---
name: codespace-test-runner
description: >
  Run github/github tests remotely in a GitHub Codespace. Use when the local
  environment cannot run Rails tests (macOS worktree sessions, missing deps) or
  when the user explicitly asks to run tests remotely. Supports running tests
  against pushed branches OR uncommitted local changes (via file copy).
  Triggers: run tests in codespace, remote tests, codespace test, test remotely.
---

# Codespace Test Runner

Run github/github tests in a GitHub Codespace when the local environment cannot execute them (e.g., local macOS sessions, missing dependencies, or when the user explicitly requests remote execution).

## Prerequisites

- `gh` CLI authenticated with `codespace` scope (`gh auth refresh -h github.com -s codespace`)
- For branch-based testing: the branch must be pushed to the remote
- For local-changes testing: an existing Codespace (any branch) is sufficient

## Step 1: Find or Create a Codespace

### Check for an existing Codespace on the branch

```bash
gh codespace list --repo github/github --json name,branch,state -q '.[] | select(.branch == "<BRANCH>")'
```

If one exists and its state is "Available", reuse it. If state is "Shutdown", it will auto-start on the next command.

### Create a new Codespace

```bash
gh codespace create --repo github/github --branch <BRANCH> --machine xLargePremiumLinux --status
```

- Use `xLargePremiumLinux` (32-core) for fast test runs. Fall back to `largePremiumLinux` (16-core) if creation fails.
- Creation takes 2-5 minutes. The `--status` flag streams progress.
- Save the codespace name from the output for subsequent commands.

## Step 2: Run Tests

Use `gh codespace exec` to run commands inside the Codespace:

```bash
# Run a specific test file
gh codespace exec -c <CODESPACE_NAME> -- bin/rails test <path/to/test_file.rb>

# Run a specific test by line number
gh codespace exec -c <CODESPACE_NAME> -- bin/rails test <path/to/test_file.rb>:<LINE>

# Run tests with all feature flags enabled (matches CI)
gh codespace exec -c <CODESPACE_NAME> -- env TEST_ALL_FEATURES=1 bin/rails test <path/to/test_file.rb>

# Run tests for a package
gh codespace exec -c <CODESPACE_NAME> -- bin/rails test packages/<package>/test/

# Run test_oracle to discover relevant tests
gh codespace exec -c <CODESPACE_NAME> -- bin/rails test_oracle
```

### Environment variables

Pass environment variables using `env` before the command:

```bash
gh codespace exec -c <CODESPACE_NAME> -- env MULTI_TENANT_ENTERPRISE=1 TEST_ALL_FEATURES=1 bin/rails test <path>
```

### Interactive shell (for debugging)

```bash
gh codespace ssh -c <CODESPACE_NAME>
```

## Step 3: Copy Files To/From Codespace

If you need to push local changes that aren't committed:

```bash
# Copy a file into the Codespace
gh codespace cp <local_path> remote:<remote_path> -c <CODESPACE_NAME>

# Copy a file out of the Codespace
gh codespace cp remote:<remote_path> <local_path> -c <CODESPACE_NAME>
```

## Step 4: Cleanup

Stop the Codespace when done to avoid billing:

```bash
gh codespace stop -c <CODESPACE_NAME>
```

Delete if no longer needed:

```bash
gh codespace delete -c <CODESPACE_NAME>
```

## Common Patterns

### Test uncommitted changes WITHOUT pushing (preferred for draft PRs)

This avoids polluting your PR with "wip" commits. Use an existing Codespace on any branch:

```bash
# 1. Find or create a Codespace (can be on master — we'll copy files over)
CODESPACE=$(gh codespace list --repo github/github --json name,state -q '.[0].name')
# Or create one: gh codespace create --repo github/github --branch master --machine xLargePremiumLinux

# 2. Copy modified files into the Codespace
gh codespace cp app/api/issues.rb remote:/workspaces/github/app/api/issues.rb -c "$CODESPACE"
gh codespace cp test/integration/api/issues_test.rb remote:/workspaces/github/test/integration/api/issues_test.rb -c "$CODESPACE"

# 3. Run tests (the copied files override what's on disk)
gh codespace exec -c "$CODESPACE" -- env TEST_ALL_FEATURES=1 bin/rails test test/integration/api/issues_test.rb

# 4. (Optional) Reset the codespace back to clean state
gh codespace exec -c "$CODESPACE" -- git checkout -- .
```

**Tip:** To copy all modified files at once:
```bash
git diff --name-only | while read f; do
  gh codespace cp "$f" "remote:/workspaces/github/$f" -c "$CODESPACE"
done
```

### Push branch and run tests remotely

```bash
# 1. Push current branch
git push origin <BRANCH>

# 2. Create codespace (or reuse existing)
CODESPACE=$(gh codespace create --repo github/github --branch <BRANCH> --machine xLargePremiumLinux 2>&1 | tail -1)

# 3. Run tests
gh codespace exec -c "$CODESPACE" -- bin/rails test <path>
```

### Run RuboCop in Codespace

```bash
gh codespace exec -c <CODESPACE_NAME> -- bin/rubocop <path/to/file.rb>
```

### Run Sorbet type checking in Codespace

```bash
gh codespace exec -c <CODESPACE_NAME> -- bin/srb tc <path/to/file.rb>
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `exec` hangs or times out | Codespace may be starting up — wait 30s and retry |
| "codespace not found" | Verify name with `gh codespace list` |
| Tests fail with DB errors | Run `gh codespace exec -c <NAME> -- bin/rails db:test:prepare` |
| Branch out of date | Run `gh codespace exec -c <NAME> -- git pull origin <BRANCH>` |
| Permission denied | Ensure `gh auth status` shows correct scopes (`codespace`) |
