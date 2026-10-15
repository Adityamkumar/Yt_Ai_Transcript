import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { PDFMarkdownText } from "./PDFMarkdownText";

interface Props {
  items: (string | { text?: string; description?: string })[];
  isCheck?: boolean;
}

export function PDFBulletList({ items, isCheck = false }: Props) {
  return (
    <View>
      {items.map((item, index) => {
        let text = "";
        if (typeof item === "string") {
          text = item;
        } else {
          text = item.text || item.description || "";
        }

        return (
          <View key={index} style={styles.bulletRow}>
            <Text style={isCheck ? { ...styles.bulletDot, ...styles.checkmark } : styles.bulletDot}>
              {isCheck ? "\u2713" : "\u2022"}
            </Text>
            <View style={styles.bulletContent}>
              <PDFMarkdownText>{text}</PDFMarkdownText>
            </View>
          </View>
        );
      })}
    </View>
  );
}
