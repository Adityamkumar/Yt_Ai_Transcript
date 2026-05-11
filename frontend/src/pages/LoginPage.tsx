import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import DotField from '@/components/landing/DotField';
import { useAuth } from '@/store/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(form.email, form.password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4"
      style={{ background: '#050816' }}
    >
      <DotField
        dotRadius={1.8}
        dotSpacing={26}
        gradientFrom="rgba(124, 92, 255, 0.7)"
        gradientTo="rgba(77, 162, 255, 0.5)"
        glowColor="rgba(124, 92, 255, 0.08)"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,92,255,0.15) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[420px]"
      >
        <div
          className="rounded-2xl p-8 sm:p-9"
          style={{
            background: 'rgba(11, 16, 32, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,255,0.05)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex flex-col items-center mb-8">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.5)] group-hover:shadow-[0_0_28px_rgba(124,92,255,0.7)] transition-shadow duration-300">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-base">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>

            <h1 className="text-xl font-bold text-[#F5F7FF] mb-1.5 text-center">
              Welcome back
            </h1>
            <p className="text-sm text-[#94A3B8] text-center">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs mb-4"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-[#94A3B8]">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="text-xs font-medium text-[#94A3B8]">
                  Password
                </label>
                <a
                  href="#"
                  id="forgot-password-link"
                  className="text-xs text-[#7C5CFF] hover:text-[#9b7fff] transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                id="remember-me-toggle"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all duration-200 ${
                  rememberMe
                    ? 'bg-[#7C5CFF] border-[#7C5CFF]'
                    : 'border-white/15 bg-white/4'
                }`}
                style={{ width: '18px', height: '18px', flexShrink: 0 }}
              >
                {rememberMe && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="text-xs text-[#94A3B8]">Remember me for 30 days</span>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isLoading}
              className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] disabled:opacity-70 disabled:scale-100 mt-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF]" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF] blur-md opacity-0 hover:opacity-50 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={15} />
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/07" />
            <span className="text-xs text-[#94A3B8]/60">New to EchoMind?</span>
            <div className="flex-1 h-px bg-white/07" />
          </div>

          <Link
            to="/signup"
            id="go-to-signup"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-[#F5F7FF] border border-white/08 hover:border-white/15 bg-white/02 hover:bg-white/05 transition-all duration-200"
          >
            Create your free account
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
