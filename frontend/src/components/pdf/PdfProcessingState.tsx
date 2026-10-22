import { ProgressiveFluxLoader } from "@/components/ui/progressive-flux-loader";

const phases = [
  { at: 0, label: "Uploading your PDF" },
  { at: 28, label: "Extracting document text" },
  { at: 56, label: "Organizing your document" },
  { at: 80, label: "Preparing your workspace" },
];

export function PdfProcessingState() {
  return (
    <div className="flex h-full min-h-0 items-center justify-center px-4 py-10 sm:px-6">
      <ProgressiveFluxLoader phases={phases} />
    </div>
  );
}
