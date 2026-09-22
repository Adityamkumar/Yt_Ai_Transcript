import VerticalMarqueeDemo from "@/components/ui/marquee-03";
import { motion } from "framer-motion";

export function TestimonialsSection() {
  return (
    <section
      id="about"
      aria-label="Testimonials"
      className="relative mt-10 overflow-hidden border-y border-[var(--border-medium)] bg-[#07080c]"
    >
      <div className="flex w-full justify-center border-b border-[var(--border-medium)] px-4 py-12 text-center sm:px-6 sm:py-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mx-auto w-full max-w-3xl text-center text-3xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-4xl"
        >
          What learners are saying
        </motion.h2>
      </div>
      <div className="mx-auto w-full max-w-6xl px-2 py-10 sm:px-4 sm:py-12">
        <VerticalMarqueeDemo />
      </div>
    </section>
  );
}
