import type { Deploy, RpcClient as RpcClientType } from "casper-js-sdk";
import casperSdk from "casper-js-sdk";
import { Method, Store } from "mppx";

import type { MaybePromise } from "../types.js";
import * as defaults from "../defaults.js";
import * as Methods from "../Methods.js";

const { HttpHandler, RpcClient: CasperRpcClient } =
  casperSdk as typeof import("casper-js-sdk");

export function charge(parameters: charge.Parameters = {}): Method.AnyServer {
  const {
    amount,
    currency = defaults.currency,
    description,
    externalId,
    recipient,
    waitForConfirmation = true,
  } = parameters;
  const network = defaults.resolveNetwork(parameters);
  const store = (parameters.store ??
    Store.memory()) as Store.Store<charge.StoreItemMap>;

  const resolveClient = async (
    resolvedNetwork: defaults.Network
  ): Promise<RpcClientType> => {
    if (parameters.getClient) return parameters.getClient({ network });
    return new CasperRpcClient(
      new HttpHandler(defaults.resolveRpcUrl(resolvedNetwork))
    );
  };

  return Method.toServer(Methods.charge, {
    defaults: {
      amount,
      currency,
      description,
      externalId,
      network,
      recipient,
    } as never,

    async request({ request }) {
      const resolvedNetwork =
        (request.network as defaults.Network | undefined) ?? network;

      return {
        ...request,
        currency: request.currency ?? defaults.currency,
        methodDetails: { network: resolvedNetwork },
        network: resolvedNetwork,
      };
    },

    async verify({ credential, request }) {
      const resolvedNetwork =
        (request.network as defaults.Network | undefined) ?? network;
      const payload = credential.payload;
      const hash =
        payload.type === "deployHash"
          ? payload.deployHash
          : payload.transactionHash;

      await assertHashUnused(store, hash);

      const client = await resolveClient(resolvedNetwork);
      const deploy =
        payload.type === "deployHash"
          ? await loadDeployByHash(client, payload.deployHash)
          : await loadDeployByTransactionHash(client, payload.transactionHash);

      if (waitForConfirmation) assertDeployExecuted(deploy.rawJSON);

      const transfer = readTransferDeploy(deploy.deploy);
      const expectedAmount = request.amount;
      const expectedRecipient = request.recipient;

      if (!expectedRecipient) throw new Error("Missing Casper recipient.");

      if (transfer.amount !== expectedAmount) {
        throw new MismatchError("Casper transfer amount does not match.", {
          expected: expectedAmount,
          actual: transfer.amount,
        });
      }

      if (
        !recipientMatches({
          actualPublicKey: transfer.recipientPublicKey,
          expected: expectedRecipient,
        })
      ) {
        throw new MismatchError("Casper transfer recipient does not match.", {
          expected: expectedRecipient,
          actual: transfer.recipientPublicKey,
        });
      }

      const assertedPublicKey =
        payload.publicKey ?? extractDidPublicKey(credential.source);
      if (assertedPublicKey && assertedPublicKey !== transfer.senderPublicKey) {
        throw new MismatchError("Casper transfer sender does not match.", {
          expected: assertedPublicKey,
          actual: transfer.senderPublicKey,
        });
      }

      await markHashUsed(store, hash);

      return {
        externalId: request.externalId,
        method: "casper",
        reference: hash,
        status: "success",
        timestamp: new Date().toISOString(),
      };
    },
  });
}

async function loadDeployByHash(client: RpcClientType, deployHash: string) {
  return client.getDeploy(deployHash);
}

async function loadDeployByTransactionHash(
  client: RpcClientType,
  transactionHash: string
) {
  const result = await client.getTransactionByTransactionHash(transactionHash);
  const deploy = result.transaction.getDeploy();
  if (!deploy) throw new Error("Casper transaction is not a deploy transfer.");

  return {
    deploy,
    executionInfo: result.executionInfo,
    rawJSON: result.rawJSON,
  };
}

function readTransferDeploy(deploy: Deploy) {
  if (!deploy.isTransfer()) {
    throw new Error("Casper deploy is not a native CSPR transfer.");
  }

  const senderPublicKey = deploy.header.account?.toHex();
  const amount = deploy.session.getArgByName("amount")?.toString();
  const recipientPublicKey = deploy.session
    .getArgByName("target")
    ?.publicKey?.toHex();

  if (!senderPublicKey || !amount || !recipientPublicKey) {
    throw new Error("Casper transfer deploy is missing required fields.");
  }

  return { amount, recipientPublicKey, senderPublicKey };
}

function assertDeployExecuted(rawJSON: unknown) {
  const raw = unwrapRpcResult(rawJSON);
  const executionInfo = readField(raw, "execution_info");
  const executionResults = readField(raw, "execution_results");
  const hasExecution =
    executionInfo !== undefined ||
    (Array.isArray(executionResults) && executionResults.length > 0);

  if (!hasExecution) {
    throw new Error("Casper deploy is not confirmed yet.");
  }

  if (containsFailure(raw)) {
    throw new Error("Casper deploy execution failed.");
  }
}

function recipientMatches(parameters: {
  actualPublicKey: string;
  expected: string;
}) {
  if (parameters.actualPublicKey === parameters.expected) return true;
  if (!parameters.expected.startsWith("account-hash-")) return false;

  return (
    defaults.accountHashFromPublicKeyHex(parameters.actualPublicKey) ===
    parameters.expected
  );
}

function extractDidPublicKey(source: string | undefined): string | undefined {
  if (!source) return undefined;
  const match = /^did:pkh:casper:(?:mainnet|testnet):(.+)$/.exec(source);
  return match?.[1];
}

function getHashStoreKey(hash: string): `mppx:charge:${string}` {
  return `mppx:charge:${hash.toLowerCase()}`;
}

async function assertHashUnused(
  store: Store.Store<charge.StoreItemMap>,
  hash: string
): Promise<void> {
  const seen = await store.get(getHashStoreKey(hash));
  if (seen !== null) throw new Error("Transaction hash has already been used.");
}

async function markHashUsed(
  store: Store.Store<charge.StoreItemMap>,
  hash: string
): Promise<void> {
  await store.put(getHashStoreKey(hash), Date.now());
}

function unwrapRpcResult(value: unknown): unknown {
  return isRecord(value) && "result" in value ? value.result : value;
}

function readField(value: unknown, key: string): unknown {
  if (!isRecord(value)) return undefined;
  return value[key];
}

function containsFailure(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsFailure);
  if (!isRecord(value)) return false;

  for (const [key, item] of Object.entries(value)) {
    if (
      (key === "Failure" || key === "failure" || key === "error_message") &&
      item !== null &&
      item !== undefined
    ) {
      return true;
    }
    if (containsFailure(item)) return true;
  }

  return false;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export declare namespace charge {
  type StoreItemMap = {
    [key: `mppx:charge:${string}`]: number;
  };

  type Parameters = {
    amount?: string | undefined;
    currency?: string | undefined;
    description?: string | undefined;
    externalId?: string | undefined;
    getClient?:
      | ((parameters: {
          network: defaults.Network;
        }) => MaybePromise<RpcClientType>)
      | undefined;
    network?: defaults.Network | undefined;
    recipient?: string | undefined;
    store?: Store.Store | undefined;
    testnet?: boolean | undefined;
    waitForConfirmation?: boolean | undefined;
  };
}

class MismatchError extends Error {
  override readonly name = "MismatchError";

  constructor(reason: string, details: Record<string, string>) {
    super(
      [
        reason,
        ...Object.entries(details).map(([key, value]) => `${key}: ${value}`),
      ].join("\n")
    );
  }
}
