import type { Config } from 'tailwindcss';

const preset: Partial<Config> = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: {
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          raised: 'hsl(var(--surface-raised) / <alpha-value>)',
          overlay: 'hsl(var(--surface-overlay) / <alpha-value>)',
          error: 'hsl(var(--surface-error) / <alpha-value>)',
        },
        glass: 'hsl(var(--glass) / var(--glass-alpha))',
        border: {
          DEFAULT: 'hsl(var(--border) / <alpha-value>)',
          subtle: 'hsl(var(--border-subtle) / <alpha-value>)',
          strong: 'hsl(var(--border-strong) / <alpha-value>)',
          focus: 'hsl(var(--border-focus) / <alpha-value>)',
        },
        focus: 'hsl(var(--border-focus) / <alpha-value>)',
        disabled: 'hsl(var(--disabled-foreground) / <alpha-value>)',
        link: 'hsl(var(--link) / <alpha-value>)',
        trend: 'hsl(var(--trend) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        muted: 'hsl(var(--muted-foreground) / <alpha-value>)',
        faint: 'hsl(var(--faint-foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
          pressed: 'hsl(var(--primary-pressed) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'hsl(var(--danger) / <alpha-value>)',
          foreground: 'hsl(var(--danger-foreground) / <alpha-value>)',
        },
        success: 'hsl(var(--success) / <alpha-value>)',
        info: 'hsl(var(--info) / <alpha-value>)',
        'diff-add': 'hsl(var(--diff-add-bg) / <alpha-value>)',
        'diff-del': 'hsl(var(--diff-del-bg) / <alpha-value>)',
        'diff-add-row': 'hsl(var(--diff-add-bg) / var(--diff-row-alpha))',
        'diff-del-row': 'hsl(var(--diff-del-bg) / var(--diff-row-alpha))',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        xl: 'calc(var(--radius) + 4px)',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 6px)',
      },
      backdropBlur: {
        glass: '20px',
      },
      ringColor: {
        DEFAULT: 'hsl(var(--border-focus))',
      },
      boxShadow: {
        soft: 'var(--shadow-soft)',
      },
      keyframes: {
        locate: {
          '0%': { backgroundColor: 'hsl(var(--primary) / 0.42)', boxShadow: 'inset 3px 0 0 hsl(var(--primary)), 0 0 0 6px hsl(var(--primary) / 0.25)' },
          '60%': { backgroundColor: 'hsl(var(--primary) / 0.16)', boxShadow: 'inset 3px 0 0 hsl(var(--primary)), 0 0 0 2px hsl(var(--primary) / 0)' },
          '100%': { backgroundColor: 'hsl(var(--primary) / 0.1)', boxShadow: 'inset 3px 0 0 hsl(var(--primary)), 0 0 0 0 hsl(var(--primary) / 0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'dialog-in': {
          from: { opacity: '0', transform: 'translate(-50%, -49%) scale(0.97)' },
          to: { opacity: '1', transform: 'translate(-50%, -50%) scale(1)' },
        },
      },
      animation: {
        locate: 'locate 1100ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'dialog-in': 'dialog-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
};

export default preset;
