import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import DotField from "@/components/landing/DotField";

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
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4" style={{ background: "#050816" }}>
      <DotField
        dotRadius={1.8}
        dotSpacing={26}
        gradientFrom="rgba(124, 92, 255, 0.7)"
        gradientTo="rgba(77, 162, 255, 0.5)"
        glowColor="rgba(124, 92, 255, 0.08)"
      />

      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`relative z-10 w-full ${maxWidthClass}`}
      >
        <div
          className="rounded-2xl p-8 sm:p-9"
          style={{
            background: "rgba(11, 16, 32, 0.85)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.05)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.5)]">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-base">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>

            <h1 className="text-xl font-bold text-[#F5F7FF] mb-1.5 text-center">{title}</h1>
            <p className="text-sm text-[#94A3B8] text-center">{subtitle}</p>
          </div>

          {children}
        </div>
      </motion.div>
    </div>
  );
}
