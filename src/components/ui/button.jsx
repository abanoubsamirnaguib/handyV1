import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	// Material 3 buttons: pill shape, label-large, state layer, standard easing
	'state-layer inline-flex items-center justify-center rounded-full text-sm font-medium tracking-wide ring-offset-background transition-[background-color,box-shadow,color] duration-200 ease-m3-standard active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none [&>*]:relative [&>*]:z-[1] select-none',
	{
		variants: {
			variant: {
				default: 'bg-roman-500 text-white hover:shadow-elevation-1', // Filled (primary)
				destructive: 'bg-warning-500 text-white hover:shadow-elevation-1', // Filled (accent)
				outline:
          'border border-roman-500/40 bg-transparent text-roman-600 hover:border-roman-500', // Outlined
				secondary:
          'bg-success-100 text-success-700 hover:shadow-elevation-1', // Tonal
				ghost: 'bg-transparent text-roman-600', // Text
				link: 'text-roman-600 underline-offset-4 hover:underline active:scale-100', // Text/link
				accent: 'bg-roman-500 text-white hover:shadow-elevation-1', // Filled
				neutral: 'bg-neutral-500 text-white hover:shadow-elevation-1', // Filled (neutral)
			},
			size: {
				default: 'h-10 px-6 py-2',
				sm: 'h-9 px-4',
				lg: 'h-12 px-8 text-base',
				icon: 'h-10 w-10 p-0',
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
