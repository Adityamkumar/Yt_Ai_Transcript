import React from 'react';

interface LumoraLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

/**
 * Lumora Logo Component
 * Recreates the brand identity with crescent arc, AI sparkle star, bold 'L',
 * and a vibrant violet-to-sky-blue gradient wordmark.
 */
export function LumoraLogo({ size = 'md', showText = true, className = '' }: LumoraLogoProps) {
  const iconSize = size === 'sm' ? 30 : size === 'lg' ? 48 : 38;
  const textSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const gap = size === 'sm' ? 'gap-2' : size === 'lg' ? 'gap-3.5' : 'gap-2.5';

  return (
    <span className={`inline-flex items-center ${gap} select-none ${className}`}>
      {/* Icon Squircle SVG */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0 drop-shadow-[0_4px_16px_rgba(124,58,237,0.35)]"
      >
        <defs>
          {/* Background gradient: dark violet/navy squircle */}
          <linearGradient id="lumoraBg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1B153D" />
            <stop offset="50%" stopColor="#120D2C" />
            <stop offset="100%" stopColor="#0A071B" />
          </linearGradient>

          {/* Crescent Arc Gradient: Light Periwinkle -> Purple -> Cyan/Blue */}
          <linearGradient id="lumoraArc" x1="15" y1="20" x2="85" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#A5B4FC" />
            <stop offset="35%" stopColor="#818CF8" />
            <stop offset="70%" stopColor="#C084FC" />
            <stop offset="100%" stopColor="#60A5FA" />
          </linearGradient>

          {/* Subtle glow for the arc */}
          <filter id="arcGlow" x="0" y="0" width="100" height="100" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Sparkle star glow */}
          <filter id="starGlow" x="40" y="5" width="50" height="50" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Squircle Container */}
        <rect width="100" height="100" rx="26" fill="url(#lumoraBg)" />
        <rect width="98" height="98" x="1" y="1" rx="25" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />

        {/* Outer Glowing Crescent Arc */}
        <path
          d="M 58 24 C 30 26 19 46 19 64 C 19 81 35 91 66 85 C 73 83.5 77 81 77 81"
          stroke="url(#lumoraArc)"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter="url(#arcGlow)"
        />

        {/* Sparkle 4-point Star at top right */}
        <g filter="url(#starGlow)">
          <path
            d="M 66 12 Q 66 24 78 24 Q 66 24 66 36 Q 66 24 54 24 Q 66 24 66 12 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Central Bold 'L' */}
        <path
          d="M 38 40 V 66 H 58"
          stroke="#FFFFFF"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Lumora Wordmark with premium gradient */}
      {showText && (
        <span
          className={`font-bold tracking-tight leading-none ${textSize}`}
          style={{
            background: 'linear-gradient(95deg, #A78BFA 0%, #818CF8 30%, #C084FC 60%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 2px 10px rgba(139, 92, 246, 0.3))',
          }}
        >
          Lumora
        </span>
      )}
    </span>
  );
}
