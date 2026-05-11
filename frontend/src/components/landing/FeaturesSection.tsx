import { motion } from 'framer-motion';
import { FileText, BrainCircuit, MessageSquareText } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

const features = [
  {
    icon: <FileText size={20} />,
    title: 'AI Transcript Extraction',
    description:
      'Instantly pull full transcripts from any YouTube video URL. Supports auto-generated and manual captions across dozens of languages.',
    gradient: 'rgba(124,92,255,0.18)',
    delay: 0,
  },
  {
    icon: <BrainCircuit size={20} />,
    title: 'Smart Summaries',
    description:
      'Get concise, structured summaries in seconds. EchoMind distills hours of content into key insights, chapters, and action items.',
    gradient: 'rgba(77,162,255,0.18)',
    delay: 0.1,
  },
  {
    icon: <MessageSquareText size={20} />,
    title: 'Contextual AI Chat',
    description:
      'Ask anything about the video. Our AI grounds every answer in the actual transcript, so responses are accurate, cited, and reliable.',
    gradient: 'rgba(124,92,255,0.14)',
    delay: 0.2,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-32" style={{ background: '#050816' }}>
      {/* Section glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(124,92,255,0.07) 0%, transparent 70%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(124,92,255,0.25)] bg-[rgba(124,92,255,0.06)] mb-5"
          >
            <span className="text-xs font-medium text-[#7C5CFF] tracking-wide">Core features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F7FF] tracking-tight mb-4"
          >
            Everything you need to{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              understand videos faster
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base text-[#94A3B8] max-w-xl mx-auto leading-relaxed"
          >
            Three powerful capabilities working together — transcription, summarization, and
            contextual AI chat.
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={feature.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
