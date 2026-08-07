import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShootingStarsGrid } from "@/components/ui/shooting-stars-grid";
import { LumoraLogo } from "@/components/ui/LumoraLogo";


interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  maxWidthClass?: string;
}

export function AuthShell({
  title,
  subtitle,
  children,
  maxWidthClass = "max-w-[430px]",
}: AuthShellProps) {
  return (
    <div className="premium-shell relative min-h-screen flex items-center justify-center overflow-hidden px-4">
      <ShootingStarsGrid
        className="absolute inset-0"
        starCount={28}
        shootingStarCount={4}
        gridSize={52}
        speed="slow"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(7,9,15,0.05),rgba(7,9,15,0.46)_72%,rgba(7,9,15,0.72))]" />


      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative z-10 w-full ${maxWidthClass}`}
      >
        <div
          className="premium-panel rounded-[1.6rem] p-8 sm:p-9"
          style={{
            boxShadow: "0 32px 84px rgba(0,0,0,0.5), 0 0 0 1px rgba(157,165,255,0.05)",
          }}
        >
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center mb-6">
              <LumoraLogo size="md" />
            </Link>

            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2 text-center tracking-tight">{title}</h1>
            <p className="text-sm text-[var(--text-secondary)] text-center max-w-sm">{subtitle}</p>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}

