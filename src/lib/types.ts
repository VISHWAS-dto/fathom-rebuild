export type Segment = { start: number; end: number; speaker: string; text: string };
export type ActionItem = { text: string; owner: string; timestamp: number };
export type Chapter = { title: string; start: number };
export type SummaryTemplate = "general" | "sales" | "standup";

export type Meeting = {
  id: string;
  title: string;
  youtubeId: string;
  date: string;
  duration: number;
  speakers: string[];
  segments: Segment[];
  summaries: Record<SummaryTemplate, string>;
  actionItems: ActionItem[];
  chapters: Chapter[];
};

export type MeetingSummary = Pick<
  Meeting,
  "id" | "title" | "youtubeId" | "date" | "duration" | "speakers"
> & { segments: Segment[]; actionCount: number };
