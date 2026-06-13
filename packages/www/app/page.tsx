import type * as React from "react";
import {
  BookOpen,
  Code2,
  Coins,
  ExternalLink,
  Globe2,
  Lock,
  Network,
  Package,
  Route,
  Server,
  ShieldCheck,
  Terminal,
  Wallet,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const packages = [
  {
    name: "@castaisdk/x402",
    role: "x402",
    description: "x402 exact scheme support for Casper CSPR payments",
    badges: ["exact", "CSPR", "HTTP"],
  },
  {
    name: "@castaisdk/mpp",
    role: "MPP",
    description: "MPP Casper method for native CSPR transfers",
    badges: ["motes", "transfer", "agent"],
  },
  {
    name: "@castaisdk/ai-sdk",
    role: "AI SDK",
    description:
      "AI SDK tools, llm.text, checkout UI, and React developer components",
    badges: ["tools", "React", "llm.text"],
  },
  {
    name: "@castaisdk/facilitator",
    role: "Verifier",
    description:
      "Service package that verifies and settles x402 Casper payments",
    badges: ["RPC", "settle", "replay"],
  },
  {
    name: "@castaisdk/router",
    role: "Router",
    description:
      "Forwards x402-protected traffic after successful Casper payment",
    badges: ["proxy", "gate", "HTTP"],
  },
];

const networkStats = [
  ["casper:mainnet", "Chain: casper"],
  ["casper:testnet", "Chain: casper-test"],
  ["CSPR", "Native asset"],
  ["motes", "Smallest unit"],
  ["9 decimals", "Asset precision"],
  ["RPC verified", "Deploy and transaction checks"],
  ["Replay protected", "Prevent duplicate payment use"],
  ["HTTP gated", "Protected routes unlock after payment"],
];

const paymentSteps = [
  {
    icon: Wallet,
    title: "1. Client Signs Payment",
    copy: "Private key or signer submits native CSPR transfer deploys.",
  },
  {
    icon: ShieldCheck,
    title: "2. Facilitator Verifies",
    copy: "Checks network, recipient, amount, execution state, sender, and replay use.",
  },
  {
    icon: Lock,
    title: "3. x402 Middleware Accepts",
    copy: "Protected request is approved after payment verification.",
  },
  {
    icon: Route,
    title: "4. Router Forwards Traffic",
    copy: "Paid HTTP requests are forwarded to the target AI service.",
  },
];

const developerCards = [
  {
    icon: Code2,
    title: "AI SDK Tools",
    copy: "Give agents the ability to pay for x402 and MPP resources with Casper CSPR.",
    code: "createCastaiAgentTools({ x402Fetch })",
  },
  {
    icon: Wallet,
    title: "Checkout UI",
    copy: "Drop in React components for payment prompts and developer-friendly checkout flows.",
    code: '<CastaiCheckout scheme="x402" />',
  },
  {
    icon: Server,
    title: "Protected HTTP Routes",
    copy: "Gate APIs, model endpoints, tools, and services behind verified CSPR payments.",
    code: "router.forwardAfterPayment(request)",
  },
];

const useCases = [
  {
    icon: Zap,
    title: "Paid AI Tools",
    copy: "Charge agents before they call premium tools or model endpoints.",
  },
  {
    icon: Globe2,
    title: "API Monetization",
    copy: "Protect HTTP services with x402 payment middleware.",
  },
  {
    icon: Coins,
    title: "Casper Payment Rails",
    copy: "Use native CSPR transfers for machine-to-machine payments.",
  },
];

const faqs = [
  [
    "What is castAI?",
    "castAI is open-source Casper payment infrastructure for AI agents, x402 resources, MPP transfers, facilitators, routers, checkout UI, and HTTP services.",
  ],
  [
    "What packages are included?",
    "The toolkit includes x402, MPP, AI SDK, facilitator, router, MCP, CLI, and React developer components under the @castaisdk scope.",
  ],
  [
    "How does x402 work with Casper?",
    "The client submits a native CSPR transfer. The server or facilitator verifies the deploy or transaction through Casper RPC before unlocking the protected HTTP resource.",
  ],
  [
    "What networks are supported?",
    "The package model supports casper:mainnet and casper:testnet with CSPR, motes, and 9-decimal asset precision.",
  ],
  [
    "Can AI agents make payments with this?",
    "Yes. The AI SDK tools let agents call x402 or MPP paid resources and format responses into model-ready text.",
  ],
  [
    "Is castAI open source?",
    "Yes. The packages, docs, examples, MCP server, plugin, and scaffolder are built as an open-source developer toolkit.",
  ],
];

export default function HomePage() {
  return (
    <main className="castai-landing">
      <header className="landing-nav">
        <Link aria-label="castAI home" className="landing-brand" href="/">
          <Image
            alt="castAI"
            className="landing-logo"
            height={34}
            priority
            src="/favicon.svg"
            width={34}
          />
          <span>castAI</span>
        </Link>
        <nav aria-label="Primary navigation" className="landing-nav__links">
          <Link href="/docs">Docs</Link>
          <a href="#packages">Packages</a>
          <a href="#networks">Networks</a>
          <a href="#examples">Examples</a>
          <Link href="https://github.com/fozagtx/castAI">GitHub</Link>
        </nav>
        <div className="landing-nav__actions">
          <LandingButton href="/docs" tone="secondary">
            View Docs
          </LandingButton>
          <LandingButton href="/docs/ai-sdk" tone="primary">
            Get Started
          </LandingButton>
        </div>
      </header>

      <section className="landing-hero">
        <div className="hero-visual" aria-hidden="true">
          <NetworkOrb />
          <div className="hero-terminal hero-terminal--top">
            <span>payment.required</span>
            <strong>x402 exact CSPR</strong>
          </div>
          <div className="hero-terminal hero-terminal--bottom">
            <span>settlement</span>
            <strong>RPC verified</strong>
          </div>
        </div>
        <div className="hero-copy">
          <h1>Casper Payments for AI Agents.</h1>
          <p>
            castAI is an open-source Casper payment toolkit for AI agents, x402
            resources, MPP transfers, facilitators, routers, and HTTP services.
          </p>
          <div className="hero-actions">
            <LandingButton href="/docs/ai-sdk" tone="primary">
              Get Started
            </LandingButton>
            <LandingButton href="/docs" tone="secondary">
              Read Docs
            </LandingButton>
          </div>
          <div className="install-snippet">
            <Terminal aria-hidden="true" />
            <code>npm install @castaisdk/ai-sdk @castaisdk/x402</code>
          </div>
        </div>
      </section>

      <section aria-label="Core capabilities" className="feature-strip">
        <FeatureStripItem
          title="x402 for Casper"
          copy="Accept exact-scheme x402 payments using native CSPR transfers."
        />
        <Separator
          className="feature-strip__separator"
          orientation="vertical"
        />
        <FeatureStripItem
          title="Agent-Ready SDKs"
          copy="AI SDK tools, llm.text helpers, checkout UI, and React components."
        />
        <Separator
          className="feature-strip__separator"
          orientation="vertical"
        />
        <FeatureStripItem
          title="Facilitators & Routers"
          copy="Verify, settle, and forward protected HTTP traffic after payment."
        />
      </section>

      <LandingSection
        badge="Open Source Toolkit"
        copy="Use modular packages for x402 payments, MPP transfers, AI SDK integrations, payment verification, and protected routing."
        id="packages"
        title="Everything You Need to Monetize AI Services."
      >
        <Card className="ecosystem-panel">
          <CardContent>
            <Tabs defaultValue="packages">
              <TabsList aria-label="Package categories">
                {[
                  "packages",
                  "x402",
                  "mpp",
                  "ai sdk",
                  "facilitator",
                  "router",
                ].map((tab) => (
                  <TabsTrigger key={tab} value={tab}>
                    {tab === "mpp"
                      ? "MPP"
                      : tab === "ai sdk"
                        ? "AI SDK"
                        : titleCase(tab)}
                  </TabsTrigger>
                ))}
              </TabsList>
              {[
                "packages",
                "x402",
                "mpp",
                "ai sdk",
                "facilitator",
                "router",
              ].map((tab) => (
                <TabsContent key={tab} value={tab}>
                  <div className="package-grid">
                    {packages
                      .filter((item) =>
                        tab === "packages"
                          ? true
                          : item.role.toLowerCase() === tab ||
                            item.name
                              .toLowerCase()
                              .includes(tab.replace(" ", "-"))
                      )
                      .map((item) => (
                        <PackageCard key={item.name} {...item} />
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            <LandingButton
              className="ecosystem-button"
              href="/docs"
              tone="primary"
            >
              Explore Packages
            </LandingButton>
          </CardContent>
        </Card>
      </LandingSection>

      <LandingSection
        badge="Casper Native"
        copy="Native Casper transfers, RPC verification, and replay protection are first-class parts of the payment path."
        id="networks"
        title="Built Around CSPR Payments."
      >
        <div className="network-grid">
          {networkStats.map(([title, description]) => (
            <NetworkStat description={description} key={title} title={title} />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        badge="Payment Flow"
        className="payment-section"
        copy="castAI signs, submits, verifies, and routes paid AI requests through Casper-native payment paths."
        title="From Agent Request to Settled CSPR."
      >
        <div className="payment-flow">
          <div className="payment-flow__column">
            {paymentSteps.slice(0, 2).map((step) => (
              <PaymentStepCard key={step.title} {...step} />
            ))}
          </div>
          <div className="payment-flow__center" aria-hidden="true">
            <NetworkOrb compact />
          </div>
          <div className="payment-flow__column">
            {paymentSteps.slice(2).map((step) => (
              <PaymentStepCard key={step.title} {...step} />
            ))}
          </div>
        </div>
      </LandingSection>

      <LandingSection
        badge="Developer Experience"
        copy="Use castAI inside AI agents, checkout flows, and HTTP services without leaving the Casper payment model."
        id="examples"
        title="Designed for Agents, APIs, and Apps."
      >
        <div className="developer-grid">
          {developerCards.map((card) => (
            <DeveloperFeatureCard key={card.title} {...card} />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        badge="Quickstart"
        copy="Install the packages, run checks, and wire Casper payment fetchers into agents or server routes."
        title="Install, Typecheck, Build."
      >
        <div className="quickstart-grid">
          <TerminalCard
            lines={[
              "npm install @castaisdk/ai-sdk @castaisdk/x402 @castaisdk/mpp",
              "",
              "npm run lint",
              "npm run typecheck",
              "npm run build",
            ]}
          />
          <TerminalCard
            compact
            lines={[
              'import { llmText } from "@castaisdk/ai-sdk";',
              "",
              "const text = llmText(response);",
            ]}
          />
        </div>
        <div className="section-actions">
          <LandingButton href="/docs" tone="primary">
            Open Docs
          </LandingButton>
          <LandingButton
            href="https://github.com/fozagtx/castAI"
            tone="secondary"
          >
            View on GitHub
          </LandingButton>
        </div>
      </LandingSection>

      <LandingSection
        badge="Use Cases"
        copy="Charge, gate, and route paid machine-to-machine HTTP calls through native Casper transfers."
        title="Payments for the Agentic Web."
      >
        <div className="usecase-grid">
          {useCases.map((card) => (
            <UseCaseCard key={card.title} {...card} />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        badge="FAQ"
        className="faq-section"
        copy="Everything you need to know about castAI, x402, MPP, and Casper CSPR payments."
        title="Questions? We’re Here."
      >
        <div className="faq-panel">
          <Accordion defaultValue={["what-is-castai"]}>
            {faqs.map(([question, answer]) => (
              <AccordionItem key={question} value={slugify(question)}>
                <AccordionTrigger>{question}</AccordionTrigger>
                <AccordionContent>{answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="support-row">
            <span>Need implementation help?</span>
            <LandingButton href="/docs" tone="primary">
              Read the Docs
            </LandingButton>
          </div>
        </div>
      </LandingSection>

      <section className="final-cta">
        <Badge className="section-badge">Open Source</Badge>
        <h2>Build Casper-native paid AI services.</h2>
        <p>
          Use castAI to add x402 payments, MPP transfers, facilitators, routers,
          and checkout experiences to AI agents and HTTP APIs.
        </p>
        <div className="final-cta__actions">
          <LandingButton href="/docs/ai-sdk" tone="inverse">
            Start Building
          </LandingButton>
          <Link href="/docs">View Documentation</Link>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-brand">
          <div className="footer-brand__heading">
            <Image
              alt="castAI"
              className="landing-logo landing-logo--footer"
              height={36}
              src="/favicon.svg"
              width={36}
            />
            <strong>castAI</strong>
          </div>
          <p>
            Casper payment infrastructure for x402, MPP, facilitators, routers,
            AI SDK tools, and HTTP services.
          </p>
        </div>
        <div className="footer-mark" aria-hidden="true">
          <Network />
        </div>
        <div className="footer-links">
          <Link aria-label="GitHub" href="https://github.com/fozagtx/castAI">
            <GithubGlyph />
          </Link>
          <Link aria-label="Docs" href="/docs">
            <BookOpen />
          </Link>
          <Link aria-label="X" href="https://x.com">
            <ExternalLink />
          </Link>
          <span>© 2026 castAI</span>
        </div>
      </footer>
    </main>
  );
}

function LandingSection({
  badge,
  children,
  className,
  copy,
  id,
  title,
}: {
  badge: string;
  children: React.ReactNode;
  className?: string;
  copy: string;
  id?: string;
  title: string;
}) {
  return (
    <section className={cn("landing-section", className)} id={id}>
      <Badge className="section-badge">{badge}</Badge>
      <h2>{title}</h2>
      <p className="section-copy">{copy}</p>
      {children}
    </section>
  );
}

function LandingButton({
  children,
  className,
  href,
  tone,
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  tone: "primary" | "secondary" | "inverse";
}) {
  return (
    <Link
      className={cn(
        buttonVariants({ size: "lg" }),
        "landing-button",
        `landing-button--${tone}`,
        className
      )}
      href={href}
    >
      {children}
    </Link>
  );
}

function FeatureStripItem({ copy, title }: { copy: string; title: string }) {
  return (
    <div className="feature-strip__item">
      <h3>{title}</h3>
      <p>{copy}</p>
    </div>
  );
}

function PackageCard({
  badges,
  description,
  name,
  role,
}: {
  badges: string[];
  description: string;
  name: string;
  role: string;
}) {
  return (
    <Card className="package-card">
      <CardContent>
        <div className="package-card__icon">
          <Package aria-hidden="true" />
        </div>
        <div className="package-card__body">
          <span>{role}</span>
          <h3>{name}</h3>
          <p>{description}</p>
          <div>
            {badges.map((badge) => (
              <Badge key={badge} variant="outline">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkStat({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <Card className="network-stat">
      <CardContent>
        <strong>{title}</strong>
        <span>{description}</span>
      </CardContent>
    </Card>
  );
}

function PaymentStepCard({
  copy,
  icon: Icon,
  title,
}: {
  copy: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className="payment-step-card">
      <CardContent>
        <div className="icon-square">
          <Icon aria-hidden="true" />
        </div>
        <div>
          <h3>{title}</h3>
          <p>{copy}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DeveloperFeatureCard({
  code,
  copy,
  icon: Icon,
  title,
}: {
  code: string;
  copy: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className="developer-card">
      <CardHeader>
        <div className="icon-square">
          <Icon aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{copy}</CardDescription>
      </CardHeader>
      <CardContent>
        <code>{code}</code>
      </CardContent>
    </Card>
  );
}

function UseCaseCard({
  copy,
  icon: Icon,
  title,
}: {
  copy: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <Card className="usecase-card">
      <CardHeader>
        <div className="icon-square">
          <Icon aria-hidden="true" />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{copy}</CardDescription>
      </CardHeader>
    </Card>
  );
}

function TerminalCard({
  compact,
  lines,
}: {
  compact?: boolean;
  lines: string[];
}) {
  return (
    <Card className={cn("terminal-card", compact && "terminal-card--compact")}>
      <CardContent>
        <div className="terminal-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <pre>
          <code>
            {lines.map((line) => (
              <span key={line || "blank-line"}>{line || " "}</span>
            ))}
          </code>
        </pre>
      </CardContent>
    </Card>
  );
}

function GithubGlyph() {
  return (
    <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 .3a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.24c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.11-3.18 0 0 1.01-.32 3.3 1.23a11.46 11.46 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.65 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.82 1.1.82 2.22v3.3c0 .32.21.7.83.58A12 12 0 0 0 12 .3Z" />
    </svg>
  );
}

function NetworkOrb({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("network-orb", compact && "network-orb--compact")}>
      <div className="network-orb__ring" />
      <div className="network-orb__core">
        <Image
          alt=""
          aria-hidden="true"
          className="network-orb__logo"
          height={compact ? 116 : 156}
          src="/favicon.svg"
          width={compact ? 116 : 156}
        />
      </div>
    </div>
  );
}

function titleCase(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
