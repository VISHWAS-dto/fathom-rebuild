import { notFound } from "next/navigation";
import { Suspense } from "react";
import MeetingView from "@/components/MeetingView";
import { getMeeting, getMeetings } from "@/lib/meetings";

export function generateStaticParams() {
  return getMeetings().map((m) => ({ id: m.id }));
}

export async function generateMetadata(props: PageProps<"/meetings/[id]">) {
  const { id } = await props.params;
  const m = getMeeting(id);
  return { title: m ? `${m.title} — Recap` : "Meeting not found" };
}

export default async function MeetingPage(props: PageProps<"/meetings/[id]">) {
  const { id } = await props.params;
  const meeting = getMeeting(id);
  if (!meeting) notFound();
  return (
    <Suspense fallback={<div className="p-10 text-stone-500">Loading meeting…</div>}>
      <MeetingView meeting={meeting} />
    </Suspense>
  );
}
