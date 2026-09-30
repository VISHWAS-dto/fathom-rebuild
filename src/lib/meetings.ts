import "server-only";
import fs from "node:fs";
import path from "node:path";
import type { Meeting, MeetingSummary } from "./types";

const dir = path.join(process.cwd(), "data", "meetings");

export function getMeetings(): Meeting[] {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Meeting)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getMeeting(id: string): Meeting | undefined {
  return getMeetings().find((m) => m.id === id);
}

export function getMeetingSummaries(): MeetingSummary[] {
  return getMeetings().map((m) => ({
    id: m.id,
    title: m.title,
    youtubeId: m.youtubeId,
    date: m.date,
    duration: m.duration,
    speakers: m.speakers,
    segments: m.segments,
    actionCount: m.actionItems.length,
  }));
}
