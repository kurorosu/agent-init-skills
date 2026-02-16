---
name: init-changelog
description: "Set up CHANGELOG.md in Keep a Changelog format with proper versioning and archive structure. Use when initializing or resetting a changelog for a project."
---

# Changelog Setup

Generate `CHANGELOG.md` and the `changelogs/` archive directory in the project root, following the [Keep a Changelog](https://keepachangelog.com/) format.

## Steps

### 1. Detect Project Version

Check for the current version in:
- `package.json` (Node.js)
- `pyproject.toml` (Python)
- `Cargo.toml` (Rust)
- `go.mod` (Go)

If no version is found, use `0.1.0`.

### 2. Generate `CHANGELOG.md`

First, check if `CHANGELOG.md` already exists in the project root.
- If it exists, ask the user: "CHANGELOG.md already exists. Overwrite or skip?" and follow their choice
- If it does not exist, create it

Create `CHANGELOG.md` with the following content:

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/),
and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

-

## [0.1.0] - YYYY-MM-DD

### Added

- Initial release

## Archived Changelogs

Older version histories are archived in the [`changelogs/`](changelogs/) directory.
```

Replace `0.1.0` with the detected version and `YYYY-MM-DD` with today's date.

### 3. Generate `changelogs/README.md`

Check if the `changelogs/` directory already exists in the project root.
- If it exists, ask the user: "changelogs/ directory already exists. Overwrite or skip?" and follow their choice
- If it does not exist, create the directory

Create `changelogs/README.md`:

```markdown
# Archived Changelogs

This directory contains archived changelog entries for older versions.

When the main `CHANGELOG.md` grows too long, move completed version entries here grouped by minor version series.

## Files

| File | Versions |
|---|---|
| `0.1.x.md` | 0.1.0 - 0.1.x |

## How to Archive

1. Cut the version entries from `CHANGELOG.md` (keep `[Unreleased]` and the latest release)
2. Create a new file named `X.Y.x.md` (e.g. `1.3.x.md`)
3. Paste the entries into the new file
4. Update the table above
```

### 4. Append Changelog Rules to `CLAUDE.md`

Check if `CLAUDE.md` exists in the project root.
- If it exists and already contains a `## Changelog` section, skip this step
- If it exists but does not contain a `## Changelog` section, append the following section to it
- If it does not exist, create it with the following content

```markdown
## Changelog

- Before committing, record your changes under the `[Unreleased]` section in `CHANGELOG.md`
- Use the appropriate category: Added, Changed, Deprecated, Removed, Fixed, Security
- On release, rename `[Unreleased]` to the new version number with today's date
- When `CHANGELOG.md` grows too long, archive older entries to `changelogs/X.Y.x.md` (see `changelogs/README.md`)
```

## Change Categories

Use these categories under each version heading:

| Category | When to use |
|---|---|
| `Added` | New features |
| `Changed` | Changes in existing functionality |
| `Deprecated` | Soon-to-be removed features |
| `Removed` | Removed features |
| `Fixed` | Bug fixes |
| `Security` | Vulnerability fixes |

## Instructions

1. Detect the project version before generating the file
2. Use today's date for the initial version entry
3. If a `CHANGELOG.md` already exists, ask the user before overwriting
4. Always create the `changelogs/` directory and `README.md` together
5. Keep the `[Unreleased]` section at the top — this is where ongoing changes are tracked
6. Append changelog rules to `CLAUDE.md` (create if not exists)
