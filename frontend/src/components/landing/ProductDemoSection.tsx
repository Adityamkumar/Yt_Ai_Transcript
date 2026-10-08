import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Play, Volume2, VolumeX } from 'lucide-react';

const VIDEO_SRC = '/video/lumora-product-demo-v2.mp4';
const POSTER_SRC = '/video/lumora-poster-v2.jpg';

export function ProductDemoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isPlaybackVisible, setIsPlaybackVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [playWhenReady, setPlayWhenReady] = useState(false);
  const [showSoundHint, setShowSoundHint] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const soundHintShownRef = useRef(false);
  const soundHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video || prefersReducedMotion) return;

    try {
      await video.play();
      setIsPlaying(true);
      setAutoplayBlocked(false);
    } catch {
      setIsPlaying(false);
      setAutoplayBlocked(true);
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setShouldLoad(true);

        const inPlaybackRange = entry.intersectionRatio >= 0.4;
        setIsPlaybackVisible(inPlaybackRange);
        if (!inPlaybackRange) {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { rootMargin: '600px 0px', threshold: [0, 0.4] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoad || !isPlaybackVisible || prefersReducedMotion || isFinished) return;
    setPlayWhenReady(true);
    playVideo();
  }, [isFinished, isPlaybackVisible, playVideo, prefersReducedMotion, shouldLoad]);

  useEffect(() => {
    if (!isPlaying) return;

    let animationFrame = 0;
    const updateProgress = () => {
      const video = videoRef.current;
      if (video?.duration) setProgress((video.currentTime / video.duration) * 100);
      animationFrame = requestAnimationFrame(updateProgress);
    };

    updateProgress();
    return () => cancelAnimationFrame(animationFrame);
  }, [isPlaying]);

  useEffect(() => () => {
    if (soundHintTimerRef.current) clearTimeout(soundHintTimerRef.current);
  }, []);

  const handleCanPlay = () => {
    if (!playWhenReady || isFinished) return;

    videoRef.current?.play().then(
      () => {
        setIsPlaying(true);
        setAutoplayBlocked(false);
      },
      () => {
        setIsPlaying(false);
        setAutoplayBlocked(true);
      },
    );
  };

  const handleTogglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (isFinished) {
      video.currentTime = 0;
      setProgress(0);
      setIsFinished(false);
      setPlayWhenReady(true);
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
      return;
    }

    if (!shouldLoad) {
      setShouldLoad(true);
      setPlayWhenReady(true);
      return;
    }

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setAutoplayBlocked(true);
      }
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleToggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleVolumeChange = () => {
    setIsMuted(videoRef.current?.muted ?? true);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
    if (soundHintShownRef.current) return;

    soundHintShownRef.current = true;
    setShowSoundHint(true);
    soundHintTimerRef.current = setTimeout(() => setShowSoundHint(false), 5000);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || video.currentTime < 29.6) return;

    video.pause();
    setProgress(100);
    setIsFinished(true);
  };

  const revealPlayButton = !isFinished && (prefersReducedMotion || autoplayBlocked);
  const shouldShowSoundWaves = !isMuted;
  const animation = prefersReducedMotion
    ? {}
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } };
  const finishedOverlayAnimation = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.25 } },
      };

  return (
    <section
      ref={sectionRef}
      id="demo"
      aria-labelledby="demo-title"
      className="relative overflow-hidden border-y border-[var(--border-soft)] bg-[#07080c] px-4 py-[clamp(80px,10vw,140px)] sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex w-full max-w-[1120px] flex-col items-center text-center">
        <motion.span
          {...animation}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex border border-[rgba(255,255,255,0.085)] bg-[rgba(255,255,255,0.03)] px-[22px] py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] sm:text-xs"
        >
          ✦ SEE IT IN ACTION
        </motion.span>

        <motion.h2
          {...animation}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: prefersReducedMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}
          id="demo-title"
          className="mt-6 text-center text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-[var(--text-primary)]"
        >
          Paste a link. <span className="font-serif font-normal italic text-[var(--accent)]">Ask anything.</span>
        </motion.h2>

        <motion.p
          {...animation}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: prefersReducedMotion ? 0 : 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 max-w-[640px] text-[clamp(1.05rem,1.6vw,1.25rem)] leading-[1.55] text-[var(--text-secondary)]"
        >
          Watch Lumora turn a YouTube link into a searchable transcript, smart chapters and answers grounded in the source — in 30 seconds.
        </motion.p>

        <motion.div
          {...animation}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, delay: prefersReducedMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-10 w-full sm:mt-14"
        >
          <div aria-hidden="true" className="absolute -inset-8 -z-10 bg-[radial-gradient(ellipse_at_center,rgba(124,124,248,0.15),transparent_68%)] blur-2xl" />
          <div
            className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-[rgba(255,255,255,0.10)] bg-[#07080c] shadow-[0_40px_120px_rgba(0,0,0,0.6),0_0_120px_rgba(124,124,248,0.18)]"
            onClick={handleTogglePlayback}
          >
            <video
              ref={videoRef}
              muted={isMuted}
              playsInline
              preload="metadata"
              poster={POSTER_SRC}
              aria-label="Lumora product demo: pasting a YouTube link, extracting the transcript, and chatting with answers grounded in the source."
              onCanPlay={handleCanPlay}
              onPlay={handleVideoPlay}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={handleTimeUpdate}
              onVolumeChange={handleVolumeChange}
              className="h-full w-full scale-[1.04] object-cover"
            >
              {shouldLoad && <source src={VIDEO_SRC} type="video/mp4" />}
            </video>

            {revealPlayButton && (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleTogglePlayback();
                }}
                aria-label="Play video"
                className="absolute left-1/2 top-1/2 grid h-[72px] w-[72px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/25 bg-[rgba(10,10,15,0.78)] text-white shadow-xl backdrop-blur-xl transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9a5ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c]"
              >
                <Play size={28} className="ml-1 fill-current" />
              </button>
            )}

            <AnimatePresence>
              {isFinished && (
                <motion.div
                  {...finishedOverlayAnimation}
                  onClick={(event) => {
                    event.stopPropagation();
                    handleTogglePlayback();
                  }}
                  className="absolute inset-0 z-10 grid place-items-center rounded-2xl bg-[rgba(7,7,11,0.26)] backdrop-blur-[4px]"
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTogglePlayback();
                    }}
                    aria-label="Play video"
                    className={`grid h-[68px] w-[68px] place-items-center rounded-full border border-[rgba(255,255,255,0.14)] bg-[rgba(10,10,15,0.65)] text-white shadow-[0_0_60px_rgba(124,124,248,0.35)] backdrop-blur-[12px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9a5ff] focus-visible:ring-offset-[3px] focus-visible:ring-offset-[#07080c] sm:h-[84px] sm:w-[84px] ${prefersReducedMotion ? '' : 'transition-transform duration-200 hover:scale-[1.06]'}`}
                  >
                    <Play size={30} className="translate-x-0.5 fill-current" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 sm:bottom-4 sm:right-4">
              <AnimatePresence>
                {showSoundHint && (
                  <motion.span
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.4 }}
                    className="whitespace-nowrap text-xs font-medium text-white/85 drop-shadow-sm"
                  >
                    Sound off · tap to turn on
                  </motion.span>
                )}
              </AnimatePresence>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleSound();
                }}
                aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                className="grid h-10 w-10 place-items-center rounded-xl border border-[rgba(255,255,255,0.12)] bg-[rgba(10,10,15,0.7)] text-white backdrop-blur-xl transition-colors hover:bg-[rgba(10,10,15,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a9a5ff] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080c] sm:h-11 sm:w-11"
              >
                {shouldShowSoundWaves ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-[rgba(169,165,255,0.9)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
