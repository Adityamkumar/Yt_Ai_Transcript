import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const sizeStyles = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-4 text-sm',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      isLoading = false,
      disabled,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-xs font-medium text-[var(--text-secondary)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled || isLoading}
            className={cn(
              'w-full rounded-xl border bg-[var(--surface-3)] text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)]',
              'transition-all duration-200',
              'focus:border-[var(--accent)]/40 focus:bg-[var(--surface-2)] focus:shadow-[0_0_0_3px_rgba(157,165,255,0.08)]',
              'focus-visible:outline-none',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              error && 'border-red-500/40 focus:border-red-500/60 focus:shadow-[0_0_0_3px_rgba(248,113,113,0.08)]',
              !error && 'border-[var(--border-medium)]',
              sizeStyles[size],
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            {...props}
          />
          {rightIcon && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
              {rightIcon}
            </span>
          )}
          {isLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[var(--text-muted)] border-t-transparent" />
            </span>
          )}
        </div>
        {error && <p className="mt-1.5 text-[11px] text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-[11px] text-[var(--text-muted)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
