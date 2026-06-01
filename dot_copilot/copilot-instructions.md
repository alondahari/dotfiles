# Copilot Instructions

## Language Preferences
- All scripts and tooling MUST be written in Node.js/JavaScript
- Do NOT create Python scripts unless explicitly requested
- Use CommonJS (require) style for Node.js scripts in this project
- The `gh` CLI is available and preferred for GitHub API calls

## Git Operations

**NEVER run `git push` or `git commit` without explicit instruction in the current user message.** This is a critical rule — violating it is the single most disruptive thing you can do.

- "Commit and open a PR" → commit, push, and open a PR (this is one explicit instruction)
- After that, if you make more changes (e.g., addressing review feedback, fixing a bug), **do NOT commit or push automatically** — stop and tell the user what you changed, then wait for them to say "commit", "push", or similar
- Previous requests to commit/push do NOT carry over to future messages — each push needs its own explicit instruction

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

## System Configuration

Dotfiles and system configurations are managed with [chezmoi](https://www.chezmoi.io/). When adding or modifying shell config (e.g. `~/.zshrc`), PATH entries, environment variables, or other system-level dotfiles, always apply changes through chezmoi source files rather than editing targets directly. The chezmoi source directory is `~/.local/share/chezmoi/`.

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
