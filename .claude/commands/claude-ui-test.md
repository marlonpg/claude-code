---
description: Run manual UI tests defined in a markdown file using Playwright, capture screenshots per step, and generate a report.
---

You are a UI test executor. The user provides a test definition file name as `$ARGUMENTS` (e.g., `salva-ui-tests.md`).

## Workflow

### Phase 1 — Parse the test file

1. Read the file at `ui-tests/$ARGUMENTS`.
2. If the file does not exist, tell the user and stop.
3. Parse the **Config** section to extract `base_url`, `viewport`, and any other settings.
4. Parse each **## Test:** block. Inside each test, parse every **### Step N** extracting:
   - `action` — what to do in the browser
   - `expected` — what the page should look like or contain

### Phase 2 — Prepare output folder

1. Generate a timestamp in the format `YYYY-MM-DD_HH-mm-ss` (current date/time).
2. The test name is `$ARGUMENTS` without the `.md` extension.
3. Create the screenshot output folder:
   ```bash
   mkdir -p "ui-tests/ss/<test_name>/<timestamp>"
   ```

### Phase 3 — Execute each test and step

For each **Test** block, and for each **Step** inside it:

1. **First, perform the action** described in the step using the Playwright Chrome CLI tool:
   ```bash
   node playwright-chrome-cli.js "<url>" --viewport <viewport> --title --console
   ```
   For interactions use the appropriate flags:
   - `--click <selector>` to click elements
   - `--type <selector> --text <value>` to type into fields
   - `--wait <ms>` to wait for dynamic content
   
   When the step says to click a link or button by its visible text (e.g., "Click the menu item 'Serviços'"), find the matching element on the page by its text content and use the appropriate CSS selector or text selector like `text=Serviços`.

2. **Then, AFTER the action completes, take the screenshot.** The screenshot must capture the resulting state of the page after the action, not before. Use the `--screenshot` flag:
   ```bash
   node playwright-chrome-cli.js "<url>" --click "<selector>" --wait 1000 --screenshot "ui-tests/ss/<test_name>/<timestamp>/<TestName>_step<N>.png"
   ```
3. Save the screenshot as:
   ```
   ui-tests/ss/<test_name>/<timestamp>/<TestName>_step<N>.png
   ```
   where `<TestName>` is the test title sanitized (spaces replaced with dashes, lowercase).
4. Analyze the screenshot and page state against the `expected` criteria.
5. Record the result for this step:
   - **PASS** — the expected condition is met
   - **FAIL** — the expected condition is NOT met (include what went wrong)
   - **WARN** — partially met or uncertain

### Phase 4 — Generate report

After all tests and steps are executed, create a Markdown report file at:
```
ui-tests/ss/<test_name>/<timestamp>/REPORT.md
```

The report must follow this structure:

```markdown
# UI Test Report: <test_name>
- **Date:** <timestamp>
- **Source:** ui-tests/$ARGUMENTS
- **Base URL:** <base_url>

## Summary
| Status | Count |
|--------|-------|
| PASS   | X     |
| FAIL   | Y     |
| WARN   | Z     |
| **Total** | **N** |

## Test: <Test Title>

### Step <N> — <step title>
- **Action:** <action>
- **Expected:** <expected>
- **Result:** PASS | FAIL | WARN
- **Screenshot:** [step screenshot](./<TestName>_step<N>.png)
- **Notes:** <any observations, error messages, or differences found>

(repeat for each step in the test)

(repeat for each test block)
```

### Phase 5 — Present results

1. Print the full report to the user.
2. If any step **FAILED**, highlight it clearly and suggest possible causes.
3. Tell the user where the screenshots and report are saved.

## Important Rules

- **Every single step** must get a screenshot — no exceptions.
- **Never skip a step** even if a previous step failed. Continue and document the failure.
- Use the Playwright CLI (`node playwright-chrome-cli.js`) for ALL browser interactions. Do not simulate results.
- If Playwright cannot perform an action (e.g., ambiguous selector), document it as WARN and describe the issue.
- Keep the browser open between steps within the same Test block using `--keep-open` when possible for efficiency.
- Always close the browser at the end of each Test block.
