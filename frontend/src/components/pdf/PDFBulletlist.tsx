import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { PDFMarkdownText } from "./PDFMarkdownText";

interface Props {
  items: string[];
}

export function PDFBulletList({
  items,
}: Props) {
  return (
    <View>
      {items.map((item, index) => (
        <View
          key={index}
          style={styles.bulletItem}
        >
          <Text style={styles.bullet}>
            •
          </Text>

          <PDFMarkdownText>
            {item}
          </PDFMarkdownText>
        </View>
      ))}
    </View>
  );
}