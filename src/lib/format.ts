import type { Segment } from "./types";

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = h ? String(m).padStart(2, "0") : String(m);
  return `${h ? h + ":" : ""}${mm}:${String(r).padStart(2, "0")}`;
}

export function fmtDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export const SPEAKER_COLORS = [
  { text: "text-violet-700", bg: "bg-violet-500", soft: "bg-violet-50" },
  { text: "text-emerald-700", bg: "bg-emerald-500", soft: "bg-emerald-50" },
  { text: "text-amber-700", bg: "bg-amber-500", soft: "bg-amber-50" },
  { text: "text-sky-700", bg: "bg-sky-500", soft: "bg-sky-50" },
  { text: "text-rose-700", bg: "bg-rose-500", soft: "bg-rose-50" },
  { text: "text-teal-700", bg: "bg-teal-500", soft: "bg-teal-50" },
  { text: "text-fuchsia-700", bg: "bg-fuchsia-500", soft: "bg-fuchsia-50" },
  { text: "text-orange-700", bg: "bg-orange-500", soft: "bg-orange-50" },
];

export function speakerColor(speakers: string[], speaker: string) {
  const i = Math.max(0, speakers.indexOf(speaker));
  return SPEAKER_COLORS[i % SPEAKER_COLORS.length];
}

export function talkTime(segments: Segment[], speakers: string[]) {
  const totals = new Map<string, number>(speakers.map((s) => [s, 0]));
  for (const seg of segments) totals.set(seg.speaker, (totals.get(seg.speaker) ?? 0) + (seg.end - seg.start));
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  return speakers.map((s) => ({ speaker: s, seconds: totals.get(s) ?? 0, pct: ((totals.get(s) ?? 0) / sum) * 100 }));
}

export function clipPath(id: string, start: number, end: number): string {
  return `/share/${id}?start=${Math.floor(start)}&end=${Math.ceil(end)}`;
}
