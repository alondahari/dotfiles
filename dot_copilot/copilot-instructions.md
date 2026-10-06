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

## Interactive Browser and API Verification

When I ask to verify changes in a browser or against a locally running API, set up a working Codespace preview and its tunnel, then give me the usable URL or local API endpoint. Do not stop after describing setup commands. Use the repository's existing Codespace dev-loop instructions for checkout, server startup, seed data, and health checks; this is separate from running automated tests.

- Use a **dedicated Codespace for this session's preview** (or reuse one only if I explicitly identify it). Never use the shared `copilot test runner` pool or another session's Codespace for an interactive preview. Do not stop, reconfigure, or change port visibility on someone else's Codespace.
- Start the relevant server inside that Codespace and verify the app/API responds there before exposing it. For browser access, use that Codespace's own private forwarded-port `browseUrl` from `env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ports -c <codespace> --json sourcePort,browseUrl,visibility`; never reuse or construct a URL from a different Codespace.
- For API calls from this machine, keep an attached `gh codespace ports forward <remote-port>:<unused-local-port> -c <codespace>` tunnel running for this session. Choose a free **local** port distinct from other sessions, even when they forward the same remote port; check the tunnel and a representative API request through it before reporting success. Preserve any required `Host` header for virtual-host APIs (for example, `api.github.localhost`) and keep credentials out of URLs and logs.
- Keep forwarded ports private unless I explicitly request broader access. Report the Codespace name, URL or local port, and how long the preview will remain available. If setup or forwarding fails, diagnose it rather than silently using an old tunnel. Do not delete a Codespace without asking.

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
