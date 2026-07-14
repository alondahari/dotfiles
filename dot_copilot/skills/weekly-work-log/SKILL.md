---
name: weekly-work-log
description: >
  Quickly record Alon Dahari's accomplishments, decisions, leadership work, and
  useful context as comments on the permanent weekly work log issue. Use when
  Alon says "log this for my weekly update", "record this for the week",
  "add this to my work log", "weekly work log", or otherwise asks to capture
  something for weekly status updates.
tools:
  - ask_user
  - bash
---

# Weekly Work Log

Capture work throughout the week as comments on:

- Repository: `github/agentic-automations`
- Issue: `1466`
- URL: https://github.com/github/agentic-automations/issues/1466

The reflections automation reads this issue through Alon's `initiative_urls`
configuration.

## Capture workflow

1. Extract the following from the user's message:
   - **What I did:** Alon's specific contribution, not the broader team's work.
   - **Impact:** Why it mattered, who it helped, or what it unblocked.
   - **Evidence:** Relevant PR, issue, discussion, or document links.
   - **Status:** `Complete` or `In progress`.
2. Preserve the user's wording where practical. Improve clarity, but do not
   embellish, invent outcomes, or add unsupported metrics.
3. Evidence is optional. Never block capture only because there is no link.
4. If impact is missing, ask one concise question with `ask_user`.
5. If status is missing:
   - Treat explicit completion language such as "shipped", "merged", "resolved",
     "finished", or "finalized" as `Complete`.
   - Treat explicit ongoing language as `In progress`.
   - Otherwise ask the user with `ask_user`, offering `Complete` and
     `In progress`.
6. When the user explicitly says to log, record, capture, or add the work,
   that is authorization to post the comment. Do not ask for redundant
   confirmation after gathering required context.
7. If the user asks only to draft or preview an entry, show the Markdown and do
   not post it.

## Comment format

```markdown
### What I did
<specific contribution>

**Impact:** <why it mattered>

**Evidence:** <links or "None recorded">

**Status:** Complete | In progress
```

## Posting

Use the GitHub CLI:

```bash
gh issue comment 1466 \
  --repo github/agentic-automations \
  --body '<formatted Markdown comment>'
```

Quote the body safely so its contents cannot be interpreted as shell syntax.
If the command fails, report the error plainly and do not claim the entry was
recorded. On success, return the comment URL and a one-sentence summary of what
was logged.

## Examples

- "Log that I shipped the confidence scoring API, which unblocks the UI team.
  Evidence: https://github.com/github/example/pull/123"
- "Record for my weekly update: I aligned the team on the rollout plan. It
  removed ambiguity around ownership. Still in progress."
- "Add this to my work log: reviewed the design and caught a migration risk."
