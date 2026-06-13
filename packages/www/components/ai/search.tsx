"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { Tool, UIMessage, UIToolInvocation } from "ai";
import type { ComponentProps, ReactNode, SyntheticEvent } from "react";
import { useChat } from "@ai-sdk/react";
import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  FileSearchIcon,
  LinkSquare02Icon,
  Loading03Icon,
  MailSend02Icon,
  RefreshIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { DefaultChatTransport } from "ai";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

import { Markdown } from "../markdown";
import { buttonVariants } from "../ui/button";
import { HugeIcon } from "../ui/huge-icon";

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

const panelId = "castai-docs-ai";
const inputId = "castai-docs-ai-input";

const Context = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  chat: UseChatHelpers<ChatUIMessage>;
} | null>(null);

export function AISearch({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const chat = useChat<ChatUIMessage>({
    id: "search",
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const value = useMemo(() => ({ chat, open, setOpen }), [chat, open]);

  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function AISearchTrigger({
  position = "default",
  className,
  ...props
}: ComponentProps<"button"> & { position?: "default" | "float" }) {
  const { open, setOpen } = useAISearchContext();

  return (
    <button
      aria-controls={panelId}
      aria-expanded={open}
      data-state={open ? "open" : "closed"}
      className={cn(
        "docs-ai-trigger",
        position === "float" && [
          "fixed bottom-4 z-20 min-w-24 gap-2 shadow-lg transition-[translate,opacity]",
          "inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))]",
          open && "pointer-events-none translate-y-10 opacity-0",
        ],
        className
      )}
      onClick={() => setOpen(!open)}
      type="button"
      {...props}
    >
      {props.children}
    </button>
  );
}

export function AISearchPanel() {
  const { open, setOpen } = useAISearchContext();
  useHotKey();
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close Ask AI"
        className="docs-ai-backdrop"
        onClick={() => setOpen(false)}
        tabIndex={-1}
        type="button"
      />
      <aside
        aria-modal="true"
        aria-label="Ask AI"
        className="docs-ai-panel"
        id={panelId}
        role="dialog"
      >
        <div className="docs-ai-shell">
          <AISearchPanelHeader />
          <AISearchPanelList />
          <div className="docs-ai-composer">
            <AISearchInput />
            <div className="docs-ai-actions">
              <AISearchInputActions />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export function AISearchPanelHeader({
  className,
  ...props
}: ComponentProps<"div">) {
  const { setOpen } = useAISearchContext();

  return (
    <div className={cn("docs-ai-header", className)} {...props}>
      <div className="docs-ai-brand" aria-hidden="true">
        <Image alt="" height={24} src="/favicon.svg" width={24} />
      </div>
      <div className="docs-ai-heading">
        <p>Ask castAI docs</p>
        <span>Setup help for x402, MPP, checkout UI, and agent tools.</span>
      </div>

      <button
        aria-label="Close"
        className={cn(
          buttonVariants({
            size: "icon-sm",
            variant: "ghost",
            className: "docs-ai-close",
          })
        )}
        onClick={() => setOpen(false)}
        type="button"
      >
        <HugeIcon aria-hidden="true" icon={Cancel01Icon} size={16} />
      </button>
    </div>
  );
}

export function AISearchPanelList({
  className,
  style,
  ...props
}: ComponentProps<"div">) {
  const chat = useChatContext();
  const messages = chat.messages.filter((msg) => msg.role !== "system");
  const isLoading = chat.status === "submitted" || chat.status === "streaming";

  return (
    <List className={cn("docs-ai-list", className)} style={style} {...props}>
      <div className="docs-ai-thread">
        {chat.error && (
          <div className="docs-ai-error" role="status">
            <strong>Docs AI is unavailable.</strong>
            <span>Try again after a moment.</span>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="docs-ai-empty">
            <div className="docs-ai-empty__icon" aria-hidden="true">
              <HugeIcon icon={SparklesIcon} size={24} />
            </div>
            <p>Ask about x402, MPP, checkout UI, or agent setup.</p>
            <span>
              Answers cite matching documentation pages when available.
            </span>
          </div>
        ) : (
          messages.map((item) => <Message key={item.id} message={item} />)
        )}

        {isLoading && (
          <div className="docs-ai-thinking" role="status">
            <HugeIcon
              aria-hidden="true"
              className="animate-spin"
              icon={Loading03Icon}
              size={16}
            />
            Reading docs...
          </div>
        )}
      </div>
    </List>
  );
}

export function AISearchInputActions() {
  const { error, messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === "submitted" || status === "streaming";

  if (messages.length === 0) {
    return (
      <span className="docs-ai-action-note">
        Searches docs before answering.
      </span>
    );
  }

  return (
    <>
      <span className="docs-ai-action-note">
        {error
          ? "Request failed."
          : isLoading
            ? "Answering from docs."
            : "Docs answer ready."}
      </span>
      <div className="docs-ai-action-buttons">
        {!isLoading && (error || messages.at(-1)?.role === "assistant") && (
          <button
            className={cn(
              buttonVariants({
                variant: "secondary",
                size: "sm",
                className: "gap-1.5 rounded-full",
              })
            )}
            onClick={() => regenerate()}
            type="button"
          >
            <HugeIcon aria-hidden="true" icon={RefreshIcon} size={16} />
            Retry
          </button>
        )}
        <button
          className={cn(
            buttonVariants({
              variant: "secondary",
              size: "sm",
              className: "rounded-full",
            })
          )}
          disabled={isLoading}
          onClick={() => setMessages([])}
          type="button"
        >
          Clear
        </button>
      </div>
    </>
  );
}

const storageKeyInput = "__ai_search_input";

export function AISearchInput(props: ComponentProps<"form">) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    setInput(readStoredInput());
  }, []);

  const onStart = (e?: SyntheticEvent) => {
    e?.preventDefault();
    const message = input.trim();
    if (message.length === 0) return;

    void sendMessage({
      role: "user",
      parts: [
        {
          type: "data-client",
          data: {
            location: location.href,
          },
        },
        {
          type: "text",
          text: message,
        },
      ],
    });
    setInput("");
    writeStoredInput("");
  };

  useEffect(() => {
    document.getElementById(inputId)?.focus();
  }, []);

  useEffect(() => {
    if (!isLoading) document.getElementById(inputId)?.focus();
  }, [isLoading]);

  return (
    <form
      {...props}
      className={cn("docs-ai-form", props.className)}
      onSubmit={onStart}
    >
      <Input
        aria-label="Ask the castAI docs"
        autoFocus
        className="docs-ai-input"
        disabled={isLoading}
        onChange={(e) => {
          setInput(e.target.value);
          writeStoredInput(e.target.value);
        }}
        onKeyDown={(event) => {
          if (
            !event.shiftKey &&
            event.key === "Enter" &&
            !event.nativeEvent.isComposing
          ) {
            onStart(event);
          }
        }}
        placeholder={
          isLoading
            ? "Reading documentation..."
            : "Ask about x402, MPP, checkout UI..."
        }
        value={input}
      />
      {isLoading ? (
        <button
          className={cn(
            buttonVariants({
              variant: "secondary",
              className: "docs-ai-submit docs-ai-submit--stop",
            })
          )}
          key="stop"
          onClick={stop}
          aria-label="Stop response"
          type="button"
        >
          <HugeIcon
            aria-hidden="true"
            className="animate-spin text-fd-muted-foreground"
            icon={Loading03Icon}
            size={16}
          />
          Stop
        </button>
      ) : (
        <button
          className={cn(
            buttonVariants({
              variant: "default",
              className: "docs-ai-submit",
            })
          )}
          disabled={input.length === 0}
          key="send"
          aria-label="Send message"
          type="submit"
        >
          <HugeIcon aria-hidden="true" icon={MailSend02Icon} size={16} />
        </button>
      )}
    </form>
  );
}

function Message({
  message,
  ...props
}: { message: ChatUIMessage } & ComponentProps<"div">) {
  let markdown = "";
  const searchCalls: UIToolInvocation<SearchTool>[] = [];

  for (const part of message.parts ?? []) {
    if (part.type === "text") {
      markdown += part.text;
      continue;
    }

    if (part.type.startsWith("tool-")) {
      const toolName = part.type.slice("tool-".length);
      const toolPart = part as UIToolInvocation<Tool>;

      if (toolName !== "search" || !toolPart.toolCallId) continue;
      searchCalls.push(toolPart);
    }
  }

  const role = message.role === "assistant" ? "castAI" : "you";

  return (
    <article
      {...props}
      className={cn("docs-ai-message", `docs-ai-message--${message.role}`)}
    >
      <div className="docs-ai-message__meta">{role}</div>
      <div className="docs-ai-message__bubble">
        {markdown.trim() ? (
          <div className="docs-ai-markdown">
            <Markdown text={markdown} />
          </div>
        ) : (
          <span className="docs-ai-message__empty">Preparing response...</span>
        )}

        {searchCalls.map((call) => (
          <SearchCallCard call={call} key={call.toolCallId} />
        ))}
      </div>
    </article>
  );
}

function SearchCallCard({ call }: { call: UIToolInvocation<SearchTool> }) {
  const results = getSearchResults(call.output);
  const hasFailed =
    call.state === "output-error" || call.state === "output-denied";

  return (
    <div className="docs-ai-sources" data-state={call.state}>
      <div className="docs-ai-sources__header">
        <HugeIcon aria-hidden="true" icon={FileSearchIcon} size={15} />
        {hasFailed
          ? call.errorText || "Docs search failed"
          : call.output
            ? `${results.length} docs result${results.length === 1 ? "" : "s"}`
            : "Searching docs..."}
      </div>

      {results.slice(0, 3).map((result) => (
        <a className="docs-ai-source-card" href={result.url} key={result.url}>
          <span>
            <HugeIcon aria-hidden="true" icon={LinkSquare02Icon} size={14} />
            {result.title}
            <HugeIcon
              aria-hidden="true"
              className="docs-ai-source-card__arrow"
              icon={ArrowUpRight01Icon}
              size={13}
            />
          </span>
          {result.description ? <p>{result.description}</p> : null}
          <small>{result.url}</small>
        </a>
      ))}
    </div>
  );
}

function Input(props: ComponentProps<"textarea">) {
  const shared = cn("col-start-1 row-start-1", props.className);

  return (
    <div className="docs-ai-input-wrap">
      <textarea
        id={inputId}
        {...props}
        className={cn(
          "resize-none bg-transparent placeholder:text-fd-muted-foreground focus-visible:outline-none",
          shared
        )}
      />
      <div aria-hidden="true" className={cn(shared, "invisible break-all")}>
        {`${props.value?.toString() ?? ""}\n`}
      </div>
    </div>
  );
}

function List(props: Omit<ComponentProps<"div">, "dir">) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    function callback() {
      containerRef.current?.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "auto",
      });
    }

    const observer = new ResizeObserver(callback);
    callback();

    const element = containerRef.current.firstElementChild;
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      {...props}
      className={cn(
        "fd-scroll-container flex min-w-0 flex-col overflow-y-auto",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

type SearchResult = {
  title: string;
  description?: string;
  url: string;
};

function getSearchResults(output: unknown): SearchResult[] {
  if (!Array.isArray(output)) return [];

  return output.flatMap((item) => {
    if (!isSearchResult(item)) return [];
    return item;
  });
}

function isSearchResult(value: unknown): value is SearchResult {
  if (!value || typeof value !== "object") return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.url === "string" &&
    (candidate.description === undefined ||
      typeof candidate.description === "string")
  );
}

function readStoredInput() {
  try {
    return localStorage.getItem(storageKeyInput) ?? "";
  } catch {
    return "";
  }
}

function writeStoredInput(value: string) {
  try {
    if (value) {
      localStorage.setItem(storageKeyInput, value);
    } else {
      localStorage.removeItem(storageKeyInput);
    }
  } catch {
    // Ignore storage failures; the composer still works without draft restore.
  }
}

function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const original = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = original;
    };
  }, [locked]);
}

export function useHotKey() {
  const { open, setOpen } = useAISearchContext();

  const onKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        e.preventDefault();
      }

      if (e.key === "/" && (e.metaKey || e.ctrlKey) && !open) {
        setOpen(true);
        e.preventDefault();
      }
    },
    [open, setOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyPress);
    return () => window.removeEventListener("keydown", onKeyPress);
  }, [onKeyPress]);
}

export function useAISearchContext() {
  const context = useContext(Context);
  if (!context)
    throw new Error("AISearch components must be rendered inside AISearch.");
  return context;
}

function useChatContext() {
  return useAISearchContext().chat;
}
