import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot, FileText, Sparkles, Clock, ChevronRight,
  Send, Play, FileSearch, Youtube, Zap, BookOpen,
  CheckCircle2, RefreshCw
} from 'lucide-react';

interface MockMessage {
  role: 'user' | 'ai';
  content: string;
}

interface SandboxSession {
  id: string;
  title: string;
  sourceType: 'youtube' | 'pdf';
  metaText: string;
  sourceMeta: string;
  statLabel: string;
  statValue: string;
  questions: { q: string; a: string }[];
  initialMessages: MockMessage[];
  outline: { title: string; time?: string; page?: string }[];
  excerpt: string;
  excerptMeta: string;
}

const sessionsData: SandboxSession[] = [
  {
    id: 'sys-design',
    title: 'System Design: Database Scaling',
    sourceType: 'youtube',
    metaText: 'Systems Academy · 47 min video',
    sourceMeta: 'youtube.com · 47 min',
    statLabel: 'Duration Analysis',
    statValue: '47m video · 2m scan',
    questions: [
      {
        q: 'What is database sharding?',
        a: 'Database sharding is a horizontal scaling strategy. It splits a single database table across multiple database nodes based on a partition key (like user_id), preventing write limits from bottlenecking a single master instance.'
      },
      {
        q: 'Explain read replicas vs sharding.',
        a: 'Read replicas copy transactions to read-only nodes to scale query traffic. Sharding partitions actual rows across nodes to scale write traffic. Modern architectures combine both for linear scaling.'
      }
    ],
    initialMessages: [
      {
        role: 'user',
        content: 'Give me the 3 key database scaling strategies.'
      },
      {
        role: 'ai',
        content: 'The 3 key database scaling strategies are:\n\n1. **Read Replicas** — copy data to read-only nodes to offload queries.\n2. **Sharding** — partition tables horizontally across instances.\n3. **Decouple database metadata** — separate massive arrays (like transcript segments) into a dedicated vector space.'
      }
    ],
    outline: [
      { title: '1. Scaling Limits of Single Master', time: '00:00 - 05:20' },
      { title: '2. Implementing Read Replicas', time: '05:20 - 12:40' },
      { title: '3. Horizontal Table Sharding', time: '12:40 - 28:15' }
    ],
    excerpt: '"...the simplest mistake in database design is stuffing large unstructured arrays directly into rows. This pollutes indexing pages and slows queries..."',
    excerptMeta: '@ 14:20'
  },
  {
    id: 'react-perf',
    title: 'React Performance Architecture',
    sourceType: 'youtube',
    metaText: 'Frontend Labs · 24 min video',
    sourceMeta: 'youtube.com · 24 min',
    statLabel: 'Duration Analysis',
    statValue: '24m video · 1m scan',
    questions: [
      {
        q: 'What causes performance bottlenecks in lists?',
        a: 'Performance bottlenecks in lists are caused by rendering thousands of active DOM nodes at once. Standard mapping triggers layout calculations for items off-screen. Virtualization solves this by rendering only viewport elements.'
      },
      {
        q: 'How does memoization solve rendering issues?',
        a: 'Memoization (React.memo, useMemo) prevents child components from re-rendering if their incoming props have not changed, avoiding massive virtual DOM diff operations.'
      }
    ],
    initialMessages: [
      {
        role: 'user',
        content: 'Summarize the core React performance tips.'
      },
      {
        role: 'ai',
        content: 'Core optimizations include:\n\n- **Virtualize large lists** using react-window to keep DOM footprint small.\n- **Colocate state updates** to child components to limit re-render scope.\n- **Memoize expensive operations** using useMemo.'
      }
    ],
    outline: [
      { title: '1. Virtual DOM Bottlenecks', time: '00:00 - 04:30' },
      { title: '2. DOM Virtualization specs', time: '04:30 - 14:15' },
      { title: '3. Strategic Memoization rules', time: '14:15 - end' }
    ],
    excerpt: '"...rendering elements the user cannot see is wasted CPU cycles. Use list virtualization to restrict rendering to the active browser window..."',
    excerptMeta: '@ 06:12'
  },
  {
    id: 'rag-specs',
    title: 'Decoupled Vector Architecture.pdf',
    sourceType: 'pdf',
    metaText: 'DeepMind Labs · 12 pages',
    sourceMeta: 'decoupled_specs.pdf · 12 pages',
    statLabel: 'Document Size',
    statValue: '12 pages · 34 vector nodes',
    questions: [
      {
        q: 'Why separate transcript vectors from video metadata?',
        a: 'Decoupling vectors from metadata avoids loading massive arrays of text chunk nodes during simple lists operations. The parent record remains light, speeding up metadata lookups while chunks are fetched separately only for RAG queries.'
      },
      {
        q: 'What are the query latency results?',
        a: 'Decoupled vector queries achieve an average retrieval latency of 78ms, compared to 320ms in the legacy model, due to optimized single-record lookups.'
      }
    ],
    initialMessages: [
      {
        role: 'user',
        content: 'What is the primary architectural proposal?'
      },
      {
        role: 'ai',
        content: 'The document proposes a decoupled RAG vector architecture:\n\n- **Light Video Metadata**: store only titles, URLs, and states in the `videos` collection.\n- **Decoupled Chunks**: store text segments and embeddings in a distinct `transcriptchunks` collection.\n- **Reduced Payload**: avoids massive document payload reads during general queries.'
      }
    ],
    outline: [
      { title: '1. Introduction to Payload Bloat', page: 'Page 1 - 3' },
      { title: '2. Decoupled Vector Database Design', page: 'Page 4 - 8' },
      { title: '3. Performance Latency Comparison', page: 'Page 9 - 12' }
    ],
    excerpt: '"...a decoupled database collection pattern isolates high-dimensional vector chunks. RAG queries retrieve indexes on-demand without metadata load penalties..."',
    excerptMeta: 'Page 5 Specs'
  }
];

