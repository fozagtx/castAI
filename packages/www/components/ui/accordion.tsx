"use client";

import type * as React from "react";
import * as AccordionPrimitive from "@base-ui/react/accordion";
import { ChevronDownIcon } from "@hugeicons/core-free-icons";

import { HugeIcon } from "@/components/ui/huge-icon";
import { cn } from "@/lib/utils";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Accordion.Root>) {
  return (
    <AccordionPrimitive.Accordion.Root
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Accordion.Item>) {
  return (
    <AccordionPrimitive.Accordion.Item
      className={cn(
        "rounded-2xl border border-white/10 bg-white/[0.035] px-5 transition-colors data-[open]:border-[#e6335a]/45 data-[open]:bg-[#24131a]",
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Accordion.Trigger>) {
  return (
    <AccordionPrimitive.Accordion.Header>
      <AccordionPrimitive.Accordion.Trigger
        className={cn(
          "flex min-h-14 w-full items-center justify-between gap-4 text-left text-[0.96rem] font-semibold text-white outline-none transition-colors hover:text-[#ff7b9d] focus-visible:ring-2 focus-visible:ring-[#ff4d7a]/70 [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform data-[panel-open]:[&_svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <HugeIcon aria-hidden="true" icon={ChevronDownIcon} size={16} />
      </AccordionPrimitive.Accordion.Trigger>
    </AccordionPrimitive.Accordion.Header>
  );
}

function AccordionContent({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Accordion.Panel>) {
  return (
    <AccordionPrimitive.Accordion.Panel
      className={cn(
        "overflow-hidden pb-5 text-sm leading-7 text-[#b9b9bf] data-[ending-style]:animate-accordion-up data-[starting-style]:animate-accordion-down",
        className
      )}
      {...props}
    />
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
