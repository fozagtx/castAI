"use client";

import type * as React from "react";
import { Separator as SeparatorPrimitive } from "@base-ui/react/separator";

import { cn } from "@/lib/utils";

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive>) {
  return (
    <SeparatorPrimitive
      className={cn(
        orientation === "vertical"
          ? "h-auto w-px bg-white/10"
          : "h-px w-full bg-white/10",
        className
      )}
      orientation={orientation}
      {...props}
    />
  );
}

export { Separator };
