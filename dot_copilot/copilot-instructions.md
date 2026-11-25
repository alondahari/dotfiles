# Copilot Instructions

## Response Style

- At the start of every new Copilot session, load and follow the installed `caveman` skill by default.
- If I say `stop caveman` or `normal mode`, stop using Caveman for the rest of that session unless I explicitly ask to enable it again.

## Language Preferences
- All scripts and tooling MUST be written in Node.js/JavaScript
- Do NOT create Python scripts unless explicitly requested
- Use CommonJS (require) style for Node.js scripts in this project
- The `gh` CLI is available and preferred for GitHub API calls

## Package Installation

- When not connected to the Microsoft VPN, run package-install commands targeting public npm, Yarn, or PyPI registries through `gh cfs -- <command>`. This applies to npm, Yarn, pnpm, Bun, and Python package installers (for example, `gh cfs -- npm install`, `gh cfs -- yarn install`, `gh cfs -- pnpm install`, `gh cfs -- bun install`, `gh cfs -- python -m pip install <package>`, or `gh cfs -- uv pip install <package>`).
- The Microsoft VPN is the supported alternative to `gh cfs`. Do not change registry configuration to bypass Central Feed Service (CFS) restrictions.

## Git Operations

- Agents may commit and push task-scoped changes whenever they are ready, including follow-up fixes, without asking for separate consent or requiring an explicit instruction in the current message.
- Respect any explicit instruction to pause, hold, or not push. This permission does not authorize destructive Git operations, force-pushes, or merging PRs.
- When addressing PR review feedback, make a separate commit for each addressed review comment; do not combine fixes for multiple comments in one commit.
- Keep commits small and focused on one logical change. Use concise, descriptive imperative commit subjects, adding a body only when it provides useful context.

## Pull Request Workflow and Required Verification

- When session code work is ready, automatically open a draft PR with a reviewer-friendly description (or update the existing PR) without waiting for a separate request, then request a Copilot code review. Respect explicit holds and do not apply this to chezmoi changes, which land on `main` per System Configuration.
- Then shepherd the draft PR until its current head is ready for my review without my interaction: resolve merge conflicts, address actionable review comments per "Addressing PR Review Comments", and fix failed CI caused by the change. Use supported durable monitoring, such as Agent merge for review, CI, and conflicts, when available; never use it to merge. Do not claim monitoring continues once the session stops.
- Never merge, mark ready, bypass or disable checks, or change unrelated code to get CI green. Report genuine blockers, flaky or pre-existing failures, permission issues, and any human comments awaiting my reply; do not call the PR fully ready while those remain.
- For PR work, first commit and push changes, then open a draft PR (or update the existing PR), then run required hands-on Codespace verification and targeted tests so CI can run in parallel. Do not delay the push or PR for validation; this ordering does not broaden when tests are required by the applicable testing instructions.
- Create and keep PRs as drafts unless I explicitly request ready-for-review or manually mark them ready. Do not automatically mark PRs ready after verification.
- After opening or updating the PR, verify the actual changed behavior hands-on in a dedicated GitHub Codespace. Automated tests alone do not satisfy this requirement. Use the browser, API, CLI, or other interface relevant to the change.
- Provide me with a working preview URL or API endpoint and reproducible steps so I can manually verify the change myself. Give me the direct link rather than opening a browser canvas.
- Capture relevant screenshots or videos and attach them to the PR, preferably showing before and after with comparable inputs, data, and feature-flag settings.
- For changes that are not browser-visible, record the exact verification performed and include before-and-after evidence in the PR. For APIs, include the request method, URL/path, relevant headers and payload, response status, and response body. For CLI or other changes, include the commands or actions and observed outputs.
- Redact credentials, tokens, and sensitive data from all evidence while keeping the verification reproducible. Label baseline and changed behavior clearly; never invent baseline results.
- Treat dedicated verification Codespaces as disposable: after all validation, explicitly requested manual checks, and evidence capture are complete and the evidence is saved outside the Codespace, automatically delete the dedicated Codespace without asking for separate approval. This also applies to an explicitly authorized disposable Codespace reused for the task; never delete unrelated, shared, or other-session Codespaces.
- Add verification results and evidence to the PR afterward. If Codespace setup, verification, or evidence capture is blocked or not applicable, report the specific limitation and keep the PR draft. Do not silently skip verification or claim unperformed checks.

