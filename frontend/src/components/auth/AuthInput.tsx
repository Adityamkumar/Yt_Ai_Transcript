import { Eye, EyeOff } from "lucide-react";

interface AuthInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password";
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  rightSlot?: React.ReactNode;
  hasError?: boolean;
}

export function AuthInput({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  autoComplete,
  required,
  minLength,
  rightSlot,
  hasError,
}: AuthInputProps) {
  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={id} className="text-xs font-medium text-[#94A3B8]">{label}</label>
      ) : null}
      <div className="relative">
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required={required}
          minLength={minLength}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 rounded-xl text-sm text-[#F5F7FF] placeholder-[#94A3B8]/50 transition-all duration-200 outline-none"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: hasError ? "1px solid rgba(239, 68, 68, 0.55)" : "1px solid rgba(255,255,255,0.08)",
          }}
        />
        {rightSlot}
      </div>
    </div>
  );
}

interface AuthPasswordInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggleVisible: () => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  hasError?: boolean;
}

export function AuthPasswordInput({
  id,
  label,
  value,
  onChange,
  visible,
  onToggleVisible,
  placeholder,
  autoComplete,
  required,
  minLength,
  hasError,
}: AuthPasswordInputProps) {
  return (
    <AuthInput
      id={id}
      label={label}
      value={value}
      onChange={onChange}
      type={visible ? "text" : "password"}
      placeholder={placeholder}
      autoComplete={autoComplete}
      required={required}
      minLength={minLength}
      hasError={hasError}
      rightSlot={
        <button
          type="button"
          onClick={onToggleVisible}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[#94A3B8] hover:text-[#F5F7FF] transition-colors duration-200"
        >
          {visible ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      }
    />
  );
}
