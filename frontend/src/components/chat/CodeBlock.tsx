import React, { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { createHighlighter, type Highlighter } from 'shiki';
import { getLanguageConfig } from './languageBadge.config';

// Import Devicon stylesheet for web font classes
import 'devicon/devicon.min.css';

// Singleton highlighter promise to prevent multiple highlighter instantiations
let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighterInstance(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ['one-dark-pro'],
      langs: [
        'c',
        'cpp',
        'java',
        'javascript',
        'typescript',
        'python',
        'go',
        'rust',
        'sql',
        'bash',
        'json',
        'yaml',
        'dockerfile',
        'markdown',
        'html',
        'css',
      ],
    });
  }
  return highlighterPromise;
}

interface LanguageBadgeProps {
  language: string;
}

function LanguageBadge({ language }: LanguageBadgeProps) {
  const config = getLanguageConfig(language);

  return (
    <div
      className="flex items-center gap-2 h-7 px-2.5 rounded-md border border-[var(--border-soft)] bg-[#111622]/65 hover:bg-[#111622]/85 hover:border-[var(--border-medium)] transition-all text-[var(--text-secondary)] select-none"
      aria-label={`${config.displayName} code block`}
    >
      {config.iconType === 'devicon' ? (
        <i
          className={`${config.icon as string} text-[14px] shrink-0`}
          style={{ color: config.color }}
          aria-hidden="true"
        />
      ) : (
        React.createElement(config.icon as React.ComponentType<React.SVGProps<SVGSVGElement>>, {
          width: 14,
          height: 14,
          style: { color: config.color },
          className: 'shrink-0',
          'aria-hidden': 'true',
        })
      )}
      <span className="font-sans text-[11px] font-medium tracking-wide">
        {config.displayName}
      </span>
    </div>
  );
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = '' }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;

    const highlightCode = async () => {
      try {
        const highlighter = await getHighlighterInstance();
        if (!active) return;

        const lang = language ? language.toLowerCase() : 'text';
        const loadedLangs = highlighter.getLoadedLanguages();

        let targetLang = 'text';
        if (lang !== 'text') {
          if (loadedLangs.includes(lang)) {
            targetLang = lang;
          } else {
            // Attempt to load the language dynamically if it isn't pre-loaded
            try {
              await highlighter.loadLanguage(lang as any);
              targetLang = lang;
            } catch {
              targetLang = 'text';
            }
          }
        }

        const html = highlighter.codeToHtml(code, {
          lang: targetLang,
          theme: 'one-dark-pro',
        });

        if (active) {
          setHighlightedHtml(html);
          setLoading(false);
        }
      } catch (err) {
        console.error('Shiki highlighting failed:', err);
        if (active) {
          setLoading(false);
        }
      }
    };

    highlightCode();

    return () => {
      active = false;
    };
  }, [code, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success('Code copied to clipboard', { duration: 2000 });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[#0b0e14] shadow-lg">
      {/* CodeBlock Header */}
      <div className="flex h-11 items-center justify-between border-b border-[var(--border-soft)] bg-[#0e121a] px-4 text-xs font-medium text-[var(--text-secondary)] select-none">
        <LanguageBadge language={language} />
        <button
          onClick={handleCopy}
          className="flex h-7 items-center gap-1.5 rounded-md px-2.5 transition-all hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:outline-none text-[11px]"
          aria-label="Copy code to clipboard"
        >
          {copied ? (
            <Check size={13} className="text-(--success)" />
          ) : (
            <Copy size={13} />
          )}
          <span>{copied ? 'Copied' : 'Copy code'}</span>
        </button>
      </div>

      {/* CodeBlock Content */}
      <div className="relative overflow-x-auto pl-6 pr-4 py-4 font-mono text-[13px] leading-relaxed no-scrollbar max-w-full">
        {loading ? (
          <pre className="whitespace-pre text-gray-100">{code}</pre>
        ) : highlightedHtml ? (
          <div
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
            className="shiki-container"
          />
        ) : (
          <pre className="whitespace-pre text-gray-100">{code}</pre>
        )}
      </div>
    </div>
  );
}
