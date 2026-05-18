import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { PDFBulletList } from "../pdf/PDFBulletlist";

interface Props {
  summary: {
    heading: string;
    point: string;
    timestamp: string;
    seconds: number;
  }[];
}

export function PDFSummary({
  summary,
}: Props) {
  const summaryItems = summary.map(s => ({
    text: `**${s.heading}**: ${s.point}`,
    timestamp: s.timestamp,
    seconds: s.seconds
  }));

  return (
    <View style={styles.conceptBlock}>
      <Text style={styles.conceptHeading}>
        Educational Summary
      </Text>

      <PDFBulletList items={summaryItems} />
    </View>
  );
}