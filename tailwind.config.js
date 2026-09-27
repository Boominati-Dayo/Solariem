/* eslint-disable */
/**
 * SOLARIEM design system — "Ledger"
 * Minimalist editorial-Swiss. Bone paper, warm ink, single verdigris accent.
 * Hairlines instead of shadows. Zero radius, enforced here so it can't regress.
 *
 * NOTE ON THE LEGACY SCALES (primary / navy / secondary / muted / light / gold):
 * The dashboard predates this system and makes ~2,000 references to these ramps.
 * Rather than rewrite every call site, the ramps are recoloured in place while
 * PRESERVING THEIR LIGHTNESS CONTRACT, which the existing JSX depends on:
 *   - navy-900 must stay dark   -> 398 `text-navy-900` + 150 `bg-navy-900`
 *   - primary-500 must stay dark -> 189 `text-primary-500` on light surfaces
 * So: navy = warm ink family, primary = verdigris family, and the
 * `bg-navy-900 text-primary-500` label pattern was migrated to `text-navy-50`.
 * @type {import('tailwindcss').Config}
 */
module.exports = {
	darkMode: ["class"],
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',

				/* ---- Primary = the single brand accent: verdigris ---- */
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					50: "#EDF2F0", 100: "#D3E0DC", 200: "#A9C3BC",
					300: "#7BA69D", 400: "#3C8378", 500: "#0E5A50",
					600: "#0A463E", 700: "#07332D", 800: "#04211D",
					900: "#02120F",
				},

				/* ---- Navy = warm ink family (the dark surfaces) ---- */
				navy: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					50: "#F5F4F0", 100: "#E6E4DE", 200: "#CFCBC3",
					300: "#A5A198", 400: "#77736B", 500: "#4E4B44",
					600: "#35322C", 700: "#232220", 800: "#171614",
					900: "#14130F",
				},

				/* ---- Secondary: same verdigris family, for legacy call sites ---- */
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					50: "#EDF2F0", 100: "#D3E0DC", 200: "#A9C3BC",
					300: "#7BA69D", 400: "#3C8378", 500: "#0E5A50",
					600: "#0A463E", 700: "#07332D", 800: "#04211D",
					900: "#02120F",
				},

				/* ---- Neutral warm greys ---- */
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					50: "#FFFFFF", 100: "#F5F4F0", 200: "#EBE9E3",
					300: "#DAD7D0", 400: "#BDB9B0", 500: "#9A968D",
					600: "#77736B", 700: "#5A574F", 800: "#3D3B36",
					900: "#232220",
				},
				light: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))',
					50: "#FFFFFF", 100: "#F5F4F0", 200: "#EBE9E3",
					300: "#DAD7D0", 400: "#BDB9B0", 500: "#9A968D",
					600: "#77736B", 700: "#5A574F", 800: "#3D3B36",
					900: "#232220",
				},
				/* ---- Solariem gold: the second brand voice ----
				   This key used to hold a COPY OF THE VERDIGRIS RAMP under the
				   name "gold", described as "retained for compatibility". It was
				   a trap: every `gold-*` class silently rendered teal, and
				   `bg-gold` meant `bg-primary`. Checked before repointing --
				   zero Tailwind `gold-50..900` classes exist in src/. (The five
				   textual matches for "gold" are a virtual-card LEVEL id in
				   VirtualCardsSection, which paints from the primary ramp and
				   never touched this scale.) Now it is actually gold.

				   Contrast anchors, measured against bone #FAF9F6:
				     700 #885011 = 6.23:1  AA   the lowest step safe for text
				     500 #C3811D = 3.08:1  UI/borders only
				     ink on 400 #DD9C2C = 7.85:1  AAA  button fill
				   Never light text on any step of this ramp. */
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					/* Ink, not white. bone-on-gold is 1.61:1 and fails. */
					foreground: 'hsl(var(--foreground))',
					text: 'hsl(var(--gold-text))',
					bright: 'hsl(var(--gold-bright))',
					mid: 'hsl(var(--gold-mid))',
					tint: 'hsl(var(--gold-tint))',
					hover: 'hsl(var(--gold-hover))',
					50: "#F7EFDE", 100: "#F0E3C4", 200: "#E1C78D",
					300: "#D2A857", 400: "#DD9C2C", 500: "#C3811D",
					600: "#A96A12", 700: "#885011", 800: "#6B3F0E",
					900: "#4A2A09",
				},

				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					subtle: 'hsl(var(--accent-subtle))',
					hover: 'hsl(var(--accent-hover))',
				},
				positive: 'hsl(var(--positive))',
				surface: {
					2: 'hsl(var(--muted))',
					3: 'hsl(var(--surface-3))',
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				'border-input': 'hsl(var(--border-input))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))',
					'6': 'hsl(var(--chart-6))'
				}
			},

			screens: {
				mobile: '870px'
			},

			/* ---- Type: one voice per surface. Serif for narrative, sans for system. ---- */
			fontFamily: {
				sans: ['var(--font-geist)', 'system-ui', '-apple-system', 'sans-serif'],
				display: ['var(--font-instrument-serif)', 'Georgia', 'serif'],
				mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
			},

			/* ---- Two modular ramps off 16px: UI = 1.25, display = 1.333 ---- */
			fontSize: {
				'display-2': ['4.75rem', { lineHeight: '1', letterSpacing: '-0.03em' }],
				'display-1': ['3.75rem', { lineHeight: '1.03', letterSpacing: '-0.03em' }],
				'h1': ['3rem', { lineHeight: '1.08', letterSpacing: '-0.025em' }],
				'h2': ['2.125rem', { lineHeight: '1.18', letterSpacing: '-0.02em' }],
				'h3': ['1.625rem', { lineHeight: '1.23', letterSpacing: '-0.015em' }],
				'h4': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.01em' }],
				'lead': ['1.3125rem', { lineHeight: '1.52', letterSpacing: '-0.005em' }],
				'body': ['1.0625rem', { lineHeight: '1.65', letterSpacing: '0' }],
				'body-sm': ['0.9375rem', { lineHeight: '1.6', letterSpacing: '0' }],
				'caption': ['0.8125rem', { lineHeight: '1.54', letterSpacing: '0.005em' }],
				'micro': ['0.75rem', { lineHeight: '1.33', letterSpacing: '0.01em' }],
				'data': ['0.8125rem', { lineHeight: '1.23', letterSpacing: '0' }],
				'figure': ['3rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
			},

			/* ---- Layout rails ---- */
			maxWidth: {
				container: '75rem',
				'container-wide': '90rem',
				measure: '42.5rem',
				form: '27.5rem',
				read: '38rem',
			},
			spacing: {
				section: { DEFAULT: '6rem', lg: '8rem', xl: '10rem' },
			},

			/* ---- Shape: 0px, enforced at config level so it cannot regress.
			       `full` is preserved for status dots, avatars and progress tracks. ---- */
			borderRadius: {
				none: '0px',
				xs: '2px',
				sm: '2px',
				DEFAULT: '0px',
				md: '0px',
				lg: '0px',
				xl: '0px',
				'2xl': '0px',
				'3xl': '0px',
				full: '9999px',
			},

			/* ---- Elevation is reserved for things that genuinely float. ---- */
			boxShadow: {
				none: 'none',
				'float-sm': '0 1px 2px 0 rgb(20 19 15 / 0.04)',
				'float-md': '0 8px 24px -8px rgb(20 19 15 / 0.12)',
				'float-lg': '0 16px 48px -12px rgb(20 19 15 / 0.18)',
				sm: '0 1px 2px 0 rgb(20 19 15 / 0.04)',
				DEFAULT: 'none',
				md: '0 8px 24px -8px rgb(20 19 15 / 0.12)',
				lg: '0 16px 48px -12px rgb(20 19 15 / 0.18)',
				xl: '0 16px 48px -12px rgb(20 19 15 / 0.18)',
				'2xl': '0 16px 48px -12px rgb(20 19 15 / 0.18)',
			},

			transitionDuration: {
				DEFAULT: '200ms',
			},
			transitionTimingFunction: {
				DEFAULT: 'cubic-bezier(0.2, 0, 0, 1)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
}
