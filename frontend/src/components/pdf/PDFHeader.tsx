import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";

interface Props {
  title: string;
  subtitle?: string;
}

export function PDFHeader({ title, subtitle }: Props) {
  return (
    <View style={styles.headerWrapper}>
      <Text style={styles.headerMeta}>EchoMind AI · Study Notes</Text>
      <Text style={styles.title}>{title.replace(/\*\*/g, "")}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}