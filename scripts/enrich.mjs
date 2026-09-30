// Merges raw Deepgram transcripts with hand-written (read-and-authored) summaries,
// action items and chapters. Usage: node scripts/enrich.mjs <scratchDir>
import fs from "node:fs";
import path from "node:path";

const scratch = process.argv[2];
const outDir = new URL("../data/meetings/", import.meta.url).pathname;

const enrich = {
  mQgvhX_hPqU: {
    summaries: {
      general: `## Overview
Americas/EMEA burndown meeting for the Kubernetes v1.37 release cycle (week 13, Monday Aug 10). Sub-teams gave status updates; the release is nearly done and the next cycle starts almost immediately, so the team is being pushed to prepare handbook changes and succession plans now.

## Sub-team status
- **Enhancements — green.** 67 KEPs tracked (26 alpha, 23 beta, 17 stable, 1 deprecation). All tracked for code freeze; a few deferred or removed from the milestone.
- **Release signal — red.** Failing: \`gce-1.37-scale-performance-100\`. Flaky: \`gce-device-plugin-gpu-master\`. Slack thread and issue already opened.
- **Docs — green.** 67 KEPs tracked, 66 for docs; 59 docs PRs merged. RC.1 is scheduled for Aug 19 and release notes will be finalised from it.
- **Comms — yellow.** Release announcement blog in progress. Feature blogs: 0 merged, 2 in progress, 6 ready for review. 18 opt-ins (two storage blogs combined): 12 alpha, 11 beta, 5 stable.
- **Release branch management.** RC.0 was cut last week; post-branch-creation tasks are being wrapped up and new dashboards went to the signal team.

## Key discussion
- **Compressed schedule:** the gap between releases is shorter, so handbook updates need to be raised as draft PRs now, not after the release.
- **Enhancements cleanup step** (removing labels from enhancement issues) matters more this cycle and should start next week so the next lead can set up their board quickly.
- **Succession:** subproject and sub-team leads should start succession discussions with the release lead and subproject leads urgently.
- **Docs exceptions:** four KEPs missed the docs deadline; three exceptions were handled over the weekend, one is still being evaluated.
- **Release logo:** designer is on summer vacation; the design is chosen but the final file is outstanding.

## Next milestone
RC.1 cut (Aug 19), contingent on green release signal.`,
      sales: `## Deal-style read-out (community meeting, adapted)
**Stakeholders:** release lead, release lead shadow (host), and leads for enhancements, release signal, docs, comms and branch management.

**Health of the "pipeline" (release):**
- 67 KEPs tracked, all good for code freeze; docs 59/66 merged.
- Green: enhancements, docs. Yellow: comms. Red: release signal (scale-performance job failing, GPU device-plugin job flaky).

**Risks / objections raised**
- Red signal could block the RC.1 cut on Aug 19 if not fixed.
- Back-to-back release schedule leaves no gap for handbook updates.
- Leads are not yet lined up for succession.
- Release announcement blog historically slips to the last day.
- Release logo delayed by designer vacation.

**Commitments / next steps**
- Release lead to send press-interview info to the Linux Foundation and ask for an extension to end of week.
- Move the announcement blog from Google Docs to a draft GitHub PR this week.
- All sub-teams to raise handbook PRs; enhancements to start cleanup next week.

**Forecast:** on track for RC.1 provided signal turns green.`,
      standup: `## Yesterday / last week
- Hit two deadlines: docs freeze and RC.0 cut.
- Branch management worked over the weekend on post-RC.0 tasks; 1.37 boards are up.
- SIG Docs leadership merged the exception-request PRs over the weekend.

## Today / this week
- Get the release announcement draft out of Google Docs and into a GitHub PR.
- Follow up on the red release signal (scale-performance failure, GPU flake).
- Send Linux Foundation the release highlights, announcement PR link and request a deadline extension.

## Blockers
- Release signal is red.
- One docs exception request still pending.
- Release logo waiting on designer (summer vacation).
- Several leads have not begun succession planning.`,
    },
    actionItems: [
      { text: "Raise draft PRs for handbook updates before the next release starts", owner: "Enhancements team & all sub-team leads", timestamp: 118 },
      { text: "Start the enhancement-issue label cleanup step from next week", owner: "Enhancements team", timestamp: 162 },
      { text: "Investigate the failing scale-performance job and the flaky GPU device-plugin job", owner: "Release signal team", timestamp: 215 },
      { text: "Finalise release notes from RC.1 (scheduled Aug 19)", owner: "Docs lead", timestamp: 294 },
      { text: "Land the release announcement blog and share progress with the CNCF webinar/press contacts", owner: "Comms team", timestamp: 366 },
      { text: "Complete remaining post-branch-creation tasks from the tracking issue", owner: "Release branch management", timestamp: 438 },
      { text: "Start succession discussions with the release lead and subproject leads", owner: "All sub-team leads", timestamp: 471 },
      { text: "Resolve open input needed from leads for the 1.37 boards (end of today / tomorrow)", owner: "Release lead", timestamp: 528 },
      { text: "Decide on the last pending docs exception request", owner: "Release lead", timestamp: 580 },
      { text: "Send release highlights, announcement PR link and logo status to the Linux Foundation and request an extended deadline", owner: "Release lead & comms", timestamp: 595 },
      { text: "Move the announcement blog from Google Docs to a draft GitHub PR for SIG lead review", owner: "Release lead & comms", timestamp: 620 },
      { text: "Tag the release lead if SIG leads don't respond about test failures so they can be nudged", owner: "Release signal team", timestamp: 686 },
      { text: "Give an update on the release logo at next week's meeting", owner: "Release lead", timestamp: 780 },
    ],
    chapters: [
      { title: "Welcome & code of conduct", start: 0 },
      { title: "Enhancements update", start: 71 },
      { title: "Handbook updates & cleanup request", start: 108 },
      { title: "Release signal (red)", start: 195 },
      { title: "Docs team", start: 249 },
      { title: "Comms team & feature blogs", start: 344 },
      { title: "Release branch management", start: 424 },
      { title: "Subproject leads & succession", start: 462 },
      { title: "Release lead update", start: 495 },
      { title: "Release logo Q&A", start: 759 },
      { title: "Wrap-up", start: 811 },
    ],
  },
  "fz5U-yaFWQw": {
    summaries: {
      general: `## Overview
Kubernetes SIG Release meeting on June 10, week 4 of the release cycle. Two deadlines land today: the PRR freeze and the alpha.1 cut. Shadows have been onboarded and every sub-team reported green.

## Sub-team status
- **Enhancements — onboarding done.** 98 KEPs tracked (50 alpha, 29 beta, 18 stable, 1 deprecation), excluding removed/deferred. 12 are at risk for the PRR freeze; the team is reaching out to owners. PRR freeze took effect at 05:30 IST, followed by a "freeze party".
- **Release signal — green.** A flake blocking the release was fixed and merged; no broken issues or PRs, and no critical items.
- **Docs — green.** Shadow onboarding complete, weekly branching PR merged. Will prep alpha.1 release notes and, after PRR freeze, distribute KEPs to shadows for placeholder PRs. Open issue: CLA/sign-off check failing on merges into the dev branch despite signed CLAs.
- **Comms — green.** Shadow access PRs merged; comms opt-in assignees updated. Shadow orientation held June 4–5. A blog on cgroup v1 removal will be in the mid-cycle blog plus an off-cycle feature blog.
- **Release branch management.** Signal green, alpha cut planned later today, possibly waiting for Americas/EMEA folks to be ready.

## Leads
Sub-team leads should finish sub-team orientations; first-time shadows must attend the release-team orientation (two slots, one already passed and one Friday).

## Next milestones
PRR freeze (hours away) and alpha.1 cut today.`,
      sales: `## Deal-style read-out (community meeting, adapted)
**Stakeholders:** meeting host, release lead, and leads for enhancements, signal, docs, comms and branch management.

**Health:** All teams green. 98 KEPs tracked; 12 at risk for the PRR freeze.

**Risks / objections**
- 12 KEPs at risk for PRR freeze.
- CLA sign-off check misfiring on the dev branch for website PRs.
- Alpha cut timing depends on Americas/EMEA availability.
- Some first-time shadows may miss orientation.

**Commitments / next steps**
- Enhancements: keep chasing at-risk KEP owners before the freeze.
- Branch management: cut alpha.1 later today.
- Docs: follow the CLA issue; prep alpha.1 release notes.
- Comms: publish the cgroup v1 removal blog.

**Forecast:** strong. Signal is green, so alpha.1 can proceed.`,
      standup: `## Yesterday / last week
- Shadow onboarding completed across teams; access PRs merged.
- Weekly branching PR merged.
- Fixed the flake that was blocking the release; signal back to green.
- Comms discussed the cgroup v1 blog with SIG Docs.

## Today
- PRR freeze at 05:30 IST.
- Alpha.1 cut later today.
- Docs to start alpha.1 release notes.

## Blockers
- 12 KEPs at risk for PRR freeze.
- CLA/sign-off check failing on dev-branch merges (issue opened, being followed up).`,
    },
    actionItems: [
      { text: "Keep reaching out to owners of the 12 KEPs at risk before the PRR freeze", owner: "Enhancements team", timestamp: 133 },
      { text: "Share the PRR freeze party link with the enhancements group", owner: "Enhancements team", timestamp: 161 },
      { text: "Prepare release notes for alpha.1 once it is out", owner: "Docs team", timestamp: 270 },
      { text: "Distribute KEPs to shadows after the PRR freeze and reach out for placeholder PRs", owner: "Docs team", timestamp: 285 },
      { text: "Follow up on the CLA/sign-off issue affecting merges to the dev branch", owner: "Docs team", timestamp: 302 },
      { text: "Publish cgroup v1 removal content in the mid-cycle blog and an off-cycle feature blog", owner: "Comms team", timestamp: 403 },
      { text: "Cut alpha.1 later today, once Americas/EMEA folks are ready", owner: "Release branch management", timestamp: 449 },
      { text: "Complete sub-team orientations (or schedule them)", owner: "Sub-team leads", timestamp: 500 },
      { text: "First-time shadows to attend release-team orientation (or contact the subproject leads for async onboarding)", owner: "First-time shadows", timestamp: 525 },
    ],
    chapters: [
      { title: "Welcome & code of conduct", start: 0 },
      { title: "Enhancements & PRR freeze", start: 69 },
      { title: "Release signal (green)", start: 192 },
      { title: "Docs team & CLA issue", start: 249 },
      { title: "Comms team", start: 354 },
      { title: "Release branch management & alpha cut", start: 437 },
      { title: "Subproject leads", start: 476 },
      { title: "Release lead update & deadlines", start: 500 },
      { title: "Wrap-up", start: 604 },
    ],
  },
};

fs.mkdirSync(outDir, { recursive: true });
for (const [id, extra] of Object.entries(enrich)) {
  const raw = JSON.parse(fs.readFileSync(path.join(scratch, `${id}.raw.json`), "utf8"));
  fs.writeFileSync(path.join(outDir, `${id}.json`), JSON.stringify({ ...raw, ...extra }, null, 2));
  console.log("wrote", id);
}
