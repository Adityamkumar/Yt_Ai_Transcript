import { motion } from 'framer-motion';
import { Bot, FileText, Sparkles, Clock, ChevronRight, Send } from 'lucide-react';

const mockMessages = [
  {
    role: 'user',
    content: 'What are the key points from the first 10 minutes?',
  },
  {
    role: 'ai',
    content:
      'In the first 10 minutes, the speaker covers three main themes:\n\n1. **The importance of async-first communication** in remote teams\n2. **Tools like Notion and Linear** for structured project management\n3. **Weekly retrospectives** as the backbone of continuous improvement.',
  },
];

const mockSummary = [
  { icon: Clock, label: '47 min video', value: '2 min read' },
  { icon: Sparkles, label: 'Key insights', value: '8 found' },
  { icon: FileText, label: 'Chapters', value: '5 sections' },
];

export function ShowcaseSection() {
  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden" style={{ background: '#050816' }}>
      {/* Background accent */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 50% at 20% 50%, rgba(77,162,255,0.06) 0%, transparent 70%)',
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
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(77,162,255,0.25)] bg-[rgba(77,162,255,0.06)] mb-5"
          >
            <span className="text-xs font-medium text-[#4DA2FF] tracking-wide">Live product preview</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#F5F7FF] tracking-tight mb-4"
          >
            Your AI-powered{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4DA2FF, #7C5CFF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              video workspace
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base text-[#94A3B8] max-w-lg mx-auto leading-relaxed"
          >
            A clean, minimal interface built for deep research — not distraction.
          </motion.p>
        </div>

        {/* Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Glow behind mockup */}
          <div
            className="absolute inset-x-8 -top-8 h-16 blur-3xl opacity-40 pointer-events-none"
            style={{ background: 'linear-gradient(90deg, #7C5CFF, #4DA2FF)' }}
          />

          {/* Browser frame */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: '#0B1020',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,92,255,0.1), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}
            >
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <div className="w-3 h-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4">
                <div
                  className="rounded-md px-3 py-1 text-xs text-[#94A3B8]/60 max-w-xs"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  echomind.ai/workspace
                </div>
              </div>
            </div>

            {/* App content */}
            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] min-h-[500px]">
              {/* Sidebar */}
              <div
                className="hidden lg:flex flex-col border-r p-4 gap-3"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest mb-2 px-1">
                  Sessions
                </div>
                {[
                  { title: 'System Design Interview', time: '2h 14m', active: true },
                  { title: 'React Performance Tips', time: '34m', active: false },
                  { title: 'Startup Funding 101', time: '58m', active: false },
                ].map((item) => (
                  <div
                    key={item.title}
                    className={`px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                      item.active
                        ? 'bg-[rgba(124,92,255,0.12)] border border-[rgba(124,92,255,0.2)]'
                        : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="text-xs font-medium text-[#F5F7FF] mb-0.5 truncate">
                      {item.title}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">{item.time}</div>
                  </div>
                ))}
              </div>

              {/* Chat area */}
              <div className="flex flex-col">
                {/* Video context */}
                <div
                  className="flex items-center gap-3 px-4 py-3 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <div
                    className="w-12 h-8 rounded-md flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(124,92,255,0.3), rgba(77,162,255,0.3))' }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-[#F5F7FF] truncate">
                      How I Became a Better Programmer
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">youtube.com · 47 min</div>
                  </div>
                  <div className="ml-auto flex-shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded-full text-[#7C5CFF] bg-[rgba(124,92,255,0.1)] border border-[rgba(124,92,255,0.2)]">
                      Ready
                    </span>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 space-y-4 overflow-hidden">
                  {mockMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'ai' && (
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{
                            background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)',
                          }}
                        >
                          <Bot size={13} className="text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-white'
                            : 'text-[#d7dce7]'
                        }`}
                        style={
                          msg.role === 'user'
                            ? {
                                background: 'linear-gradient(135deg, #7C5CFF, #4DA2FF)',
                              }
                            : {
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.07)',
                              }
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input area */}
                <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <span className="text-xs text-[#94A3B8]/60 flex-1">Ask anything about the video...</span>
                    <button className="p-1.5 rounded-lg bg-[#7C5CFF] text-white">
                      <Send size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Summary panel */}
              <div
                className="hidden lg:flex flex-col border-l p-4 gap-4"
                style={{ borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">
                  Summary
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 gap-2">
                  {mockSummary.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      <stat.icon size={13} className="text-[#7C5CFF] flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-[10px] text-[#94A3B8]">{stat.label}</div>
                        <div className="text-xs font-semibold text-[#F5F7FF]">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key points */}
                <div className="flex flex-col gap-2">
                  <div className="text-xs font-semibold text-[#94A3B8] uppercase tracking-widest">
                    Key Points
                  </div>
                  {[
                    'Async communication reduces meetings by 60%',
                    'Documentation is a form of kindness',
                    'Context switching costs 20 min per task',
                  ].map((point) => (
                    <div key={point} className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-[#7C5CFF] mt-0.5 flex-shrink-0" />
                      <span className="text-[10px] text-[#94A3B8] leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>

                {/* Transcript snippet */}
                <div
                  className="flex-1 rounded-lg p-3"
                  style={{
                    background: 'rgba(124,92,255,0.05)',
                    border: '1px solid rgba(124,92,255,0.12)',
                  }}
                >
                  <div className="text-[10px] font-semibold text-[#7C5CFF] mb-2 uppercase tracking-widest">
                    Transcript
                  </div>
                  <p className="text-[10px] text-[#94A3B8] leading-relaxed">
                    "...the key thing I learned is that the best programmers aren't necessarily the ones who write the most code, but the ones who..."
                  </p>
                  <div className="mt-2 text-[10px] text-[#7C5CFF]/70">@ 12:34</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating labels */}
          <motion.div
            className="absolute -left-4 top-1/3 hidden lg:block"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#F5F7FF] shadow-lg"
              style={{
                background: 'rgba(11,16,32,0.9)',
                border: '1px solid rgba(124,92,255,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              🎯 Instant answers
            </div>
          </motion.div>

          <motion.div
            className="absolute -right-4 top-1/2 hidden lg:block"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            <div
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#F5F7FF] shadow-lg"
              style={{
                background: 'rgba(11,16,32,0.9)',
                border: '1px solid rgba(77,162,255,0.3)',
                backdropFilter: 'blur(12px)',
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
