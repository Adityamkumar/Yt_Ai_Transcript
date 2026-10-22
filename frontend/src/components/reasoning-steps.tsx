import { useEffect, useState } from "react";
import { cn } from "@/utils/cn";

type Props = {
  /** Messages to cycle through while Lumora prepares an answer. */
  messages: string[];
  messageDuration?: number;
  className?: string;
};

function DotMatrix() {
  return (
    <span className="grid grid-cols-3 gap-[2px]" aria-hidden>
      {Array.from({ length: 9 }).map((_, i) => (
        <span
          key={i}
          className="reasoning-dot size-[3px] rounded-full bg-foreground"
          style={{ animationDelay: `${([0, 1, 2, 7, 8, 3, 6, 5, 4][i] ?? 0) * 110}ms` }}
        />
      ))}
    </span>
  );
}

export function ReasoningSteps({ messages, messageDuration = 2200, className }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % messages.length), messageDuration);
    return () => window.clearInterval(timer);
  }, [messages.length, messageDuration]);

  return (
    <div className={cn("text-[15px] leading-6", className)}>
      <div className="flex items-center gap-2.5">
        <DotMatrix />
        <span className="overflow-hidden">
          <span key={`m${index}`} className="reasoning-fade inline-block">
            <span className="reasoning-shimmer">{messages[index]}</span>
          </span>
        </span>
      </div>
    </div>
  );
}
