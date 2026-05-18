import { StyleSheet } from "@react-pdf/renderer";

const ACCENT = "#5B4EFF";
const ACCENT_LIGHT = "#EEF0FF";
const TEXT_DARK = "#1A1A2E";
const TEXT_BODY = "#374151";
const TEXT_MUTED = "#6B7280";
const BORDER = "#E5E7EB";
const BG_PAGE = "#FFFFFF";
const BG_SECTION = "#F9FAFB";
const BG_KEYWORD = "#EEF0FF";
const CODE_BG = "#F1F5F9";
const CODE_TEXT = "#1E3A5F";
const INSIGHT_BG = "#FFFBEB";
const INSIGHT_BORDER = "#FDE68A";
const TAKEAWAY_BG = "#F0FDF4";
const TAKEAWAY_BORDER = "#86EFAC";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 56,
    paddingHorizontal: 48,
    backgroundColor: BG_PAGE,
    fontSize: 10.5,
    fontFamily: "Helvetica",
    lineHeight: 1.55,
    color: TEXT_BODY,
  },

  headerWrapper: {
    marginBottom: 36,
    paddingBottom: 20,
    borderBottom: `2px solid ${ACCENT}`,
  },

  headerMeta: {
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 8,
    fontWeight: "bold",
  },

  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 6,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: 10,
    color: TEXT_MUTED,
    lineHeight: 1.5,
  },

  section: {
    marginBottom: 28,
  },

  sectionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 10,
  },

  divider: {
    borderBottom: `1px solid ${BORDER}`,
    marginBottom: 14,
  },

  overviewText: {
    fontSize: 10.5,
    color: TEXT_BODY,
    lineHeight: 1.65,
    marginBottom: 8,
  },

  conceptBlock: {
    marginBottom: 18,
    padding: "10 14",
    backgroundColor: BG_SECTION,
    borderRadius: 6,
    borderLeft: `3px solid ${ACCENT}`,
  },

  conceptHeading: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 8,
  },

  bulletRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 2,
  },

  bulletContent: {
    flex: 1,
  },

  bulletDot: {
    width: 14,
    fontSize: 12,
    color: ACCENT,
    lineHeight: 1.3,
  },

  bulletText: {
    fontSize: 10,
    color: TEXT_BODY,
    lineHeight: 1.6,
  },

  insightBox: {
    backgroundColor: INSIGHT_BG,
    borderRadius: 6,
    padding: "10 14",
    marginBottom: 18,
    borderLeft: `3px solid ${INSIGHT_BORDER}`,
  },

  insightLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#B45309",
    marginBottom: 8,
  },

  takeawayBox: {
    backgroundColor: TAKEAWAY_BG,
    borderRadius: 6,
    padding: "10 14",
    marginBottom: 18,
    borderLeft: `3px solid ${TAKEAWAY_BORDER}`,
  },

  takeawayLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#15803D",
    marginBottom: 8,
  },

  checkmark: {
    width: 14,
    fontSize: 10,
    color: "#16A34A",
  },

  keyword: {
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },

  code: {
    fontFamily: "Courier",
    fontSize: 9.5,
    color: CODE_TEXT,
  },

  exampleBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 6,
    padding: "10 14",
    marginBottom: 18,
    borderLeft: `3px solid #A78BFA`,
  },

  exampleLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#7C3AED",
    marginBottom: 8,
  },

  footer: {
    position: "absolute",
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 10,
  },

  footerText: {
    fontSize: 8,
    color: TEXT_MUTED,
  },

  footerBrand: {
    fontSize: 8,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },
});
