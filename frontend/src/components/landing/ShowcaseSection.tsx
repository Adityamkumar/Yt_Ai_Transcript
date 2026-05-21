import { motion } from 'framer-motion';
import {
  Bot,
  FileText,
  Sparkles,
  Clock,
  ChevronRight,
  Send,
  Play,
  FileSearch,
  Youtube,
  Zap,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

const mockMessages = [
  {
    role: 'user',
    content: 'What are the 3 most important takeaways from this video?',
  },
  {
    role: 'ai',
    content:
      'Here are the 3 key takeaways:\n\n1. **Async-first communication** — eliminates 60% of unnecessary meetings\n2. **Documentation as kindness** — write for future-you and your team\n3. **Deep work blocks** — context switching costs 20+ min per interruption',
  },
];

const mockSummary = [
  { icon: Clock, label: '47 min video', value: '2 min read', color: '#7C5CFF' },
  { icon: Sparkles, label: 'Key insights', value: '8 found', color: '#4DA2FF' },
  { icon: FileText, label: 'Chapters', value: '5 sections', color: '#A78BFA' },
];

const sessions = [
  { title: 'System Design Interview', time: '2h 14m', active: true, type: 'youtube' },
  { title: 'React Performance Tips', time: '34m', active: false, type: 'youtube' },
  { title: 'Product Strategy Doc', time: '12 pages', active: false, type: 'pdf' },
];

const keyPoints = [
  'Async reduces meetings by 60%',
  'Documentation is a form of kindness',
  'Context switching: -20 min per task',
];

const demoFeatures = [
  {
    icon: Youtube,
    label: 'YouTube Chat',
    desc: 'Ask anything about any video',
    color: '#FF4444',
    bg: 'rgba(255,68,68,0.08)',
    border: 'rgba(255,68,68,0.2)',
  },
  {
    icon: FileSearch,
    label: 'PDF Chat',
    desc: 'Upload docs, ask questions',
    color: '#34D399',
    bg: 'rgba(52,211,153,0.08)',
    border: 'rgba(52,211,153,0.2)',
  },
  {
    icon: BookOpen,
    label: 'Smart Notes',
    desc: 'AI-generated study notes',
    color: '#4DA2FF',
    bg: 'rgba(77,162,255,0.08)',
    border: 'rgba(77,162,255,0.2)',
  },
  {
    icon: Zap,
    label: 'Instant Summary',
    desc: 'Full video in 2 minutes',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.2)',
  },
];

