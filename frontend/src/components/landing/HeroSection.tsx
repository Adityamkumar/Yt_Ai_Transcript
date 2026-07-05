import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, Github, Sparkles, Youtube, FileText,
  Play, Send, CheckCircle, RefreshCw, UploadCloud,
  Database, BrainCircuit, Terminal, ArrowUpRight, Check
} from 'lucide-react';

import { Cover } from '@/components/ui/cover';
import Silk from '@/components/background/Silk';



export function HeroSection() {
  const [sourceType, setSourceType] = useState<'youtube' | 'pdf'>('youtube');
  const [inputUrl, setInputUrl] = useState('');
  const [simState, setSimState] = useState<'idle' | 'analyzing' | 'active'>('idle');
  const [simStep, setSimStep] = useState(0);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  


  
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
      id="hero"
      className="relative min-h-[105dvh] flex flex-col justify-center pt-24 pb-20 overflow-hidden"
    >
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Silk speed={6} scale={1} color="#2b00ff" noiseIntensity={2.3} rotation={0} />
        {/* Dark radial overlay to ensure readability */}
        <div 
          className="absolute inset-0 z-1 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.15) 0%, rgba(10, 10, 10, 0.65) 100%)',
          }}
        />
        {/* Bottom fade block to blend background seamlessly into black mode */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--canvas))',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Mobile-First Layout Grid: Stacks on mobile, splits into 12 columns on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 xl:gap-24 items-center">
          
          {/* Column Left: Copy and Static CTAs */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col items-start text-left max-w-2xl lg:max-w-none">
            
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
              className="text-3xl sm:text-4xl lg:text-4xl xl:text-5xl font-semibold tracking-tight text-[var(--text-primary)] leading-snug mb-4 font-sans"
            >
              Turn YouTube videos and documents into{' '}
              <Cover>intelligent conversations</Cover>
              .
            </motion.h1>

            {/* Calm, readable narrative subtext */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm sm:text-base lg:text-base text-[var(--text-secondary)] leading-relaxed max-w-xl mb-6"
            >
              Extract transcripts, synthesize deep chapters, and map interactive vector
              dialogues from your media library. Crafted for students, writers, and thorough researchers.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mt-4"
            >
              <Link
                to="/signup"
                id="hero-cta-primary"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-neutral-900 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md shadow-black/30"
              >
                <span>Create Account</span>
                <ArrowRight size={13} />
              </Link>
              <a
                href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
                target="_blank"
                rel="noopener noreferrer"
                id="hero-cta-github"
                className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[var(--border-medium)] hover:border-[var(--border-strong)] bg-[var(--surface-3)] hover:bg-[var(--surface-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Github size={13} />
                <span>View Code</span>
              </a>
            </motion.div>
          </div>

          {/* Column Right: Interactive Playground Sandbox */}
          <div className="lg:col-span-6 xl:col-span-6 w-full">
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
                  <div className="flex flex-col gap-3.5 pb-3 border-b border-[var(--border-soft)] mb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2 w-full sm:w-auto">
                      <Terminal size={12} className="text-[var(--accent)]" />
                      <span>workspace_ingestion_sandbox</span>
                    </div>
                    {/* Sandbox source tabs */}
                    <div className="flex gap-1.5 bg-[var(--surface-3)] p-0.5 rounded-lg border border-[var(--border-soft)] w-full sm:w-auto justify-center">
                      <button
                        onClick={() => { setSourceType('youtube'); setInputUrl(''); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center justify-center flex-1 sm:flex-none gap-1.5 ${
                          sourceType === 'youtube'
                            ? 'bg-[var(--accent)] text-neutral-950 shadow-sm'
                            : 'text-[var(--text-secondary)] hover:text-white'
                        }`}
                      >
                        <Youtube size={10} />
                        YouTube
                      </button>
                      <button
                        onClick={() => { setSourceType('pdf'); setInputUrl(''); }}
                        className={`px-2.5 py-1 rounded-md text-[10px] font-semibold transition-all flex items-center justify-center flex-1 sm:flex-none gap-1.5 ${
                          sourceType === 'pdf'
                            ? 'bg-[var(--accent)] text-neutral-950 shadow-sm'
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
                      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:flex-1">
                          <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={15} />
                          <input
                            type="text"
                            placeholder="Paste any YouTube video link..."
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[var(--border-medium)] bg-[var(--surface-3)] text-xs text-[var(--text-primary)] focus:bg-[var(--surface-1)] focus:border-[var(--accent-strong)] transition-all font-mono"
                          />
                        </div>
                        <button
                          onClick={startSimulation}
                          className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-neutral-950 text-xs font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_16px_rgba(139,156,247,0.3)] transition-all active:scale-[0.98]"
                        >
                          <Sparkles size={13} />
                          <span>Index</span>
                        </button>
                      </div>

                      {/* Demo Quick Start Option */}
                      <div className="flex flex-col gap-1.5 pt-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[10px] text-[var(--text-muted)] text-left">No video link at hand?</span>
                        <button
                          onClick={() => {
                            setInputUrl(demoData.youtube.url);
                            startSimulation();
                          }}
                          className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1 w-fit"
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
                        className="border border-dashed border-[var(--border-strong)] bg-[var(--surface-3)] hover:bg-[var(--surface-hover)] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-[var(--accent)] group"
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
                      <div className="flex flex-col gap-1.5 pt-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-[10px] text-[var(--text-muted)] text-left">Want a sample document?</span>
                        <button
                          onClick={() => {
                            setInputUrl(demoData.pdf.url);
                            startSimulation();
                          }}
                          className="text-[11px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1 w-fit"
                        >
                          <span>Load sample benchmark PDF</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  )}
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
                    <div className="h-1 w-48 bg-[var(--surface-3)] rounded-full overflow-hidden mx-auto my-3 border border-[var(--border-soft)]">
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
                      className="p-1 rounded-lg border border-[var(--border-medium)] hover:bg-[var(--surface-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                      title="Reset Sandbox"
                    >
                      <RefreshCw size={11} />
                    </button>
                  </div>

                  {/* Small loaded source item information */}
                  <div className="bg-[var(--surface-3)] border border-[var(--border-soft)] rounded-xl p-3 flex gap-3 items-center">
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
                    <div className="grid grid-cols-1 gap-2">
                      {(sourceType === 'youtube' ? demoData.youtube.questions : demoData.pdf.questions).map((item, index) => (
                        <button
                          key={index}
                          disabled={isTyping}
                          onClick={() => handleAskQuestion(item.q, item.a)}
                          className={`text-left p-2.5 rounded-xl border text-[10.5px] font-medium leading-normal transition-all duration-200 ${
                            selectedQuestion === item.q
                              ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--text-primary)]'
                              : 'bg-[var(--surface-3)] border-[var(--border-soft)] hover:border-[var(--border-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
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
                        className="border border-[var(--border-soft)] bg-[var(--surface-3)] rounded-xl p-3 space-y-2 mt-2"
                      >
                        <div className="flex justify-between items-center border-b border-[var(--border-soft)] pb-1.5 mb-1.5">
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
                      className="px-4 py-2 rounded-lg bg-[var(--accent-subtle)] hover:bg-[var(--accent)] border border-[var(--accent)] text-[var(--accent)] hover:text-neutral-950 text-[11px] font-semibold flex items-center gap-1.5 transition-all active:scale-[0.98] shadow-sm"
                    >
                      <span>Access full workspace</span>
                      <ArrowUpRight size={12} />
                    </Link>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

    </section>
  );
}
