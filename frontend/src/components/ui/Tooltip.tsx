import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: "right" | "top" | "bottom" | "left";
  sideOffset?: number;
  delayDuration?: number;
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({
  content,
  shortcut,
  side = "right",
  sideOffset = 8,
  delayDuration = 100,
  children,
  className,
}: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    if (side === "right") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.right + sideOffset,
      });
    } else if (side === "left") {
      setCoords({
        top: rect.top + rect.height / 2,
        left: rect.left - sideOffset,
      });
    } else if (side === "top") {
      setCoords({
        top: rect.top - sideOffset,
        left: rect.left + rect.width / 2,
      });
    } else if (side === "bottom") {
      setCoords({
        top: rect.bottom + sideOffset,
        left: rect.left + rect.width / 2,
      });
    }
  };

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      calculatePosition();
      setIsOpen(true);
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onScrollOrResize = () => {
      calculatePosition();
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [isOpen]);

  // Clone trigger element and attach ref and hover handlers
  const child = React.Children.only(children) as React.ReactElement<any>;
  const trigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node;
      // Preserve existing ref if present
      const childRef = (child as any).ref;
      if (typeof childRef === "function") {
        childRef(node);
      } else if (childRef && "current" in childRef) {
        childRef.current = node;
      }
    },
    onMouseEnter: (e: React.MouseEvent) => {
      child.props.onMouseEnter?.(e);
      handleMouseEnter();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      child.props.onMouseLeave?.(e);
      handleMouseLeave();
    },
    onClick: (e: React.MouseEvent) => {
      child.props.onClick?.(e);
      setIsOpen(false);
    },
  });

  return (
    <>
      {trigger}
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.12, ease: [0.2, 0, 0, 1] }}
                style={{
                  position: "fixed",
                  top: coords.top,
                  left: coords.left,
                  transform:
                    side === "right"
                      ? "translateY(-50%)"
                      : side === "left"
                        ? "translate(-100%, -50%)"
                        : side === "top"
                          ? "translate(-50%, -100%)"
                          : "translateX(-50%)",
                  zIndex: 99999,
                }}
                className={`pointer-events-none flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#232428] px-2.5 py-1.5 text-[12.5px] font-medium leading-none text-white shadow-xl shadow-black/50 backdrop-blur-md ${className || ""}`}
              >
                <span>{content}</span>
                {shortcut && (
                  <span className="rounded-md border border-white/[0.12] bg-white/[0.10] px-1.5 py-0.5 text-[11px] font-medium tracking-tight text-neutral-300">
                    {shortcut}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
