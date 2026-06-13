"use client";

import type * as React from "react";
import * as TabsPrimitive from "@base-ui/react/tabs";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tabs.Root>) {
  return (
    <TabsPrimitive.Tabs.Root
      className={cn("grid gap-5", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tabs.List>) {
  return (
    <TabsPrimitive.Tabs.List
      className={cn(
        "inline-flex w-fit flex-wrap items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tabs.Tab>) {
  return (
    <TabsPrimitive.Tabs.Tab
      className={cn(
        "rounded-full px-4 py-2 text-sm font-semibold text-white/58 transition-all outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[#ff4d7a]/70 data-[selected]:bg-[linear-gradient(180deg,#ff4d7a,#d90046)] data-[selected]:text-white data-[selected]:shadow-[0_12px_26px_rgba(230,51,90,0.28)]",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tabs.Panel>) {
  return (
    <TabsPrimitive.Tabs.Panel
      className={cn(
        "outline-none focus-visible:ring-2 focus-visible:ring-[#ff4d7a]/70",
        className
      )}
      {...props}
    />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
