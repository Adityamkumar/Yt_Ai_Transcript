import { Document, Page, Text, View } from "@react-pdf/renderer";
import { NotesResponse } from "@/types";
import { styles } from "./PDFStyles";
import { PDFHeader } from "./PDFHeader";
import { PDFFooter } from "./PDFFooter";
import { PDFBulletList } from "./PDFBulletlist";
import { PDFMarkdownText } from "./PDFMarkdownText";
import { PDFSection } from "./PDFSection";

interface Props {
  notes: NotesResponse;
}

function buildRevisionPoints(notes: NotesResponse): string[] {
  const points: string[] = [];
  if (notes.keyInsights && notes.keyInsights.length > 0) {
    points.push(notes.keyInsights[0]);
  }
  if (notes.actionableTakeaways && notes.actionableTakeaways.length > 0) {
    points.push(notes.actionableTakeaways[0]);
  }
  if (notes.mainConcepts && notes.mainConcepts.length > 0) {
    const first = notes.mainConcepts[0];
    if (first.points && first.points.length > 0) {
      points.push(first.points[0]);
    }
  }
  return points;
}

export function NotesPDF({ notes }: Props) {
  const revisionPoints = buildRevisionPoints(notes);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader title={notes.title} subtitle={notes.subtitle} />

        {notes.overview && notes.overview.length > 0 && (
          <PDFSection title="Executive Summary" sectionNumber="01">
            <View wrap={false}>
              <View style={{ marginBottom: 5 }}>
                <PDFMarkdownText style={styles.overviewText}>
                  {notes.overview[0]}
                </PDFMarkdownText>
              </View>
            </View>
            {notes.overview.slice(1).map((paragraph, index) => (
              <View key={index + 1} style={{ marginBottom: 5 }}>
                <PDFMarkdownText style={styles.overviewText}>
                  {paragraph}
                </PDFMarkdownText>
              </View>
            ))}
          </PDFSection>
        )}

        {notes.mainConcepts && notes.mainConcepts.length > 0 && (
          <PDFSection title="Main Concepts" sectionNumber="02">
            {notes.mainConcepts.map((concept, index) => (
              <View key={index} style={styles.conceptBlock} wrap={false}>
                <Text style={styles.conceptHeading}>{concept.heading}</Text>
                <PDFBulletList items={concept.points} />
              </View>
            ))}
          </PDFSection>
        )}

        {notes.keyInsights && notes.keyInsights.length > 0 && (
          <PDFSection title="Key Insights" sectionNumber="03">
            <View wrap={false}>
              <View style={styles.insightBox}>
                <Text style={styles.insightLabel}>Core Learnings</Text>
                <PDFBulletList items={notes.keyInsights} />
              </View>
            </View>
          </PDFSection>
        )}

        {notes.actionableTakeaways && notes.actionableTakeaways.length > 0 && (
          <PDFSection title="Actionable Takeaways" sectionNumber="04">
            <View wrap={false}>
              <View style={styles.takeawayBox}>
                <Text style={styles.takeawayLabel}>Next Steps</Text>
                <PDFBulletList
                  items={notes.actionableTakeaways}
                  isCheck={true}
                />
              </View>
            </View>
          </PDFSection>
        )}

        {notes.examples && notes.examples.length > 0 && (
          <PDFSection title="Real-World Examples" sectionNumber="05">
            <View wrap={false}>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleLabel}>Applications</Text>
                <PDFBulletList items={notes.examples} />
              </View>
            </View>
          </PDFSection>
        )}

        {revisionPoints.length > 0 && (
          <PDFSection title="Quick Revision Summary">
            <View wrap={false}>
              <View style={styles.summaryBox}>
                <Text style={styles.summaryLabel}>Key Takeaways at a Glance</Text>
                <PDFBulletList items={revisionPoints} />
              </View>
            </View>
          </PDFSection>
        )}

        <PDFFooter />
      </Page>
    </Document>
  );
}
