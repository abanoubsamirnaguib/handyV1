import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import React from 'react';

const buttonVariants = cva(
	'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
	{
		variants: {
			variant: {
				default: 'bg-olivePrimary text-white hover:bg-olivePrimary/90', // Primary (60%)
				destructive: 'bg-brightOrange text-white hover:bg-brightOrange/90', // Accent (10%)
				outline:
          'border border-olivePrimary/30 bg-background text-darkOlive hover:bg-lightGreen/30 hover:text-olivePrimary hover:border-olivePrimary',
				secondary:
          'bg-lightGreen text-darkOlive hover:bg-lightGreen/80', // Secondary (30%)
				ghost: 'hover:bg-lightGreen hover:text-olivePrimary', // Secondary (30%)
				link: 'text-burntOrange underline-offset-4 hover:underline', // Secondary (30%)
				accent: 'bg-burntOrange text-white hover:bg-burntOrange/90', // Secondary (30%)
				neutral: 'bg-lightBrownGray text-white hover:bg-lightBrownGray/90', // Supporting color
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
