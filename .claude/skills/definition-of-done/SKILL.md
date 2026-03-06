---
name: definition-of-done
description: >
  Automated Definition of Done checker for GolfNext internal tools. Runs build, tests, and lint
  automatically, then walks through the remaining manual checklist items.
  Use this skill when finishing a feature, completing a task, wrapping up work, preparing to merge,
  or any time the user says "done", "finished", "ready to merge", "is this ready", "ship it",
  "check if everything passes", "run the checklist", "DoD", "definition of done", or asks whether
  their code is ready for review or deployment.
---

# Definition of Done — GolfNext Internal Tools

This skill runs the GolfNext Definition of Done checklist. It automates what can be automated
(build, tests, lint) and prompts the user for the rest.

A task is not done until every item passes.

## How to Use

Run this skill when you've finished building a feature or fixing a bug and want to verify
everything is ready. It will check your code automatically and tell you what passed and what
needs attention.

## Step 1: Automated Checks

Run these three commands in order. If any fails, stop and fix the issue before continuing.

### 1.1 TypeScript Build

```bash
npm run build
```

**What it checks:** The entire project compiles with zero TypeScript errors. This catches type
mismatches, missing imports, and structural issues that would break in production.

**If it fails:** Read the error output carefully. Common issues: missing type annotations (add
explicit return types), `any` types (replace with proper types), and import paths that don't
resolve (check file names and exports).

### 1.2 Tests

```bash
npm run test
```

**What it checks:** All unit tests and component tests pass, including any new tests you wrote
for this feature.

**If it fails:** A failing test means either the code has a bug or the test needs updating.
Read the test name and assertion to understand what's expected. Fix the code first — only update
the test if the expected behavior has intentionally changed.

### 1.3 Linting

```bash
npm run lint
```

**What it checks:** Code style and common mistakes. ESLint catches unused variables, missing
dependencies in hooks, accessibility issues in JSX, and other patterns that lead to bugs.

**If it fails:** Most lint errors have auto-fixes. Run `npm run lint -- --fix` to apply them,
then review the changes. For errors that can't be auto-fixed, read the rule name and fix
manually.

## Step 2: Automated Check Report

After running the three commands, generate a summary:

```
┌─────────────────────────────────────────────┐
│           Definition of Done Report          │
├──────────────────┬──────────────────────────┤
│ TypeScript Build │ ✅ PASS / ❌ FAIL        │
│ Tests            │ ✅ PASS (X/Y) / ❌ FAIL  │
│ Lint             │ ✅ PASS / ❌ FAIL        │
└──────────────────┴──────────────────────────┘
```

If any automated check fails, address the failures before proceeding to the manual checklist.

## Step 3: Manual Checklist

These items require human judgment. Go through each one:

### 3.1 Business Logic Tests

**Question:** Does the new or changed code include calculations, data transformations, or
decision logic? If yes, are there unit tests covering it?

This goes beyond "do tests pass" — it asks whether the *right* tests exist. A passing test
suite is meaningless if the critical business logic isn't tested.

### 3.2 Environment Variables

**Question:** Were any new environment variables added? If yes:
- Are they documented in `.env.example` with a comment explaining their purpose?
- Are secrets (API keys, service role keys) kept out of `NEXT_PUBLIC_` prefixed variables?

Check by running:
```bash
grep -r "process.env" src/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

Compare the result against `.env.example` to spot any undocumented variables.

### 3.3 README

**Question:** Has the tool's functionality changed in a way that affects how someone would use
it or set it up? If yes, is the README updated?

Things that warrant a README update: new features, changed setup steps, new dependencies,
changed environment variables, new API endpoints.

### 3.4 Deployment Verification

**Question:** Has the Vercel preview deployment been checked? Open the preview URL from the
pull request and manually verify that the feature works as expected in the deployed environment.

Local development can hide issues that only appear in production: missing environment variables,
different Node.js versions, serverless function timeouts.

### 3.5 Portal Registration (New Tools Only)

**Question:** Is this a brand new tool? If yes, has it been registered in the GolfNext Portal's
app registry with a name, description, category, icon, and URL?

Skip this step for changes to existing tools.

### 3.6 Code Review

**Question:** Has the code been reviewed?

- **For developers:** Another team member has reviewed the pull request on GitHub.
- **For vibe coders:** The feature-dev plugin's quality review phase (Phase 6) was completed
  during development.

## Step 4: Final Summary

After all checks, generate the complete report:

```
┌─────────────────────────────────────────────┐
│       Definition of Done — Final Report      │
├──────────────────┬──────────────────────────┤
│ AUTOMATED CHECKS                             │
├──────────────────┬──────────────────────────┤
│ TypeScript Build │ ✅ / ❌                   │
│ Tests            │ ✅ / ❌                   │
│ Lint             │ ✅ / ❌                   │
├──────────────────┼──────────────────────────┤
│ MANUAL CHECKLIST                             │
├──────────────────┬──────────────────────────┤
│ Business logic   │ ✅ / ❌ / ⏭️ N/A         │
│ Env vars         │ ✅ / ❌ / ⏭️ N/A         │
│ README           │ ✅ / ❌ / ⏭️ N/A         │
│ Deploy verified  │ ✅ / ❌                   │
│ Portal registered│ ✅ / ⏭️ N/A (existing)   │
│ Code reviewed    │ ✅ / ❌                   │
├──────────────────┼──────────────────────────┤
│ RESULT           │ ✅ READY / ❌ NOT READY   │
└──────────────────┴──────────────────────────┘
```

If everything passes: the task is done. Merge to `main`.

If anything fails: list the specific items that need attention and help the user fix them.
