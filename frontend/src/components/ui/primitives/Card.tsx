import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'elevated' | 'floating' | 'glass' | 'premium';
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-[var(--surface-3)] border border-[var(--border-soft)]',
  elevated: 'surface-elevated',
  floating: 'surface-floating',
  glass: 'glass-surface',
  premium: 'premium-card',
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, variant = 'default', hover = false, padding = 'md', className, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-[var(--radius-xl)] transition-all duration-200',
          variantStyles[variant],
          paddingStyles[padding],
          hover && 'premium-card-hover',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* ── Card Header ────────────────────────── */

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  action?: ReactNode;
}

export function CardHeader({ children, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)} {...props}>
      <div className="min-w-0 flex-1">{children}</div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── Card Title ─────────────────────────── */

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export function CardTitle({ children, className, ...props }: CardTitleProps) {
  return (
    <h3 className={cn('text-sm font-semibold text-[var(--text-primary)]', className)} {...props}>
      {children}
    </h3>
  );
}

/* ── Card Description ───────────────────── */

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export function CardDescription({ children, className, ...props }: CardDescriptionProps) {
  return (
    <p className={cn('text-xs text-[var(--text-muted)] mt-0.5', className)} {...props}>
      {children}
    </p>
  );
}

/* ── Card Content ───────────────────────── */

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardContent({ children, className, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

/* ── Card Footer ────────────────────────── */

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function CardFooter({ children, className, ...props }: CardFooterProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-soft)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
