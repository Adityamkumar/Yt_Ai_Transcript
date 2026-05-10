import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return (
    <div
      className={cn(
        'shimmer bg-white/5',
        variant === 'rectangular' && 'rounded-xl',
        variant === 'circular' && 'rounded-full',
        variant === 'text' && 'rounded h-4 w-full',
        className
      )}
    />
  );
}

export function ChatSkeleton() {
  return (
    <div className="space-y-6 px-4 py-8 max-w-3xl mx-auto">
      <div className="flex gap-4">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <div className="flex gap-4 flex-row-reverse">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="space-y-2 flex-1 flex flex-col items-end">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-12 w-3/4" />
        </div>
      </div>
      <div className="flex gap-4">
        <Skeleton variant="circular" className="w-10 h-10 flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
