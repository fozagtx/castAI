import { Hono } from "hono";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Env } from "../env";

const proxyMock = vi.fn();
const decodePaymentRequiredHeaderMock = vi.fn();
const wrapFetchWithPaymentMock = vi.fn();
const paymentMiddlewareMock = vi.fn();

vi.mock("hono/proxy", () => ({
  proxy: proxyMock,
}));

vi.mock("@x402/core/http", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@x402/core/http")>();
  return {
    ...actual,
    decodePaymentRequiredHeader: decodePaymentRequiredHeaderMock,
  };
});

vi.mock("@x402/fetch", () => ({
  wrapFetchWithPayment: wrapFetchWithPaymentMock,
}));

vi.mock("@x402/hono", () => ({
  paymentMiddleware: paymentMiddlewareMock,
}));

const { routeHandler } = await import("./route");

type MockContext = {
  executionCtx: {
    waitUntil(promise: Promise<unknown>): void;
  };
  json(body: unknown): Response;
  notFound(): Response;
  req: {
    header(name: string): string | undefined;
  };
};

const env = {
  FACILITATOR_URL: "https://facilitator.castai.test",
  CASPER_MAINNET_PAY_TO: "01mainnet",
  CASPER_TESTNET_PAY_TO: "01testnet",
  CASPER_MAINNET_PRIVATE_KEY: "",
  CASPER_TESTNET_PRIVATE_KEY: "",
} as CloudflareBindings;

function createApp() {
  const app = new Hono<Env>();

  app.use(async (c, next) => {
    c.set("X402_SERVER", { id: "server" } as never);
    c.set("X402_CLIENT", { id: "client" } as never);
    return next();
  });

  app.route("/", routeHandler);

  return app;
}

describe("router x402 handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    paymentMiddlewareMock.mockImplementation((paymentConfig, x402Server) => {
      return async (c: MockContext) => {
        if (c.req.header("payment-signature") === "settled") {
          c.executionCtx.waitUntil(Promise.resolve());
          return c.notFound();
        }

        return c.json({ paymentConfig, x402Server });
      };
    });
  });

  it("passes through successful destination responses", async () => {
    proxyMock.mockResolvedValue(new Response("ok", { status: 200 }));

    const response = await createApp().request(
      "/x402?url=https%3A%2F%2Fapi.castai.test%2Fdata",
      {},
      env
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("ok");
    expect(paymentMiddlewareMock).not.toHaveBeenCalled();
  });

  it("converts a destination 402 into Casper payment requirements", async () => {
    proxyMock.mockResolvedValue(
      new Response(null, {
        status: 402,
        headers: { "payment-required": "encoded-payment-required" },
      })
    );
    decodePaymentRequiredHeaderMock.mockReturnValue({
      resource: {
        description: "Paid data",
        mimeType: "application/json",
      },
      accepts: [
        {
          scheme: "exact",
          network: "casper:testnet",
          amount: "100000000",
          extra: { destination: "kept" },
        },
        {
          scheme: "exact",
          network: "unsupported",
          amount: "100000000",
          extra: {},
        },
      ],
    });

    const response = await createApp().request(
      "/x402?url=https%3A%2F%2Fapi.castai.test%2Fdata",
      {},
      env
    );
    const body = (await response.json()) as {
      paymentConfig: unknown;
      x402Server: unknown;
    };

    expect(response.status).toBe(200);
    expect(body.paymentConfig).toMatchObject({
      description: "Paid data",
      mimeType: "application/json",
      resource: "https://api.castai.test/data",
      accepts: [
        {
          scheme: "exact",
          network: "casper:testnet",
          payTo: "01testnet",
          price: {
            asset: "CSPR",
            amount: "100000000",
            extra: {
              assetSymbol: "CSPR",
              decimals: 9,
              destination: "kept",
            },
          },
        },
      ],
      extensions: {
        "castai-router": {
          url: "https://api.castai.test/data",
        },
      },
    });
    expect(body.x402Server).toEqual({ id: "server" });
  });

  it("forwards a settled request through the registered x402 client", async () => {
    const paidDestinationResponse = new Response("paid-data", { status: 200 });
    proxyMock.mockResolvedValue(
      new Response(null, {
        status: 402,
        headers: { "payment-required": "encoded-payment-required" },
      })
    );
    decodePaymentRequiredHeaderMock.mockReturnValue({
      resource: {
        description: "Paid data",
        mimeType: "application/json",
      },
      accepts: [
        {
          scheme: "exact",
          network: "casper:testnet",
          amount: "100000000",
          extra: {},
        },
      ],
    });
    paymentMiddlewareMock.mockImplementation((_paymentConfig, _x402Server) => {
      return (_c: unknown, next: () => Promise<Response>) => next();
    });
    wrapFetchWithPaymentMock.mockReturnValue(
      vi.fn().mockResolvedValue(paidDestinationResponse)
    );

    const response = await createApp().request(
      "/x402?url=https%3A%2F%2Fapi.castai.test%2Fdata",
      {},
      env
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toBe("paid-data");
    expect(wrapFetchWithPaymentMock).toHaveBeenCalledWith(
      fetch,
      expect.objectContaining({ id: "client" })
    );
  });
});
