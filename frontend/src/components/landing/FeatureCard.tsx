import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export function FeatureCard({ icon, title, description, gradient, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative p-6 sm:p-7 rounded-2xl overflow-hidden cursor-default"
      style={{
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Hover border glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: gradient
            ? `radial-gradient(circle at 20% 20%, ${gradient} 0%, transparent 60%)`
            : 'radial-gradient(circle at 20% 20%, rgba(124,92,255,0.08) 0%, transparent 60%)',
          border: '1px solid rgba(124,92,255,0.18)',
        }}
      />

      {/* Icon */}
      <div
        className="relative w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: gradient
            ? `linear-gradient(135deg, ${gradient}, rgba(77,162,255,0.15))`
            : 'linear-gradient(135deg, rgba(124,92,255,0.2), rgba(77,162,255,0.1))',
          border: '1px solid rgba(124,92,255,0.2)',
        }}
      >
        <div className="text-[#7C5CFF] group-hover:scale-110 transition-transform duration-200">
          {icon}
        </div>
      </div>

      {/* Content */}
      <h3 className="text-base font-semibold text-[#F5F7FF] mb-2.5 tracking-tight">{title}</h3>
      <p className="text-sm text-[#94A3B8] leading-relaxed">{description}</p>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(124,92,255,0.5), transparent)',
        }}
      />
    </motion.div>
  );
}
