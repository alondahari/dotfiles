# Copilot Instructions

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

- When creating or updating PRs, keep automated-test summaries concise: say "Validated with tests" rather than enumerating test files, commands, run counts, or assertion counts unless I explicitly request those details. This does not replace the required hands-on verification steps and evidence above.
- Give PR screenshots and recordings a concise caption explaining what behavior they demonstrate and why it matters to the change. Retain useful alt text.

### Reviewer-friendly descriptions

- Describe the final diff, not the history of developing it.
- Write like a friendly teammate who respects the reviewer's time. Lead with what changed and why. Make the description understandable without reading linked issues or previous conversations.
- Use plain language and short paragraphs. Explain only the behavior, boundaries, tradeoffs, and rollout concerns needed to review the change.
- Call out non-obvious decisions, tradeoffs, or risks. When focused feedback would help, point to the specific behavior or part of the diff and say why it matters.
- Avoid commit SHAs, intermediate fixes, environment identifiers, setup logs, and cleanup history.
- Link issues only when useful. Explain the relevant requirement or decision inline; never make the link carry essential context.
- Follow the repository template without adding repetitive prose. Omit optional, inapplicable sections when the template permits it.
- Aim for roughly 200–400 words of reviewer-facing prose. Add detail only when it materially helps review; collapsing text is not a substitute
  for editing it.
- Before publishing, remove repetition, unexplained jargon, and anything
  that belongs in an implementation log rather than a PR description.
- Be warm and factual without overdoing thanks, praising your own work, making demands, or overstating certainty.

## PR Review Comment Style

- Apply this style when explicitly asked to post review comments or feedback on someone's PR. Only post review replies or comments when the user explicitly asks; this style does not authorize posting.
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

## Investigating Issues — Feature Flag Correlation

When investigating a production issue and you suspect a feature flag state might be involved, **always check feature flag changes first** before diving deeper. Use the Datadog MCP to search events:

- Query: `tags:feature_flag` with a time window of 30 minutes before/after the incident
- For extended searches (flags enabled days/weeks ago): search up to 30 days back
- Narrow by keyword: `tags:feature_flag *<keyword>*`
- Narrow by team: `tags:feature_flag owning_service:github/<team>`

### Critical rules

- `feature_flag` is a **standalone tag** (no value) — never use `sources:feature_flag` or `tags:feature_flag:<name>`
- Parse event messages carefully:
  - "enabled for X%" / "fully shipped" / "actor added" → flag was **ENABLED** (possible cause)
  - "actor removed" / "fully disabled" / "deleted" → flag was **DISABLED** (NOT a cause of new behavior)
- If the affected feature area doesn't match a flag name directly, trace the code path in `github/github` to find the controlling flag

Reference: [github/copilot-sre feature-flags workflow](https://github.com/github/copilot-sre/blob/main/.github/skills/datadog/workflows/feature-flags.md)

## Splunk MCP Usage

The Splunk MCP server connects to GitHub's internal Splunk instance (`splunkazure-api.service.azure-eastus.github.net`). It runs in a Docker container with `--network host` (required for internal DNS resolution).

### Log format

GitHub logs use **OpenTelemetry** format. Key fields (access via `| spath`):

- `Body` — the log message (main content to search/aggregate on)
- `SeverityText` — log level (`ERROR`, `WARN`, `INFO`, etc.)
- `TraceId`, `SpanId`, `ParentSpanId` — distributed tracing
- `InstrumentationScope` — source system
- `Timestamp` / `@timestamp` — event time
- `hostname`, `kube_pod`, `kube_namespace`, `kube_container` — infrastructure context

### Common indexes

- `rails` — Rails application logs (web requests, controllers)
- `prod-resque` — Background job logs (Resque/ActiveJob workers)
- rails-exceptions -- Dedicated index for Rails exceptions

### Query tips

- Always use `| spath` to parse JSON fields before filtering or aggregating
- Use `| top limit=N Body` for quick error pattern discovery
- Use `| rex field=Body` to extract structured data from log messages
- Use `| timechart span=Xh count` for volume-over-time analysis
- Keep time ranges short (`-1h`, `-15m`) to avoid 504 timeouts on high-volume indexes
- Use `| bucket _time span=2h | stats count by _time` as a lighter alternative to `timechart` for large datasets
