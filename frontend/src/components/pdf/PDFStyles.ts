import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 50,
    backgroundColor: "#ffffff",
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: "#374151",
  },

  header: {
    marginBottom: 40,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 25,
    alignItems: "center",
    textAlign: "center",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#111827",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    maxWidth: "85%",
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
    borderLeft: 3,
    borderLeftColor: "#8b9cff",
    paddingLeft: 10,
  },

  conceptHeading: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    marginTop: 12,
    color: "#111827",
    backgroundColor: "#f9fafb",
    padding: "4 8",
    borderRadius: 4,
  },

  bulletItem: {
    flexDirection: "row",
    marginBottom: 10,
    paddingLeft: 4,
  },

  bullet: {
    width: 14,
    color: "#8b9cff",
    fontWeight: "bold",
  },

  bulletText: {
    flex: 1,
    textAlign: "justify",
  },

  keyword: {
    fontWeight: "bold",
    color: "#111827",
  },

  code: {
    fontFamily: "Courier",
    fontWeight: "bold",
    backgroundColor: "#f1f5f9",
    color: "#000000",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 10,
  },

  summaryBox: {
    marginTop: 25,
    padding: 20,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    border: 1,
    borderColor: "#e2e8f0",
  },

  summaryTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  summaryText: {
    marginBottom: 6,
    lineHeight: 1.6,
  }
});