import { PDFDownloadLink } from "@react-pdf/renderer";
import { Download, Loader2 } from "lucide-react";
import { NotesPDF } from "../pdf/NotesPdf";
import { NotesResponse } from "../../types/notesResponse";

interface Props {
  notes: NotesResponse;
}

export function PDFDownloadButton({
  notes,
}: Props) {
  return (
    <PDFDownloadLink
      document={<NotesPDF notes={notes} />}
      fileName={`${notes.title.replace(/\s+/g, '_')}_Notes.pdf`}
      style={{ textDecoration: 'none' }}
    >
      {({ loading }) => (
        <div
          className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all font-medium text-xs sm:text-sm whitespace-nowrap ${
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
              <span>Download PDF</span>
            </>
          )}
        </div>
      )}
    </PDFDownloadLink>
  );
}