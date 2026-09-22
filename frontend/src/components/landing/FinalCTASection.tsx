import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Grainient } from "@/components/ui/Grainient";

export function FinalCTASection() {
  return (
    <section
      aria-labelledby="final-cta-title"
      className="relative overflow-hidden border-y border-[var(--border-medium)] bg-[#07080c]"
    >
      <div
        className="relative flex min-h-[390px] items-center justify-center px-6 py-16 text-center sm:min-h-[440px] sm:px-10 sm:py-20"
      >
        <Grainient
          className="pointer-events-none opacity-90"
          color1="#7266d6"
          color2="#4338a8"
          color3="#17143a"
          timeSpeed={0.25}
        />
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex w-full max-w-3xl flex-col items-center"
        >
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-[11px]">
            Ready to explore?
          </span>

          <h2
            id="final-cta-title"
            className="mt-5 max-w-2xl text-3xl font-semibold leading-[1.04] tracking-tight text-[var(--text-primary)] sm:mt-6 sm:text-4xl lg:text-5xl"
          >
            Turn your content into{" "}
            <span className="font-serif font-normal italic text-[var(--accent)]">
              meaningful conversations.
            </span>
          </h2>

          <p className="mt-5 max-w-[42rem] text-sm leading-[1.7] text-[var(--text-secondary)] sm:mt-6 sm:text-base">
            Bring your YouTube videos and PDFs into Lumora and explore them
            with grounded AI conversations.
          </p>

          <Link
            to="/signup"
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-[rgba(199,204,255,0.22)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[#08090c] shadow-[0_8px_24px_rgba(157,165,255,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[var(--accent-strong)] hover:shadow-[0_12px_30px_rgba(157,165,255,0.24)] sm:mt-8 sm:px-6 sm:py-3.5"
          >
            <span>Start Exploring Free</span>
            <ArrowUpRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
