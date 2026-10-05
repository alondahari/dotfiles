---
description: Use the codespace-test-runner skill to run tests remotely in a GitHub Codespace
applyTo: "**"
---

## Running Tests

**Only applies when working in `github/github` or `github/github-ui` repositories.**

### When to run

**Do NOT run tests, linters, or type checkers automatically after edits.** Run them only when:
- The user explicitly asks (e.g. "run tests", "verify", "lint", "check types"), or
- Right before a commit or push the user has asked for — one validation pass, then commit/push.

This overrides any general guidance to validate after every change. Don't re-run after small follow-up edits, review replies, or rebases unless one of the triggers above applies. When you skip validation, say briefly that tests weren't run.

### How to run

When a trigger applies, **always use the `codespace-test-runner` skill** to execute `bin/rails test`, `test_oracle`, `bin/rubocop`, `bin/srb tc`, etc. in a GitHub Codespace rather than locally.

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
