import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

interface GlowInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  containerClassName?: string;
  glowing?: boolean;
}

export const GlowInput = forwardRef<HTMLTextAreaElement, GlowInputProps>(
  ({ className, containerClassName, glowing = false, ...props }, ref) => {
    return (
      <div
        className={cn(
          'relative rounded-2xl transition-all duration-300',
          glowing
            ? 'shadow-[0_0_0_1px_rgba(139,92,246,0.6),0_0_30px_rgba(139,92,246,0.2)]'
            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.07)]',
          'focus-within:shadow-[0_0_0_1px_rgba(139,92,246,0.6),0_0_30px_rgba(139,92,246,0.2)]',
          containerClassName
        )}
      >
        {/* Inner glow layer */}
        <div
          className={cn(
            'absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-300 bg-gradient-to-r from-violet-600/5 via-indigo-600/5 to-blue-600/5',
            glowing ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100'
          )}
        />
        <textarea
          ref={ref}
          className={cn(
            'relative w-full bg-transparent resize-none outline-none',
            'text-slate-100 placeholder:text-slate-500',
            'text-sm leading-relaxed',
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

GlowInput.displayName = 'GlowInput';
