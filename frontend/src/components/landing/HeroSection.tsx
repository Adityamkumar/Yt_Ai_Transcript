import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SonarGrid } from '@/components/ui/sonar-grid';
import { ContainerTextFlip } from '@/components/ui/container-text-flip';
import { MascotWalker } from '@/components/landing/MascotWalker';

export function HeroSection() {
  const buttonRef = useRef<HTMLDivElement>(null);
  const [btnWidth, setBtnWidth] = useState(380);

  useEffect(() => {
    if (!buttonRef.current) return;
    const updateWidth = () => {
      if (buttonRef.current) {
        setBtnWidth(buttonRef.current.offsetWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(buttonRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <SonarGrid
      id="hero"
      spacing={30}
      dotRadius={1.15}
      baseOpacity={0.18}
      color="#aeb8ff"
      pingEvery={3.6}
      speed={220}
      ringWidth={110}
      amplitude={2.4}
      pingArea={[0.2, 0.18, 0.8, 0.84]}
      className="relative min-h-screen min-h-[100dvh] w-full flex flex-col justify-center items-center pt-16 sm:pt-20 pb-16 bg-[#07080c]"
    >
      <div className="relative z-10 max-w-4xl mx-auto px-6 w-full flex flex-col items-center text-center">
        {/* Display Headline in Absans (refined, sleek proportion) */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] font-normal tracking-[-0.025em] text-[#f0f2f7] leading-[1.15] max-w-3xl"
        >
            Turn YouTube videos and documents into{' '}
          <span className="bg-gradient-to-r from-[#ffffff] via-[#c7ccff] to-[#9da5ff] bg-clip-text text-transparent">
            grounded{' '}
            <ContainerTextFlip
              words={["conversations", "summaries", "insights", "notes"]}
              className="mx-auto sm:mx-0"
              textClassName="text-3xl font-normal tracking-[-0.025em] text-[#b8beff] sm:text-4xl md:text-5xl lg:text-[3.5rem]"
            />
          </span>
        </motion.h1>

        {/* Short, elegant project explanation subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-xl sm:max-w-2xl mt-6 sm:mt-7 font-normal font-sans"
        >
          Extract transcripts, synthesize chapters, and chat directly with your YouTube videos and documents.
        </motion.p>

        {/* Elongated Centered Action Button with Animated Walking Robot */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-32 sm:mt-36 flex justify-center w-full px-4"
        >
          <div ref={buttonRef} className="relative inline-flex flex-col items-center w-full max-w-[380px]">
            {/* Lumora Robot Mascot walking back and forth */}
            <MascotWalker containerWidth={btnWidth} />

            <Link
              to="/signup"
              id="hero-cta-primary"
              className="w-full h-14 sm:h-[58px] px-8 rounded-[6px] bg-white hover:bg-neutral-100 text-neutral-950 text-base sm:text-[17px] font-semibold tracking-tight transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shadow-[0_12px_40px_rgba(0,0,0,0.45)] text-center flex items-center justify-center relative z-10"
            >
              Start Exploring Free
            </Link>
          </div>
        </motion.div>
      </div>
    </SonarGrid>
  );
}
