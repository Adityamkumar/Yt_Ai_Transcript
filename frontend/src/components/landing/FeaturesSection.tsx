import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import MagicBento from './MagicBento';

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-24 sm:py-32 overflow-hidden"
      style={{ background: 'var(--canvas)' }}
    >
      {/* Subtle Background Glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,156,247,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--surface-3)] mb-6"
          >
            <Sparkles size={11} className="text-[var(--accent)]" />
            <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
              Capabilities Map
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight leading-[1.2] mb-6"
          >
            A calm structure for your files{' '}
            <span className="font-serif italic font-normal text-[var(--accent)] leading-[1.2]">
              and conversations
            </span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
          >
            EchoMind streamlines material ingestion, analysis, and grounding. Experience the AI-native workspace architecture and real-time citation synchronization.
          </motion.p>
        </div>

        {/* Magic Bento Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <MagicBento 
            textAutoHide={true}
            enableStars={true}
            enableSpotlight={true}
            enableBorderGlow={true}
            enableTilt={true}
            enableMagnetism={true}
            clickEffect={true}
            spotlightRadius={350}
            particleCount={10}
            glowColor="139, 156, 247"
          />
        </motion.div>
      </div>
    </section>
  );
}

