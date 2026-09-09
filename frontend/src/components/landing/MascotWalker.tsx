import { useState, useEffect, useRef } from 'react';

const sprites = {
  right: [
    '/assets/mascot/walking/right1.svg',
    '/assets/mascot/walking/right2.svg',
    '/assets/mascot/walking/right3.svg',
  ],
  left: [
    '/assets/mascot/walking/left1.svg',
    '/assets/mascot/walking/left2.svg',
    '/assets/mascot/walking/left3.svg',
  ],
};

interface MascotWalkerProps {
  containerWidth?: number;
}

export function MascotWalker({ containerWidth = 380 }: MascotWalkerProps) {
  const [posX, setPosX] = useState(10);
  const [direction, setDirection] = useState<'right' | 'left'>('right');
  const [frame, setFrame] = useState(0);

  const posXRef = useRef(10);
  const dirRef = useRef<'right' | 'left'>('right');

  // Cycle walking animation frames (140ms per step)
  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 3);
    }, 140);
    return () => clearInterval(interval);
  }, []);

  // Smooth walking motion left-to-right and right-to-left across the button
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    const speed = 46; // pixels per second

    const update = (now: number) => {
      const dt = Math.min(0.064, (now - lastTime) / 1000);
      lastTime = now;

      // SVG box is 140px wide, visual robot is positioned between ~32px and ~100px inside it
      // minLimit puts visual left edge ~8px inside the button's left edge
      // maxLimit puts visual right edge ~8px inside the button's right edge
      const minLimit = -24;
      const maxLimit = Math.max(minLimit + 40, containerWidth - 140 + 32);

      if (dirRef.current === 'right') {
        posXRef.current += speed * dt;
        if (posXRef.current >= maxLimit) {
          posXRef.current = maxLimit;
          dirRef.current = 'left';
          setDirection('left');
        }
      } else {
        posXRef.current -= speed * dt;
        if (posXRef.current <= minLimit) {
          posXRef.current = minLimit;
          dirRef.current = 'right';
          setDirection('right');
        }
      }

      setPosX(posXRef.current);
      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [containerWidth]);

  return (
    <div
      className="absolute pointer-events-none select-none z-20"
      style={{
        left: 0,
        bottom: '100%', // Feet sit fully on and above the top edge of the button
        transform: `translate3d(${posX}px, 0, 0)`,
        willChange: 'transform',
      }}
      aria-hidden="true"
    >
      <img
        src={sprites[direction][frame]}
        alt=""
        className="w-[140px] h-[106px] object-contain drop-shadow-[0_6px_20px_rgba(157,165,255,0.35)]"
        style={{ imageRendering: 'pixelated' }}
        draggable={false}
      />
    </div>
  );
}
