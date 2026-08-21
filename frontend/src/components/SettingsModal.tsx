import { AnimatePresence, motion } from "framer-motion";
import {
  Settings,
  X,
  User,
  Mail,
  Shield,
  Trash2,
  AlertTriangle,
  Check,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  Lock,
  Database,
  MonitorSmartphone,
  Download,
  MessageSquareOff,
  Files,
  Image as ImageIcon,
  Edit2,
  LogOut,
  LayoutDashboard
} from "lucide-react";
import { useAuth } from "@/store/AuthContext";
import { useState, useEffect, useRef } from "react";
import { DeleteAccountModal } from "./DeleteAccountModal";
import { UserAvatar } from "@/components/auth/UserAvatar";
import toast from "react-hot-toast";
import { settingsService, type ResponseLanguage } from "@/services/settings.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 400,
      damping: 30,
      delay: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const GoogleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    width="14"
    height="14"
    aria-hidden="true"
  >
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
    <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
  </svg>
);

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
      checked ? 'bg-indigo-500' : 'bg-white/10'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        checked ? 'translate-x-2' : '-translate-x-2'
      }`}
    />
  </button>
);

const SettingRow = ({ title, description, children, danger = false }: { title: string; description: string; children: React.ReactNode, danger?: boolean }) => (
  <div className="flex items-center justify-between py-4 border-b border-white/[0.04] last:border-0 group gap-4">
    <div className="pr-4 flex-1">
      <p className={`text-sm font-medium transition-colors ${danger ? 'text-red-400' : 'text-white group-hover:text-white/90'}`}>{title}</p>
      <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{description}</p>
    </div>
    <div className="shrink-0">{children}</div>
  </div>
);

const SettingSelect = ({ 
  value, 
  options, 
  onChange 
}: { 
  value: string; 
  options: { label: string; value: string }[]; 
  onChange: (val: string) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none ${
          isOpen ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-white/[0.02] text-white hover:bg-white/10'
        }`}
      >
        {selectedLabel}
        <ChevronRight size={14} className={`text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 z-[70] overflow-hidden rounded-xl border border-[var(--border-medium)] bg-[var(--surface-2)] shadow-2xl shadow-black/60"
          >
            <div className="max-h-64 overflow-y-auto p-1 scrollbar-thin scrollbar-thumb-white/10">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors ${
                    value === opt.value
                      ? 'bg-indigo-500/10 text-indigo-400 font-medium'
                      : 'text-white hover:bg-white/[0.06]'
                  }`}
                >
                  {opt.label}
                  {value === opt.value && <Check size={14} className="text-indigo-400" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SettingAction = ({ icon: Icon, label, danger }: { icon: any, label: string, danger?: boolean }) => (
  <button className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#111] ${
    danger 
      ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 focus:ring-red-500' 
      : 'border-white/10 bg-white/[0.02] text-white hover:bg-white/10 focus:ring-indigo-500'
  }`}>
    <Icon size={14} />
    {label}
  </button>
);


// Tabs content components
function ProfileTab({ user, onShowDeleteModal }: any) {
  const isGoogle = user?.provider === "google";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Profile Information
        </h3>
        
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar name={user?.name || "Guest"} avatar={user?.avatar} size={64} />
          <div>
            <p className="text-lg font-semibold text-white">{user?.name || "Guest"}</p>
            <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            <button className="mt-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Change avatar
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <div className="flex items-center justify-between py-4 border-b border-white/[0.04]">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Display name</p>
              <p className="text-sm font-medium text-white">{user?.name || "Guest"}</p>
            </div>
            <button className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
              Edit
            </button>
          </div>
          
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs text-[var(--text-muted)] mb-1">Email address</p>
              <p className="text-sm font-medium text-white">{user?.email}</p>
              {isGoogle && (
                <p className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-1.5">
                  <GoogleIcon /> Managed by Google
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-red-400/80">
          Danger Zone
        </h3>
        <div className="rounded-xl border border-red-500/15 bg-red-500/[0.04] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-400" />
                <p className="text-sm font-medium text-white">Delete Account</p>
              </div>
              <p className="mt-1.5 text-xs text-[var(--text-muted)] max-w-sm">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={onShowDeleteModal}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:text-red-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-[#111]"
            >
              <Trash2 size={14} />
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LearningTab({ prefs, updatePref, updateResponseLanguage }: any) {
  const languageOptions = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Tamil', value: 'ta' },
    { label: 'Telugu', value: 'te' },
    { label: 'Kannada', value: 'kn' },
    { label: 'Malayalam', value: 'ml' },
    { label: 'Bengali', value: 'bn' },
    { label: 'Marathi', value: 'mr' },
  ];

  const styleOptions = [
    { label: 'Concise', value: 'concise' },
    { label: 'Balanced', value: 'balanced' },
    { label: 'Detailed', value: 'detailed' },
  ];

  const levelOptions = [
    { label: 'Beginner', value: 'beginner' },
    { label: 'Intermediate', value: 'intermediate' },
    { label: 'Advanced', value: 'advanced' },
  ];

  const toneOptions = [
    { label: 'Supportive', value: 'supportive' },
    { label: 'Direct', value: 'direct' },
    { label: 'Socratic', value: 'socratic' },
    { label: 'Academic', value: 'academic' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Output Preferences
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Response language" description="Choose the language Lumora uses for AI-generated responses.">
            <SettingSelect 
              value={prefs.responseLanguage} 
              options={languageOptions}
              onChange={updateResponseLanguage}
            />
          </SettingRow>
          <SettingRow title="Answer style" description="Choose how Lumora should structure explanations and answers.">
            <SettingSelect 
              value={prefs.answerStyle} 
              options={styleOptions}
              onChange={(v) => updatePref('answerStyle', v)} 
            />
          </SettingRow>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Educational Focus
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Explanation level" description="Tailor explanations to your current level of understanding.">
            <SettingSelect 
              value={prefs.explanationLevel} 
              options={levelOptions}
              onChange={(v) => updatePref('explanationLevel', v)} 
            />
          </SettingRow>
          <SettingRow title="Educational tone" description="Adjust the teaching style of your learning assistant.">
            <SettingSelect 
              value={prefs.educationalTone} 
              options={toneOptions}
              onChange={(v) => updatePref('educationalTone', v)} 
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function AiTab({ prefs, updatePref }: any) {
  const groundingOptions = [
    { label: 'Strict', value: 'strict' },
    { label: 'Balanced', value: 'balanced' },
    { label: 'Open', value: 'open' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Retrieval & Generation
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Answer grounding" description="Prioritize uploaded sources and use general knowledge when it helps explain the topic.">
            <SettingSelect 
              value={prefs.answerGrounding} 
              options={groundingOptions}
              onChange={(v) => updatePref('answerGrounding', v)} 
            />
          </SettingRow>
          <SettingRow title="Automatically summarize new documents" description="Generate a summary after document indexing completes.">
            <ToggleSwitch 
              checked={prefs.autoSummarizeDocuments} 
              onChange={(v) => updatePref('autoSummarizeDocuments', v)} 
            />
          </SettingRow>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Context & Citations
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Show source references" description="Display citations from your uploaded content.">
            <ToggleSwitch 
              checked={prefs.showSourceReferences} 
              onChange={(v) => updatePref('showSourceReferences', v)} 
            />
          </SettingRow>
          <SettingRow title="Show timestamps" description="Include YouTube timestamps when available.">
            <ToggleSwitch 
              checked={prefs.showTimestamps} 
              onChange={(v) => updatePref('showTimestamps', v)} 
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function WorkspaceTab({ prefs, updatePref }: any) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Startup Behavior
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Continue where I left off" description="Return to your most recent workspace when Lumora opens.">
            <ToggleSwitch 
              checked={prefs.continueWhereLeftOff} 
              onChange={(v) => updatePref('continueWhereLeftOff', v)} 
            />
          </SettingRow>
          <SettingRow title="Remember last workspace" description="Open the workspace you were using most recently.">
            <ToggleSwitch 
              checked={prefs.rememberLastWorkspace} 
              onChange={(v) => updatePref('rememberLastWorkspace', v)} 
            />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Active Sessions
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] divide-y divide-white/[0.04]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <MonitorSmartphone size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">Chrome on Windows</p>
                  <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">Current</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Active now</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)]">
                <MonitorSmartphone size={20} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Safari on iPhone</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">Last active 2 hours ago</p>
              </div>
            </div>
            <button className="text-sm font-medium text-white/60 hover:text-white transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <SettingAction icon={LogOut} label="Sign out of all other devices" />
      </div>
    </div>
  );
}

function DataTab() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          Your Data
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Download Account Data" description="Get a copy of your preferences, history, and metadata.">
            <SettingAction icon={Download} label="Export" />
          </SettingRow>
          <SettingRow title="Manage Uploaded Documents" description="Review or delete files you've uploaded to Lumora.">
            <SettingAction icon={Files} label="Manage" />
          </SettingRow>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
          History & Privacy
        </h3>
        <div className="rounded-xl border border-[var(--border-soft)] bg-[var(--surface-3)] px-5">
          <SettingRow title="Clear Chat History" description="This permanently removes your conversations.">
            <SettingAction icon={MessageSquareOff} label="Clear History" danger />
          </SettingRow>
          <SettingRow title="Delete All Documents" description="Removes all original files, metadata, generated chunks, and vector records.">
            <SettingAction icon={Trash2} label="Delete Documents" danger />
          </SettingRow>
        </div>
      </div>
    </div>
  );
}


type TabId = 'profile' | 'learning' | 'ai' | 'workspace' | 'security' | 'data';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User, category: 'ACCOUNT' },
  { id: 'learning', label: 'Learning Preferences', icon: GraduationCap, category: 'LEARNING' },
  { id: 'ai', label: 'AI Preferences', icon: Sparkles, category: 'LEARNING' },
  { id: 'workspace', label: 'Workspace', icon: LayoutDashboard, category: 'WORKSPACE' },
  { id: 'security', label: 'Security & Sessions', icon: Lock, category: 'SECURITY' },
  { id: 'data', label: 'Privacy & Data', icon: Database, category: 'DATA' },
] as const;

export function SettingsModal({ isOpen, onClose }: Props) {
  const { user } = useAuth();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(true);
  const [isUpdatingResponseLanguage, setIsUpdatingResponseLanguage] = useState(false);

  // Other settings remain local-only until their backend integrations are added.
  const [prefs, setPrefs] = useState({
    responseLanguage: 'en',
    answerStyle: 'balanced',
    explanationLevel: 'intermediate',
    educationalTone: 'supportive',
    answerGrounding: 'balanced',
    showSourceReferences: true,
    showTimestamps: true,
    autoSummarizeDocuments: false,
    continueWhereLeftOff: false,
    rememberLastWorkspace: true,
  });

  const updatePref = (key: keyof typeof prefs, value: any) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  useEffect(() => {
    const savedLanguage = user?.preferences?.responseLanguage || (user?.id && localStorage.getItem(`responseLanguage:${user.id}`));

    if (savedLanguage) {
      setPrefs(p => ({ ...p, responseLanguage: savedLanguage }));
    }
  }, [user?.id, user?.preferences?.responseLanguage]);

  const updateResponseLanguage = async (responseLanguage: string) => {
    if (
      responseLanguage === prefs.responseLanguage ||
      isUpdatingResponseLanguage
    ) {
      return;
    }

    setIsUpdatingResponseLanguage(true);

    try {
      const savedLanguage = await settingsService.updateResponseLanguage(
        responseLanguage as ResponseLanguage,
      );
      setPrefs(p => ({ ...p, responseLanguage: savedLanguage }));

      if (user?.id) {
        localStorage.setItem(`responseLanguage:${user.id}`, savedLanguage);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update response language');
    } finally {
      setIsUpdatingResponseLanguage(false);
    }
  };
  // -------------------------------------

  // Group tabs by category
  const categories = TABS.reduce((acc, tab) => {
    if (!acc[tab.category]) acc[tab.category] = [];
    acc[tab.category].push(tab);
    return acc;
  }, {} as Record<string, typeof TABS[number][]>);

  // Reset state when opened
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setActiveTab('profile');
        setIsMobileMenuOpen(true);
      }, 200);
    }
  }, [isOpen]);

  const activeTabDef = TABS.find(t => t.id === activeTab);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative flex h-full max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[var(--border-medium)] bg-[var(--surface-1)] shadow-2xl shadow-black/40 sm:flex-row"
            >
              {/* Mobile Header (Only visible on small screens) */}
              <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-soft)] bg-[var(--surface-2)] px-4 py-3 sm:hidden">
                {!isMobileMenuOpen ? (
                  <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-muted)] transition-colors hover:text-white"
                  >
                    <ChevronLeft size={16} />
                    Back
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Settings size={16} className="text-white" />
                    <span className="font-semibold text-white">Settings</span>
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Sidebar Navigation */}
              <div className={`flex w-full shrink-0 flex-col border-r border-[var(--border-soft)] bg-[var(--surface-2)] sm:w-64 sm:flex ${isMobileMenuOpen ? 'flex' : 'hidden sm:flex'}`}>
                {/* Desktop Header */}
                <div className="hidden items-center justify-between px-6 py-6 sm:flex">
                  <div>
                    <h2 className="flex items-center gap-2 text-base font-semibold text-white">
                      <Settings size={16} className="text-[var(--text-muted)]" />
                      Settings
                    </h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:px-4 sm:py-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {Object.entries(categories).map(([category, categoryTabs]) => (
                    <div key={category} className="mb-6 last:mb-0">
                      <h4 className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]/70">
                        {category}
                      </h4>
                      <div className="space-y-0.5">
                        {categoryTabs.map((tab) => {
                          const isActive = activeTab === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => {
                                setActiveTab(tab.id);
                                setIsMobileMenuOpen(false);
                              }}
                              className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                                isActive
                                  ? 'bg-white/10 text-white shadow-sm'
                                  : 'text-[var(--text-muted)] hover:bg-white/[0.04] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <tab.icon size={16} className={isActive ? "text-indigo-400" : "text-white/40"} />
                                {tab.label}
                              </div>
                              <ChevronRight size={14} className={`sm:hidden ${isActive ? "text-white/60" : "text-transparent"}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Area */}
              <div className={`flex flex-1 flex-col bg-[var(--surface-1)] ${!isMobileMenuOpen ? 'flex' : 'hidden sm:flex'}`}>
                {/* Desktop Content Header */}
                <div className="hidden shrink-0 items-center justify-between border-b border-[var(--border-soft)] px-8 py-5 sm:flex">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{activeTabDef?.label}</h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--text-muted)] transition-colors hover:bg-white/[0.06] hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Mobile Content Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-soft)] px-5 py-4 sm:hidden">
                  <h2 className="text-base font-semibold text-white">{activeTabDef?.label}</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-5 sm:p-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  <div className="mx-auto max-w-2xl pb-8">
                    {activeTab === 'profile' && <ProfileTab user={user} onShowDeleteModal={() => { onClose(); setShowDeleteModal(true); }} />}
                    {activeTab === 'learning' && (
                      <LearningTab
                        prefs={prefs}
                        updatePref={updatePref}
                        updateResponseLanguage={updateResponseLanguage}
                      />
                    )}
                    {activeTab === 'ai' && <AiTab prefs={prefs} updatePref={updatePref} />}
                    {activeTab === 'workspace' && <WorkspaceTab prefs={prefs} updatePref={updatePref} />}
                    {activeTab === 'security' && <SecurityTab />}
                    {activeTab === 'data' && <DataTab />}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
