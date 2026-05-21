import { StyleSheet } from "@react-pdf/renderer";

const ACCENT = "#4F46E5";
const ACCENT_SOFT = "#6366F1";
const ACCENT_LIGHT = "#EEF2FF";
const TEXT_DARK = "#111827";
const TEXT_BODY = "#374151";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BORDER_LIGHT = "#F3F4F6";
const BG_PAGE = "#FFFFFF";
const BG_SECTION = "#F9FAFB";
const BG_KEYWORD = "#EEF2FF";
const CODE_BG = "#F1F5F9";
const CODE_TEXT = "#1E3A5F";
const INSIGHT_BG = "#FFFBEB";
const INSIGHT_BORDER = "#FCD34D";
const TAKEAWAY_BG = "#F0FDF4";
const TAKEAWAY_BORDER = "#86EFAC";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 42,
    paddingBottom: 52,
    paddingHorizontal: 48,
    backgroundColor: BG_PAGE,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.5,
    color: TEXT_BODY,
  },

  headerWrapper: {
    marginBottom: 24,
    paddingBottom: 14,
    borderBottom: `2px solid ${ACCENT}`,
  },

  headerMeta: {
    fontSize: 7.5,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: ACCENT_SOFT,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },

  headerDate: {
    fontSize: 8,
    color: TEXT_MUTED,
    marginTop: 4,
  },

  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 5,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    lineHeight: 1.45,
  },

  section: {
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },

  sectionNumber: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: BG_PAGE,
    backgroundColor: ACCENT,
    width: 18,
    height: 18,
    borderRadius: 9,
    textAlign: "center",
    lineHeight: 1,
    paddingTop: 4,
  },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 6,
  },

  divider: {
    borderBottom: `1px solid ${BORDER}`,
    marginBottom: 10,
  },

  overviewText: {
    fontSize: 10,
    color: TEXT_BODY,
    lineHeight: 1.6,
    marginBottom: 5,
  },

  conceptBlock: {
    marginBottom: 10,
    padding: "10 14",
    backgroundColor: BG_SECTION,
    borderRadius: 4,
    borderLeft: `3px solid ${ACCENT}`,
  },

  conceptHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#3730A3",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottom: `1px solid #DDE1FF`,
  },

  bulletRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingLeft: 2,
  },

  bulletContent: {
    flex: 1,
  },

  bulletDot: {
    width: 12,
    fontSize: 10,
    color: ACCENT,
    lineHeight: 1.45,
  },

  bulletText: {
    fontSize: 9.5,
    color: TEXT_BODY,
    lineHeight: 1.45,
  },

  insightBox: {
    backgroundColor: INSIGHT_BG,
    borderRadius: 4,
    padding: "10 14",
    marginBottom: 8,
    borderLeft: `3px solid ${INSIGHT_BORDER}`,
  },

  insightLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#92400E",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  takeawayBox: {
    backgroundColor: TAKEAWAY_BG,
    borderRadius: 4,
    padding: "10 14",
    marginBottom: 8,
    borderLeft: `3px solid ${TAKEAWAY_BORDER}`,
  },

  takeawayLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#14532D",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  checkmark: {
    width: 12,
    fontSize: 9,
    color: "#16A34A",
  },

  keyword: {
    fontFamily: "Helvetica-Bold",
    color: "#3730A3",
    backgroundColor: "#DDE1FF",
    borderRadius: 3,
  },

  code: {
    fontFamily: "Courier",
    fontSize: 8.5,
    color: "#0F2557",
    backgroundColor: "#E8EFF8",
    borderRadius: 3,
    borderLeft: `2px solid #6366F1`,
  },

  exampleBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 4,
    padding: "10 14",
    marginBottom: 8,
    borderLeft: `3px solid #A78BFA`,
  },

  exampleLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#5B21B6",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  summaryBox: {
    backgroundColor: "#EFF6FF",
    borderRadius: 4,
    padding: "10 14",
    marginBottom: 8,
    borderLeft: `3px solid #60A5FA`,
  },

  summaryLabel: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#1E3A8A",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${BORDER_LIGHT}`,
    paddingTop: 8,
  },

  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },

  footerBrand: {
    fontSize: 7,
    color: ACCENT_SOFT,
    fontFamily: "Helvetica-Bold",
  },
});
