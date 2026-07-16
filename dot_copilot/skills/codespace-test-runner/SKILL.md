---
name: codespace-test-runner
description: >
  Run github/github tests remotely in a dedicated disposable GitHub Codespace.
  Use when the local environment cannot run Rails tests or when the user asks
  to run tests remotely. Supports pushed branches and uncommitted local changes.
---

# Codespace Test Runner

Run `github/github` tests in a dedicated disposable Codespace whose display
name is `copilot test runner`.

## Authentication

Copilot sessions inject tokens without the `codespace` scope. Run every
`gh codespace` command with those tokens unset:

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ...
```

The keyring login must have the `codespace` scope.

## Dedicated disposable Codespace

Never copy local files into an arbitrary existing Codespace. Its checkout and
resolved dependencies may be older than the local session, and it may contain
another user's uncommitted work.

Find the dedicated runner:

```bash
CODESPACE=$(env -u GH_TOKEN -u GITHUB_TOKEN gh codespace list \
  --repo github/github \
  --json name,displayName \
  --jq '.[] | select(.displayName == "copilot test runner") | .name')
```

The user has approved treating only this Codespace as disposable. It is safe to
reset and clean this Codespace. Never reset or clean any other Codespace.

### First-time setup

Always select the primary devcontainer explicitly. `github/github` contains
multiple devcontainers, so omitting this flag makes non-interactive creation
fail with `failed to prompt: no terminal`.

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace create \
  --repo github/github \
  --branch master \
  --devcontainer-path .devcontainer/devcontainer.json \
  --machine xLargePremiumLinux \
  --display-name "copilot test runner" \
  --idle-timeout 30m \
  --retention-period 24h \
  --status
```

On the first run, GitHub prints an `allow_permissions` URL and exits. Open that
exact URL, authorize the requested permissions, and rerun the same command.
Approval is required for authenticated `git fetch` and dependency access.
Do not use `--default-permissions`: it creates a runner whose checkout cannot
fetch `github/github`. Do not substitute another Codespace.

## Running remote commands

GitHub CLI 2.96 does not provide `gh codespace exec`. Use `gh codespace ssh`.
Always invoke the command through a login shell: the Codespace supplies
`GITHUB_TOKEN` and related authentication variables from its login profile.
Without `bash -lc`, authenticated `git fetch` fails.

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github && <COMMAND>'"
```

## Test uncommitted local changes

### 1. Align the full checkout

Do not copy changed files over a stale revision. Align the entire disposable
checkout to the local session's committed base first:

```bash
BASE_SHA=$(git rev-parse HEAD)

env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github &&
    git fetch origin &&
    git cat-file -e ${BASE_SHA}^{commit} &&
    git reset --hard ${BASE_SHA} &&
    git clean -fd'"
```

If `git cat-file` fails, the local `HEAD` is not available remotely. Do not
fall back to a stale revision; push the branch before testing.

### 2. Mirror local changes

Copy modified and untracked files into `/workspaces/github`. Remove paths that
are deleted locally from the disposable checkout too:

```bash
git diff --name-only --diff-filter=ACMRTUXB HEAD
git ls-files --others --exclude-standard
git diff --name-only --diff-filter=D HEAD
```

For each modified or untracked file, create its parent directory remotely and
copy it:

```bash
FILE=app/api/issues.rb
REMOTE_DIR=$(dirname "$FILE")

env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'mkdir -p /workspaces/github/${REMOTE_DIR}'"
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace cp \
  "$FILE" \
  "remote:/workspaces/github/$FILE" \
  -c "$CODESPACE"
```

For each locally deleted path:

```bash
FILE=app/api/deleted_file.rb

env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'rm -f /workspaces/github/${FILE}'"
```

Do not create a second worktree whose `vendor` directory points at the primary
checkout. That can corrupt the shared bundle while leaving source and
dependencies mismatched.

### 3. Refresh dependencies

Always refresh dependencies after the full source and local changes are in
place. This prevents failures such as a source revision requiring
`moda-service-discovery` while the runner still has an older resolved bundle.

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github && bin/bundle install'"
```

### 4. Run validation

```bash
# Rails tests with CI feature flags
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github &&
    TEST_ALL_FEATURES=1 bin/rails test <path>'"

# RuboCop
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github && bin/rubocop <path>'"

# Sorbet
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github && bin/srb tc <path>'"
```

### 5. Clean up

Reset only the dedicated disposable checkout, then stop it:

```bash
env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github && git reset --hard HEAD && git clean -fd'"

env -u GH_TOKEN -u GITHUB_TOKEN gh codespace stop -c "$CODESPACE"
```

## Test a pushed branch

```bash
BRANCH=<BRANCH>

env -u GH_TOKEN -u GITHUB_TOKEN gh codespace ssh -c "$CODESPACE" -- \
  "bash -lc 'cd /workspaces/github &&
    git fetch origin ${BRANCH} &&
    git reset --hard origin/${BRANCH} &&
    git clean -fd &&
    bin/bundle install &&
    TEST_ALL_FEATURES=1 bin/rails test <path>'"
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `failed to prompt: no terminal` | Pass `--devcontainer-path .devcontainer/devcontainer.json` |
| Dedicated runner missing | Use first-time setup; do not reuse another Codespace |
| `git fetch` asks for a username | Ensure permissions were authorized and use `bash -lc` |
| Base SHA unavailable | Push the branch; do not test against a different revision |
| Dependency missing | Confirm checkout alignment, then run `bin/bundle install` |
| DB errors | Run `bin/rails db:test:prepare` in the aligned checkout |
