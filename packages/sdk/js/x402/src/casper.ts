import type { x402Client } from "@x402/core/client";
import type { x402Facilitator } from "@x402/core/facilitator";
import type { x402ResourceServer } from "@x402/core/server";
import type {
  AssetAmount,
  FacilitatorContext,
  Network,
  PaymentPayload,
  PaymentPayloadContext,
  PaymentPayloadResult,
  PaymentRequirements,
  Price,
  SchemeNetworkClient,
  SchemeNetworkFacilitator,
  SchemeNetworkServer,
  SettleResponse,
  SupportedKind,
  VerifyResponse,
} from "@x402/core/types";
import type {
  Deploy,
  PrivateKey as PrivateKeyType,
  RpcClient as RpcClientType,
} from "casper-js-sdk";
import casperSdk from "casper-js-sdk";

const {
  HttpHandler,
  KeyAlgorithm,
  PrivateKey,
  PublicKey,
  RpcClient,
  makeCsprTransferDeploy,
} = casperSdk as typeof import("casper-js-sdk");

export const CASPER_MAINNET = "casper:mainnet" as const;
export const CASPER_TESTNET = "casper:testnet" as const;
export const CASPER_NETWORKS = [CASPER_MAINNET, CASPER_TESTNET] as const;
export type CasperNetwork = (typeof CASPER_NETWORKS)[number];

export const CSPR_ASSET = "CSPR";
export const CSPR_DECIMALS = 9;
export const DEFAULT_TRANSFER_PAYMENT_AMOUNT = "100000000";

const CASPER_CHAIN_NAME = {
  [CASPER_MAINNET]: "casper",
  [CASPER_TESTNET]: "casper-test",
} as const satisfies Record<CasperNetwork, string>;

const CASPER_RPC_URL = {
  [CASPER_MAINNET]: "https://node.mainnet.casper.network/rpc",
  [CASPER_TESTNET]: "https://node.testnet.casper.network/rpc",
} as const satisfies Record<CasperNetwork, string>;

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

type SubmitTransferParameters = {
  amount: string;
  asset: string;
  chainName: string;
  network: CasperNetwork;
  recipient: string;
};

export type CasperSignerOptions = {
  keyAlgorithm?: "ed25519" | "secp256k1" | undefined;
  privateKeyHex?: string | undefined;
  privateKeyPem?: string | undefined;
  publicKey?: string | undefined;
  submitTransfer?:
    | ((parameters: SubmitTransferParameters) => Promise<TransferResult>)
    | undefined;
};

export type CasperRpcOptions = {
  getClient?:
    | ((parameters: {
        network: CasperNetwork;
      }) => Promise<RpcClientType> | RpcClientType)
    | undefined;
  rpcUrls?: Partial<Record<CasperNetwork, string>> | undefined;
};

export type CasperPaymentStore = {
  get(key: string): Promise<unknown> | unknown;
  put(key: string, value: unknown): Promise<void> | void;
};

export class ExactCasperScheme implements SchemeNetworkServer {
  readonly scheme = "exact";

  async parsePrice(price: Price, network: Network): Promise<AssetAmount> {
    const casperNetwork = assertCasperNetwork(network);

    if (typeof price === "object" && price !== null && "amount" in price) {
      return price;
    }

    return {
      amount: toMotes(price),
      asset: CSPR_ASSET,
      extra: {
        assetSymbol: CSPR_ASSET,
        chainName: CASPER_CHAIN_NAME[casperNetwork],
        decimals: CSPR_DECIMALS,
        paymentTarget: "publicKey",
      },
    };
  }

  getAssetDecimals(_asset: string, _network: Network): number {
    return CSPR_DECIMALS;
  }

  async enhancePaymentRequirements(
    paymentRequirements: PaymentRequirements,
    supportedKind: SupportedKind,
    _facilitatorExtensions: string[]
  ): Promise<PaymentRequirements> {
    const network = assertCasperNetwork(supportedKind.network);

    return {
      ...paymentRequirements,
      extra: {
        ...paymentRequirements.extra,
        ...supportedKind.extra,
        assetSymbol: CSPR_ASSET,
        chainName: CASPER_CHAIN_NAME[network],
        decimals: CSPR_DECIMALS,
        paymentTarget: "publicKey",
      },
    };
  }
}

export class ExactCasperClientScheme implements SchemeNetworkClient {
  readonly scheme = "exact";

  constructor(
    private readonly options: CasperSignerOptions & CasperRpcOptions
  ) {}

  async createPaymentPayload(
    x402Version: number,
    paymentRequirements: PaymentRequirements,
    _context?: PaymentPayloadContext
  ): Promise<PaymentPayloadResult> {
    const network = assertCasperNetwork(paymentRequirements.network);
    const result = this.options.submitTransfer
      ? await this.options.submitTransfer({
          amount: paymentRequirements.amount,
          asset: paymentRequirements.asset,
          chainName: CASPER_CHAIN_NAME[network],
          network,
          recipient: paymentRequirements.payTo,
        })
      : await submitWithPrivateKey({
          amount: paymentRequirements.amount,
          chainName: CASPER_CHAIN_NAME[network],
          client: await resolveRpcClient(this.options, network),
          keyAlgorithm: this.options.keyAlgorithm,
          privateKeyHex: this.options.privateKeyHex,
          privateKeyPem: this.options.privateKeyPem,
          recipient: paymentRequirements.payTo,
        });

    return {
      x402Version,
      payload: toPaymentPayload(result, this.options.publicKey),
    };
  }
}

