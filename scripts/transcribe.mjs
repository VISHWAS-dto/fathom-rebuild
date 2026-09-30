// Usage: node scripts/transcribe.mjs <youtubeId> <title> <date YYYY-MM-DD> <duration-seconds> <outRawPath>
// Transcribes data/audio/<id>.mp3 with Deepgram nova-3 (diarize, utterances, smart_format).
import fs from "node:fs";

const env = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const key = /DEEPGRAM_API_KEY=(.+)/.exec(env)?.[1]?.trim();
if (!key) throw new Error("DEEPGRAM_API_KEY missing in .env.local");

const [id, title, date, duration, outPath] = process.argv.slice(2);
const audio = fs.readFileSync(new URL(`../data/audio/${id}.mp3`, import.meta.url));

const url =
  "https://api.deepgram.com/v1/listen?model=nova-3&diarize=true&utterances=true&smart_format=true&punctuate=true";
const res = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Token ${key}`, "Content-Type": "audio/mpeg" },
  body: audio,
});
if (!res.ok) throw new Error(`Deepgram ${res.status}: ${await res.text()}`);
const dg = await res.json();

const utts = dg.results.utterances ?? [];
const segments = utts.map((u) => ({
  start: Math.round(u.start * 100) / 100,
  end: Math.round(u.end * 100) / 100,
  speaker: `Speaker ${u.speaker + 1}`,
  text: u.transcript.trim(),
}));
const speakers = [...new Set(segments.map((s) => s.speaker))];

const meeting = {
  id,
  title,
  youtubeId: id,
  date,
  duration: Number(duration),
  speakers,
  segments,
};
fs.writeFileSync(outPath, JSON.stringify(meeting, null, 2));
console.log(`${id}: ${segments.length} segments, ${speakers.length} speakers -> ${outPath}`);
