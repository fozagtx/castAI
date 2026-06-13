# @castaisdk/mcp

MCP server for castAI Casper x402 and MPP paid-resource tools.

## Install

```sh
npm install @castaisdk/mcp
```

## Run

Hosted Hugging Face MCP:

```sh
# CASTAI_MCP_URL must contain the deployed Hugging Face MCP endpoint.
castai claude-code --url "$CASTAI_MCP_URL" --json
```

stdio:

```sh
castai-mcp
```

Streamable HTTP:

```sh
PORT=7860 castai-mcp-http
```

HTTP endpoints:

- `/mcp`
- `/gradio_api/mcp`
- `/gradio_api/mcp/sse`
- `/health`

Hugging Face Docker Space template:

```txt
spaces/huggingface-mcp
```

Remote MCP client config:

```json
{
  "mcpServers": {
    "castai": {
      "url": "$CASTAI_MCP_URL"
    }
  }
}
```

## Tools

- `castai_doctor`
- `castai_pay_x402_resource`
- `castai_pay_mpp_resource`
- `castai_format_paid_resource`

## Environment

```txt
CASTAI_CASPER_PRIVATE_KEY_PEM=
CASTAI_CASPER_PRIVATE_KEY_HEX=
CASTAI_CASPER_PUBLIC_KEY=
CASTAI_CASPER_NETWORK=casper:testnet
CASTAI_CASPER_KEY_ALGORITHM=ed25519
CASPER_PRIVATE_KEY_PEM=
CASPER_PRIVATE_KEY_HEX=
CASPER_NETWORK=casper:testnet
```
