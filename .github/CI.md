# CI coverage and runner routing

General Linux jobs use the registered `kalana-ci` scale-set label. Do not add
`self-hosted` or `Linux` scheduling constraints to that family: its successfully
running jobs request the custom label alone. Native macOS jobs use the
`kalana-macos-ci` family. Windows jobs retain their existing GitHub-hosted Windows
runners, as explicitly requested because no self-hosted Windows runner exists.

All workflows are covered, including Python/Rust checks, browser tests, native
installer/wrapper E2E, devcontainer validation, docs/plugins, security scans,
scheduled evaluations, release wheels, Docker images, and repository maintenance.
Existing publishing triggers, secrets, job IDs, artifact names, and platform
matrices are retained. No release publication is needed to validate this PR.

The main suite keeps its four pytest shards and coverage uploads, and now retains
JUnit results. A separate compatibility matrix exercises configuration, model
registry, tokenization, and TOIN contracts on Python 3.10, 3.11, 3.13, and 3.14
using the built ABI3 wheel. Python 3.12 remains covered by the full sharded suite.
Rust formatting/lint/tests now explicitly use Cargo.lock; existing parity,
dependency, packaging, integration, and browser checks stay in place.

`typescript-packages.yml` runs the SDK and OpenClaw packages' existing typecheck,
test, and build gates serially from their npm lockfiles. Vitest uses one worker,
with file and test concurrency also limited to one. Local validation on
2026-10-25 passed 380 tests; 33 existing opt-in integration tests were skipped.
Live provider tests remain opt-in.

Both Linux release architectures are preserved. Docker builds and wheel smoke
containers run the requested platform explicitly, with QEMU available for a
non-native target. Native Linux ARM hardware is therefore not a scheduling
prerequisite. Emulated builds have larger time budgets. The Linux worker still
needs usable Docker/Buildx and binfmt registration privileges, which those
integration jobs require. macOS workers need Xcode; preserved Intel Mac wheels
also require Rosetta 2 and architecture-matched Python interpreters.

The 16-row Docker build matrix and Python compatibility matrix run one row at a
time. The Docker build job also limits concurrent BuildKit operations to one.
CI passes `CI_CARGO_BUILD_JOBS=1` to the selected Bake target; the builder exports
it into the actual maturin and Cargo compilation commands. Omitting that argument
preserves normal developer Cargo behavior. Direct self-hosted Rust checks use one
compiler and test worker on Linux and retain two on native macOS, including the
newly covered Rust test job.

These limits apply per job or builder. Aggregate runner admission across jobs,
workflows, and repositories is managed separately.
The owner reports five aggregate Linux runners, each with one CPU and 3 GB RAM;
that budget is not independent proof of GitHub execution or admission enforcement.

Workflow validation installs pinned, checksum-verified actionlint/act binaries in
the job temporary directory. Maintenance jobs bootstrap GitHub CLI without sudo
or apt. Path-filter jobs receive only the pull-request read permission they need.
Jobs have explicit timeouts and workflows have bounded concurrency. Existing
job-local Mac home isolation remains in place for native tests that intentionally
write agent settings under their home directory.

External fork PRs do not execute source on self-hosted workers. A maintainer can
copy reviewed changes to a branch in this repository to run trusted CI. Existing
pull_request_target governance checks continue to use base-branch code only.
Runner administration APIs return HTTP 403 for this integration, so label and
repository registration are provisioned outside the PR.

This record describes configured coverage and local verification. It does not
establish current Actions enablement or a complete passing CI run.
