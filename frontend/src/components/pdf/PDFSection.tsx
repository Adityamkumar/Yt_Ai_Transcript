import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
}

export function PDFSection({
  title,
  children,
}: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {title}
      </Text>

      {children}
    </View>
  );
}