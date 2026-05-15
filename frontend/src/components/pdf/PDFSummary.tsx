import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { PDFBulletList } from "../pdf/PDFBulletlist";

interface Props {
  summary: string[];
}

export function PDFSummary({
  summary,
}: Props) {
  return (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryTitle}>
        Final Summary
      </Text>

      <PDFBulletList items={summary} />
    </View>
  );
}