## Pull Request Descriptions

- Keep PR titles short and simple: ideally 2-4 words, and the shorter the better. They need not be fully descriptive; the description carries the detail. For example, prefer "Enforce max noodle collaborators" over "Cap personal noodle collaborators before granting access".
- When creating or updating PRs, keep automated-test summaries concise: say "Validated with tests" rather than enumerating test files, commands, run counts, or assertion counts unless I explicitly request those details. This does not replace the required hands-on verification steps and evidence above.
- Give PR screenshots and recordings a concise caption explaining what behavior they demonstrate and why it matters to the change. Retain useful alt text.
- Show verification screenshots and videos inline in the PR description, outside any collapsible `<details>` block or other folded section, so reviewers see them without expanding anything.

### Reviewer-friendly descriptions

- Write like a friendly teammate who respects the reviewer's time. Lead with what changed and why: a self-contained snapshot of the final diff for someone with no session context, not a development diary.
- Use plain language and short paragraphs. Explain only the behavior, essential boundaries, non-obvious decisions, tradeoffs, and rollout risks. When focused feedback would help, name the specific behavior and why it matters.
- Avoid unexplained references to follow-ups, prior heads, or review fixes, as well as commit SHAs, environment identifiers, setup logs, cleanup history, and routine lint output.
- Keep verification honest and scoped to the current revision; earlier-head evidence does not verify current code. State any remaining gap or blocker in one concrete sentence naming the affected behavior, not environment provisioning or promises of future checks. Do not hide relevant verification gaps.
- Keep the main description to the change, why it matters, essential boundaries and risks, and a short verification summary. Preserve required exact hands-on evidence, reproducibility, captions, and redaction in a clearly labeled evidence subsection, collapsible block, or linked durable artifact; edit that evidence for concision first. Only nonvisual evidence (such as API transcripts or command output) may be collapsed or linked; keep screenshots and videos visible inline.
- When reproduction instructions are needed, including below evidence tables, use a short numbered sequence with fenced commands or requests and explicit expected results, not a dense paragraph of setup, fixtures, headers, and payloads. Include only necessary setup; do not repeat a table in prose.
- Link issues only when useful. Explain the relevant requirement or decision inline; never make the link carry essential context.
- Follow the repository template without adding repetitive prose. Omit optional, inapplicable sections when the template permits it.
- Prefer a few concise paragraphs, with roughly 400 words as an upper guide for reviewer-facing prose, not a quota. Do not pad simple changes. Keep required exact evidence separately as above; collapsing text is not a substitute for editing it.
- Before publishing, remove repetition, unexplained jargon, and anything
  that belongs in an implementation log rather than a PR description.
- Be warm and factual without overdoing thanks, praising your own work, making demands, or overstating certainty.

## Addressing PR Review Comments

- Treat a comment as non-human when its author is a bot account or its body indicates it was auto-generated. Treat all other comments as human.
- Non-human comments: once addressed (fixed, declined, or deferred to a follow-up), automatically reply inline in that thread and resolve it. State what was done or will be done and how: the fix, the reason for declining, or the follow-up plan.
- Human comments: never reply or resolve automatically. After addressing them, prompt me to respond myself, summarizing what changed for each comment.

## PR Review Comment Style

- Apply this style when explicitly asked to post review comments or feedback on someone's PR. Apart from the automatic non-human replies above, only post review replies or comments when the user explicitly asks; this style does not authorize posting.
- Comment inline on the exact changed line or range that matters. Submit a plain comment review, never an approval or a request for changes. Only when no changed line is a sensible anchor, leave one short PR conversation comment naming the file path. Keep one concern per comment; do not add a summary or overview comment.
- Write like an experienced teammate: short, specific, and curious. Use 1-3 sentences covering the concern, a concrete reason, and usually an invitation to respond. Prefer questions over verdicts; name the function, input, failure mode, or consequence, and suggest directions lightly ("Could we...", "Maybe...").
- Vary openings and endings naturally; do not use a fixed template or start or end consecutive comments the same way. Mix questions such as "What happens here if...?" or "Should this... too?" with plain observations.
- Avoid headings, bullet lists, bold labels, severity or confidence scores, long explanations, restating the diff, hedging filler, false certainty, generic advice, mentioning AI or tools, and private context.

Examples:

