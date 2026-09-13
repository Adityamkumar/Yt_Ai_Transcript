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
import { Meteors } from "@/components/ui/meteors";

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
      className="relative overflow-hidden border-t border-[var(--border-soft)] bg-[#07080c] pb-0 pt-24 sm:pt-32"
    >
      <div className="relative z-10">
        
        {/* Section Header */}
        <div className="mx-auto mb-16 max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="text-3xl font-semibold leading-[1.08] tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-4xl"
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
            className="mt-5 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-[15px]"
          >
            Lumora streamlines material ingestion, analysis, and grounding. Experience the AI-native workspace architecture and real-time citation synchronization.
          </motion.p>
        </div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 overflow-hidden border border-[var(--border-soft)] bg-[#07080c]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12">
            {features.map((feature, index) => (
              <Feature key={feature.title} {...feature} index={index} />
            ))}
          </div>
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
        "group/feature relative flex min-h-[250px] flex-col overflow-hidden border-b border-r border-[var(--border-soft)] px-6 py-8 transition-colors duration-300 hover:bg-[rgba(157,165,255,0.035)] sm:px-8 lg:px-10",
        index < 2 && "lg:col-span-6 lg:row-span-2 lg:min-h-[430px]",
        index >= 2 && "lg:col-span-4 lg:min-h-[210px]",
        index === 6 && "sm:border-b-0",
        index >= 5 && "lg:border-b-0",
        index === 7 && "sm:border-b-0"
      )}
    >
      {index < 2 && (
        <Meteors
          number={16}
          minDelay={0.2}
          maxDelay={2.8}
          minDuration={4}
          maxDuration={8}
          angle={215}
          className="bg-[rgba(157,165,255,0.45)] shadow-[0_0_0_1px_rgba(157,165,255,0.12)]"
        />
      )}
      <div className="relative z-10 mb-8 text-[var(--text-secondary)]">
        {icon}
      </div>
      <div className="relative z-10 mb-3 text-lg font-bold">
        <div className="absolute -left-6 inset-y-0 h-6 w-0.5 bg-[var(--border-strong)] transition-all duration-200 group-hover/feature:h-8 group-hover/feature:bg-[var(--accent)] sm:-left-8 lg:-left-10" />
        <span className="inline-block text-[var(--text-primary)] transition duration-200 group-hover/feature:translate-x-1">
          {title}
        </span>
      </div>
      <p className="relative z-10 max-w-xl text-sm leading-relaxed text-[var(--text-secondary)]">
        {description}
      </p>
    </div>
  );
};
