import type { IconSvgElement } from "@hugeicons/react";
import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";

type HugeIconProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon"> & {
  icon: IconSvgElement;
};

function HugeIcon({
  color = "currentColor",
  size = 20,
  strokeWidth = 1.8,
  ...props
}: HugeIconProps) {
  return (
    <HugeiconsIcon
      color={color}
      size={size}
      strokeWidth={strokeWidth}
      {...props}
    />
  );
}

export type { IconSvgElement };
export { HugeIcon };
