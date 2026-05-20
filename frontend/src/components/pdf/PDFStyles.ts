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
    paddingTop: 36,
    paddingBottom: 44,
    paddingHorizontal: 40,
    backgroundColor: BG_PAGE,
    fontSize: 10,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: TEXT_BODY,
  },

  headerWrapper: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: `2px solid ${ACCENT}`,
  },

  headerMeta: {
    fontSize: 7.5,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 5,
    fontWeight: "bold",
  },

  title: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 4,
    lineHeight: 1.2,
  },

  subtitle: {
    fontSize: 9.5,
    color: TEXT_MUTED,
    lineHeight: 1.4,
  },

  section: {
    marginBottom: 10,
  },

  sectionLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    textTransform: "uppercase",
    color: ACCENT,
    marginBottom: 5,
  },

  divider: {
    borderBottom: `1px solid ${BORDER}`,
    marginBottom: 8,
  },

  overviewText: {
    fontSize: 10,
    color: TEXT_BODY,
    lineHeight: 1.55,
    marginBottom: 4,
  },

  conceptBlock: {
    marginBottom: 8,
    padding: "8 12",
    backgroundColor: BG_SECTION,
    borderRadius: 4,
    borderLeft: `3px solid ${ACCENT}`,
  },

  conceptHeading: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: TEXT_DARK,
    marginBottom: 4,
  },

  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },

  bulletContent: {
    flex: 1,
  },

  bulletDot: {
    width: 12,
    fontSize: 10,
    color: ACCENT,
    lineHeight: 1.3,
  },

  bulletText: {
    fontSize: 9.5,
    color: TEXT_BODY,
    lineHeight: 1.5,
  },

  insightBox: {
    backgroundColor: INSIGHT_BG,
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 6,
    borderLeft: `3px solid ${INSIGHT_BORDER}`,
  },

  insightLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#B45309",
    marginBottom: 4,
  },

  takeawayBox: {
    backgroundColor: TAKEAWAY_BG,
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 6,
    borderLeft: `3px solid ${TAKEAWAY_BORDER}`,
  },

  takeawayLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#15803D",
    marginBottom: 4,
  },

  checkmark: {
    width: 12,
    fontSize: 9,
    color: "#16A34A",
  },

  keyword: {
    fontFamily: "Helvetica-Bold",
    color: ACCENT,
  },

  code: {
    fontFamily: "Courier",
    fontSize: 9,
    color: CODE_TEXT,
  },

  exampleBox: {
    backgroundColor: "#F5F3FF",
    borderRadius: 4,
    padding: "8 12",
    marginBottom: 6,
    borderLeft: `3px solid #A78BFA`,
  },

  exampleLabel: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    color: "#7C3AED",
    marginBottom: 4,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: `1px solid ${BORDER}`,
    paddingTop: 6,
  },

  footerText: {
    fontSize: 7,
    color: TEXT_MUTED,
  },

  footerBrand: {
    fontSize: 7,
    color: ACCENT,
    fontFamily: "Helvetica-Bold",
  },
});
