
import React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-xl border border-gray-300 bg-white/80 px-4 py-3 text-sm ring-offset-background transition-all duration-200 ease-apple placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-roman-500/60 focus-visible:ring-4 focus-visible:ring-ring/20 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
