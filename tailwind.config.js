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
					'Roboto Flex',
					'Roboto',
					'Tajawal',
					'system-ui',
					'Segoe UI',
					'Helvetica Neue',
					'Arial',
					'sans-serif',
				],
				display: ['Roboto Flex', 'Roboto', 'Tajawal', 'sans-serif'],
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
				// Material 3 shape scale
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 4px)',
				sm: 'calc(var(--radius) - 8px)',
				'm3-xs': '4px',
				'm3-sm': '8px',
				'm3-md': '12px',
				'm3-lg': '16px',
				'm3-xl': '28px',
			},
			boxShadow: {
				// Material Design 3 elevation levels (key + ambient shadow)
				'elevation-1':
					'0 1px 2px 0 rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15)',
				'elevation-2':
					'0 1px 2px 0 rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15)',
				'elevation-3':
					'0 4px 8px 3px rgba(0,0,0,0.15), 0 1px 3px 0 rgba(0,0,0,0.30)',
				'elevation-4':
					'0 6px 10px 4px rgba(0,0,0,0.15), 0 2px 3px 0 rgba(0,0,0,0.30)',
				'elevation-5':
					'0 8px 12px 6px rgba(0,0,0,0.15), 0 4px 4px 0 rgba(0,0,0,0.30)',
			},
			transitionTimingFunction: {
				// Material 3 motion easing
				'm3-standard': 'cubic-bezier(0.2, 0, 0, 1)',
				'm3-emphasized': 'cubic-bezier(0.3, 0, 0.8, 0.15)',
				'm3-decelerate': 'cubic-bezier(0.05, 0.7, 0.1, 1)',
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
				'm3-ripple': {
					to: { transform: 'scale(4)', opacity: '0' },
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'm3-ripple': 'm3-ripple 0.6s linear',
			},
		},
	},
	plugins: [require('tailwindcss-animate')],
};
