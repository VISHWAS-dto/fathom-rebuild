"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { clipPath, fmtDate, fmtTime, speakerColor, talkTime } from "@/lib/format";
import type { Meeting, SummaryTemplate } from "@/lib/types";
import Markdown from "./Markdown";
import Toast, { type ToastData } from "./Toast";
import YouTubePlayer, { type PlayerHandle } from "./YouTubePlayer";

const TEMPLATES: { value: SummaryTemplate; label: string }[] = [
  { value: "general", label: "General" },
  { value: "sales", label: "Sales call" },
  { value: "standup", label: "Stand-up" },
];
type Tab = "summary" | "actions" | "chapters";

export default function MeetingView({ meeting }: { meeting: Meeting }) {
  const params = useSearchParams();
  const initialT = Math.max(0, Number(params.get("t")) || 0);

  const player = useRef<PlayerHandle>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const rows = useRef<(HTMLDivElement | null)[]>([]);

  const [time, setTime] = useState(initialT);
  const [tab, setTab] = useState<Tab>("summary");
  const [template, setTemplate] = useState<SummaryTemplate>("general");
  const [autoScroll, setAutoScroll] = useState(true);
  const [toast, setToast] = useState<ToastData>(null);

  // Range clipping: pick a first line, then a second line.
  const [rangeMode, setRangeMode] = useState(false);
  const [anchor, setAnchor] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);

  const { segments, speakers } = meeting;
  const talk = useMemo(() => talkTime(segments, speakers), [segments, speakers]);

  const activeIdx = useMemo(() => {
    let idx = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].start <= time + 0.25) idx = i;
      else break;
    }
    return idx;
  }, [segments, time]);

  const showToast = useCallback((t: ToastData) => {
    setToast(t);
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const seek = useCallback((t: number) => player.current?.seekTo(t, true), []);

  // Jump to ?t once on load (player queues the seek until it is ready).
  useEffect(() => {
    if (initialT > 0) player.current?.seekTo(initialT, false);
  }, [initialT]);

  // Keep the active line in view without scrolling the whole page.
  useEffect(() => {
    if (!autoScroll || activeIdx < 0) return;
    const c = scroller.current;
    const el = rows.current[activeIdx];
    if (!c || !el) return;
    c.scrollTo({ top: el.offsetTop - c.clientHeight / 3, behavior: "smooth" });
  }, [activeIdx, autoScroll]);

  const copyClip = useCallback(
    async (start: number, end: number) => {
      const path = clipPath(meeting.id, start, end);
      const ok = await copyText(window.location.origin + path);
      showToast({ text: ok ? `Clip link copied (${fmtTime(start)}–${fmtTime(end)})` : "Couldn't copy — open the clip and copy the URL", href: path });
    },
    [meeting.id, showToast],
  );

  const range = useMemo(() => {
    if (anchor === null) return null;
    const a = rangeEnd ?? anchor;
    const lo = Math.min(anchor, a);
    const hi = Math.max(anchor, a);
    return { lo, hi, start: segments[lo].start, end: segments[hi].end };
  }, [anchor, rangeEnd, segments]);

  function onLineClick(i: number) {
    if (!rangeMode) return seek(segments[i].start);
    if (anchor === null || rangeEnd !== null) {
      setAnchor(i);
      setRangeEnd(null);
    } else {
      setRangeEnd(i);
    }
  }

  function exitRange() {
    setRangeMode(false);
    setAnchor(null);
    setRangeEnd(null);
  }

  return (
    <main className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      {/* Left: player, talk time, tabs */}
      <section className="min-w-0 space-y-5">
        <div>
          <Link href="/" className="text-sm text-stone-500 hover:text-violet-700">← All meetings</Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{meeting.title}</h1>
          <p className="text-sm text-stone-500">
            {fmtDate(meeting.date)} · {fmtTime(meeting.duration)} · {speakers.length} speakers
          </p>
        </div>

        <YouTubePlayer ref={player} videoId={meeting.youtubeId} start={initialT} onTime={setTime} />

        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-stone-700">Speaker talk time</h2>
          <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-stone-100">
            {talk.map((t) => (
              <div
                key={t.speaker}
                className={speakerColor(speakers, t.speaker).bg}
                style={{ width: `${t.pct}%` }}
                title={`${t.speaker}: ${fmtTime(t.seconds)} (${t.pct.toFixed(0)}%)`}
              />
            ))}
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {talk.map((t) => (
              <li key={t.speaker} className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${speakerColor(speakers, t.speaker).bg}`} />
                <span className="truncate">{t.speaker}</span>
                <span className="ml-auto font-mono text-xs text-stone-500">{t.pct.toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-stone-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-2 pt-2" role="tablist">
            <div className="flex">
              {([
                ["summary", "Summary"],
                ["actions", `Action items (${meeting.actionItems.length})`],
                ["chapters", `Chapters (${meeting.chapters.length})`],
              ] as [Tab, string][]).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition ${
                    tab === key ? "border-violet-600 text-violet-700" : "border-transparent text-stone-500 hover:text-stone-800"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {tab === "summary" && (
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value as SummaryTemplate)}
                aria-label="Summary template"
                className="mb-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-sm outline-none focus:border-violet-400"
              >
                {TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            )}
          </div>

          <div className="p-5">
            {tab === "summary" && <Markdown>{meeting.summaries[template]}</Markdown>}
            {tab === "actions" && (
              <ul className="space-y-2">
                {meeting.actionItems.map((a, i) => (
                  <li key={i}>
                    <button
                      onClick={() => seek(a.timestamp)}
                      className="flex w-full items-start gap-3 rounded-lg border border-stone-100 p-3 text-left transition hover:border-violet-200 hover:bg-violet-50"
                    >
                      <span className="mt-1 h-4 w-4 shrink-0 rounded border-2 border-stone-300" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-[15px] text-stone-800">{a.text}</span>
                        <span className="mt-1 block text-xs text-stone-500">{a.owner}</span>
                      </span>
                      <span className="shrink-0 rounded-md bg-violet-100 px-2 py-0.5 font-mono text-xs text-violet-700">{fmtTime(a.timestamp)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {tab === "chapters" && (
              <ol className="space-y-1">
                {meeting.chapters.map((c, i) => {
                  const next = meeting.chapters[i + 1]?.start ?? Infinity;
                  const current = time >= c.start && time < next;
                  return (
                    <li key={i}>
                      <button
                        onClick={() => seek(c.start)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-violet-50 ${current ? "bg-violet-50 ring-1 ring-violet-200" : ""}`}
                      >
                        <span className="w-12 shrink-0 font-mono text-xs text-violet-700">{fmtTime(c.start)}</span>
                        <span className="text-[15px]">{c.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </section>

      {/* Right: transcript */}
      <section className="flex min-h-0 min-w-0 flex-col rounded-xl border border-stone-200 bg-white shadow-sm lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)]">
        <div className="flex items-center justify-between gap-2 border-b border-stone-100 px-4 py-3">
          <h2 className="font-semibold">Transcript</h2>
          <div className="flex items-center gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-1.5 text-stone-600">
              <input type="checkbox" checked={autoScroll} onChange={(e) => setAutoScroll(e.target.checked)} className="accent-violet-600" />
              Auto-scroll
            </label>
            <button
              onClick={() => (rangeMode ? exitRange() : setRangeMode(true))}
              className={`rounded-lg border px-2.5 py-1 font-medium transition ${
                rangeMode ? "border-violet-600 bg-violet-600 text-white" : "border-stone-200 text-stone-700 hover:bg-stone-50"
              }`}
            >
              {rangeMode ? "Cancel range" : "Clip range"}
            </button>
          </div>
        </div>

        {rangeMode && (
          <div className="border-b border-violet-100 bg-violet-50 px-4 py-2 text-sm text-violet-800">
            {anchor === null
              ? "Click the first line of your clip."
              : rangeEnd === null
                ? "Now click the last line of your clip."
                : "Range selected — copy the link or click a line to start over."}
          </div>
        )}

        <div ref={scroller} className="thin-scroll relative min-h-0 flex-1 overflow-y-auto p-2 max-lg:max-h-[70vh]">
          {segments.map((s, i) => {
            const color = speakerColor(speakers, s.speaker);
            const active = i === activeIdx;
            const inRange = range && i >= range.lo && i <= range.hi;
            const isAnchor = rangeMode && anchor === i;
            return (
              <div
                key={i}
                ref={(el) => { rows.current[i] = el; }}
                onClick={() => onLineClick(i)}
                className={`group relative flex cursor-pointer gap-3 rounded-lg px-3 py-2 transition ${
                  inRange || isAnchor ? "bg-violet-100 ring-1 ring-violet-300" : active ? `${color.soft} ring-1 ring-black/5` : "hover:bg-stone-50"
                }`}
              >
                {active && <span className={`absolute inset-y-2 left-0 w-1 rounded-full ${color.bg}`} />}
                <span className="mt-0.5 w-11 shrink-0 font-mono text-xs text-stone-400">{fmtTime(s.start)}</span>
                <div className="min-w-0 flex-1">
                  <span className={`text-sm font-semibold ${color.text}`}>{s.speaker}</span>
                  <p className={`text-[15px] leading-relaxed ${active ? "text-stone-900" : "text-stone-700"}`}>{s.text}</p>
                </div>
                {!rangeMode && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyClip(s.start, Math.max(s.end, s.start + 5));
                    }}
                    className="h-7 shrink-0 rounded-md border border-stone-200 bg-white px-2 text-xs font-medium text-stone-600 opacity-0 shadow-sm transition hover:border-violet-300 hover:text-violet-700 focus:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
                    title="Copy a shareable link to this line"
                  >
                    ✂ Clip
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {range && rangeEnd !== null && (
          <div className="flex items-center justify-between gap-3 border-t border-stone-100 bg-white px-4 py-3">
            <span className="text-sm text-stone-600">
              Clip <span className="font-mono">{fmtTime(range.start)}–{fmtTime(range.end)}</span> · {Math.round(range.end - range.start)}s
            </span>
            <div className="flex gap-2">
              <Link
                href={clipPath(meeting.id, range.start, range.end)}
                target="_blank"
                className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm font-medium hover:bg-stone-50"
              >
                Preview
              </Link>
              <button
                onClick={() => copyClip(range.start, range.end)}
                className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
              >
                Copy link
              </button>
            </div>
          </div>
        )}
      </section>
      <Toast toast={toast} />
    </main>
  );
}
