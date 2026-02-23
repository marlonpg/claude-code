# Word Chain Puzzle — Godot (Android) Implementation Task Breakdown

This plan breaks your idea into small, Claude-executable tasks for an **offline-first Android app** built with **Godot 4.x**.

## Target Stack and Constraints
- Engine: Godot 4.x (GDScript)
- Platform: Android (primary), portrait mode
- Architecture: Scene-based + Autoload singletons
- Data: Local JSON + optional SQLite plugin later
- Offline-first: No required network for core gameplay
- MVP goal: Single-player chain gameplay + timed mode + local leaderboard + daily challenge seed

---

## Phase 0 — Project Setup (Foundation)

### Task 0.1 — Initialize Godot project for Android
**Goal:** Create clean Godot project with Android export-ready baseline.

**Implement:**
- Create folder structure:
  - `scenes/`
  - `scripts/`
  - `assets/`
  - `data/`
  - `ui/`
  - `tests/`
- Set project settings:
  - Portrait orientation
  - 60 FPS target
  - Fixed stretch mode for consistent mobile layout
- Configure Android export preset (debug + release placeholders)

**Acceptance criteria:**
- Project opens with no script errors
- Android export preset exists
- App launches to placeholder main menu on Android device/emulator

**Claude prompt:**
"Set up a Godot 4 Android project structure for a portrait word game, create initial folders and Android export preset instructions, and add a MainMenu scene as startup scene."

### Task 0.2 — Add coding conventions + architecture notes
**Goal:** Reduce rework and keep Claude changes consistent.

**Implement:**
- Add `docs/architecture.md` with scene graph, singleton list, naming conventions
- Define script naming rules (`snake_case.gd`, `PascalCase` scene names)
- Define save data schema v1

**Acceptance criteria:**
- Documentation includes clear module boundaries
- Save schema versioned (`schema_version: 1`)

---

## Phase 1 — Core Gameplay Loop

### Task 1.1 — Build game state manager (autoload)
**Goal:** Central source of truth for session state.

**Implement:**
- Create `scripts/autoload/game_state.gd`
- Track:
  - current_chain
  - used_words
  - score
  - time_remaining
  - current_mode
- Expose methods:
  - `reset_session(mode)`
  - `submit_word(word)`
  - `end_session()`

**Acceptance criteria:**
- Session can reset and start cleanly
- Submit flow updates chain and score or returns structured failure reason

### Task 1.2 — Implement chain validation rules
**Goal:** Enforce core word-chain mechanic.

**Implement:**
- Rule 1: First word can be any valid word
- Rule 2: Next word must start with previous word’s last letter
- Rule 3: Word cannot repeat in same session
- Rule 4: Minimum word length (e.g., 3)
- Normalize input (`trim`, lowercase, accent-safe strategy if needed)

**Acceptance criteria:**
- Validation returns machine-readable error codes:
  - `ERR_EMPTY`
  - `ERR_TOO_SHORT`
  - `ERR_NOT_IN_DICTIONARY`
  - `ERR_CHAIN_MISMATCH`
  - `ERR_DUPLICATE`

### Task 1.3 — Create scoring system v1
**Goal:** Reward speed and complexity with simple formula.

**Implement:**
- Base points by word length
- Bonus for streak (`n` consecutive valid submissions)
- Optional bonus for rare starting letters
- Add score event log for debugging

**Acceptance criteria:**
- Score deterministic for same input sequence
- Unit-like test scene verifies at least 10 score cases

### Task 1.4 — Build gameplay scene UI
**Goal:** Usable mobile gameplay screen.

**Implement:**
- Scene: `scenes/GamePlay.tscn`
- UI elements:
  - current required letter
  - text input
  - submit button
  - timer label
  - score label
  - chain history list
  - feedback toast/label for errors
- Keyboard-safe layout (avoid overlap with virtual keyboard)

**Acceptance criteria:**
- Can play full 60-second round on Android
- UI remains readable on 720p and 1080p portrait screens

---

## Phase 2 — Offline Dictionary + Daily Content

### Task 2.1 — Add dictionary loader service
**Goal:** Fast local word lookup.

**Implement:**
- Add `data/dictionary_en_5000.txt` (or JSON)
- Create `scripts/services/dictionary_service.gd`
- Build in-memory set/hash for O(1)-like lookup
- Precompute index by first letter for hinting/game modes

**Acceptance criteria:**
- Dictionary loads < 1.5s on mid-range Android
- Lookup function returns valid/invalid reliably

### Task 2.2 — Add dictionary tooling script
**Goal:** Keep dictionary clean and maintainable.

**Implement:**
- Script to normalize and deduplicate source words
- Enforce min length and allowed characters
- Generate final packed dictionary file

**Acceptance criteria:**
- Tool can regenerate dictionary from source file
- Output stable and reproducible

