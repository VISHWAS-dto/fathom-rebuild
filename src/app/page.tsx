import MeetingsBrowser from "@/components/MeetingsBrowser";
import { getMeetingSummaries } from "@/lib/meetings";

export default function Home() {
  const meetings = getMeetingSummaries();
  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">Your meetings</h1>
      <p className="mt-1 text-stone-500">Search every transcript, jump straight to the moment it was said.</p>
      <MeetingsBrowser meetings={meetings} />
    </main>
  );
}
