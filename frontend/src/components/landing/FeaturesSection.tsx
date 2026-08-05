import { cn } from "@/utils/cn";
import {
  IconBrandYoutube,
  IconMessageChatbot,
  IconFileText,
  IconTimeline,
  IconSparkles,
  IconBolt,
  IconNotebook,
  IconDownload,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const features = [
    {
      title: "YouTube Transcript Extractor",
      description: "Convert any YouTube video URL into clean text chunks instantly.",
      icon: <IconBrandYoutube className="w-8 h-8 text-[#ff0000]" />,
    },
    {
      title: "Conversational RAG Chat",
      description: "Ask questions, query definitions, and chat directly with your files.",
      icon: <IconMessageChatbot className="w-8 h-8 text-blue-400" />,
    },
    {
      title: "PDF & Document Parser",
      description: "Seamlessly upload and index PDFs for structured document intelligence.",
      icon: <IconFileText className="w-8 h-8 text-emerald-400" />,
    },
    {
      title: "Synchronized Timestamps",
      description: "Click transcript phrases or AI outputs to jump directly to video timestamps.",
      icon: <IconTimeline className="w-8 h-8 text-amber-400" />,
    },
    {
      title: "AI Smart Chapters",
      description: "Automatically organize and summarize transcripts into readable key chapters.",
      icon: <IconSparkles className="w-8 h-8 text-purple-400" />,
    },
    {
      title: "Sub-100ms Search",
      description: "Highly optimized vector database indexing for lightning-fast retrievals.",
      icon: <IconBolt className="w-8 h-8 text-yellow-400" />,
    },
    {
      title: "Workspace Notebook",
      description: "Write, edit, and keep notes side-by-side with your video and chat panels.",
      icon: <IconNotebook className="w-8 h-8 text-teal-400" />,
    },
    {
      title: "Flexible Export Suite",
      description: "Download transcripts, notes, and custom summaries as clean PDF or Markdown.",
      icon: <IconDownload className="w-8 h-8 text-indigo-400" />,
    },
  ];

  return (
    <section
      id="features"
      className="section-shell relative py-24 sm:py-32 overflow-hidden border-t border-[var(--border-soft)]"
      style={{ background: 'linear-gradient(180deg, rgba(8, 9, 12, 0.96), rgba(6, 7, 10, 1))' }}
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-left mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[rgba(157,165,255,0.18)] bg-[rgba(255,255,255,0.04)] mb-6 backdrop-blur-md"
          >
            <IconSparkles size={11} className="text-[var(--accent)]" />
            <span className="text-[10px] font-mono tracking-[0.26em] text-[var(--accent)] uppercase font-semibold">
              Capabilities Map
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--text-primary)] tracking-tight leading-[1.08] mb-6"
          >
            A calm structure for your files{" "}
            <span className="font-serif italic font-normal text-[var(--accent)] leading-[1.2]">
              and conversations
            </span>.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed"
          >
            EchoMind streamlines material ingestion, analysis, and grounding. Experience the AI-native workspace architecture and real-time citation synchronization.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10"
        >
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r py-10 relative group/feature border-[var(--border-soft)] premium-card-hover",
        (index === 0 || index === 4) && "lg:border-l border-[var(--border-soft)]",
        index < 4 && "lg:border-b border-[var(--border-soft)]"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-[rgba(157,165,255,0.08)] to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-[rgba(157,165,255,0.08)] to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-[var(--text-secondary)]">
        {icon}
      </div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-[var(--border-strong)] group-hover/feature:bg-[var(--accent)] transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-[var(--text-primary)]">
          {title}
        </span>
      </div>
      <p className="text-sm text-[var(--text-secondary)] max-w-xs relative z-10 px-10 leading-relaxed">
        {description}
      </p>
    </div>
  );
};
