import {
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  RpcClient,
  makeCsprTransferDeploy,
} from "casper-js-sdk";
import { Credential, Method, z } from "mppx";

import type { MaybePromise } from "../types.js";
import * as defaults from "../defaults.js";
import * as Methods from "../Methods.js";

type TransferResult =
  | {
      deployHash: string;
      publicKey?: string | undefined;
      transactionHash?: never;
    }
  | {
      transactionHash: string;
      publicKey?: string | undefined;
      deployHash?: never;
    };

export function charge(parameters: charge.Parameters = {}) {
  const resolveNetwork = (network?: defaults.Network | undefined) =>
    network ?? parameters.network ?? defaults.resolveNetwork(parameters);

  const resolveClient = async (network: defaults.Network): Promise<RpcClient> => {
    if (parameters.getClient) return parameters.getClient({ network });
    return new RpcClient(new HttpHandler(defaults.resolveRpcUrl(network)));
  };

  return Method.toClient(Methods.charge, {
    context: z.object({
      deployHash: z.optional(z.string()),
      publicKey: z.optional(z.string()),
      transactionHash: z.optional(z.string()),
    }),

    async createCredential({ challenge, context }) {
      const request = challenge.request;
      const network = resolveNetwork(
        request.methodDetails?.network as defaults.Network | undefined
      );

      if (context?.deployHash || context?.transactionHash) {
        return Credential.serialize({
          challenge,
          payload: context.deployHash
            ? {
                type: "deployHash" as const,
                deployHash: context.deployHash,
                publicKey: context.publicKey,
              }
            : {
                type: "transactionHash" as const,
                transactionHash: context.transactionHash as string,
                publicKey: context.publicKey,
              },
          source: context.publicKey
            ? `did:pkh:${network}:${context.publicKey}`
            : undefined,
        });
      }

      const recipient = request.recipient;
      if (!recipient) throw new Error("Missing Casper recipient public key.");

      const result = parameters.submitTransfer
        ? await parameters.submitTransfer({
            amount: request.amount,
            chainName: defaults.resolveChainName(network),
            currency: request.currency ?? defaults.currency,
            network,
            recipient,
          })
        : await submitWithPrivateKey({
            amount: request.amount,
            chainName: defaults.resolveChainName(network),
            client: await resolveClient(network),
            keyAlgorithm: parameters.keyAlgorithm,
            privateKeyHex: parameters.privateKeyHex,
            privateKeyPem: parameters.privateKeyPem,
            recipient,
          });

      const publicKey = result.publicKey ?? parameters.publicKey;

      return Credential.serialize({
        challenge,
        payload:
          "deployHash" in result
            ? {
                type: "deployHash" as const,
                deployHash: result.deployHash,
                publicKey,
              }
            : {
                type: "transactionHash" as const,
                transactionHash: result.transactionHash,
                publicKey,
              },
        source: publicKey ? `did:pkh:${network}:${publicKey}` : undefined,
      });
    },
  });
}

async function submitWithPrivateKey(parameters: {
  amount: string;
  chainName: string;
  client: RpcClient;
  keyAlgorithm?: charge.KeyAlgorithmName | undefined;
  privateKeyHex?: string | undefined;
  privateKeyPem?: string | undefined;
  recipient: string;
}): Promise<TransferResult> {
  const privateKey = resolvePrivateKey(parameters);
  const publicKey = privateKey.publicKey.toHex();

  const deploy = makeCsprTransferDeploy({
    chainName: parameters.chainName,
    paymentAmount: defaults.defaultPaymentAmount,
    recipientPublicKeyHex: parameters.recipient,
    senderPublicKeyHex: publicKey,
    transferAmount: parameters.amount,
  });
  deploy.sign(privateKey);

  const result = await parameters.client.putDeploy(deploy);

  return {
    deployHash: result.deployHash.toHex(),
    publicKey,
  };
}

function resolvePrivateKey(parameters: {
  keyAlgorithm?: charge.KeyAlgorithmName | undefined;
  privateKeyHex?: string | undefined;
  privateKeyPem?: string | undefined;
}): PrivateKey {
  const algorithm =
    parameters.keyAlgorithm === "secp256k1"
      ? KeyAlgorithm.SECP256K1
      : KeyAlgorithm.ED25519;

  if (parameters.privateKeyPem) {
    return PrivateKey.fromPem(parameters.privateKeyPem, algorithm);
  }

  if (parameters.privateKeyHex) {
    return PrivateKey.fromHex(parameters.privateKeyHex, algorithm);
  }

  throw new Error(
    "No Casper signer configured. Provide submitTransfer, privateKeyPem, or privateKeyHex."
  );
}

export declare namespace charge {
  type KeyAlgorithmName = "ed25519" | "secp256k1";

  type SubmitTransferParameters = {
    amount: string;
    chainName: string;
    currency: string;
    network: defaults.Network;
    recipient: string;
  };

  type Parameters = {
    getClient?:
      | ((parameters: {
          network: defaults.Network;
        }) => MaybePromise<RpcClient>)
      | undefined;
    keyAlgorithm?: KeyAlgorithmName | undefined;
    network?: defaults.Network | undefined;
    privateKeyHex?: string | undefined;
    privateKeyPem?: string | undefined;
    publicKey?: string | undefined;
    submitTransfer?:
      | ((parameters: SubmitTransferParameters) => MaybePromise<TransferResult>)
      | undefined;
    testnet?: boolean | undefined;
  };
}
