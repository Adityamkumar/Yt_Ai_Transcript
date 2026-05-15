import { Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";

interface Props {
  children: string;
  style?: any;
}

export function PDFMarkdownText({ children, style }: Props) {
  if (!children) return null;

  // Split by bold (**text**) or inline code (`text`)
  // Regex matches **text** OR `text`
  const segments = children.split(/(\*\*.*?\*\*|`.*?`)/g);

  return (
    <Text style={[styles.bulletText, style]}>
      {segments.map((segment, index) => {
        // Handle Bold
        if (segment.startsWith("**") && segment.endsWith("**")) {
          return (
            <Text key={index} style={styles.keyword}>
              {segment.slice(2, -2)}
            </Text>
          );
        }
        
        // Handle Inline Code
        if (segment.startsWith("`") && segment.endsWith("`")) {
          return (
            <Text key={index} style={styles.code}>
              {segment.slice(1, -1)}
            </Text>
          );
        }

        // Normal Text
        return segment;
      })}
    </Text>
  );
}
