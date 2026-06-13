FROM oven/bun:1.3.12

WORKDIR /repo

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates git \
  && rm -rf /var/lib/apt/lists/*

RUN git clone --depth=1 https://github.com/fozagtx/castAI.git .

RUN bun install --frozen-lockfile \
  && bun --filter @castaisdk/mcp build

ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV PORT=7860

EXPOSE 7860

CMD ["bun", "packages/mcp/dist/esm/http.js"]
