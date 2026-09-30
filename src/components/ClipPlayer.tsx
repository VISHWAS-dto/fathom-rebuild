"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { fmtTime, speakerColor } from "@/lib/format";
import type { Segment } from "@/lib/types";
import Toast, { type ToastData } from "./Toast";
import YouTubePlayer, { type PlayerHandle } from "./YouTubePlayer";

type Props = {
  meetingId: string;
  title: string;
  youtubeId: string;
  speakers: string[];
  start: number;
  end: number;
  lines: Segment[];
};

export default function ClipPlayer({ meetingId, title, youtubeId, speakers, start, end, lines }: Props) {
  const player = useRef<PlayerHandle>(null);
  const [time, setTime] = useState(start);
  const [finished, setFinished] = useState(false);
  const [toast, setToast] = useState<ToastData>(null);

  const len = end - start;
  const pct = Math.min(100, Math.max(0, ((time - start) / len) * 100));

  async function copyLink() {
    const ok = await copyText(window.location.href);
    setToast({ text: ok ? "Link copied" : "Couldn't copy — copy the URL from the address bar" });
    window.setTimeout(() => setToast(null), 2500);
  }

  function replay() {
    setFinished(false);
    player.current?.seekTo(start, true);
  }

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 space-y-5 px-4 py-8 sm:px-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-violet-700">Shared clip</p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-stone-500">
          {fmtTime(start)} – {fmtTime(end)} · {Math.round(len)}s
        </p>
      </div>

      <YouTubePlayer
        ref={player}
        videoId={youtubeId}
        start={start}
        end={end}
        autoplay
        onTime={(t) => {
          setTime(t);
          if (t < end - 0.5) setFinished(false);
        }}
        onClipEnd={() => setFinished(true)}
      />

      <div>
        <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
          <div className="h-full rounded-full bg-violet-500 transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-1 flex justify-between font-mono text-xs text-stone-500">
          <span>{fmtTime(Math.max(0, time - start))}</span>
          <span>{fmtTime(len)}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button onClick={copyLink} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
          Copy link
        </button>
        <button onClick={replay} className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium hover:bg-stone-50">
          {finished ? "Replay clip" : "Restart"}
        </button>
        <Link
          href={`/meetings/${meetingId}?t=${Math.floor(start)}`}
          className="ml-auto text-sm font-medium text-violet-700 hover:underline"
        >
          View full meeting →
        </Link>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-stone-700">Transcript</h2>
        <div className="space-y-3">
          {lines.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 w-11 shrink-0 font-mono text-xs text-stone-400">{fmtTime(s.start)}</span>
              <p className="text-[15px] leading-relaxed text-stone-700">
                <span className={`mr-2 font-semibold ${speakerColor(speakers, s.speaker).text}`}>{s.speaker}</span>
                {s.text}
              </p>
            </div>
          ))}
        </div>
      </div>
      <Toast toast={toast} />
    </main>
  );
}
