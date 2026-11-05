---
description: Use the codespace-test-runner skill to run tests remotely in a GitHub Codespace
applyTo: "**"
---

## Running Tests

**Only applies when working in `github/github` or `github/github-ui` repositories.**

### When to run

**Do NOT run tests, linters, or type checkers automatically after edits.** Run them only when:
- The user explicitly asks (e.g. "run tests", "verify", "lint", "check types"), or
- The user has asked for a commit or push — commit and push first, then run one validation pass. If opening or updating a PR is part of the task, do that before validation so CI can run in parallel; new PRs must be drafts.

This overrides any general guidance to validate after every change. Don't re-run after small follow-up edits, review replies, or rebases unless one of the triggers above applies. When you skip validation, say briefly that tests weren't run.

### How to run

When a trigger applies, **always use the `codespace-test-runner` skill** to execute `bin/rails test`, `test_oracle`, `bin/rubocop`, `bin/srb tc`, etc. in a GitHub Codespace rather than locally.

For PR work, add validation results to the PR afterward. If validation is blocked, report the specific limitation and keep the PR draft; never claim checks that were not performed.

Keep each validation pass cheap:
- Sync changed files once per pass (e.g. a single `git diff | gh codespace ssh ... git apply`), not one SSH call per file.
- Run all tests, rubocop, and srb in a **single** SSH invocation.
- Target `file:line` for changed/added tests instead of whole files; only run whole files when the user asks.

## Codespace Authentication

Copilot sessions inject a `GH_TOKEN` that does not have the `codespace` scope,
overriding the persisted `gh` keyring login that does. Run every `gh codespace`
command with the injected tokens unset:

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace <command>
```

Do not ask the user to refresh authentication unless that command also reports
that the keyring login lacks the `codespace` scope.

Never pass `--default-permissions` when creating a Codespace. It opts out of
additional repository permissions requested by the devcontainer; preserve the
browser authorization step instead.

Run authenticated remote commands through `bash -lic '<command>'` so the
interactive login shell loads the Codespace token. A plain SSH command may not
inherit `GITHUB_TOKEN`. Check only its presence, never print its value, and verify
private repository access before requesting new credentials.
