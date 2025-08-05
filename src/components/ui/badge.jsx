
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", // Primary - roman-500 (60%)
        secondary:
          "border-transparent bg-success-100 text-neutral-900 hover:bg-success-100/80", // Secondary - success-100 (30%)
        destructive:
          "border-transparent bg-warning-500 text-white hover:bg-warning-600", // Accent - warning-500 (10%)
        outline: "text-foreground border-roman-500", // Primary color border
        accent: 
          "border-transparent bg-warning-500 text-white hover:bg-warning-500/80", // Secondary - roman-500 (30%)
        muted:
          "border-transparent bg-neutral-500 text-white hover:bg-neutral-600", // Supporting color
        success:
          "border-transparent bg-success-200 text-neutral-900 hover:bg-success-200/80", // Supporting color
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
