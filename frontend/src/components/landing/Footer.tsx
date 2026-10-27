import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LumoraLogo } from "@/components/ui/LumoraLogo";

function GitHubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.1c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.76 2.57 3.73 1.82.1-.72.4-1.2.72-1.48-2.48-.28-5.08-1.24-5.08-5.53 0-1.22.44-2.22 1.16-3-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.14a10.7 10.7 0 0 1 5.6 0c2.13-1.44 3.08-1.14 3.08-1.14.61 1.55.23 2.7.12 2.98.72.78 1.15 1.78 1.15 3.01 0 4.3-2.6 5.24-5.1 5.51.4.34.76 1.02.76 2.06v3.05c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}

function LinkedInIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45ZM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0h.01Z" />
    </svg>
  );
}

const socialLinks = [
  { label: "GitHub", href: "https://github.com/Adityamkumar", Icon: GitHubIcon },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/aditya-kumar-6b37802ba", Icon: LinkedInIcon },
];

export function Footer() {
  return (
    <footer className="relative isolate mx-auto w-full max-w-[1216px] overflow-hidden border-x border-t border-[var(--border-soft)] bg-[#07080c]">
      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-2 gap-x-8 gap-y-12 px-6 pt-12 sm:px-10 sm:pt-16 lg:grid-cols-[1.5fr_0.7fr_0.8fr_0.7fr] lg:gap-12 lg:px-12 lg:pt-20">
        <section className="col-span-2 max-w-md lg:col-span-1">
          <Link to="/" aria-label="Lumora home" className="inline-flex items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            <LumoraLogo size="md" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--text-secondary)] sm:text-base sm:leading-7">
            Turn videos and documents into clear, useful knowledge.
          </p>
          <a href="/#features" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white transition-colors hover:text-violet-300">
            Explore Lumora <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </section>

        <nav aria-label="Explore Lumora">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Explore</h2>
          <ul className="mt-5 flex flex-col items-start gap-4">
            <li><a href="/#features" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">Features</a></li>
            <li><a href="/#showcase" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">How it works</a></li>
          </ul>
        </nav>

        <nav aria-label="Your workspace">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Workspace</h2>
          <ul className="mt-5 flex flex-col items-start gap-4">
            <li><Link to="/login" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">Log in</Link></li>
            <li><Link to="/signup" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">Create an account</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Legal</h2>
          <ul className="mt-5 flex flex-col items-start gap-4">
            <li><Link to="/privacy" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">Privacy policy</Link></li>
            <li><Link to="/terms" className="text-sm text-[var(--text-secondary)] transition-colors hover:text-white">Terms of service</Link></li>
          </ul>
        </nav>
      </div>

      <div className="relative z-10 mx-auto mt-12 flex w-full max-w-7xl flex-col-reverse items-start justify-between gap-6 border-t border-[var(--border-soft)] px-6 py-7 sm:mt-16 sm:flex-row sm:items-center sm:px-10 lg:mt-20 lg:px-12">
        <span className="text-sm text-[var(--text-muted)]">© {new Date().getFullYear()} Lumora. Crafted for learning.</span>
        <div className="flex items-center gap-2" aria-label="Social links">
          {socialLinks.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Lumora on ${label} (opens in a new tab)`}
              className="inline-flex size-9 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
              <Icon className="size-[18px]" />
            </a>
          ))}
          <a href="#top" aria-label="Back to top" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" }); }} className="ml-2 inline-flex size-9 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative -mb-[0.16em] select-none overflow-hidden bg-gradient-to-b from-white/[0.12] to-transparent bg-clip-text text-center text-[clamp(6rem,23vw,17rem)] font-semibold leading-[0.82] tracking-[-0.075em] text-transparent">
        Lumora
      </div>
    </footer>
  );
}
