"use client";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";

export function Component({ onGetStartedClick }: { onGetStartedClick?: () => void } = {}) {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = hostRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const pillContent = (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "h-6 w-6 shrink-0 rounded-md grid place-items-center",
          "bg-[#FC6A21]",
          "shadow-[0_2px_10px_rgba(252,106,33,0.55)]",
        )}
        aria-hidden="true"
      >
        <ArrowRight className="size-4 text-white" />
      </span>
      <span className="text-sm md:text-base md:text-white font-medium tracking-wide text-neutral-800">
        Get started with Lumina
      </span>
    </div>
  );

  return (
    <div className=" w-full flex items-center justify-center ">
      <div
        ref={hostRef}
        className={cn(
          "relative inline-flex items-center justify-center rounded-full",
          "px-2 py-2 isolate select-none",
        )}
        style={
          {
            ["--mx" as any]: "50%",
            ["--my" as any]: "50%",
          } as React.CSSProperties
        }
      >
        {/* Subtle moving glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-full"
        >
          <div
            className={cn(
              "absolute inset-0 rounded-full",
              "bg-[radial-gradient(160px_80px_at_var(--mx)_var(--my),rgba(255,140,0,0.24),transparent_70%)]",
              "blur-2xl",
            )}
          />
        </div>

        {/* Glass pill */}
        <div
          className={cn(
            "relative z-10 rounded-full px-4 py-2",
            "backdrop-blur-xl",
            "bg-white/15",
            "ring-1 ring-black/5 dark:ring-white/10",
            "shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
            onGetStartedClick && "cursor-pointer hover:bg-white/20 transition-colors",
          )}
          {...(onGetStartedClick
            ? { role: "button", onClick: onGetStartedClick, onKeyDown: (e: React.KeyboardEvent) => e.key === "Enter" && onGetStartedClick() }
            : {})}
        >
          {pillContent}
        </div>
      </div>
    </div>
  );
};

function YCMonogram(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 5h3.2l2.8 5 2.8-5H18l-4.6 8v6h-2.8v-6L6 5z"
        fill="currentColor"
      />
    </svg>
  );
}
