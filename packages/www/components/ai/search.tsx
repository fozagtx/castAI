"use client";

import type { UseChatHelpers } from "@ai-sdk/react";
import type { Tool, UIMessage, UIToolInvocation } from "ai";
import type { ComponentProps, ReactNode, SyntheticEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Loader2,
  MessageCircleIcon,
  RefreshCw,
  SearchIcon,
  Send,
  X,
} from "lucide-react";
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

export type ChatUIMessage = UIMessage<
  never,
  {
    client: {
      location: string;
    };
  }
>;

export type SearchTool = Tool<{ query: string; limit: number }>;

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
      data-state={open ? "open" : "closed"}
      className={cn(
        position === "float" && [
          "fixed bottom-4 z-20 min-w-24 gap-2 shadow-lg transition-[translate,opacity]",
          "inset-e-[calc(--spacing(4)+var(--removed-body-scroll-bar-size,0px))]",
          open && "translate-y-10 opacity-0",
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

  if (!open) return null;

  return (
    <>
      <button
        aria-label="Close Ask AI"
        className="fixed inset-0 z-30 cursor-default border-0 bg-fd-overlay/65 p-0 backdrop-blur-xs lg:hidden"
        onClick={() => setOpen(false)}
        type="button"
      />
      <aside
        aria-label="Ask AI"
        className={cn(
          "fixed inset-x-2 inset-y-4 z-30 overflow-hidden rounded-2xl border bg-fd-card text-fd-card-foreground shadow-xl",
          "lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[400px] lg:rounded-none lg:border-y-0 lg:border-e-0 lg:border-s",
          "2xl:w-[460px]"
        )}
      >
        <div className="flex size-full flex-col gap-3 p-3">
          <AISearchPanelHeader />
          <AISearchPanelList className="flex-1" />
          <div className="rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm focus-within:shadow-md">
            <AISearchInput />
            <div className="flex items-center gap-1.5 p-1 empty:hidden">
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
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border bg-fd-secondary text-fd-secondary-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <div className="flex-1 px-3 py-2">
        <p className="mb-1 text-sm font-medium">Ask AI</p>
        <p className="text-xs text-fd-muted-foreground">
          Answers come from the docs. Verify details before shipping.
        </p>
      </div>

      <button
        aria-label="Close"
        className={cn(
          buttonVariants({
            size: "icon-sm",
            variant: "ghost",
            className: "m-1 rounded-full text-fd-muted-foreground",
          })
        )}
        onClick={() => setOpen(false)}
        tabIndex={-1}
        type="button"
      >
        <X />
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

  return (
    <List
      className={cn("py-4 overscroll-contain", className)}
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, white 1rem, white calc(100% - 1rem), transparent 100%)",
        ...style,
      }}
      {...props}
    >
      {messages.length === 0 ? (
        <div className="flex size-full flex-col items-center justify-center gap-2 text-center text-sm text-fd-muted-foreground/80">
          <MessageCircleIcon fill="currentColor" stroke="none" />
          <p>Ask about x402, MPP, checkout UI, or agent setup.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-3">
          {chat.error && (
            <div className="rounded-lg border bg-fd-secondary p-2 text-fd-secondary-foreground">
              <p className="mb-1 text-xs text-fd-muted-foreground">
                Request failed
              </p>
              <p className="text-sm">Docs AI is temporarily unavailable.</p>
            </div>
          )}
          {messages.map((item) => (
            <Message key={item.id} message={item} />
          ))}
        </div>
      )}
    </List>
  );
}

export function AISearchInputActions() {
  const { messages, status, setMessages, regenerate } = useChatContext();
  const isLoading = status === "streaming";

  if (messages.length === 0) return null;

  return (
    <>
      {!isLoading && messages.at(-1)?.role === "assistant" && (
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
          <RefreshCw className="size-4" />
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
        onClick={() => setMessages([])}
        type="button"
      >
        Clear
      </button>
    </>
  );
}

const storageKeyInput = "__ai_search_input";

export function AISearchInput(props: ComponentProps<"form">) {
  const { status, sendMessage, stop } = useChatContext();
  const [input, setInput] = useState("");
  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    setInput(localStorage.getItem(storageKeyInput) ?? "");
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
    localStorage.removeItem(storageKeyInput);
  };

  useEffect(() => {
    if (isLoading) document.getElementById("nd-ai-input")?.focus();
  }, [isLoading]);

  return (
    <form
      {...props}
      className={cn("flex items-start pe-2", props.className)}
      onSubmit={onStart}
    >
      <Input
        autoFocus
        className="p-3"
        disabled={isLoading}
        onChange={(e) => {
          setInput(e.target.value);
          localStorage.setItem(storageKeyInput, e.target.value);
        }}
        onKeyDown={(event) => {
          if (!event.shiftKey && event.key === "Enter") {
            onStart(event);
          }
        }}
        placeholder={isLoading ? "Answering..." : "Ask the docs"}
        value={input}
      />
      {isLoading ? (
        <button
          className={cn(
            buttonVariants({
              variant: "secondary",
              className: "mt-2 gap-2 rounded-full transition-all",
            })
          )}
          key="stop"
          onClick={stop}
          type="button"
        >
          <Loader2 className="size-4 animate-spin text-fd-muted-foreground" />
          Stop
        </button>
      ) : (
        <button
          className={cn(
            buttonVariants({
              variant: "default",
              className: "mt-2 rounded-full transition-all",
            })
          )}
          disabled={input.length === 0}
          key="send"
          type="submit"
        >
          <Send className="size-4" />
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

  return (
    <div {...props}>
      <p
        className={cn(
          "mb-1 text-sm font-medium text-fd-muted-foreground",
          message.role === "assistant" && "text-fd-primary"
        )}
      >
        {message.role === "assistant" ? "castAI" : "you"}
      </p>
      <div className="prose text-sm">
        <Markdown text={markdown} />
      </div>

      {searchCalls.map((call) => {
        const count = Array.isArray(call.output) ? call.output.length : 0;

        return (
          <div
            className="mt-3 flex flex-row items-center gap-2 rounded-lg border bg-fd-secondary p-2 text-xs text-fd-muted-foreground"
            key={call.toolCallId}
          >
            <SearchIcon className="size-4" />
            {call.state === "output-error" || call.state === "output-denied" ? (
              <p className="text-fd-error">
                {call.errorText ?? "Search failed"}
              </p>
            ) : (
              <p>
                {!call.output ? "Searching docs..." : `${count} docs results`}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Input(props: ComponentProps<"textarea">) {
  const shared = cn("col-start-1 row-start-1", props.className);

  return (
    <div className="grid flex-1">
      <textarea
        id="nd-ai-input"
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
        behavior: "instant",
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
