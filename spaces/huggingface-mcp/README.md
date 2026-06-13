---
title: castAI MCP
emoji: C
colorFrom: blue
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: apache-2.0
---

# castAI MCP

This Space runs the real castAI MCP server over Streamable HTTP.

Endpoints:

- `/mcp`
- `/gradio_api/mcp`
- `/gradio_api/mcp/sse`
- `/health`

Runtime secrets:

- `CASTAI_CASPER_PRIVATE_KEY_HEX` or `CASTAI_CASPER_PRIVATE_KEY_PEM`
- `CASTAI_CASPER_PUBLIC_KEY`
- `CASTAI_CASPER_NETWORK=casper:testnet` or `casper:mainnet`
- `CASTAI_CASPER_KEY_ALGORITHM=ed25519` or `secp256k1`
