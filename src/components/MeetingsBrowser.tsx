"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDate, fmtTime, speakerColor } from "@/lib/format";
import type { MeetingSummary } from "@/lib/types";

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "gi");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-yellow-200 px-0.5 text-inherit">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function MeetingsBrowser({ meetings }: { meetings: MeetingSummary[] }) {
  const [q, setQ] = useState("");
  const terms = useMemo(() => q.trim().toLowerCase().split(/\s+/).filter(Boolean), [q]);

  const results = useMemo(() => {
    if (!terms.length) return [];
    return meetings
      .map((m) => ({
        meeting: m,
        hits: m.segments.filter((s) => {
          const t = s.text.toLowerCase();
          return terms.every((term) => t.includes(term));
        }),
      }))
      .filter((r) => r.hits.length);
  }, [meetings, terms]);

  const total = results.reduce((n, r) => n + r.hits.length, 0);

  return (
    <div className="mt-6">
      <div className="relative">
        <svg className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search across all transcripts — try “release signal” or “handbook”"
          className="w-full rounded-xl border border-stone-200 bg-white py-3.5 pl-12 pr-4 text-base shadow-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          aria-label="Search transcripts"
        />
      </div>

      {terms.length > 0 ? (
        <div className="mt-6 space-y-6">
          <p className="text-sm text-stone-500">
            {total} {total === 1 ? "match" : "matches"} in {results.length} {results.length === 1 ? "meeting" : "meetings"}
          </p>
          {results.map(({ meeting, hits }) => (
            <section key={meeting.id} className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
              <Link href={`/meetings/${meeting.id}`} className="block border-b border-stone-100 bg-stone-50 px-4 py-3 hover:bg-stone-100">
                <div className="font-medium">{meeting.title}</div>
                <div className="text-xs text-stone-500">{fmtDate(meeting.date)}</div>
              </Link>
              <ul className="divide-y divide-stone-100">
                {hits.slice(0, 12).map((h) => (
                  <li key={h.start}>
                    <Link
                      href={`/meetings/${meeting.id}?t=${Math.floor(h.start)}`}
                      className="flex gap-3 px-4 py-3 hover:bg-violet-50"
                    >
                      <span className="mt-0.5 shrink-0 rounded-md bg-violet-100 px-2 py-0.5 font-mono text-xs text-violet-700">
                        {fmtTime(h.start)}
                      </span>
                      <span className="min-w-0 text-sm">
                        <span className={`mr-2 font-medium ${speakerColor(meeting.speakers, h.speaker).text}`}>{h.speaker}</span>
                        <Highlight text={h.text} terms={terms} />
                      </span>
                    </Link>
                  </li>
                ))}
                {hits.length > 12 && (
                  <li className="px-4 py-2 text-xs text-stone-500">+ {hits.length - 12} more in this meeting</li>
                )}
              </ul>
            </section>
          ))}
          {results.length === 0 && (
            <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center text-stone-500">
              No transcript lines match “{q}”.
            </div>
          )}
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {meetings.map((m) => (
            <li key={m.id}>
              <Link
                href={`/meetings/${m.id}`}
                className="group block overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-video bg-stone-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://img.youtube.com/vi/${m.youtubeId}/mqdefault.jpg`} alt="" className="h-full w-full object-cover" />
                  <span className="absolute bottom-2 right-2 rounded bg-black/75 px-1.5 py-0.5 font-mono text-xs text-white">
                    {fmtTime(m.duration)}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="font-medium leading-snug group-hover:text-violet-700">{m.title}</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    {fmtDate(m.date)} · {m.speakers.length} speakers · {m.actionCount} action items
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