> Adding `| string` makes this effectively just `string`, so typos in the analytics target will compile. Could we map assistant keys to the known targets instead?

> Looks like this describes `DocsViewer`, but it is attached to `UnsupportedDocsViewer`. Can we move it above the export it documents so the editor hover shows the right explanation?

## Testing with Feature Flags

CI environments run tests with all feature flags enabled. When making changes and running tests, account for this by toggling any relevant flags on or off. To run tests with all flags enabled locally, pass `TEST_ALL_FEATURES=1`.

## Local API Testing in Codespaces

To test the GitHub API locally in a Codespace, find the monalisa dev token by running:
```bash
grep 'GITHUB_TOKEN=' script/start-workbench
```
Then use it to curl:
```bash
curl -H "Authorization: token <TOKEN>" http://api.github.localhost/<endpoint>
```

## Interactive Browser and API Verification

After pushing changes and opening or updating a PR, or whenever I ask to verify changes in a browser or against a locally running API, set up a working Codespace preview and its tunnel, then give me the usable URL or local API endpoint. Do not stop after describing setup commands. Use the repository's existing Codespace dev-loop instructions for checkout, server startup, seed data, and health checks; this is separate from running automated tests.

- Use a **dedicated Codespace for this session's preview**. Reuse an existing one only if I explicitly identify it and authorize treating it as disposable, including deletion after verification; otherwise create a new dedicated Codespace. Never use the shared `copilot test runner` pool or another session's Codespace for an interactive preview. Do not stop, reconfigure, or change port visibility on someone else's Codespace.
- When creating a Codespace, **never pass `--default-permissions`**: it opts out of the devcontainer's requested additional repository permissions. Omit it and preserve GitHub's browser authorization step if required; do not bypass that step to make creation non-interactive.
- Run authenticated remote setup through `bash -lic '<command>'`. The interactive login shell loads the Codespace's `GITHUB_TOKEN`; a plain SSH command can incorrectly make it appear missing. Check token presence without printing its value, then verify access to the required private repository before diagnosing missing credentials or requesting a PAT.
- Start the relevant server inside that Codespace and verify the app/API responds there before exposing it. For browser access, use that Codespace's own private forwarded-port `browseUrl` from `env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ports -c <codespace> --json sourcePort,browseUrl,visibility`; never reuse or construct a URL from a different Codespace.
- For API calls from this machine, keep an attached `gh codespace ports forward <remote-port>:<unused-local-port> -c <codespace>` tunnel running for this session. Choose a free **local** port distinct from other sessions, even when they forward the same remote port; check the tunnel and a representative API request through it before reporting success. Preserve any required `Host` header for virtual-host APIs (for example, `api.github.localhost`) and keep credentials out of URLs and logs.
- Keep forwarded ports private unless I explicitly request broader access. Report the Codespace name, URL or local port, and that the preview is temporary and will be removed when verification is complete. If setup or forwarding fails, diagnose it rather than silently using an old tunnel.
- After verification and evidence preservation, stop this session's forwarding tunnel and delete only the exact dedicated Codespace recorded for this task with `env -u GH_TOKEN -u GITHUB_TOKEN gh codespace delete -c <codespace> --force`. Confirm it is absent from `env -u GH_TOKEN -u GITHUB_TOKEN gh codespace list --json name` before reporting cleanup complete. If verification is blocked or abandoned, preserve any available evidence and perform the same cleanup once the Codespace is no longer needed. Report cleanup failures explicitly; never claim deletion succeeded without confirmation.

## System Configuration

Manage dotfiles and system configuration through [chezmoi](https://www.chezmoi.io/) source files, not by editing installed targets directly. For every chezmoi change:

1. Before editing, check the intended GitHub branch, the primary source checkout (`~/.local/share/chezmoi/`), and the affected installed targets for drift. Preserve unrelated and user-owned changes.
2. Stage and commit only task-scoped source changes, then land them on the intended GitHub branch (normally `main` for this repo). Honor any explicit hold.
3. If working in a separate worktree, safely fast-forward the actual primary checkout to the landed commit; updating only the task branch does not count. From the synced primary source, use `chezmoi apply` only on affected targets that need updating. Never blanket apply.
4. Verify that the primary checkout and the intended GitHub branch point to the same commit and that the affected installed targets match the rendered source. Report any divergence, permissions issue, or conflict instead of overwriting local changes, forcing an update, or claiming all three are synced.
