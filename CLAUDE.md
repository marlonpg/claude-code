## ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_BASE_URL=http://192.168.1.14:11435 ANTHROPIC_API_KEY="" claude --model qwen3-coder --dangerously-skip-permissions "run /claude-ui-test salva-ui-tests.md"

## Launch Command
ANTHROPIC_AUTH_TOKEN=ollama ANTHROPIC_BASE_URL=http://192.168.1.14:11435 ANTHROPIC_API_KEY="" claude --model qwen3-coder

## Project Overview
This repo contains Claude Code skills for browser automation and UI testing using Playwright.

## Key Files
- `.claude/commands/playwright-chrome-skill.js` — Core Playwright browser skill class (screenshot, navigate, click, type)
- `.claude/commands/claude-ui-test.md` — Slash command for running full manual UI test suites
- `playwright-chrome-cli.js` — CLI entry point that wraps the skill for terminal usage
- `ui-tests/` — Folder containing manual test definition files (Markdown)
- `ui-tests/ss/` — Screenshot output and test reports

## Skills (Slash Commands)
- `/claude-ui-test <filename.md>` — Runs all tests defined in `ui-tests/<filename.md>`, takes screenshots of every step, and generates a REPORT.md

## Conventions
- Test definitions are Markdown files in `ui-tests/`
- Each test file has a **Config** section, **Test** blocks, and **Steps** with action/expected pairs
- Screenshots are saved to `ui-tests/ss/<test-name>/<timestamp>/`
- A REPORT.md is generated alongside screenshots after every run
- Always run `npm install` before first use