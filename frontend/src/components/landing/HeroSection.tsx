import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Github, Sparkles, Youtube, FileText,
  Play, Send, CheckCircle, RefreshCw, UploadCloud,
  Database, BrainCircuit, Terminal, ArrowUpRight, Check
} from 'lucide-react';
import { BackgroundBeams } from '@/components/ui/background-beams';


export function HeroSection() {
  const [sourceType, setSourceType] = useState<'youtube' | 'pdf'>('youtube');
  const [inputUrl, setInputUrl] = useState('');
  const [simState, setSimState] = useState<'idle' | 'analyzing' | 'active'>('idle');
  const [simStep, setSimStep] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Mouse tracking for 3D parallax depth
  const heroRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = heroRef.current.getBoundingClientRect();
    const x = (clientX - left) / width - 0.5; // -0.5 to 0.5
    const y = (clientY - top) / height - 0.5; // -0.5 to 0.5
    setMouseOffset({ x, y });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  // Ingestion simulation runner
  const startSimulation = () => {
    if (simState !== 'idle') return;
    setSimState('analyzing');
    setSimStep(0);
  };

  useEffect(() => {
    if (simState !== 'analyzing') return;

    const interval = setInterval(() => {
      setSimStep((prev) => {
        if (prev >= 2) {
          clearInterval(interval);
          setTimeout(() => {
            setSimState('active');
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 1200);

    return () => clearInterval(interval);
  }, [simState]);

  // Typing simulator
  const handleAskQuestion = (question: string, answer: string) => {
    if (isTyping) return;
    setSelectedQuestion(question);
    setIsTyping(true);
    setAiResponse('');

    let charIndex = 0;
    const typingInterval = setInterval(() => {
      setAiResponse((prev) => prev + answer.charAt(charIndex));
      charIndex++;
      if (charIndex >= answer.length) {
        clearInterval(typingInterval);
        setIsTyping(false);
      }
    }, 15);
  };

  const resetPlayground = () => {
    setSimState('idle');
    setSimStep(0);
    setSelectedQuestion(null);
    setAiResponse('');
    setIsTyping(false);
    setInputUrl('');
  };

  // Demo Scenarios
  const demoData = {
    youtube: {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'Decoupled Vector Architecture for RAG Systems',
      duration: '14 mins',
      channel: 'Systems Engineering Academy',
      questions: [
        {
          q: 'What is the primary architectural shift?',
          a: 'The key shift is decoupling video metadata from the transcript chunks. Transcript text and high-dimensional embeddings are separated into a dedicated "transcriptchunks" collection, keeping the "videos" collection light and avoiding performance degradation on large media assets.'
        },
        {
          q: 'How does it optimize storage footprint?',
          a: 'By separating chunks, we eliminate the duplicated storage of arrays of transcripts nested directly inside metadata schemas. We achieve up to 40% drop in overall database record payload sizes.'
        }
      ]
    },
    pdf: {
      url: 'retrieval_benchmarks.pdf',
      title: 'RAG Retrieval Ingestion Benchmarks.pdf',
      pages: '12 pages',
      size: '2.4 MB',
      questions: [
        {
          q: 'What are the query retrieval latencies?',
          a: 'The benchmarks demonstrate that indexing decoupled vector stores reduces query retrieval latency from 320ms to 78ms, enabling real-time conversational streaming with zero perceived delay.'
        },
        {
          q: 'What chunks split settings were used?',
          a: 'The researchers used a recursive character text splitter with a chunk size of 500 characters and a chunk overlap of 50 characters, optimized for semantic retrieval of technical specifications.'
        }
      ]
    }
  };

  const stepsText = [
    { yt: 'Connecting to YouTube metadata streams...', pdf: 'Validating PDF content stream...' },
    { yt: 'Parsing audio channel to text chunks...', pdf: 'Segmenting document pages to clean text blocks...' },
    { yt: 'Structuring vector indexes & computing semantic nodes...', pdf: 'Building semantic database indexes & node structures...' }
  ];

  return (
    <section
      ref={heroRef}
      id="hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative min-h-[105dvh] flex flex-col justify-center pt-24 pb-20 overflow-hidden"
      style={{ background: 'var(--canvas)' }}
    >
      {/* Background Animated Beams */}
      <BackgroundBeams className="opacity-35 pointer-events-none" />


      {/* Decorative Blur Orbs */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(139,156,247,0.12) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 85% 75%, rgba(77,162,255,0.06) 0%, transparent 60%)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile-First Layout Grid: Stacks on mobile, splits into 12 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Column Left: Copy + Interactive Sandbox */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col items-start text-left max-w-2xl lg:max-w-none">
            
            {/* Elegant Tag Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--border-medium)] bg-[var(--surface-3)] backdrop-blur-sm mb-6"
            >
              <Sparkles size={12} className="text-[var(--accent)]" />
              <span className="text-[10px] font-mono tracking-widest text-[var(--accent)] uppercase font-semibold">
                AI-Native Media Workspace
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold tracking-tight text-[var(--text-primary)] leading-[1.15] mb-6 font-sans"
            >
              Turn YouTube videos and documents into{' '}
              <span className="font-serif italic font-normal text-[var(--accent)] text-4xl sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.15] inline-block pr-1">
                intelligent conversations
              </span>
              .
            </motion.h1>

            {/* Calm, readable narrative subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base lg:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mb-10"
            >
              Extract transcripts, synthesize deep chapters, and map interactive vector
              dialogues from your media library. Crafted for students, writers, and thorough researchers.
            </motion.p>

            {/* INTERACTIVE PLAYGROUND SANDBOX */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-2)] p-4 sm:p-5 shadow-lg relative overflow-hidden backdrop-blur-md"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-subtle)] via-transparent to-transparent opacity-20 pointer-events-none" />

              {/* SIMULATION STATE: IDLE */}
              {simState === 'idle' && (
                <div>
                  <div className="flex items-center justify-between mb-4 border-b border-[var(--border-soft)] pb-3">
                    <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2">
                      <Terminal size={12} className="text-[var(--accent)]" />
                      <span>workspace_ingestion_sandbox</span>
                    </div>
                    {/* Sandbox source tabs */}
                    <div className="flex gap-1.5 bg-black/30 p-0.5 rounded-lg border border-[var(--border-soft)]">
                      <button
                        onClick={() => { setSourceType('youtube'); setInputUrl(''); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                          sourceType === 'youtube'
                            ? 'bg-[var(--accent)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <Youtube size={10} />
                        YouTube
                      </button>
                      <button
                        onClick={() => { setSourceType('pdf'); setInputUrl(''); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center gap-1.5 ${
                          sourceType === 'pdf'
                            ? 'bg-[var(--accent)] text-white shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <FileText size={10} />
                        PDF Document
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Inputs */}
                  {sourceType === 'youtube' ? (
                    <div className="space-y-3.5">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
                          <input
                            type="text"
                            placeholder="Paste any YouTube video link..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-medium)] bg-black/40 text-xs text-[var(--text-primary)] focus:border-[var(--accent-strong)] transition-all font-mono"
                          />
                        </div>
                        <button
                          onClick={startSimulation}
                          className="px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-white text-xs font-semibold flex items-center gap-2 shadow-md hover:shadow-[0_0_16px_rgba(139,156,247,0.3)] transition-all active:scale-[0.98]"
                        >
                          <Sparkles size={13} />
                          <span>Index</span>
                        </button>
                      </div>

                      {/* Demo Quick Start Option */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">No video link at hand?</span>
                        <button
                          onClick={() => {
                            setInputUrl(demoData.youtube.url);
                            startSimulation();
                          }}
                          className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          <span>Try demo video: "Decoupled RAG"</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {/* PDF Drop Area */}
                      <div
                        onClick={() => {
                          setInputUrl(demoData.pdf.url);
                          startSimulation();
                        }}
                        className="border border-dashed border-[var(--border-strong)] bg-black/30 hover:bg-black/50 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[var(--accent)] group"
                      >
                        <UploadCloud size={24} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors mb-2" />
                        <span className="text-xs text-[var(--text-secondary)] font-medium group-hover:text-[var(--text-primary)] transition-colors">
                          Drag & drop PDF here or click to browse
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] mt-1">
                          Max size 15MB
                        </span>
                      </div>

                      {/* Demo Quick Start Option */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-[var(--text-muted)]">Want a sample document?</span>
                        <button
                          onClick={() => {
                            setInputUrl(demoData.pdf.url);
                            startSimulation();
                          }}
                          className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1"
                        >
                          <span>Load sample benchmark PDF</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Standard Static CTA triggers for registration */}
                  <div className="flex flex-col sm:flex-row items-center gap-3.5 mt-6 border-t border-[var(--border-soft)] pt-4">
                    <Link
                      to="/signup"
                      id="hero-cta-primary"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#7c5cff] to-[#4da2ff] hover:from-[#6c4cef] hover:to-[#3da2ef] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-indigo-950/30"
                    >
                      <span>Create Account</span>
                      <ArrowRight size={13} />
                    </Link>
                    <a
                      href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
                      target="_blank"
                      rel="noopener noreferrer"
                      id="hero-cta-github"
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border-medium)] hover:border-[var(--border-strong)] bg-white/[0.02] hover:bg-white/[0.05] text-[var(--text-secondary)] hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Github size={13} />
                      <span>View Code</span>
                    </a>
                  </div>
                </div>
              )}

              {/* SIMULATION STATE: INGESTION / ANALYZING */}
              {simState === 'analyzing' && (
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                    className="w-8 h-8 rounded-full border-2 border-[var(--border-soft)] border-t-[var(--accent)] flex items-center justify-center mb-5"
                  />
                  <div className="space-y-2 max-w-sm">
                    <span className="text-xs font-mono font-semibold text-[var(--accent)] uppercase tracking-wider block">
                      analyzing_pipeline_active
                    </span>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                      {sourceType === 'youtube' ? 'Extracting YouTube Speech Index' : 'Parsing Document Index'}
                    </h4>
                    <div className="h-1 w-48 bg-black/40 rounded-full overflow-hidden mx-auto my-3 border border-[var(--border-soft)]">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[var(--accent)] to-[#4da2ff]"
                        initial={{ width: '0%' }}
                        animate={{ width: `${(simStep + 1) * 33.3}%` }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                      />
                    </div>
                    {/* Simulated details stream */}
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={simStep}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        className="text-[11px] font-mono text-[var(--text-muted)] min-h-[32px]"
                      >
                        {sourceType === 'youtube'
                          ? stepsText[simStep].yt
                          : stepsText[simStep].pdf}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* SIMULATION STATE: ACTIVE MINI WORKSPACE */}
              {simState === 'active' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between border-b border-[var(--border-soft)] pb-3">
                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>workspace_indexed_successfully</span>
                    </div>
                    <button
                      onClick={resetPlayground}
                      className="p-1 rounded-lg border border-[var(--border-medium)] hover:bg-white/5 text-[var(--text-muted)] hover:text-white transition-colors"
                      title="Reset Sandbox"
                    >
                      <RefreshCw size={11} />
                    </button>
                  </div>

                  {/* Small loaded source item information */}
                  <div className="bg-black/30 border border-[var(--border-soft)] rounded-xl p-3 flex gap-3 items-center">
                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      sourceType === 'youtube' ? 'bg-red-500/10 border border-red-500/25' : 'bg-emerald-500/10 border border-emerald-500/25'
                    }`}>
                      {sourceType === 'youtube' ? (
                        <Youtube size={15} className="text-red-400" />
                      ) : (
                        <FileText size={15} className="text-emerald-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h5 className="text-[11px] font-semibold text-[var(--text-primary)] truncate">
                        {sourceType === 'youtube' ? demoData.youtube.title : demoData.pdf.title}
                      </h5>
                      <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-wide">
                        {sourceType === 'youtube'
                          ? `${demoData.youtube.channel} · ${demoData.youtube.duration}`
                          : `${demoData.pdf.size} · ${demoData.pdf.pages}`}
                      </span>
                    </div>
                  </div>

                  {/* Chat interface */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-mono text-[var(--text-muted)] uppercase tracking-wider px-1">
                      suggested_prompts
                    </div>
                    {/* Suggested Questions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(sourceType === 'youtube' ? demoData.youtube.questions : demoData.pdf.questions).map((item, index) => (
                        <button
                          key={index}
                          disabled={isTyping}
                          onClick={() => handleAskQuestion(item.q, item.a)}
                          className={`text-left p-2.5 rounded-xl border text-[10.5px] font-medium leading-normal transition-all duration-200 ${
                            selectedQuestion === item.q
                              ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--text-primary)]'
                              : 'bg-black/20 border-[var(--border-soft)] hover:border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-white'
                          }`}
                        >
                          {item.q}
                        </button>
                      ))}
                    </div>

                    {/* Chat Bubble Result */}
                    {selectedQuestion && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-[var(--border-soft)] bg-black/40 rounded-xl p-3 space-y-2 mt-2"
                      >
                        <div className="flex justify-between items-center border-b border-white/[0.04] pb-1.5 mb-1.5">
                          <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase">ai_assistant</span>
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">Grounded RAG</span>
                        </div>
                        <p className="text-[11.5px] text-[var(--text-primary)] font-medium leading-relaxed whitespace-pre-wrap">
                          {aiResponse}
                          {isTyping && <span className="inline-block w-1 h-3.5 ml-0.5 bg-[var(--accent)] animate-pulse" />}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Proceed to Full App Link */}
                  <div className="pt-2 border-t border-[var(--border-soft)] flex justify-end">
                    <Link
                      to="/signup"
                      className="px-4 py-2 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent)] border border-[var(--accent)] text-white hover:text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-sm shadow-indigo-950/20"
                    >
                      <span>Access full workspace</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Column Right: Floating 3D Depth Card Stack (Hidden on Mobile, progressive layout enhancement) */}
          <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 relative justify-center h-[520px] items-center pointer-events-none select-none">
            {/* Base Glowing Core Backdrop */}
            <div
              className="absolute w-[320px] h-[320px] rounded-full opacity-30 pointer-events-none"
              style={{
                background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)',
                filter: 'blur(45px)',
              }}
            />

            {/* STACK CONTAINER */}
            <div className="relative w-[340px] h-[400px]">
              
              {/* Card 1: Back (YouTube / PDF source container) */}
              <motion.div
                style={{
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  x: mouseOffset.x * -16,
                  y: mouseOffset.y * -16,
                  rotateY: mouseOffset.x * 6,
                  rotateX: mouseOffset.y * -6,
                }}
                className="absolute top-[30px] left-[10px] w-[270px] bg-[#0b0f19] border border-white/10 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.5)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-wider">SOURCE_INGEST</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-semibold text-red-400 bg-red-400/10 border border-red-400/25">YT Stream</span>
                </div>
                <div className="relative aspect-video rounded-xl bg-black/50 overflow-hidden mb-3 border border-white/5 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <Play size={10} className="text-white fill-white translate-x-0.5" />
                  </div>
                  {/* Mock status indicator bar */}
                  <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center text-[7px] font-mono text-white/50 bg-black/60 px-1.5 py-0.5 rounded">
                    <span>14:02 / 34:15</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-[10.5px] font-semibold text-[var(--text-primary)] truncate">RAG Vector Architecture Study</div>
                  <div className="text-[8.5px] text-[var(--text-muted)]">Indexed 2,400 chunks successfully</div>
                </div>
              </motion.div>

              {/* Card 2: Middle (Live Transcript highlighter pane) */}
              <motion.div
                style={{
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  x: mouseOffset.x * 8,
                  y: mouseOffset.y * 8,
                  rotateY: mouseOffset.x * -4,
                  rotateX: mouseOffset.y * 4,
                }}
                className="absolute top-[160px] left-[50px] w-[270px] bg-[#0d1222] border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[9px] font-mono text-[var(--text-muted)] tracking-wider">TRANSCRIPT_INDEX</span>
                  <span className="text-[8px] font-mono text-[var(--accent)] font-semibold">Live Highlighting</span>
                </div>
                <div className="space-y-2 text-[9px] leading-relaxed text-[var(--text-secondary)]">
                  <p className="opacity-40">...decisions should favor simple code systems...</p>
                  <p className="bg-[var(--accent-subtle)] border-l-2 border-[var(--accent)] px-1.5 py-1 text-[var(--text-primary)] rounded-r-md">
                    "The core architectural shift lies in separating transcription database assets from indexing vectors."
                    <span className="text-[8px] text-[var(--accent)] ml-1 font-mono">@ 04:12</span>
                  </p>
                  <p className="opacity-40">...this avoids massive payload spikes on queries...</p>
                </div>
              </motion.div>

              {/* Card 3: Front (Claude-like AI message bubble node) */}
              <motion.div
                style={{
                  perspective: 1000,
                  transformStyle: 'preserve-3d',
                }}
                animate={{
                  x: mouseOffset.x * 24,
                  y: mouseOffset.y * 24,
                  rotateY: mouseOffset.x * 10,
                  rotateX: mouseOffset.y * -8,
                }}
                className="absolute top-[280px] left-[20px] w-[290px] bg-[#11172b] border border-[var(--accent)]/40 rounded-2xl p-4 shadow-[0_30px_70px_rgba(0,0,0,0.7)] transition-all duration-300"
              >
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/[0.04]">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center">
                    <BrainCircuit size={10} className="text-white" />
                  </div>
                  <span className="text-[10px] font-semibold text-white">EchoMind AI assistant</span>
                </div>
                <div className="space-y-1.5">
                  <div className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">Question asked</div>
                  <div className="text-[10px] text-white font-medium bg-white/5 px-2 py-1 rounded-lg">Why decouple vectors?</div>
                  <div className="text-[8px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mt-2">Response summary</div>
                  <p className="text-[9.5px] leading-relaxed text-[#d1d5e6]">
                    Decoupling transcript vector chunks from indexing documents stops metadata pollution and accelerates query processing speed by **4x**.
                  </p>
                </div>
              </motion.div>

            </div>
          </div>

        </div>
      </div>

      {/* Under-hero fade gradient block */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, var(--canvas))',
        }}
      />
    </section>
  );
}
