---
name: init-github
description: "Generate .github/ templates including Issue Templates (bug report, feature request, documentation request, refactor request, test request, blank issue config) and a PR Template. Use when setting up GitHub templates for a new project or when asked to create issue/PR templates."
---

# GitHub Templates Setup

Generate the following files under `.github/` in the project root.

## Steps

### 1. Create Issue Templates

Create `.github/ISSUE_TEMPLATE/` directory with the following files.
All templates use Markdown front matter format.

For each file, check if it already exists.
- If it exists, ask the user: "[filename] already exists. Overwrite or skip?" and follow their choice
- If it does not exist, create it

### `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Report a bug or unexpected behavior
labels: bug
---

## Summary

<!-- A clear and concise description of the bug. -->

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

<!-- What you expected to happen. -->

## Actual Behavior

<!-- What actually happened. -->

## Environment

- OS:
- Runtime:
- Version:

## Additional Context

<!-- Screenshots, logs, or any other relevant information. -->

---

> **Branch prefix**: `fix/`
```

### `.github/ISSUE_TEMPLATE/feature_request.md`

```markdown
---
name: Feature Request
about: Suggest a new feature or enhancement
labels: enhancement
---

## Summary

<!-- Brief description of the feature. -->

## Background

<!-- Why is this feature needed? What problem does it solve? -->

## Scope

<!-- What should be included in the implementation? -->

## Out of Scope

<!-- What is explicitly NOT included? -->

## Acceptance Criteria

- [ ]

## Additional Context

<!-- Any other context, references, or screenshots. -->

---

> **Branch prefix**: `feature/`
```

### `.github/ISSUE_TEMPLATE/documentation_request.md`

```markdown
---
name: Documentation Request
about: Request new or improved documentation
labels: documentation
---

## Summary

<!-- Brief description of the documentation improvement. -->

## Target Documents

<!-- Which files or sections need to be updated? -->

## Proposed Changes

<!-- What should be added, changed, or clarified? -->

## Acceptance Criteria

- [ ]

---

> **Branch prefix**: `docs/`
```

### `.github/ISSUE_TEMPLATE/refactor_request.md`

```markdown
---
name: Refactor Request
about: Propose a code refactoring
labels: refactoring
---

## Summary

<!-- Brief description of the refactoring. -->

## Background

<!-- Why is this refactoring needed? -->

## Current Implementation

<!-- What are the problems with the current code? -->

## Proposed Changes

<!-- What changes do you propose? -->

## Acceptance Criteria

- [ ]

---

> **Branch prefix**: `refactor/`
```

### `.github/ISSUE_TEMPLATE/test_request.md`

```markdown
---
name: Test Request
about: Request new or improved tests
labels: test
---

## Summary

<!-- Brief description of the test improvement. -->

## Target Code

<!-- Which modules or functions need test coverage? -->

## Test Cases

<!-- What test cases should be added or improved? -->

## Acceptance Criteria

- [ ]

---

> **Branch prefix**: `test/`
```

### `.github/ISSUE_TEMPLATE/config.yml`

```yaml
blank_issues_enabled: true
```

### 2. Create Pull Request Template

Check if `.github/pull_request_template.md` already exists.
- If it exists, ask the user: "pull_request_template.md already exists. Overwrite or skip?" and follow their choice
- If it does not exist, create it

### `.github/pull_request_template.md`

```markdown
## Summary

<!-- Brief description of what this PR does. -->

-

## Related Issue

<!-- Link the related issue. Use `Closes #XX` to auto-close on merge. -->

Closes #

## Changes

<!-- List the main changes. -->

-

## Test Plan

- [ ]

## Checklist

- [ ]
```

## Instructions

1. Always check each file for existence before creating it
2. Keep the branch prefix conventions consistent across all templates
