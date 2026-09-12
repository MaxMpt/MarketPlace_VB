import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,background-color,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 active:opacity-80",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-fg hover:bg-primary/90",
        ghost: "bg-transparent text-fg hover:bg-fg/5",
        outline: "bg-surface text-fg shadow-card hover:bg-bg",
        danger: "bg-danger text-primary-fg",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-sm",
        icon: "size-11",
        tab: "h-12 flex-1 flex-col gap-0.5 text-[11px] font-medium",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
