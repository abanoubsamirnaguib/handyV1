import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-roman-500 text-white hover:bg-roman-500/90', // Primary (60%)
				destructive: 'bg-warning-500 text-white hover:bg-warning-600', // Accent (10%)
				outline:
          'border border-roman-500/30 bg-background text-neutral-900 hover:bg-success-100/30 hover:text-roman-500 hover:border-roman-500',
				secondary:
          'bg-success-100 text-neutral-900 hover:bg-success-100/80', // Secondary (30%)
				ghost: 'hover:bg-success-100 hover:text-roman-500', // Secondary (30%)
				link: 'text-warning-500 underline-offset-4 hover:underline', // Secondary (30%)
				accent: 'bg-roman-500 text-white hover:bg-roman-500/90', // Secondary (30%)
				neutral: 'bg-neutral-500 text-white hover:bg-neutral-600', // Supporting color
			},
			size: {
				default: 'h-10 px-4 py-2',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10',
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
