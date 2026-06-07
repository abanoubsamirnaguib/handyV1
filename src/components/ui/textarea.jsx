
import React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-m3-xs border border-gray-400 bg-white px-4 py-3 text-sm ring-offset-background transition-[border-color,box-shadow] duration-200 ease-m3-standard placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-roman-500 focus-visible:shadow-[inset_0_0_0_1px_hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
