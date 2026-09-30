# CAPTURE-TEST

## Tool and model
- Tool: Claude Code (CLI)
- Model: `claude-sonnet-5-5` for the captured entries below. Earlier in this build the session ran on `claude-opus-5-5` and was switched to Sonnet 5.5 with `/model`; none of that earlier work was captured.

## Hook config
`.claude/settings.json` registers one script, `.claude/hooks/capture.mjs`, on three events:

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/capture.mjs\"" }] }
    ],
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/capture.mjs\"" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "node \"$CLAUDE_PROJECT_DIR/.claude/hooks/capture.mjs\"" }] }
    ]
  }
}
```

- `SessionStart` records the model, `UserPromptSubmit` appends a `PROMPT` entry, `Stop` appends a `RESPONSE` entry (the final assistant text of the turn).
- The hook only records from installation onward. It never reads past sessions.
- `.agent-logs/` is not in `.gitignore`. Only `.claude/.capture-state/` (the hook's per-session counter) is ignored.
- The log format was built from a description of the 8x format, not from the spec itself, so it may need adjusting.

## Log paths
- `.agent-logs/2026-09-30_11-52-01_3d21f8cd-cb24-4d4b-9a90-9fda457e6fb8.md`

## Canary entries — NOT VERIFIED
The user reported sending two canary prompts. **No canary prompts appear in `.agent-logs/`.** The only log file was written by the working session itself and contains two entries, reproduced raw below: one `RESPONSE` (an ordinary reply from that session) and one `PROMPT` (the request to verify the canaries and create this file). I have not added, edited or reconstructed any canary entry. Whether the canaries went to a different session or the hook did not fire for them is unknown.

### Raw log file
````markdown
---
session: 3d21f8cd-cb24-4d4b-9a90-9fda457e6fb8
started: 2026-09-30T11:52:01.435Z
model: unknown
capture: live hook (.claude/hooks/capture.mjs)
---

[LOG_ENTRY type=RESPONSE num=1 session=3d21f8cd-cb24-4d4b-9a90-9fda457e6fb8]
timestamp: 2026-09-30T11:52:01.435Z
model: claude-sonnet-5-5

I can help with part of this, and I'm not going to do the rest.

**I won't backfill the logs.** The 8x requirement exists so reviewers see a record captured live while the work happened. Building those files afterward from transcripts, in the same format, so the repo passes the check is a way around that requirement. Labelling each entry "backfilled" doesn't change what the files would be used for. That's also the step the classifier blocked, so I'm not re-running the transcript extraction. If you want the earlier sessions in front of the reviewers, tell them what happened (capture was set up in a copy you deleted) and let them decide what evidence they'll accept.

**I will install the live capture hook**, since it only records from now on. I don't have the actual 8x instructions, only your description, so the format below is my best reading of it. Please compare it against their spec.

[LOG_ENTRY type=PROMPT num=2 session=3d21f8cd-cb24-4d4b-9a90-9fda457e6fb8]
timestamp: 2026-09-30T11:52:52.385Z
model: claude-sonnet-5-5

Both canaries sent. Verify they're in .agent-logs/, then create CAPTURE-TEST.md with the tool, model, hook config, log paths, both canary entries raw, and an honest "what went wrong" section: capture was set up in my first repo, I deleted and re-cloned it, and the build ran without the hook. Commit and push.

````

## What went wrong
- Capture was originally set up in the author's first copy of this repo.
- That copy was deleted and the repo was re-cloned. The hook lived in the deleted copy, so it was never installed in the re-cloned repo.
- The whole build ran without the hook: data collection (Deepgram transcription), the Next.js app, the README and the first Vercel deployment. **None of it has a live-captured log.** The first log entry is from after the build was finished.
- The reviewers rejected the submission for the missing `.agent-logs/`. A live hook was installed afterwards. Earlier Claude Code session transcripts still exist on the author's machine under `~/.claude/projects/`; they were not converted into `.agent-logs/` files, because those files would be reconstructions and not live capture.
