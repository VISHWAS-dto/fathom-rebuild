# Recap — a Fathom-style meeting notes app

A small, polished rebuild of the core Fathom experience: browse recorded meetings, search every transcript, watch the video with a live-synced transcript, read AI-style notes, and share clips with a link. Seeded with two real, public Kubernetes SIG Release meetings.

## What I built

- **`/` Meetings list + global search.** Searches every transcript line (all terms must match), highlights hits, and each result opens the meeting at that exact timestamp (`/meetings/[id]?t=seconds`).
- **`/meetings/[id]`**
  - YouTube IFrame player on the left, transcript on the right.
  - Colour-coded speakers, click any line to seek, the current line highlights and auto-scrolls (toggleable).
  - Tabs: **Summary** (template dropdown: General / Sales call / Stand-up), **Action items** (click to seek), **Chapters** (current chapter highlighted, click to seek).
  - Speaker talk-time bar with per-speaker percentages.
  - Supports `?t=seconds` deep links.
- **Clips.**
  - A **✂ Clip** button on every transcript line copies a share link for that line.
  - **Clip range** mode: click a first and last line, then preview or copy the link.
  - Links look like `/share/[id]?start=X&end=Y`. That page plays *only* that range (pauses at the end, with restart/replay), shows the clipped transcript, has a copy-link button, and needs no login.

## What's stubbed, and why

| Stubbed | Why |
| --- | --- |
| **Recording bot** (joining Zoom/Meet/Teams) | Needs a meeting-bot vendor or platform apps plus infrastructure. Out of scope for a time-boxed build; the seed data simulates the output of that step. |
| **Calendar integration** | Requires Google/Microsoft OAuth apps and consent screens. The meetings list is static data instead. |
| **Login / accounts / sharing permissions** | Explicitly out of scope. Clip links are public by design, which is also what makes them easy to demo. |
| **Database** | Two meetings live as JSON in `data/meetings/`, read at build time. Swap `src/lib/meetings.ts` for a DB query to scale. |
| **Live AI summarisation** | Summaries, action items and chapters were authored offline by reading the transcripts (see below), not generated at request time. |

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · `react-markdown` · YouTube IFrame API. No database, no auth. Deployed on Vercel.

## How the seed data was made

1. Picked three public Kubernetes SIG Release recordings, checked durations with `yt-dlp`, and used the **longest** (14:06, 2026-08-10) and the **shortest** (10:38, 2026-06-10). Neither exceeded 70 minutes, so nothing was trimmed.
2. Downloaded **audio only** (`yt-dlp -x`) and transcribed it with **Deepgram** (`nova-3`, `diarize`, `utterances`, `smart_format`) — see `scripts/transcribe.mjs`.
3. Saved `data/meetings/<id>.json` with `id, title, youtubeId, date, duration, speakers, segments[{start,end,speaker,text}]`.
4. Read each transcript and hand-wrote the `summaries` (general / sales / standup, in Markdown), `actionItems[{text,owner,timestamp}]` and `chapters[{title,start}]` — see `scripts/enrich.mjs`.
5. Deleted the audio files. Nothing but text is committed.

**Known limitations of the data:** speakers are diarization labels ("Speaker 1…"), not real names, because the ASR garbles spoken names and I didn't want to guess. Action-item owners come from names or roles actually mentioned in the audio. The "Sales call" template is a community meeting reframed in sales terms, so it's more a demo of the template switcher than a real sales analysis.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```

To re-create the seed data you need `yt-dlp`, `ffmpeg`, and a `DEEPGRAM_API_KEY` in `.env.local` (gitignored). The app itself needs no environment variables.
