
import React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-12 w-full rounded-m3-xs border border-gray-400 bg-white px-4 py-2 text-sm ring-offset-background transition-[border-color,box-shadow] duration-200 ease-m3-standard file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-roman-500 focus-visible:shadow-[inset_0_0_0_1px_hsl(var(--primary))] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
