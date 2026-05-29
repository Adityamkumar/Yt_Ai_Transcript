import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";

interface Props {
  title: string;
  subtitle?: string;
}

export function PDFHeader({ title, subtitle }: Props) {
  const cleanTitle = title.replace(/\*\*/g, "");
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <View style={styles.headerWrapper} wrap={false}>
      <Text style={styles.headerMeta}>EchoMind AI · Study Notes</Text>
      <Text style={styles.title}>{cleanTitle}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <Text style={styles.headerDate}>{dateStr}</Text>
    </View>
  );
}
