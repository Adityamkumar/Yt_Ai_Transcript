import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const baseStyles = 'bg-[rgba(255,255,255,0.05)]';
  const animationStyles = animate ? 'shimmer-loader' : '';

  const variantStyles = {
    text: 'rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-xl',
  };

  const style: React.CSSProperties = {};
  if (width !== undefined) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={cn(baseStyles, variantStyles[variant], animationStyles, className)}
      style={style}
      aria-hidden="true"
    />
  );
}

/* ── Skeleton Group ─────────────────────── */

interface SkeletonGroupProps {
  lines?: number;
  lineHeight?: number;
  gap?: number;
  className?: string;
  lastLineWidth?: string;
}

export function SkeletonText({
  lines = 3,
  lineHeight = 16,
  gap = 8,
  className,
  lastLineWidth = '60%',
}: SkeletonGroupProps) {
  return (
    <div className={cn('flex flex-col', className)} style={{ gap: `${gap}px` }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height={lineHeight}
          width={i === lines - 1 ? lastLineWidth : '100%'}
        />
      ))}
    </div>
  );
}

/* ── Skeleton Card ──────────────────────── */

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-xl)] border border-[var(--border-soft)] bg-[var(--surface-3)] p-5',
        className
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" height={16} width="60%" className="mb-2" />
          <Skeleton variant="text" height={12} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} lineHeight={14} gap={10} />
    </div>
  );
}

/* ── Skeleton Avatar ────────────────────── */

export function SkeletonAvatar({ size = 40, className }: { size?: number; className?: string }) {
  return <Skeleton variant="circular" width={size} height={size} className={className} />;
}
