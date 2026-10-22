import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, AlertCircle } from "lucide-react";
import { pdfService } from "@/services/pdf.service";
import { IConversation } from "@/types";
import { cn } from "@/utils/cn";
import toast from "react-hot-toast";
import { EMAIL_NOT_VERIFIED_CODE } from "@/lib/axios";

interface PdfUploadCardProps {
  onUploadSuccess: (conversation: IConversation) => void;
  onUploadingStateChange?: (uploading: boolean) => void;
}

export function PdfUploadCard({ onUploadSuccess, onUploadingStateChange }: PdfUploadCardProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

    setIsUploading(true);
    onUploadingStateChange?.(true);

    try {
      const conversation = await pdfService.uploadPdf(selectedFile);
      toast.success("PDF indexed successfully!");
      onUploadSuccess(conversation);
    } catch (err: any) {
      if (err?.code === EMAIL_NOT_VERIFIED_CODE) {
        return;
      }
      const errMsg = err.message || "Failed to index PDF document";
      setErrorMsg(errMsg);
      toast.error(errMsg);
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
      void validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      void validateAndUpload(e.target.files[0]);
    }
  };

  const triggerInput = () => {
    inputRef.current?.click();
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="ruixen-input-panel">
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={!isUploading ? triggerInput : undefined}
          className={cn(
            "ruixen-input-panel__content group relative flex min-h-[136px] flex-col items-center justify-center rounded-[18px] border border-dashed p-8 text-center transition-all duration-300",
            !isUploading ? "cursor-pointer" : "cursor-default",
            isDragActive
              ? "border-[rgba(139,156,255,0.8)] bg-[rgba(139,156,255,0.06)] shadow-[0_0_24px_rgba(102,117,246,0.1)]"
              : "border-white/[0.08] bg-[rgba(10,13,28,0.55)] hover:border-white/[0.18] hover:bg-[rgba(14,18,36,0.65)]",
            errorMsg && "border-[rgba(251,113,133,0.4)] bg-[rgba(251,113,133,0.02)]",
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
            {!isUploading && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center py-2"
              >
                <div
                  className={cn(
                    "mb-4 grid h-12 w-12 place-items-center rounded-2xl border transition-all duration-300",
                    isDragActive
                      ? "border-[rgba(139,156,255,0.4)] bg-[rgba(139,156,255,0.1)] text(--accent) scale-110"
                      : "border-white/[0.08] bg-[#0c1018] text(--text-muted) group-hover:border-white/[0.16] group-hover:text-white group-hover:scale-105",
                  )}
                >
                  <UploadCloud size={22} />
                </div>
                <p className="text-sm font-semibold text-white">
                  Drag and drop your PDF here, or{" "}
                  <span className="text(--accent) group-hover:underline">browse</span>
                </p>
                <p className="mt-1 text-xs text(--text-muted)">Maximum file size: 10MB</p>
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
              className="mt-3 flex items-center justify-center gap-2 text-sm text(--danger)"
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
