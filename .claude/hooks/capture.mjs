#!/usr/bin/env node
// Live capture hook for Claude Code. Appends prompts/responses to .agent-logs/.
// Events: SessionStart (records model), UserPromptSubmit (PROMPT), Stop (RESPONSE).
// Only records what happens from install onward; it never reads past sessions.
import fs from "node:fs";
import path from "node:path";

const root = process.env.CAPTURE_ROOT || process.env.CLAUDE_PROJECT_DIR || process.cwd();
const logDir = path.join(root, ".agent-logs");
const stateDir = path.join(root, ".claude", ".capture-state");

const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}");
const event = input.hook_event_name;
const sid = input.session_id || "unknown";
const now = new Date();
const iso = now.toISOString();
const stamp = iso.slice(0, 19).replace("T", "_").replace(/:/g, "-");

fs.mkdirSync(logDir, { recursive: true });
fs.mkdirSync(stateDir, { recursive: true });
const statePath = path.join(stateDir, `${sid}.json`);
const state = fs.existsSync(statePath)
  ? JSON.parse(fs.readFileSync(statePath, "utf8"))
  : { file: `${stamp}_${sid}.md`, num: 0, model: input.model || "unknown", started: iso };
if (input.model) state.model = input.model;
const logPath = path.join(logDir, state.file);

if (!fs.existsSync(logPath)) {
  fs.writeFileSync(
    logPath,
    `---\nsession: ${sid}\nstarted: ${state.started}\nmodel: ${state.model}\ncapture: live hook (.claude/hooks/capture.mjs)\n---\n\n`,
  );
}

function append(type, model, body) {
  state.num += 1;
  fs.appendFileSync(
    logPath,
    `[LOG_ENTRY type=${type} num=${state.num} session=${sid}]\ntimestamp: ${iso}\nmodel: ${model}\n\n${body}\n\n`,
  );
}

// Final assistant text of the turn, plus the model that produced it.
function lastAssistant(transcriptPath) {
  try {
    const lines = fs.readFileSync(transcriptPath, "utf8").split("\n").filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      const r = JSON.parse(lines[i]);
      if (r.type === "user" && !r.isMeta && typeof r.message?.content === "string") break;
      if (r.type !== "assistant") continue;
      const text = (r.message.content || []).filter((b) => b.type === "text").map((b) => b.text).join("\n");
      if (text) return { text, model: r.message.model };
    }
  } catch {}
  return null;
}

if (event === "UserPromptSubmit") {
  append("PROMPT", state.model, input.prompt ?? "");
} else if (event === "Stop") {
  const a = input.transcript_path ? lastAssistant(input.transcript_path) : null;
  if (a) {
    state.model = a.model || state.model;
    append("RESPONSE", state.model, a.text);
  }
}
fs.writeFileSync(statePath, JSON.stringify(state));
