import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="home-shell">
      <header className="floating-doc-header">
        <div className="floating-doc-header__inner">
          <Link className="floating-doc-brand" href="/">
            <Image
              alt="castAI"
              className="floating-doc-logo"
              height={28}
              priority
              src="/castai.svg"
              width={112}
            />
          </Link>
          <nav aria-label="Primary" className="floating-doc-nav">
            <Link href="/docs">Docs</Link>
            <Link href="/docs/ai-sdk">AI SDK</Link>
            <Link href="/docs/x402/quickstart">x402</Link>
            <Link href="/docs/mpp/quickstart">MPP</Link>
            <Link href="/docs/router">Router</Link>
          </nav>
        </div>
      </header>

      <section className="home-inner">
        <h1 className="home-title">
          Casper payment infrastructure for AI services
        </h1>
        <p className="home-copy">
          castAI ships real Casper CSPR payment rails for x402, MPP, facilitator
          verification, and router forwarding.
        </p>
        <div className="home-actions">
          <Link href="/docs">Open docs</Link>
          <Link href="/docs/ai-sdk/agent-tools">Agent tools</Link>
          <Link href="/docs/x402/quickstart">x402 quickstart</Link>
          <Link href="/docs/mpp/quickstart">MPP quickstart</Link>
        </div>
      </section>
    </main>
  );
}