export function ShowcaseSection() {
  const [activeSessionId, setActiveSessionId] = useState('sys-design');
  const [messages, setMessages] = useState<MockMessage[]>([]);
  const [selectedQ, setSelectedQ] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const activeSession = sessionsData.find((s) => s.id === activeSessionId) || sessionsData[0];

  useEffect(() => {
    setMessages(activeSession.initialMessages);
    setSelectedQ(null);
    setAiResponse('');
    setIsTyping(false);
  }, [activeSessionId]);

  const handlePromptClick = (question: string, answer: string) => {
    if (isTyping) return;
    setSelectedQ(question);
    setIsTyping(true);
    setAiResponse('');

    const updatedMessages = [...activeSession.initialMessages, { role: 'user' as const, content: question }];
    setMessages(updatedMessages);

    let index = 0;
    const typingInterval = setInterval(() => {
      setAiResponse((prev) => {
        const next = prev + answer.charAt(index);
        index++;
        if (index >= answer.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
          setMessages([...updatedMessages, { role: 'ai' as const, content: answer }]);
          setSelectedQ(null);
        }
        return next;
      });
    }, 12);
  };

  return (
    <section
      id="about"
      className="relative py-28 sm:py-36 overflow-hidden"
      style={{ background: 'var(--canvas)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 60% at 85% 50%, rgba(139,156,247,0.03) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--surface-3)] mb-6"
          >
            <span className="text-xs font-medium text-[var(--accent)] tracking-wide">Live Interactive Preview</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-4xl sm:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-5 leading-tight"
          >
            Explore the{' '}
            <span className="font-serif italic font-normal text-[var(--accent)]">
              active workspace
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] max-w-lg mx-auto leading-relaxed"
          >
            A minimal, structured space designed for learning. Switch sessions, trigger suggested queries, and experience RAG grounding in real-time.
          </motion.p>
        </div>

        {/* WORKSPACE PREVIEW CONTAINER */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-6xl mx-auto"
        >
          {/* Ambient Glow */}
          <div
            className="absolute -inset-px rounded-2xl opacity-40 blur-2xl pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(139,156,247,0.2), rgba(77,162,255,0.15))',
            }}
          />

          {/* Core Chrome Frame */}
          <div
            className="relative rounded-2xl overflow-hidden bg-[var(--canvas-subtle)] border border-[var(--border-medium)] shadow-[0_32px_64px_rgba(0,0,0,0.35)]"
          >
            {/* Window Top Bar controls */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-soft)] bg-[var(--surface-3)]">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 mx-4 flex items-center justify-center">
                <div className="rounded-lg px-4 py-1 text-[10px] font-mono text-[var(--text-muted)] border border-[var(--border-soft)] bg-black/5 dark:bg-black/30">
                  echomind.ai/workspace/{activeSessionId}
                </div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wide">RAG_Online</span>
              </div>
            </div>

            {/* Mobile Workspace Selector */}
            <div className="lg:hidden flex border-b border-[var(--border-soft)] bg-[var(--surface-3)] p-2 overflow-x-auto gap-1">
              {sessionsData.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSessionId(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10.5px] font-semibold flex-shrink-0 transition-colors flex items-center gap-1.5 ${
                    activeSessionId === item.id
                      ? 'bg-[var(--accent-subtle)] border border-[var(--accent)]/30 text-[var(--text-primary)] font-bold shadow-sm'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.sourceType === 'youtube' ? <Youtube size={11} className="text-red-400" /> : <FileSearch size={11} className="text-emerald-400" />}
                  <span className="truncate max-w-[120px]">{item.title}</span>
                </button>
              ))}
            </div>

            {/* Main Workspace layout split */}
            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_260px] min-h-[500px]">
              
              {/* Column 1: Left Sessions Sidebar */}
              <div className="hidden lg:flex flex-col border-r border-[var(--border-soft)] bg-[var(--surface-3)] p-4 gap-2.5">
                <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2 px-1">
                  Active Sessions
                </div>
                {sessionsData.map((item) => {
                  const isActive = activeSessionId === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSessionId(item.id)}
                      className={`text-left px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
                        isActive
                          ? 'bg-[var(--accent-subtle)] border-[var(--accent)]/30 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-[var(--surface-hover)] hover:border-[var(--border-medium)]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {item.sourceType === 'youtube' ? (
                          <Youtube size={12} className="text-red-400 flex-shrink-0" />
                        ) : (
                          <FileSearch size={12} className="text-emerald-400 flex-shrink-0" />
                        )}
                        <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate block">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] text-[var(--text-muted)] pl-4 block">
                        {item.metaText}
                      </span>
                    </button>
                  );
                })}

                {/* Workspace Capabilities */}
                <div className="mt-auto pt-4 border-t border-[var(--border-soft)] space-y-2">
                  <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Capabilities</div>
                  {[
                    { label: 'Transcript Grounding', ok: true },
                    { label: 'Recursive Chunks RAG', ok: true },
                    { label: 'Citation Source Linking', ok: true }
                  ].map((cap, i) => (
                    <div key={i} className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)]">
                      <CheckCircle2 size={11} className="text-[var(--accent)]" />
                      <span>{cap.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Center RAG Chat Workspace */}
              <div className="flex flex-col bg-[var(--surface-3)]/30">
                {/* Media header panel */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-soft)] bg-[var(--surface-3)]">
                  <div className={`w-10 h-7 rounded-lg flex items-center justify-center ${
                    activeSession.sourceType === 'youtube' ? 'bg-red-500/10 border border-red-500/20' : 'bg-emerald-500/10 border border-emerald-500/20'
                  }`}>
                    {activeSession.sourceType === 'youtube' ? (
                      <Play size={11} className="text-red-400 fill-red-400" />
                    ) : (
                      <FileText size={11} className="text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[11.5px] font-semibold text-[var(--text-primary)] truncate">
                      {activeSession.title}
                    </div>
                    <div className="text-[9.5px] text-[var(--text-muted)] font-mono">
                      {activeSession.sourceMeta}
                    </div>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Ready
                  </span>
                </div>

                {/* Messages Panel Container */}
                <div className="flex-1 p-4 space-y-4 min-h-[280px] max-h-[360px] overflow-y-auto">
                  {messages.map((msg, index) => {
                    const isAi = msg.role === 'ai';
                    return (
                      <div
                        key={index}
                        className={`flex gap-2.5 ${!isAi ? 'justify-end' : 'justify-start'}`}
                      >
                        {isAi && (
                          <div className="w-5.5 h-5.5 rounded bg-gradient-to-br from-[#7c5cff] to-[#4da2ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Bot size={11} className="text-white" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[11px] leading-relaxed ${
                            isAi
                              ? 'bg-[var(--surface-1)] border border-[var(--border-medium)] text-[var(--text-primary)] rounded-tl-sm shadow-sm'
                              : 'bg-[var(--accent)] text-neutral-950 rounded-tr-sm font-medium'
                          }`}
                        >
                          {msg.content.split('\n').map((line, lIdx) => (
                            <span key={lIdx}>
                              {line.split(/(\*\*[^*]+\*\*)/).map((part, pIdx) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return (
                                    <strong key={pIdx} className="text-[var(--text-primary)] font-bold">
                                      {part.slice(2, -2)}
                                    </strong>
                                  );
                                }
                                return part;
                              })}
                              {lIdx < msg.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Typing simulated response overlay */}
                  {selectedQ && (
                    <div className="flex gap-2.5 justify-start">
                      <div className="w-5.5 h-5.5 rounded bg-gradient-to-br from-[#7c5cff] to-[#4da2ff] flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Bot size={11} className="text-white" />
                      </div>
                      <div className="max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-[var(--surface-1)] border border-[var(--border-medium)] text-[var(--text-primary)] leading-relaxed text-[11px] min-h-[40px] shadow-sm">
                        <span>{aiResponse}</span>
                        {isTyping && (
                          <span className="inline-block w-1.5 h-3.5 bg-[var(--accent)] ml-0.5 animate-pulse" />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Prompt click elements */}
                <div className="px-4 py-2 bg-[var(--canvas)]/40 border-t border-[var(--border-soft)]">
                  <div className="text-[8.5px] font-mono text-[var(--text-muted)] uppercase tracking-wider mb-2 px-1">
                    Ask source questions
                  </div>
                  <div className="flex lg:flex-wrap gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    {activeSession.questions.map((item, idx) => (
                      <button
                        key={idx}
                        disabled={isTyping}
                        onClick={() => handlePromptClick(item.q, item.a)}
                        className="text-[10px] text-left px-3 py-2 rounded-xl bg-[var(--surface-2)] border border-[var(--border-medium)] hover:border-[var(--accent)]/30 text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium flex-shrink-0 lg:flex-shrink transition-all"
                      >
                        {item.q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat input placeholder */}
                <div className="p-3 border-t border-[var(--border-soft)] bg-[var(--surface-3)]">
                  <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border-medium)]">
                    <span className="text-[10.5px] text-[var(--text-muted)] flex-1 truncate">
                      Ask a detailed question...
                    </span>
                    <button className="p-1.5 rounded-lg bg-[var(--surface-3)] text-[var(--text-muted)]" disabled>
                      <Send size={11} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Column 3: Right Details & Outlines */}
              <div className="hidden lg:flex flex-col border-l border-[var(--border-soft)] bg-[var(--surface-3)] p-4 gap-5">
                <div>
                  <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] mb-2">
                    {activeSession.statLabel}
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-medium)] flex items-center gap-2.5">
                    <Clock size={12} className="text-[var(--accent)]" />
                    <div>
                      <div className="text-[10.5px] font-semibold text-[var(--text-primary)]">
                        {activeSession.statValue}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chapters list */}
                <div className="space-y-2">
                  <div className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em]">
                    Structural Chapters
                  </div>
                  <div className="space-y-2">
                    {activeSession.outline.map((chap, i) => (
                      <div key={i} className="flex items-start gap-1.5 p-1.5 rounded bg-[var(--surface-3)] text-[10px]">
                        <ChevronRight size={10} className="text-[var(--accent)] mt-0.5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] text-[var(--text-secondary)] truncate">{chap.title}</p>
                          <span className="text-[8px] text-[var(--text-muted)] font-mono">
                            {chap.time || chap.page}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cited segment box */}
                <div className="mt-auto p-3 rounded-xl bg-[var(--accent-subtle)] border border-[var(--accent)]/15">
                  <div className="text-[9px] font-bold text-[var(--accent)] mb-1.5 uppercase tracking-wide">
                    Grounding Excerpt
                  </div>
                  <p className="text-[9.5px] text-[var(--text-secondary)] leading-relaxed italic">
                    {activeSession.excerpt}
                  </p>
                  <div className="mt-2 text-[8.5px] font-mono text-[var(--accent)]">
                    {activeSession.excerptMeta}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
