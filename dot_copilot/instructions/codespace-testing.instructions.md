---
description: Use the codespace-test-runner skill to run tests remotely in a GitHub Codespace
applyTo: "**"
---

## Running Tests

**Only applies when working in `github/github` or `github/github-ui` repositories.**

When you need to run tests (`bin/rails test`, `bin/rubocop`, `bin/srb tc`, etc.), **always use the `codespace-test-runner` skill** to execute them in a GitHub Codespace rather than locally.

This applies to:
- Running tests after making code changes
- Running `test_oracle` to discover relevant tests
- Running linters or type checkers
- Any command that requires the full Rails environment

Invoke the skill, then follow its steps to find or create a Codespace and run the commands remotely.
