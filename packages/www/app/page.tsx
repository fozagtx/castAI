import type * as React from "react";
import {
  BookOpenTextIcon,
  CodeXmlIcon,
  Coins01Icon,
  ComputerTerminal01Icon,
  GithubIcon,
  Globe02Icon,
  LockIcon,
  PackageIcon,
  Route01Icon,
  ServerStack01Icon,
  ShieldEnergyIcon,
  Wallet01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons";
import Image from "next/image";
import Link from "next/link";

import type { IconSvgElement } from "@/components/ui/huge-icon";
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
import { HugeIcon } from "@/components/ui/huge-icon";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const networkStats = [
  ["casper:mainnet", "Chain: casper"],
  ["casper:testnet", "Chain: casper-test"],
  ["CSPR", "Native asset"],
  ["motes", "Smallest unit"],
  ["9 decimals", "Asset precision"],
  ["RPC checked", "Payment receipt lookup"],
  ["Replay protected", "Prevent duplicate payment use"],
  ["HTTP gated", "Protected routes unlock after payment"],
];

const paymentSteps = [
  {
    icon: Wallet01Icon,
    title: "1. Client Signs Payment",
    copy: "Private key or signer submits native CSPR transfer deploys.",
  },
  {
    icon: ShieldEnergyIcon,
    title: "2. Server Checks Payment",
    copy: "Reads Casper RPC for amount, recipient, sender, and replay use.",
  },
  {
    icon: LockIcon,
    title: "3. x402 Middleware Accepts",
    copy: "Protected request is approved after the payment check passes.",
  },
  {
    icon: Route01Icon,
    title: "4. Router Forwards Traffic",
    copy: "Paid HTTP requests are forwarded to the target AI service.",
  },
];

const startPaths = [
  {
    icon: ZapIcon,
    title: "AI agent payments",
    copy: "Add x402 and MPP paid-resource calls to agent workflows.",
    href: "/docs/ai-sdk/agent-tools",
    cta: "Open agent tools",
  },
  {
    icon: LockIcon,
    title: "Protected HTTP APIs",
    copy: "Gate an endpoint and unlock it after a verified Casper transfer.",
    href: "/docs/x402/quickstart",
    cta: "Start x402 quickstart",
  },
  {
    icon: Wallet01Icon,
    title: "Checkout UI",
    copy: "Drop a payment prompt into React without inventing the state model.",
    href: "/docs/ai-sdk/ui-components",
    cta: "View UI components",
  },
  {
    icon: ComputerTerminal01Icon,
    title: "MCP and CLI",
    copy: "Scaffold agent, checkout, and MCP projects from the command line.",
    href: "/docs/ai-sdk/mcp-cli",
    cta: "Set up tools",
  },
];

const developerCards = [
  {
    icon: CodeXmlIcon,
    title: "AI UI Tools",
    copy: "Give agents the ability to pay for x402 and MPP resources with Casper CSPR.",
    code: "createCastaiAgentTools({ x402Fetch })",
    href: "/docs/ai-sdk/agent-tools",
  },
  {
    icon: Wallet01Icon,
    title: "Checkout UI",
    copy: "Drop in React components for payment prompts and developer-friendly checkout flows.",
    code: '<CastaiCheckout scheme="x402" />',
    href: "/docs/ai-sdk/ui-components",
  },
  {
    icon: ServerStack01Icon,
    title: "Protected HTTP Routes",
    copy: "Gate APIs, model endpoints, tools, and services behind CSPR payment checks.",
    code: "router.forwardAfterPayment(request)",
    href: "/docs/router",
  },
];

const proofPoints = [
  "Open-source TypeScript packages",
  "Casper mainnet and testnet docs",
  "x402, MPP, MCP, CLI, and checkout paths",
];

const useCases = [
  {
    icon: ZapIcon,
    title: "Paid AI Tools",
    copy: "Charge agents before they call premium tools or model endpoints.",
  },
  {
    icon: Globe02Icon,
    title: "API Monetization",
    copy: "Protect HTTP services with x402 payment middleware.",
  },
  {
    icon: Coins01Icon,
    title: "Casper Payment Rails",
    copy: "Use native CSPR transfers for machine-to-machine payments.",
  },
];

const faqs = [
  [
    "What is castAI?",
    "castAI is an open-source Casper payments infrastructure layer for AI agents, x402 resources, MPP transfers, facilitators, routers, checkout UI, and HTTP services.",
  ],
  [
    "What packages are included?",
    "The toolkit includes x402, MPP, AI UI, facilitator, router, MCP, CLI, and React developer components under the @castaisdk scope.",
  ],
  [
    "How does x402 work with Casper?",
    "The client submits a native CSPR transfer. The server or facilitator checks the transaction through Casper RPC before unlocking the protected HTTP resource.",
  ],
  [
    "What networks are supported?",
    "The package model supports casper:mainnet and casper:testnet with CSPR, motes, and 9-decimal asset precision.",
  ],
  [
    "Can AI agents make payments with this?",
    "Yes. The AI UI tools let agents call x402 or MPP paid resources and format responses into model-ready text.",
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
          <LogoPlate />
          <HeroTerminalFlow />
        </div>
        <div className="hero-copy">
          <h1>Casper Payments Infrastructure Layer for AI Agents.</h1>
          <p>
            castAI gives agents a simple path to request a paid resource, send
            CSPR, and unlock the response through x402, MPP, routers, and
            checkout UI.
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
            <HugeIcon aria-hidden="true" icon={ComputerTerminal01Icon} />
            <code>npm install @castaisdk/ai-sdk @castaisdk/x402</code>
          </div>
          <ul className="hero-proof-list" aria-label="Project signals">
            {proofPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
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
          title="Agent-Ready UI"
          copy="AI UI tools, llm.text helpers, checkout UI, and React components."
        />
        <Separator
          className="feature-strip__separator"
          orientation="vertical"
        />
        <FeatureStripItem
          title="Facilitators & Routers"
          copy="Check payment receipts and forward protected HTTP traffic after payment."
        />
      </section>

      <LandingSection
        badge="Start Here"
        copy="Choose the integration path that matches the thing you are building. Each path opens the relevant docs first, not a generic landing page."
        title="Get to the Right Implementation Fast."
      >
        <div className="start-path-grid">
          {startPaths.map((path) => (
            <StartPathCard key={path.title} {...path} />
          ))}
        </div>
      </LandingSection>

      <LandingSection
        badge="How It Fits"
        copy="The UI gives each part of the payment path a focused package instead of forcing developers to wire every step from scratch."
        id="packages"
        title="One Payment Path, Split Into Useful Building Blocks."
      >
        <div className="story-bento-grid">
          <BentoCard
            className="story-bento-card--wide"
            icon={CodeXmlIcon}
            label="@castaisdk/ai-sdk"
            title="Agent asks for a paid resource"
            copy="Tools expose x402 and MPP calls to AI agents without hiding the payment path."
          />
          <BentoCard
            icon={Wallet01Icon}
            label="@castaisdk/mpp"
            title="CSPR moves on Casper"
            copy="Native transfers use motes, account hashes, and the selected Casper network."
          />
          <BentoCard
            icon={Route01Icon}
            label="@castaisdk/router"
            title="HTTP opens after payment"
            copy="The router forwards the request only after the payment path succeeds."
          />
          <BentoCard
            icon={ServerStack01Icon}
            label="@castaisdk/facilitator"
            title="Server checks the receipt"
            copy="Amount, recipient, sender, network, and replay use are checked through Casper RPC."
          />
          <BentoCard
            className="story-bento-card--tall"
            icon={PackageIcon}
            label="@castaisdk/x402"
            title="x402 becomes Casper-native"
            copy="The package turns payment-required HTTP resources into a CSPR-based request flow."
          />
          <BentoCard
            icon={Globe02Icon}
            label="React UI"
            title="Checkout gets a real interface"
            copy="Prebuilt components help developers test payment prompts without building UI first."
          />
        </div>
        <div className="section-actions">
          <LandingButton href="/docs" tone="primary">
            Explore Packages
          </LandingButton>
        </div>
      </LandingSection>

      <LandingSection
        badge="Casper Native"
        copy="Native Casper transfers, RPC checks, and replay protection are part of the payment path."
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
        copy="An agent requests a resource, receives payment instructions, sends CSPR, and gets the response."
        title="From Agent Request to Paid Response."
      >
        <div className="payment-flow">
          <div className="payment-flow__column">
            {paymentSteps.slice(0, 2).map((step) => (
              <PaymentStepCard key={step.title} {...step} />
            ))}
          </div>
          <div className="payment-flow__center" aria-hidden="true">
            <LogoPlate compact />
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
        copy="Install the UI packages, connect a Casper payment fetcher, and place the payment step in front of the resource."
        title="Wire the Flow Into Your App."
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
          Use castAI to add a Casper payments infrastructure layer across AI
          agents, x402 resources, MPP transfers, facilitators, routers, and
          checkout experiences.
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
            Casper payments infrastructure layer for AI agents, x402, MPP,
            facilitators, routers, AI UI tools, and HTTP services.
          </p>
        </div>
        <div className="footer-links">
          <Link aria-label="GitHub" href="https://github.com/fozagtx/castAI">
            <HugeIcon aria-hidden="true" icon={GithubIcon} />
          </Link>
          <Link aria-label="Docs" href="/docs">
            <HugeIcon aria-hidden="true" icon={BookOpenTextIcon} />
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

function StartPathCard({
  copy,
  cta,
  href,
  icon: Icon,
  title,
}: {
  copy: string;
  cta: string;
  href: string;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <Link className="start-path-card" href={href}>
      <div className="icon-square">
        <HugeIcon aria-hidden="true" icon={Icon} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
      <span>{cta}</span>
    </Link>
  );
}

function BentoCard({
  className,
  copy,
  icon: Icon,
  label,
  title,
}: {
  className?: string;
  copy: string;
  icon: IconSvgElement;
  label: string;
  title: string;
}) {
  return (
    <Card className={cn("story-bento-card", className)}>
      <CardContent>
        <div className="story-bento-card__top">
          <div className="icon-square">
            <HugeIcon aria-hidden="true" icon={Icon} />
          </div>
          <span>{label}</span>
        </div>
        <h3>{title}</h3>
        <p>{copy}</p>
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
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <Card className="payment-step-card">
      <CardContent>
        <div className="icon-square">
          <HugeIcon aria-hidden="true" icon={Icon} />
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
  href,
  icon: Icon,
  title,
}: {
  code: string;
  copy: string;
  href: string;
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <Card className="developer-card">
      <CardHeader>
        <div className="icon-square">
          <HugeIcon aria-hidden="true" icon={Icon} />
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{copy}</CardDescription>
      </CardHeader>
      <CardContent>
        <code>{code}</code>
        <Link className="developer-card__link" href={href}>
          Open docs
        </Link>
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
  icon: IconSvgElement;
  title: string;
}) {
  return (
    <Card className="usecase-card">
      <CardHeader>
        <div className="icon-square">
          <HugeIcon aria-hidden="true" icon={Icon} />
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
        <div className="terminal-label" aria-hidden="true">
          terminal
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

function HeroTerminalFlow() {
  return (
    <div className="hero-terminal-flow">
      <div className="hero-terminal-flow__header" aria-hidden="true">
        <span>castAI flow</span>
        <span>x402 + CSPR</span>
      </div>
      <div className="hero-terminal-flow__lines">
        <span className="hero-terminal-flow__line hero-terminal-flow__line--one">
          agent requests paid model output
        </span>
        <span className="hero-terminal-flow__line hero-terminal-flow__line--two">
          x402 returns Casper payment instructions
        </span>
        <span className="hero-terminal-flow__line hero-terminal-flow__line--three">
          wallet sends CSPR on Casper
        </span>
        <span className="hero-terminal-flow__line hero-terminal-flow__line--four">
          resource opens for the agent
        </span>
      </div>
      <span className="hero-terminal-flow__cursor" />
    </div>
  );
}

function LogoPlate({ compact = false }: { compact?: boolean }) {
  return (
    <div className={cn("logo-plate", compact && "logo-plate--compact")}>
      <div className="logo-plate__core">
        <Image
          alt=""
          aria-hidden="true"
          className="logo-plate__logo"
          height={compact ? 116 : 156}
          src="/favicon.svg"
          width={compact ? 116 : 156}
        />
      </div>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
