/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		'./pages/**/*.{js,jsx}',
		'./components/**/*.{js,jsx}',
		'./app/**/*.{js,jsx}',
		'./src/**/*.{js,jsx}',
	],
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px',
			},
		},
		extend: {
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'SF Pro Display',
					'SF Pro Text',
					'Tajawal',
					'Segoe UI',
					'Helvetica Neue',
					'Arial',
					'sans-serif',
				],
				display: [
					'-apple-system',
					'BlinkMacSystemFont',
					'SF Pro Display',
					'Tajawal',
					'sans-serif',
				],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))',
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))',
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))',
				},
				// Roman Color Palette
				roman: {
					50: '#fdf3f3',
					100: '#fde3e3',
					200: '#fbcecd',
					300: '#f8aaa9',
					400: '#f17a78',
					500: '#e85856',  // Main Primary Color
					600: '#d3312f',
					700: '#b12624',
					800: '#932321',
					900: '#7a2322',
					950: '#420e0d',
				},
				// Neutral Colors
				neutral: {
					100: '#feefd7',
					200: '#f7f2ee',
					300: '#ced6bf',
					400: '#cce4e6',
					900: '#2e2e2f',
				},
				// Success Colors (Swamp Green)
				success: {
					50: '#f4f5f0',
					100: '#e6e9de',
					200: '#ced6c0',
					300: '#a3b18a',
					400: '#93a279',
					500: '#75875b',
					600: '#5b6a46',
					700: '#475239',
					800: '#3b4331',
					900: '#343b2c',
					950: '#1a1e15',
				},
				// Warning Colors (Chardonnay)
				warning: {
					50: '#fef8ee',
					100: '#feefd6',
					200: '#fbdcad',
					300: '#f9c784',
					400: '#f59e42',
					500: '#f1811e',
					600: '#e36713',
					700: '#bc4e12',
					800: '#953e17',
					900: '#783516',
					950: '#411809',
				},
			},
			borderRadius: {
				xl: 'calc(var(--radius) + 6px)',
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': 'calc(var(--radius) + 12px)',
				'3xl': 'calc(var(--radius) + 22px)',
			},
			boxShadow: {
				// Apple-style soft, layered, diffuse shadows
				'apple-sm': '0 1px 2px rgba(0,0,0,0.04), 0 2px 6px rgba(0,0,0,0.05)',
				apple: '0 2px 6px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.08)',
				'apple-md': '0 4px 10px rgba(0,0,0,0.06), 0 14px 40px rgba(0,0,0,0.1)',
				'apple-lg': '0 8px 18px rgba(0,0,0,0.08), 0 24px 60px rgba(0,0,0,0.14)',
				'apple-inset': 'inset 0 1px 0 rgba(255,255,255,0.6)',
			},
			transitionTimingFunction: {
				// Apple spring-like easing
				spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
				apple: 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			backdropBlur: {
				apple: '20px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: 0 },
					to: { height: 'var(--radix-accordion-content-height)' },
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: 0 },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
