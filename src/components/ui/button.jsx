import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 ease-apple active:scale-[0.96] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 select-none',
	{
		variants: {
			variant: {
				default: 'bg-roman-500 text-white shadow-apple-sm hover:bg-roman-600 hover:shadow-apple', // Primary (60%)
				destructive: 'bg-warning-500 text-white shadow-apple-sm hover:bg-warning-600 hover:shadow-apple', // Accent (10%)
				outline:
          'border border-roman-500/25 bg-white/70 backdrop-blur-sm text-neutral-900 hover:bg-roman-500/5 hover:text-roman-600 hover:border-roman-500/50',
				secondary:
          'bg-success-100 text-neutral-900 shadow-apple-sm hover:bg-success-100/80', // Secondary (30%)
				ghost: 'hover:bg-neutral-900/5 hover:text-roman-600', // Secondary (30%)
				link: 'text-roman-500 underline-offset-4 hover:underline active:scale-100', // Secondary (30%)
				accent: 'bg-roman-500 text-white shadow-apple-sm hover:bg-roman-600 hover:shadow-apple', // Secondary (30%)
				neutral: 'bg-neutral-500 text-white shadow-apple-sm hover:bg-neutral-600', // Supporting color
			},
			size: {
				default: 'h-11 px-5 py-2',
				sm: 'h-9 rounded-lg px-4',
				lg: 'h-12 rounded-2xl px-8 text-base',
				icon: 'h-11 w-11',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	const Comp = asChild ? Slot : 'button';
	return (
		<Comp
			className={cn(buttonVariants({ variant, size, className }))}
			ref={ref}
			{...props}
		/>
	);
});
Button.displayName = 'Button';

export { Button, buttonVariants };
