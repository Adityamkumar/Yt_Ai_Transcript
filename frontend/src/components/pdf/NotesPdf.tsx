import {
  Document,
  Page,
  Text,
  View,
} from "@react-pdf/renderer";

import { NotesResponse } from "@/types/notesResponse";
import { styles } from "./PDFStyles";
import { PDFHeader } from "./PDFHeader";
import { PDFSection } from "./PDFSection";
import { PDFBulletList } from "../pdf/PDFBulletlist";
import { PDFSummary } from "./PDFSummary";

interface Props {
  notes: NotesResponse;
}

export function NotesPDF({
  notes,
}: Props) {
  return (
    <Document>
      <Page
        size="A4"
        style={styles.page}
      >
        <PDFHeader
          title={notes.title}
          subtitle={notes.subtitle}
        />

        <PDFSection title="Overview">
          <PDFBulletList
            items={notes.overview}
          />
        </PDFSection>

        <PDFSection title="Main Concepts">
          {notes.mainConcepts.map(
            (concept, index) => (
              <View key={index} style={{ marginBottom: 15 }}>
                <Text style={styles.conceptHeading}>
                  {concept.heading.replace(/\*\*/g, "")}
                </Text>

                <PDFBulletList
                  items={concept.points}
                />
              </View>
            )
          )}
        </PDFSection>

        <PDFSection title="Key Insights">
          <PDFBulletList
            items={notes.keyInsights}
          />
        </PDFSection>

        <PDFSection title="Actionable Takeaways">
          <PDFBulletList
            items={
              notes.actionableTakeaways
            }
          />
        </PDFSection>

        <PDFSection title="Examples">
          <PDFBulletList
            items={notes.examples}
          />
        </PDFSection>

        <PDFSummary
          summary={notes.summary}
        />
      </Page>
    </Document>
  );
}