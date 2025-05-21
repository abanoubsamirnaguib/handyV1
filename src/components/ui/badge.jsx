
import React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80", // Primary - olivePrimary (60%)
        secondary:
          "border-transparent bg-lightGreen text-darkOlive hover:bg-lightGreen/80", // Secondary - lightGreen (30%)
        destructive:
          "border-transparent bg-brightOrange text-white hover:bg-brightOrange/80", // Accent - brightOrange (10%)
        outline: "text-foreground border-olivePrimary", // Primary color border
        accent: 
          "border-transparent bg-burntOrange text-white hover:bg-burntOrange/80", // Secondary - burntOrange (30%)
        muted:
          "border-transparent bg-lightBrownGray text-white hover:bg-lightBrownGray/80", // Supporting color
        success:
          "border-transparent bg-paleGreen text-darkOlive hover:bg-paleGreen/80", // Supporting color
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
