import { View, Text } from "@react-pdf/renderer";
import { styles } from "./PDFStyles";
import { ReactNode } from "react";

interface Props {
  title: string;
  children: ReactNode;
  sectionNumber?: string;
}

export function PDFSection({ title, children, sectionNumber }: Props) {
  return (
    <View style={styles.section}>
      {sectionNumber ? (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionNumber}>{sectionNumber}</Text>
          <Text style={styles.sectionLabel}>{title}</Text>
        </View>
      ) : (
        <Text style={styles.sectionLabel}>{title}</Text>
      )}
      <View style={styles.divider} />
      {children}
    </View>
  );
}