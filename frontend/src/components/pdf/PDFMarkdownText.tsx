import { Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";

interface Props {
  children: string;
  style?: any;
}

export function PDFMarkdownText({ children, style }: Props) {
  if (!children) return null;

  const segments = children.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <Text style={[styles.bulletText, style]}>
      {segments.map((segment, index) => {
        if (segment.startsWith("**") && segment.endsWith("**")) {
          return (
            <Text key={index} style={styles.keyword}>
              {segment.slice(2, -2)}
            </Text>
          );
        }
        
        if (segment.startsWith("`") && segment.endsWith("`")) {
          return (
            <Text key={index} style={styles.code}>
              {segment.slice(1, -1)}
            </Text>
          );
        }

        return segment;
      })}
    </Text>
  );
}
