# castAI Web PRD

## Product

castAI is a public developer website and documentation app for Casper-native payments infrastructure. It helps developers evaluate and adopt the `@castaisdk` packages for AI agents, x402 paid HTTP resources, MPP transfers, checkout UI, facilitators, routers, MCP tools, and CLI workflows.

## Non-Negotiables

- Public visitors must understand the product before connecting any wallet or running code.
- The homepage must offer direct paths into docs for the main jobs: AI agents, protected APIs, checkout UI, MCP/CLI, and payment routing.
- Public pages must not imply fake production usage, fake payment success, fake balances, fake transaction hashes, or fake explorer links.
- Any simulated, local, or example-only behavior must be labeled as example code or documentation.
- Docs AI must disclose unavailable configuration with a clear unavailable state instead of inventing answers.
- Visual design must be restrained, responsive, accessible, and consistent with the existing shadcn/Fumadocs component system.

## Users And Roles

| Role | Description | Can | Cannot |
| --- | --- | --- | --- |
| Visitor | Unauthenticated public reader | View homepage, docs, examples, package links, `llms.txt`, `llms-full.txt`, markdown exports, and GitHub links | Execute protected payments through the docs site |
| Developer | Public reader integrating castAI | Read implementation docs, copy snippets, ask Docs AI when configured, open package-specific routes | Receive fake deployment, payment, balance, or transaction success from the site |
| Operator | Maintainer with deployment environment access | Configure Docs AI provider keys and site URL | Bypass public route behavior through the browser UI |

## Route Map And Permissions

| Route | Purpose | Visitor | Developer | Operator | Data Shown | Actions Allowed | Failure Behavior |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/` | Public product overview and adoption paths | Allowed | Allowed | Allowed | Product positioning, packages, supported payment concepts, doc links, examples | Navigate to docs, GitHub, package-specific entry points | Static page remains readable without app configuration |
| `/docs` | Documentation index | Allowed | Allowed | Allowed | Docs tree and MDX content | Browse, copy markdown, open related pages | Missing docs route returns 404 |
| `/docs/[[...slug]]` | Documentation page | Allowed | Allowed | Allowed | MDX docs, page actions, AI/docs utility actions | Browse, copy markdown, open GitHub source | Missing slug returns 404 |
| `/docs-md/[...path]` | Markdown export for a docs page | Allowed | Allowed | Allowed | Markdown representation of docs content | Fetch/copy page markdown | Missing path returns 404 |
| `/llms.txt` | LLM-readable docs index | Allowed | Allowed | Allowed | Markdown index of docs pages | Fetch index | Static generation failure should fail build |
| `/llms-full.txt` | Full LLM-readable docs bundle | Allowed | Allowed | Allowed | Combined markdown text for docs pages | Fetch full docs text | Static generation failure should fail build |
| `/api/chat` | Docs AI answer endpoint | Allowed when configured | Allowed when configured | Configures provider environment | Search-grounded docs answers and cited source pages | POST chat messages | Returns `503` when `OPENROUTER_API_KEY` is missing; returns a generic unavailable message on provider failure |

## Page Requirements

### Homepage

- Purpose: explain castAI in under five seconds and route developers to the correct implementation path.
- Visible data: product promise, install command, package categories, supported Casper payment concepts, payment flow, use cases, FAQs, GitHub/docs links.
- Allowed actions: navigate to docs, package-specific docs, examples, and GitHub.
- Blocked actions: no live payment execution, no fake success, no fabricated metrics.
- Empty state: not applicable; static content must remain useful.
- Error state: external links and docs links should be ordinary navigation with accessible labels.
- Loading state: static page should avoid layout shift and keep primary assets sized.

### Documentation Pages

- Purpose: teach implementation details with source-backed examples.
- Visible data: MDX content, nav tree, markdown/GitHub actions, Docs AI trigger.
- Allowed actions: browse, copy markdown, open GitHub, ask Docs AI when configured.
- Blocked actions: no fake live deployment or payment success.
- Empty state: docs route 404 for missing pages.
- Error state: Docs AI panel shows an unavailable state on request failure.
- Loading state: Docs AI uses a visible reading/answering state.

## UI System

- Component library: existing shadcn-style primitives in `packages/www/components/ui` plus Fumadocs UI for docs shell.
- Icons: existing Hugeicons icon system.
- Navigation: public top navigation on homepage; Fumadocs sidebar/navigation in docs.
- Forms: no homepage forms; Docs AI composer uses the existing chat input.
- Tables/lists: docs content and homepage grids use semantic card/list groupings.
- Toasts/errors: Docs AI inline unavailable/error messaging.
- Visual restrictions: no decorative orb backgrounds, no fake dashboard states, no fixture-driven live actions, no unsupported wallet/payment claims.

## No Fake Demo Rules

Allowed only when labeled:

- Documentation examples
- Local development snippets
- Unit-test fixtures
- Static explanatory diagrams or terminal snippets

Never allowed:

- Fake payment success
- Fake transaction hashes or explorer links
- Fake balances
- Hardcoded production-looking usage metrics
- Fixture wallets presented as live user state
- Simulated payment checks described as mainnet/testnet success

## Acceptance Criteria

- `docs/PRD.md` exists and defines users, routes, permissions, UI system, no-fake-demo rules, and acceptance criteria.
- Homepage first viewport clearly states what castAI is and offers primary docs and implementation paths.
- Homepage visual treatment uses real project assets and avoids decorative orb/background treatments.
- Public routes remain accessible without authentication.
- Docs AI route returns a clear `503` unavailable response when not configured.
- UI remains responsive on mobile and desktop with no overlapping text or unstable fixed-format elements.
- Build/typecheck or the narrow equivalent is run and reported.
