import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Camera specific colors
				'camera-overlay': 'hsl(var(--camera-overlay))',
				'camera-overlay-text': 'hsl(var(--camera-overlay-text))',
				'camera-focus': 'hsl(var(--camera-focus))',
				'camera-grid': 'hsl(var(--camera-grid))',
				'gps-active': 'hsl(var(--gps-active))',
				'gps-inactive': 'hsl(var(--gps-inactive))',
				'gps-manual': 'hsl(var(--gps-manual))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'camera-focus': {
					'0%': {
						transform: 'scale(1)',
						opacity: '0.5'
					},
					'50%': {
						transform: 'scale(1.1)',
						opacity: '1'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '0.5'
					}
				},
				'capture-flash': {
					'0%': {
						opacity: '0'
					},
					'50%': {
						opacity: '0.8'
					},
					'100%': {
						opacity: '0'
					}
				},
				'gps-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						opacity: '1'
					},
					'50%': {
						transform: 'scale(1.05)',
						opacity: '0.8'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'camera-focus': 'camera-focus 2s ease-in-out infinite',
				'capture-flash': 'capture-flash 0.3s ease-out',
				'gps-pulse': 'gps-pulse 2s ease-in-out infinite'
			},
			backgroundImage: {
				'gradient-camera': 'var(--gradient-camera)',
				'gradient-overlay': 'var(--gradient-overlay)'
			},
			boxShadow: {
				'camera': 'var(--shadow-camera)',
				'overlay': 'var(--shadow-overlay)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