export class ExactCasperFacilitatorScheme implements SchemeNetworkFacilitator {
  readonly caipFamily = "casper:*";
  readonly scheme = "exact";

  private readonly store: CasperPaymentStore;

  constructor(
    private readonly options: CasperRpcOptions & {
      signers?: string[] | undefined;
      store?: CasperPaymentStore | undefined;
    } = {}
  ) {
    this.store = options.store ?? new MemoryPaymentStore();
  }

  getExtra(network: Network): Record<string, unknown> {
    const casperNetwork = assertCasperNetwork(network);
    return {
      assetSymbol: CSPR_ASSET,
      chainName: CASPER_CHAIN_NAME[casperNetwork],
      decimals: CSPR_DECIMALS,
      paymentTarget: "publicKey",
    };
  }

  getSigners(_network: string): string[] {
    return this.options.signers ?? [];
  }

  async verify(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
    _context?: FacilitatorContext
  ): Promise<VerifyResponse> {
    return this.verifyCasperPayment(payload, requirements);
  }

  async settle(
    payload: PaymentPayload,
    requirements: PaymentRequirements,
    _context?: FacilitatorContext
  ): Promise<SettleResponse> {
    const verified = await this.verifyCasperPayment(payload, requirements);
    const reference = getPayloadHash(payload.payload);

    if (!verified.isValid) {
      return {
        success: false,
        errorReason: verified.invalidReason,
        errorMessage: verified.invalidMessage,
        network: requirements.network,
        payer: verified.payer,
        transaction: "",
      };
    }

    const storeKey = `x402:casper:${reference}`;
    if (await this.store.get(storeKey)) {
      return {
        success: false,
        errorReason: "payment_already_settled",
        network: requirements.network,
        payer: verified.payer,
        transaction: reference,
      };
    }

    await this.store.put(storeKey, Date.now());

    return {
      amount: requirements.amount,
      success: true,
      network: requirements.network,
      payer: verified.payer,
      transaction: reference,
    };
  }

  private async verifyCasperPayment(
    payload: PaymentPayload,
    requirements: PaymentRequirements
  ): Promise<VerifyResponse> {
    try {
      const network = assertCasperNetwork(requirements.network);

      if (payload.accepted.scheme !== this.scheme) {
        return invalid("invalid_scheme");
      }
      if (payload.accepted.network !== requirements.network) {
        return invalid("network_mismatch");
      }
      if (requirements.asset !== CSPR_ASSET) {
        return invalid("unsupported_asset");
      }

      const client = await resolveRpcClient(this.options, network);
      const loaded = await loadPaymentDeploy(client, payload.payload);
      assertDeployExecuted(loaded.rawJSON);

      const transfer = readTransferDeploy(loaded.deploy);
      if (transfer.amount !== requirements.amount) {
        return invalid("amount_mismatch", transfer.senderPublicKey);
      }
      if (
        !recipientMatches({
          actualPublicKey: transfer.recipientPublicKey,
          expected: requirements.payTo,
        })
      ) {
        return invalid("recipient_mismatch", transfer.senderPublicKey);
      }

      const assertedPublicKey = readPayloadString(payload.payload, "publicKey");
      if (assertedPublicKey && assertedPublicKey !== transfer.senderPublicKey) {
        return invalid("payer_mismatch", transfer.senderPublicKey);
      }

      return {
        isValid: true,
        payer: transfer.senderPublicKey,
      };
    } catch (error) {
      return invalid(
        "casper_verification_failed",
        undefined,
        error instanceof Error
          ? error.message
          : "Unknown Casper verification error."
      );
    }
  }
}

export function registerExactCasperScheme(
  server: x402ResourceServer,
  config: { networks?: CasperNetwork[] | undefined } = {}
): x402ResourceServer {
  const networks = config.networks ?? [...CASPER_NETWORKS];
  networks.forEach((network) => {
    server.register(network, new ExactCasperScheme());
  });
  return server;
}

export function registerExactCasperClientScheme(
  client: x402Client,
  config: CasperSignerOptions &
    CasperRpcOptions & { networks?: CasperNetwork[] | undefined }
): x402Client {
  const networks = config.networks ?? [...CASPER_NETWORKS];
  networks.forEach((network) => {
    client.register(network, new ExactCasperClientScheme(config));
  });
  return client;
}

export function registerExactCasperFacilitatorScheme(
  facilitator: x402Facilitator,
  config: CasperRpcOptions & {
    networks?: CasperNetwork[] | undefined;
    signers?: string[] | undefined;
    store?: CasperPaymentStore | undefined;
  } = {}
): x402Facilitator {
  const networks = config.networks ?? [...CASPER_NETWORKS];
  facilitator.register(networks, new ExactCasperFacilitatorScheme(config));
  return facilitator;
}

