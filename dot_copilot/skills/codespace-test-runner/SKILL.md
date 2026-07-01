# Codespace Test Runner

Run github/github tests in a GitHub Codespace when the local environment cannot execute them (e.g., local macOS sessions, missing dependencies, or when the user explicitly requests remote execution).

## Prerequisites

- `gh` CLI authenticated with access to `github/github`
- The branch you want to test must be pushed to the remote

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