### Task 2.3 — Daily challenge generator (offline)
**Goal:** Repeatable daily puzzle without internet.

**Implement:**
- Seed from local date (`YYYYMMDD`)
- Generate constraints (start letter, time, optional banned letters)
- Store completion per day in save file

**Acceptance criteria:**
- Same date always yields same challenge
- New date yields different challenge

---

## Phase 3 — Menus, Progress, and Persistence

### Task 3.1 — Main menu + mode selection
**Goal:** Entry point for all game modes.

**Implement:**
- Scene: `scenes/MainMenu.tscn`
- Buttons:
  - Quick Play
  - Timed Challenge
  - Daily Challenge
  - Leaderboard
  - Settings

**Acceptance criteria:**
- Navigation works with no dead links
- Back navigation behaves correctly on Android

### Task 3.2 — Local save system
**Goal:** Persist progress and settings safely.

**Implement:**
- `scripts/services/save_service.gd`
- Save file content:
  - high scores per mode
  - settings
  - daily completion
  - achievements
- Atomic write pattern (temp file then swap)

**Acceptance criteria:**
- Data survives app restarts
- Corrupt file fallback resets gracefully and logs warning

### Task 3.3 — Local leaderboard view
**Goal:** Show top runs without backend.

**Implement:**
- Keep top N scores per mode (e.g., 20)
- Sort by score desc + date asc as tie-break
- Add `scenes/Leaderboard.tscn`

**Acceptance criteria:**
- New score insertion keeps ordering stable
- Clearing leaderboard available in Settings (with confirm)

### Task 3.4 — Achievements v1
**Goal:** Basic retention layer.

**Implement:**
- Add 3 achievements:
  - First Chain Completed
  - 20-Word Streak
  - Daily Challenge 7-Day Streak
- Unlock checks after each session event
- Display lightweight in-game notification

**Acceptance criteria:**
- Achievements unlock exactly once
- Unlock state persists across restarts

---

## Phase 4 — Android UX Hardening

### Task 4.1 — Mobile input and accessibility pass
**Goal:** Improve usability on touch screens.

**Implement:**
- Larger touch targets (>=48dp equivalent)
- High-contrast text styles via theme
- Haptic feedback on valid submit (if available)
- Optional vibration toggle in settings

**Acceptance criteria:**
- No overlapping controls on common portrait aspect ratios
- Input flow works smoothly with Android keyboard

### Task 4.2 — Performance and memory pass
**Goal:** Keep stable on low-mid Android devices.

**Implement:**
- Profile dictionary load and scene transitions
- Remove per-frame allocations in hot paths
- Pool reusable UI list items for chain history if needed

**Acceptance criteria:**
- Stable 55–60 FPS during gameplay
- No major memory spikes when loading dictionary

### Task 4.3 — Android build pipeline checklist
**Goal:** Repeatable release process.

**Implement:**
- Keystore handling notes (no secrets committed)
- Version code/name update checklist
- Release signing instructions
- Optional GitHub Action draft for export artifact

**Acceptance criteria:**
- Documented steps produce installable signed APK/AAB

---

## Phase 5 — Optional Multiplayer (Post-MVP)

### Task 5.1 — Local async “battle ghost” mode
**Goal:** Add competition feel without real-time backend.

**Implement:**
- Save session replays (word + timestamp)
- Player can challenge own best run “ghost” target score

**Acceptance criteria:**
- Ghost data loads and compares progress in-session

### Task 5.2 — Online multiplayer spike (defer)
**Goal:** Validate complexity before full implementation.

**Implement:**
- Draft architecture options (Firebase, Nakama, custom API)
- Estimate latency/anti-cheat implications

**Acceptance criteria:**
- Decision doc recommends one approach with effort estimate

---

## Suggested Implementation Order for Claude (small PR-style units)
1. Task 0.1
2. Task 1.1
3. Task 1.2
4. Task 2.1
5. Task 1.4
6. Task 1.3
7. Task 3.1
8. Task 3.2
9. Task 3.3
10. Task 2.3
11. Task 3.4
12. Task 4.1
13. Task 4.2
14. Task 4.3

---

## Definition of MVP Done
- User can install Android app and play timed word-chain rounds offline
- Word validation uses local dictionary and enforces chain rules
- Score is calculated and persisted to local leaderboard
- Daily challenge available offline and progress saved
- App has main menu, gameplay, leaderboard, settings
- No critical crash in 30-minute exploratory playtest on Android

---

## Ready-to-Use “Claude Task” Template
Use this template for each item above:

"Implement **Task X.Y - <task name>** in a Godot 4 project for Android.\
Constraints: keep changes minimal, preserve existing architecture, and include only files needed.\
Deliverables: (1) code changes, (2) brief explanation, (3) verification steps.\
Acceptance criteria:\
- <criterion 1>\
- <criterion 2>\
If unclear, choose the simplest implementation that satisfies criteria."