export function toMotes(value: string | number): string {
  const normalized =
    typeof value === "number"
      ? value.toString()
      : value.trim().replace(/^\$/, "").replaceAll(",", "");

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid CSPR price: ${value}`);
  }

  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > CSPR_DECIMALS) {
    throw new Error(`CSPR amount has more than ${CSPR_DECIMALS} decimals.`);
  }

  return `${whole}${fraction.padEnd(CSPR_DECIMALS, "0")}`.replace(
    /^0+(?=\d)/,
    ""
  );
}

export function accountHashFromPublicKeyHex(publicKeyHex: string): string {
  return PublicKey.fromHex(publicKeyHex).accountHash().toPrefixedString();
}

function toPaymentPayload(
  result: TransferResult,
  fallbackPublicKey?: string | undefined
): Record<string, unknown> {
  const payload: Record<string, unknown> =
    "deployHash" in result
      ? { type: "deployHash", deployHash: result.deployHash }
      : { type: "transactionHash", transactionHash: result.transactionHash };

  const publicKey = result.publicKey ?? fallbackPublicKey;
  if (publicKey) payload.publicKey = publicKey;

  return payload;
}

async function submitWithPrivateKey(parameters: {
  amount: string;
  chainName: string;
  client: RpcClientType;
  keyAlgorithm?: CasperSignerOptions["keyAlgorithm"];
  privateKeyHex?: string | undefined;
  privateKeyPem?: string | undefined;
  recipient: string;
}): Promise<TransferResult> {
  const privateKey = resolvePrivateKey(parameters);
  const publicKey = privateKey.publicKey.toHex();

  const deploy = makeCsprTransferDeploy({
    chainName: parameters.chainName,
    paymentAmount: DEFAULT_TRANSFER_PAYMENT_AMOUNT,
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
  keyAlgorithm?: CasperSignerOptions["keyAlgorithm"];
  privateKeyHex?: string | undefined;
  privateKeyPem?: string | undefined;
}): PrivateKeyType {
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

async function resolveRpcClient(
  options: CasperRpcOptions,
  network: CasperNetwork
): Promise<RpcClientType> {
  if (options.getClient) return options.getClient({ network });
  const rpcUrl = options.rpcUrls?.[network] ?? CASPER_RPC_URL[network];
  return new RpcClient(new HttpHandler(rpcUrl));
}

async function loadPaymentDeploy(
  client: RpcClientType,
  payload: Record<string, unknown>
) {
  const type = readPayloadString(payload, "type");
  if (type === "deployHash") {
    return client.getDeploy(requirePayloadString(payload, "deployHash"));
  }

  if (type === "transactionHash") {
    const result = await client.getTransactionByTransactionHash(
      requirePayloadString(payload, "transactionHash")
    );
    const deploy = result.transaction.getDeploy();
    if (!deploy) throw new Error("Casper transaction is not a deploy.");
    return {
      deploy,
      executionInfo: result.executionInfo,
      rawJSON: result.rawJSON,
    };
  }

  throw new Error(`Unsupported Casper x402 payload type: ${type ?? "missing"}`);
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

  if (!hasExecution) throw new Error("Casper deploy is not confirmed yet.");
  if (containsFailure(raw)) throw new Error("Casper deploy execution failed.");
}

function recipientMatches(parameters: {
  actualPublicKey: string;
  expected: string;
}) {
  if (parameters.actualPublicKey === parameters.expected) return true;
  if (!parameters.expected.startsWith("account-hash-")) return false;

  return (
    accountHashFromPublicKeyHex(parameters.actualPublicKey) ===
    parameters.expected
  );
}

function assertCasperNetwork(network: Network): CasperNetwork {
  if (network === CASPER_MAINNET || network === CASPER_TESTNET) return network;
  throw new Error(`Unsupported Casper network: ${network}`);
}

function getPayloadHash(payload: Record<string, unknown>): string {
  const type = readPayloadString(payload, "type");
  if (type === "deployHash") return requirePayloadString(payload, "deployHash");
  if (type === "transactionHash") {
    return requirePayloadString(payload, "transactionHash");
  }
  throw new Error("Casper payment payload has no hash.");
}

function requirePayloadString(
  payload: Record<string, unknown>,
  key: string
): string {
  const value = readPayloadString(payload, key);
  if (!value) throw new Error(`Missing Casper payment payload field: ${key}`);
  return value;
}

function readPayloadString(
  payload: Record<string, unknown>,
  key: string
): string | undefined {
  const value = payload[key];
  return typeof value === "string" ? value : undefined;
}

function invalid(
  invalidReason: string,
  payer?: string | undefined,
  invalidMessage?: string | undefined
): VerifyResponse {
  return {
    isValid: false,
    invalidMessage,
    invalidReason,
    payer,
  };
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

class MemoryPaymentStore implements CasperPaymentStore {
  private readonly data = new Map<string, unknown>();

  get(key: string): unknown {
    return this.data.get(key);
  }

  put(key: string, value: unknown): void {
    this.data.set(key, value);
  }
}
