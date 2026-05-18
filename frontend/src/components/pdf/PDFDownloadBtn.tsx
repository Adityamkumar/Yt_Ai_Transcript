import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { NotesPDF } from "../pdf/NotesPdf";
import { NotesResponse } from "../../types/NotesResponse";

interface Props {
  notes: NotesResponse;
}

const buildPdfFileName = (title: string) => {
  const normalized = title
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const shortTitle = normalized
    .split(" ")
    .filter(Boolean)
    .slice(0, 4)
    .join("_")
    .slice(0, 36);
  return `${shortTitle || "notes"}_Notes.pdf`;
};

export function PDFDownloadButton({ notes }: Props) {
  return (
    <PDFDownloadLink
      document={<NotesPDF notes={notes} />}
      fileName={buildPdfFileName(notes.title)}
      style={{ textDecoration: "none" }}
    >
      {({ loading }) => (
        <div
          className={`inline-flex h-11 items-center gap-2 px-3 sm:px-4 rounded-xl transition-all font-medium text-xs sm:text-sm whitespace-nowrap shrink-0 ${
            loading
              ? "bg-white/5 text-gray-500 cursor-not-allowed"
              : "bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:text-purple-300 shadow-lg shadow-purple-500/5"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
              <span className="hidden sm:inline">Generating...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </>
          )}
        </div>
      )}
    </PDFDownloadLink>
  );
}
