import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { pdfService } from "@/services/pdf.service";
import { IConversation } from "@/types";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";

interface PdfUploadCardProps {
  onUploadSuccess: (conversation: IConversation) => void;
  onUploadingStateChange?: (uploading: boolean) => void;
}

export function PdfUploadCard({ onUploadSuccess, onUploadingStateChange }: PdfUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const validateAndUpload = async (selectedFile: File) => {
    setErrorMsg(null);
  
    const acceptableMimes = ["application/pdf"];
    const isPdfByMime = acceptableMimes.includes(selectedFile.type);
    const isPdfByExt = selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdfByMime && !isPdfByExt) {
      setErrorMsg("Only PDF documents are supported");
      toast.error("Invalid file format. Please upload a PDF.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMsg("File exceeds the maximum 10MB limit");
      toast.error("File is too large. Max size is 10MB.");
      return;
    }

    setFile(selectedFile);
    setIsUploading(true);
    onUploadingStateChange?.(true);

    try {
      const conversation = await pdfService.uploadPdf(selectedFile);
      toast.success("PDF indexed successfully!");
      onUploadSuccess(conversation);
    } catch (err: any) {
      const errMsg = err.message || "Failed to index PDF document";
      setErrorMsg(errMsg);
      toast.error(errMsg);
      setFile(null);
    } finally {
      setIsUploading(false);
      onUploadingStateChange?.(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="glass-surface rounded-[24px] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3 px-1 sm:px-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-[rgba(139,156,255,0.12)] text-[var(--accent)]">
              <FileText size={17} />
            </span>
            <div className="text-left">
              <p className="text-sm font-semibold text-white">Upload PDF document</p>
              <p className="text-xs text-[var(--text-muted)]">Upload a PDF to create an AI grounded chat workspace.</p>
            </div>
          </div>
        </div>

        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={!isUploading ? triggerInput : undefined}
          className={cn(
            "group relative flex flex-col items-center justify-center rounded-[20px] border border-dashed p-8 text-center transition-all duration-300",
            !isUploading ? "cursor-pointer" : "cursor-default",
            isDragActive
              ? "border-[rgba(139,156,255,0.8)] bg-[rgba(139,156,255,0.06)] shadow-[0_0_24px_rgba(102,117,246,0.1)]"
              : "border-white/[0.08] bg-[#070a10]/72 hover:border-white/[0.18] hover:bg-white/[0.01]",
            errorMsg && "border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.02)]"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleChange}
            className="hidden"
            disabled={isUploading}
          />

          <AnimatePresence mode="wait">
            {isUploading ? (
               <motion.div
                 key="uploading"
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="flex flex-col items-center gap-3 py-4 w-full max-w-[280px]"
               >
                 <div className="relative">
                   <div className="h-12 w-12 rounded-full border-2 border-white/[0.06] border-t-[var(--accent)] animate-spin" />
                   <FileText size={18} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[var(--accent)] animate-pulse" />
                 </div>
                 <div className="mt-2 w-full text-center">
                   <p className="text-[15px] font-semibold text-white">
                     Uploading &amp; indexing "{file?.name}"...
                   </p>
                   <p className="mt-1 text-xs text-[var(--text-muted)]">
                     Extracting pages and building AI learning context.
                   </p>
                   <div className="mt-3.5 h-1.5 w-full rounded-full bg-white/[0.04] overflow-hidden">
                     <motion.div
                       className="h-full w-1/3 bg-[var(--accent)] rounded-full"
                       animate={{ x: ["0%", "200%", "0%"] }}
                       transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                     />
                   </div>
                 </div>
               </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-2"
              >
                <div className={cn(
                  "mb-4 grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-300",
                  isDragActive 
                    ? "border-[rgba(139,156,255,0.4)] bg-[rgba(139,156,255,0.1)] text-[var(--accent)] scale-110" 
                    : "border-white/[0.08] bg-[#0c1018] text-[var(--text-muted)] group-hover:border-white/[0.16] group-hover:text-white group-hover:scale-105"
                )}>
                  <UploadCloud size={22} />
                </div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your PDF here, or <span className="text-[var(--accent)] group-hover:underline">browse</span>
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Maximum file size: 10MB
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-3 flex items-center justify-center gap-2 text-sm text-[var(--danger)]"
            >
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

