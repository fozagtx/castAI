# castAI Claude Code Plugin

This plugin adds castAI MCP tools and a Claude Code skill for Casper x402 and MPP paid-resource development.

## Setup

Hosted Hugging Face MCP:

```sh
# CASTAI_MCP_URL must contain the deployed Hugging Face MCP endpoint.
castai claude-code --url "$CASTAI_MCP_URL" --json
```

Local signer fallback:

```sh
export CASPER_PRIVATE_KEY_PEM=...
export CASPER_NETWORK=casper:testnet
```

The MCP server also accepts `CASPER_PRIVATE_KEY_HEX`, `CASTAI_CASPER_PRIVATE_KEY_PEM`, and `CASTAI_CASPER_PRIVATE_KEY_HEX`.

The included `.mcp.json` uses `@castaisdk/mcp@latest` for local stdio. For hosted MCP, generate config with `castai claude-code --url "$CASTAI_MCP_URL" --json`.

## Tools

- `castai_doctor`
- `castai_pay_x402_resource`
- `castai_pay_mpp_resource`
- `castai_format_paid_resource`
