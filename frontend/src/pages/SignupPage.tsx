import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Check, AlertCircle } from 'lucide-react';
import DotField from '@/components/landing/DotField';
import { useAuth } from '@/store/AuthContext';

const passwordStrengthLabel = (pw: string): { label: string; color: string; width: string } => {
  if (pw.length === 0) return { label: '', color: 'transparent', width: '0%' };
  if (pw.length < 6) return { label: 'Too weak', color: '#ef4444', width: '25%' };
  if (pw.length < 10) return { label: 'Fair', color: '#f59e0b', width: '55%' };
  if (!/[A-Z]/.test(pw) || !/[0-9]/.test(pw)) return { label: 'Good', color: '#3b82f6', width: '75%' };
  return { label: 'Strong', color: '#22c55e', width: '100%' };
};

export default function SignupPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });

  const strength = passwordStrengthLabel(form.password);
  const passwordsMatch = form.password && form.confirm && form.password === form.confirm;
  const passwordMismatch = form.confirm && form.password !== form.confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return;
    setIsLoading(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  };

  const focusHandlers = {
    onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)';
      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)';
    },
    onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      e.currentTarget.style.boxShadow = 'none';
    },
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 py-12"
      style={{ background: '#050816' }}
    >
      <DotField
        dotRadius={1.8}
        dotSpacing={26}
        gradientFrom="rgba(77, 162, 255, 0.7)"
        gradientTo="rgba(124, 92, 255, 0.5)"
        glowColor="rgba(77, 162, 255, 0.08)"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(77,12,255,0.12) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ y: 24, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-[440px]"
      >
        <div
          className="rounded-2xl p-8 sm:p-9"
          style={{
            background: 'rgba(11, 16, 32, 0.85)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(77,162,255,0.05)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex flex-col items-center mb-7">
            <Link to="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7C5CFF] to-[#4DA2FF] flex items-center justify-center shadow-[0_0_20px_rgba(124,92,255,0.5)] group-hover:shadow-[0_0_28px_rgba(124,92,255,0.7)] transition-shadow duration-300">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <span className="text-[#F5F7FF] font-semibold text-base">
                EchoMind <span className="text-[#7C5CFF]">AI</span>
              </span>
            </Link>

            <h1 className="text-xl font-bold text-[#F5F7FF] mb-1.5 text-center">
              Create your account
            </h1>
            <p className="text-sm text-[#94A3B8] text-center">
              Start analyzing videos in seconds — free forever
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
              <label htmlFor="signup-name" className="text-xs font-medium text-[#94A3B8]">
                Full name
              </label>
              <input
                id="signup-name"
                type="text"
                autoComplete="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Chen"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-xs font-medium text-[#94A3B8]">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                style={inputStyle}
                {...focusHandlers}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-medium text-[#94A3B8]">
                Password
              </label>
              <div className="relative">
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                  style={inputStyle}
                  {...focusHandlers}
                />
                <button
                  type="button"
                  id="toggle-signup-password"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {form.password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1"
                >
                  <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: strength.width }}
                      transition={{ duration: 0.3 }}
                      style={{ background: strength.color }}
                    />
                  </div>
                  <span className="text-xs" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </motion.div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="text-xs font-medium text-[#94A3B8]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="signup-confirm"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Re-enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
                  style={{
                    ...inputStyle,
                    borderColor: passwordMismatch
                      ? 'rgba(239,68,68,0.5)'
                      : passwordsMatch
                      ? 'rgba(34,197,94,0.4)'
                      : 'rgba(255,255,255,0.08)',
                  }}
                  onFocus={(e) => {
                    if (!passwordMismatch && !passwordsMatch) {
                      e.currentTarget.style.borderColor = 'rgba(124,92,255,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(124,92,255,0.1)';
                    }
                  }}
                  onBlur={(e) => {
                    if (!passwordMismatch && !passwordsMatch) {
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                />
                <button
                  type="button"
                  id="toggle-confirm-password"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {passwordMismatch && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-red-400"
                >
                  Passwords don't match
                </motion.p>
              )}
              {passwordsMatch && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-green-400 flex items-center gap-1"
                >
                  <Check size={11} />
                  Passwords match
                </motion.p>
              )}
            </div>

            <button
              type="submit"
              id="signup-submit-btn"
              disabled={isLoading || !!passwordMismatch}
              className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-white overflow-hidden transition-all duration-300 hover:scale-[1.01] disabled:opacity-60 disabled:scale-100 mt-2"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] to-[#4DA2FF]" />
              <span className="absolute inset-0 bg-gradient-to-r from-[#7C5CFF] toLog-[#4DA2FF] blur-md opacity-0 hover:opacity-50 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight size={15} />
                  </>
                )}
              </span>
            </button>

            <p className="text-[10px] text-[#94A3B8]/60 text-center leading-relaxed">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-[#7C5CFF] hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-[#7C5CFF] hover:underline">Privacy Policy</a>.
            </p>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
            <span className="text-xs text-[#94A3B8]/60">Already have an account?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <Link
            to="/login"
            id="go-to-login"
            className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm text-[#94A3B8] hover:text-[#F5F7FF] border border-white/08 hover:border-white/15 bg-white/02 hover:bg-white/05 transition-all duration-200"
          >
            Sign in instead
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
