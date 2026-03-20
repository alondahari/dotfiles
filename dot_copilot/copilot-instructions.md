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
