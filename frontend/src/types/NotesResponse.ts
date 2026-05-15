export interface NotesResponse {
  title: string;
  subtitle: string;
  overview: string[];

  mainConcepts: {
    heading: string;
    points: string[];
  }[];

  keyInsights: string[];

  actionableTakeaways: string[];

  examples: string[];

  summary: string[];
}