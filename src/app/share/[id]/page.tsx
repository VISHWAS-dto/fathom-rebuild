import { notFound } from "next/navigation";
import ClipPlayer from "@/components/ClipPlayer";
import { getMeeting } from "@/lib/meetings";
import { fmtTime } from "@/lib/format";

function parseRange(sp: Record<string, string | string[] | undefined>, duration: number) {
  const num = (v: string | string[] | undefined) => {
    const n = Number(Array.isArray(v) ? v[0] : v);
    return Number.isFinite(n) ? n : NaN;
  };
  let start = num(sp.start);
  let end = num(sp.end);
  if (Number.isNaN(start)) start = 0;
  start = Math.min(Math.max(0, start), Math.max(0, duration - 1));
  if (Number.isNaN(end) || end <= start) end = start + 30;
  end = Math.min(end, duration);
  return { start, end };
}

export async function generateMetadata(props: PageProps<"/share/[id]">) {
  const { id } = await props.params;
  const m = getMeeting(id);
  if (!m) return { title: "Clip not found" };
  const { start, end } = parseRange(await props.searchParams, m.duration);
  return {
    title: `Clip ${fmtTime(start)}–${fmtTime(end)} · ${m.title}`,
    description: m.segments.find((s) => s.end > start)?.text,
  };
}

export default async function SharePage(props: PageProps<"/share/[id]">) {
  const { id } = await props.params;
  const meeting = getMeeting(id);
  if (!meeting) notFound();
  const { start, end } = parseRange(await props.searchParams, meeting.duration);
  const lines = meeting.segments.filter((s) => s.end > start && s.start < end);
  return (
    <ClipPlayer
      meetingId={meeting.id}
      title={meeting.title}
      youtubeId={meeting.youtubeId}
      speakers={meeting.speakers}
      start={start}
      end={end}
      lines={lines}
    />
  );
}
