import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/cn';

const buttonVariants = cva(
  'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors duration-[120ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary-pressed',
        secondary: 'border border-border-strong bg-transparent text-foreground hover:bg-surface-raised active:bg-surface-raised/70',
        ghost: 'text-muted hover:bg-surface-raised hover:text-foreground',
        danger: 'bg-danger text-danger-foreground hover:bg-danger/90 active:bg-danger/80',
        outline: 'border border-border bg-transparent hover:bg-surface-raised',
        link: 'text-link underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-8 px-4',
        sm: 'h-7 px-3 text-xs',
        lg: 'h-10 px-5',
        icon: 'h-8 w-8 rounded-md',
        'icon-sm': 'h-7 w-7 rounded-md',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