function AnimatedMessage({ msg, index }: { msg: (typeof mockMessages)[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.6 + index * 0.3 }}
      className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {msg.role === 'ai' && (
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)' }}
        >
          <Bot size={12} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed ${
          msg.role === 'user'
            ? 'rounded-tr-sm text-white'
            : 'rounded-tl-sm text-[#CBD5E1]'
        }`}
        style={
          msg.role === 'user'
            ? { background: 'linear-gradient(135deg, #7C5CFF, #5B8FFF)' }
            : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }
        }
      >
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>
            {line
              .split(/(\*\*[^*]+\*\*)/)
              .map((part, j) =>
                part.startsWith('**') && part.endsWith('**') ? (
                  <strong key={j} className="text-white font-semibold">
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                ),
              )}
            {i < msg.content.split('\n').length - 1 && <br />}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function ShowcaseSection() {
  return (
    <section
      id="about"
      className="relative py-28 sm:py-36 overflow-hidden"
      style={{ background: '#050816' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(77,162,255,0.05) 0%, transparent 65%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 20% 80%, rgba(124,92,255,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 mb-14"
        >
          {demoFeatures.map((f) => (
            <div
              key={f.label}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
              style={{ background: f.bg, border: `1px solid ${f.border}` }}
            >
              <f.icon size={14} style={{ color: f.color }} />
              <div>
                <div className="text-[11px] font-semibold text-[#F5F7FF]">{f.label}</div>
                <div className="text-[10px] text-[#94A3B8]">{f.desc}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(77,162,255,0.25)] bg-[rgba(77,162,255,0.06)] mb-6"
          >
            <span className="text-xs font-medium text-[#4DA2FF] tracking-wide">Live product preview</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl lg:text-[56px] font-bold text-[#F5F7FF] tracking-tight mb-5 leading-tight"
          >
            See EchoMind{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4DA2FF, #7C5CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              in action
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg text-[#94A3B8] max-w-lg mx-auto leading-relaxed"
          >
            A clean, focused workspace built for deep research — not distraction.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto mb-16"
        >
          <div
            className="absolute -inset-px rounded-2xl opacity-60 blur-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,162,255,0.3))',
            }}
          />

          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: '#0A0F1E',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow:
                '0 50px 100px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,92,255,0.12), inset 0 1px 0 rgba(255,255,255,0.07)',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.025)' }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 mx-4 flex items-center gap-2">
                <div
                  className="rounded-md px-3 py-1 text-xs text-[#94A3B8]/50 max-w-xs"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  echomind.ai/workspace
                </div>
                <div className="flex gap-1 ml-2">
                  {['YouTube', 'PDF'].map((tab, i) => (
                    <div
                      key={tab}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-medium"
                      style={
                        i === 0
                          ? {
                              background: 'rgba(124,92,255,0.15)',
                              color: '#A78BFA',
                              border: '1px solid rgba(124,92,255,0.25)',
                            }
                          : { color: 'rgba(148,163,184,0.5)' }
                      }
                    >
                      {tab}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] min-h-[480px]">
              <div
                className="hidden lg:flex flex-col border-r p-4 gap-2"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] font-bold text-[#94A3B8]/60 uppercase tracking-[0.15em] mb-3 px-1">
                  Sessions
                </div>
                {sessions.map((item) => (
                  <div
                    key={item.title}
                    className="px-3 py-2.5 rounded-xl transition-colors"
                    style={
                      item.active
                        ? {
                            background: 'rgba(124,92,255,0.1)',
                            border: '1px solid rgba(124,92,255,0.2)',
                          }
                        : { border: '1px solid transparent' }
                    }
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      {item.type === 'pdf' ? (
                        <FileSearch size={10} className="text-[#34D399] flex-shrink-0" />
                      ) : (
                        <Youtube size={10} className="text-[#FF4444] flex-shrink-0" />
                      )}
                      <div className="text-[11px] font-medium text-[#F5F7FF] truncate leading-tight">
                        {item.title}
                      </div>
                    </div>
                    <div className="text-[9px] text-[#94A3B8] pl-4">{item.time}</div>
                  </div>
                ))}

                <div className="mt-auto pt-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {[
                    { label: 'Transcripts', check: true },
                    { label: 'Smart Notes', check: true },
                    { label: 'PDF Upload', check: true },
                  ].map((f) => (
                    <div key={f.label} className="flex items-center gap-2 py-1">
                      <CheckCircle2 size={10} className="text-[#7C5CFF]" />
                      <span className="text-[10px] text-[#94A3B8]">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col">
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-12 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, rgba(255,68,68,0.3), rgba(124,92,255,0.3))' }}
                  >
                    <Play size={10} className="text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-[#F5F7FF] truncate">
                      How I Became a Better Programmer
                    </div>
                    <div className="text-[9px] text-[#94A3B8]">youtube.com · 47 min</div>
                  </div>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{
                      color: '#34D399',
                      background: 'rgba(52,211,153,0.1)',
                      border: '1px solid rgba(52,211,153,0.2)',
                    }}
                  >
                    Ready
                  </span>
                </div>

                <div className="flex-1 p-4 space-y-3.5 overflow-hidden">
                  {mockMessages.map((msg, i) => (
                    <AnimatedMessage key={i} msg={msg} index={i} />
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="flex gap-2 items-center"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)' }}
                    >
                      <Bot size={12} className="text-white" />
                    </div>
                    <div
                      className="px-3 py-2 rounded-2xl rounded-tl-sm text-[11px]"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <span className="flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </motion.div>
                </div>

                <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-[11px] text-[#94A3B8]/50 flex-1">
                      Ask anything about the video...
                    </span>
                    <button
                      className="p-1.5 rounded-lg text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)' }}
                    >
                      <Send size={11} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                className="hidden lg:flex flex-col border-l p-4 gap-5"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-[9px] font-bold text-[#94A3B8]/60 uppercase tracking-[0.15em]">
                  Summary
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {mockSummary.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <stat.icon size={13} style={{ color: stat.color }} className="flex-shrink-0" />
                      <div>
                        <div className="text-[9px] text-[#94A3B8]">{stat.label}</div>
                        <div className="text-[11px] font-semibold text-[#F5F7FF]">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-[9px] font-bold text-[#94A3B8]/60 uppercase tracking-[0.15em]">
                    Key Points
                  </div>
                  {keyPoints.map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <ChevronRight size={11} className="text-[#7C5CFF] mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-[#94A3B8] leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>

                <div
                  className="flex-1 rounded-xl p-3"
                  style={{
                    background: 'rgba(124,92,255,0.05)',
                    border: '1px solid rgba(124,92,255,0.12)',
                  }}
                >
                  <div className="text-[9px] font-bold text-[#7C5CFF] mb-2 uppercase tracking-[0.12em]">
                    Transcript
                  </div>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    "...the best programmers aren't the ones who write the most code, but the ones who
                    communicate most clearly..."
                  </p>
                  <div className="mt-2 text-[9px] text-[#7C5CFF]/70">@ 12:34</div>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute -left-5 top-1/3 hidden lg:block"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F5F7FF] shadow-xl"
              style={{
                background: 'rgba(10,15,30,0.9)',
                border: '1px solid rgba(124,92,255,0.35)',
                backdropFilter: 'blur(16px)',
              }}
            >
              🎯 Instant answers
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-5 top-2/5 hidden lg:block"
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          >
            <div
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F5F7FF] shadow-xl"
              style={{
                background: 'rgba(10,15,30,0.9)',
                border: '1px solid rgba(52,211,153,0.35)',
                backdropFilter: 'blur(16px)',
              }}
            >
              📄 PDF Chat — New
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-5 bottom-1/4 hidden lg:block"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
          >
            <div
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#F5F7FF] shadow-xl"
              style={{
                background: 'rgba(10,15,30,0.9)',
                border: '1px solid rgba(77,162,255,0.35)',
                backdropFilter: 'blur(16px)',
              }}
            >
              ⚡ Real-time AI
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
