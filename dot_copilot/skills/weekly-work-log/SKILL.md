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

1. Identify Alon's specific contribution, not the broader team's work, and any
   impact or evidence the user supplied.
2. Write a concise, freeform note. Preserve the user's wording where practical.
   Use paragraphs, bullets, headings, or links only when they make that
   particular note clearer; do not force entries into a fixed template.
3. Improve clarity, but do not
   embellish, invent outcomes, or add unsupported metrics.
4. Impact, evidence, and status are optional. Include them naturally when
   supplied, but do not ask for missing fields unless the note would otherwise
   be unclear or misleading.
5. Wrap every reference to another GitHub issue or pull request in backticks,
   including full URLs and shorthand such as `owner/repo#123`, so posting the
   comment does not create cross-reference notifications or backlinks.
6. When the user explicitly says to log, record, capture, or add the work,
   that is authorization to post the comment. Do not ask for redundant
   confirmation.
7. If the user asks only to draft or preview an entry, show the Markdown and do
   not post it.

## Comment style

Comments are freeform Markdown. Prefer a short natural paragraph for a single
item. Use a small list or headings only when the user is capturing multiple
distinct points or when structure genuinely improves readability.

## Posting

Use the GitHub CLI:

```bash
gh issue comment 1466 \
  --repo github/agentic-automations \
  --body '<freeform Markdown note>'
```

Quote the body safely so its contents cannot be interpreted as shell syntax.
If the command fails, report the error plainly and do not claim the entry was
recorded. On success, return the comment URL and a one-sentence summary of what
was logged.

## Examples

- "Log that I shipped the confidence scoring API, which unblocks the UI team.
  Evidence: `https://github.com/github/example/pull/123`"
- "Record for my weekly update: I aligned the team on the rollout plan. It
  removed ambiguity around ownership. Still in progress."
- "Add this to my work log: reviewed the design and caught a migration risk."
