import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Github, Sparkles } from 'lucide-react';
import DotField from './DotField';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
};

export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#050816' }}
    >
      {/* Animated DotField Background */}
      <DotField
        dotRadius={2.2}
        dotSpacing={26}
        gradientFrom="rgba(124, 92, 255, 0.8)"
        gradientTo="rgba(77, 162, 255, 0.6)"
        glowColor="rgba(124, 92, 255, 0.1)"
        cursorRadius={280}
      />

      {/* Radial spotlight glow - top center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% -10%, rgba(124,92,255,0.22) 0%, transparent 70%)',
        }}
      />

      {/* Secondary accent glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 40% 40% at 80% 70%, rgba(77,162,255,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Animated blur orb */}
      <motion.div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle, rgba(124,92,255,0.06) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        animate={{
          scale: [1, 1.08, 1],
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-5xl mx-auto pt-24 pb-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(124,92,255,0.3)] bg-[rgba(124,92,255,0.08)] backdrop-blur-sm">
            <Sparkles size={13} className="text-[#7C5CFF]" />
            <span className="text-xs font-medium text-[#7C5CFF] tracking-wide">
              AI-powered transcript intelligence
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#F5F7FF] leading-[1.2] tracking-tight mb-10"
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          Turn YouTube videos into{' '}
          <span
            className="inline-block pb-2"
            style={{
              background: 'linear-gradient(135deg, #7C5CFF 0%, #4DA2FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            intelligent conversations.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg lg:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Extract transcripts, generate summaries, ask questions, and unlock insights
          from any YouTube video instantly.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-8"
        >
          {/* Primary CTA */}
          <Link
            to="/signup"
            id="hero-cta-primary"
            className="group relative flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-105"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF] transition-opacity duration-300" />
            <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF] blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300 scale-110" />
            <span className="absolute inset-0 border border-white/10 rounded-xl" />
            <span className="relative">Start Analyzing</span>
            <ArrowRight size={15} className="relative group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>

          {/* Secondary CTA */}
          <a
            href="https://github.com/Adityamkumar/Yt_Ai_Transcript"
            target="_blank"
            rel="noopener noreferrer"
            id="hero-cta-github"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-[#94A3B8] hover:text-[#F5F7FF] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.18)] bg-[rgba(255,255,255,0.02)] hover:bg-[rgba(255,255,255,0.05)] transition-all duration-300"
          >
            <Github size={15} className="group-hover:scale-110 transition-transform duration-200" />
            View Github
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          variants={itemVariants}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <p className="text-xs text-[#94A3B8]/60 tracking-widest uppercase">
            No credit card required · Free to start
          </p>
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#7C5CFF" className="opacity-80">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
            <span className="text-xs text-[#94A3B8] ml-2">Trusted by 2,400+ researchers</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent, #050816)',
        }}
      />
    </section>
  );
}
