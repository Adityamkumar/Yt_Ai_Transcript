import { motion } from 'framer-motion';
import { FileText, BrainCircuit, MessageSquareText, FileSearch } from 'lucide-react';

const features = [
  {
    icon: FileText,
    number: '01',
    title: 'AI Transcript Extraction',
    description:
      'Instantly pull full transcripts from any YouTube video URL. Supports auto-generated and manual captions across dozens of languages.',
    accent: '#7C5CFF',
    accentBg: 'rgba(124,92,255,0.08)',
    accentBorder: 'rgba(124,92,255,0.2)',
    tag: 'YouTube',
    delay: 0,
  },
  {
    icon: BrainCircuit,
    number: '02',
    title: 'Smart Summaries',
    description:
      'EchoMind distills hours of content into key insights, chapters, and action items — structured and ready in seconds.',
    accent: '#4DA2FF',
    accentBg: 'rgba(77,162,255,0.08)',
    accentBorder: 'rgba(77,162,255,0.2)',
    tag: 'AI-powered',
    delay: 0.08,
  },
  {
    icon: MessageSquareText,
    number: '03',
    title: 'Contextual AI Chat',
    description:
      'Ask anything about the video. Every answer is grounded in the actual transcript — accurate, cited, and reliable.',
    accent: '#A78BFA',
    accentBg: 'rgba(167,139,250,0.08)',
    accentBorder: 'rgba(167,139,250,0.2)',
    tag: 'Contextual',
    delay: 0.16,
  },
  {
    icon: FileSearch,
    number: '04',
    title: 'Chat with PDF',
    description:
      'Upload any PDF document and chat with it using the same powerful AI. Extract insights, summarize pages, and ask follow-up questions.',
    accent: '#34D399',
    accentBg: 'rgba(52,211,153,0.08)',
    accentBorder: 'rgba(52,211,153,0.2)',
    tag: 'New',
    isNew: true,
    delay: 0.24,
  },
];

const steps = [
  { step: '1', label: 'Paste a YouTube URL or upload a PDF' },
  { step: '2', label: 'AI extracts transcript & builds context' },
  { step: '3', label: 'Chat, summarize, and export instantly' },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 sm:py-36 overflow-hidden" style={{ background: '#050816' }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(124,92,255,0.06) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(124,92,255,0.25)] bg-[rgba(124,92,255,0.06)] mb-6"
          >
            <span className="text-xs font-medium text-[#7C5CFF] tracking-wide">Core features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#F5F7FF] tracking-tight mb-5 leading-tight"
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
              understand faster
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-[#94A3B8] max-w-xl mx-auto leading-relaxed"
          >
            Four powerful capabilities working together — from YouTube videos to PDFs, powered by AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center gap-6 mt-8"
          >
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)' }}
                >
                  {s.step}
                </div>
                <span className="text-xs text-[#94A3B8] hidden sm:block">{s.label}</span>
                {i < steps.length - 1 && (
                  <div className="w-8 h-px ml-2 hidden sm:block" style={{ background: 'rgba(255,255,255,0.1)' }} />
                )}
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              initial={{ y: 32, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.6, delay: feature.delay, ease: 'easeOut' }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group relative p-7 sm:p-8 rounded-2xl overflow-hidden cursor-default"
              style={{
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 50% at 10% 20%, ${feature.accentBg} 0%, transparent 70%)`,
                  border: `1px solid ${feature.accentBorder}`,
                }}
              />

              <div className="relative flex items-start gap-5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: feature.accentBg,
                    border: `1px solid ${feature.accentBorder}`,
                  }}
                >
                  <feature.icon size={22} style={{ color: feature.accent }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2.5">
                    <span
                      className="text-[11px] font-mono font-bold tracking-widest"
                      style={{ color: feature.accent, opacity: 0.5 }}
                    >
                      {feature.number}
                    </span>
                    {feature.isNew && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide"
                        style={{
                          background: 'rgba(52,211,153,0.12)',
                          color: '#34D399',
                          border: '1px solid rgba(52,211,153,0.25)',
                        }}
                      >
                        NEW
                      </span>
                    )}
                    {!feature.isNew && (
                      <span
                        className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                        style={{
                          background: feature.accentBg,
                          color: feature.accent,
                          border: `1px solid ${feature.accentBorder}`,
                        }}
                      >
                        {feature.tag}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[17px] font-semibold text-[#F5F7FF] mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{feature.description}</p>
                </div>
              </div>

              <div
                className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: `linear-gradient(to right, transparent, ${feature.accent}55, transparent)`,
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
