---
name: init-changelog
description: "Initialize or reset changelog files only when the user explicitly requests changelog setup (for example `/init-changelog`, 'set up changelog', or 'initialize CHANGELOG.md'). Do not trigger for routine changelog edits or unrelated Markdown tasks."
---

# Changelog Setup

Generate `CHANGELOG.md` and the `changelogs/` archive directory in the project root, following the [Keep a Changelog](https://keepachangelog.com/) format.

## Steps

### 1. Decide Confirmation Mode

Check whether changelog targets already exist:
- `CHANGELOG.md`
- `changelogs/README.md` (and implicitly the `changelogs/` directory)

Apply this rule:
- If neither target exists, create all targets directly without overwrite/skip prompts.
- If one or more targets exist, ask overwrite/skip only for each existing target file.
- Do not ask a single global "overwrite all / skip all" question.

### 2. Detect Project Version

Check for the current version in:
- `package.json` (Node.js)
- `pyproject.toml` (Python)
- `Cargo.toml` (Rust)
- `go.mod` (Go)

If no version is found, use `0.1.0`.

### 3. Generate `CHANGELOG.md`

Check whether `CHANGELOG.md` already exists.
- If it exists, ask: "CHANGELOG.md already exists. Overwrite or skip?" and follow the user's choice
- If it does not exist, create it directly

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

### 4. Generate `changelogs/README.md`

Ensure the `changelogs/` directory exists (create it if missing).

Then check whether `changelogs/README.md` already exists.
- If it exists, ask: "changelogs/README.md already exists. Overwrite or skip?" and follow the user's choice
- If it does not exist, create it directly

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

### 5. Reference Existing Change Rules

Do not create or modify `CLAUDE.md` / `AGENTS.md` in this skill.

If `README.md` contains changelog/update contribution rules, read and follow those rules when updating `CHANGELOG.md`.

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

1. Trigger this skill only when changelog setup is explicitly requested.
2. Determine whether targets already exist before creating files.
3. Ask overwrite/skip per existing target file (`CHANGELOG.md`, `changelogs/README.md`).
4. Do not ask a global "overwrite all / skip all" question.
5. Detect the project version before generating the initial release section.
6. Use today's date for the initial version entry.
7. Always ensure `changelogs/` exists when creating `changelogs/README.md`.
8. Keep the `[Unreleased]` section at the top — this is where ongoing changes are tracked.
9. Do not create or modify `CLAUDE.md` / `AGENTS.md` in this skill.
