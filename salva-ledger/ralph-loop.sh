#!/bin/bash
# =============================================================================
# Ralph Loop — Agentic loop for Claude Code
# Calls Claude Code in a loop, tracking progress until all tasks are done.
# =============================================================================

set -euo pipefail

# --- Config ---
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://192.168.1.14:11435
export ANTHROPIC_API_KEY=""
MODEL="qwen3-coder"
MAX_ITERATIONS=20
PROGRESS_FILE="salva-ledger/progress.txt"
PRD_FILE="salva-ledger/PRD.md"

# --- Task List (from PRD Phase 1 & 2 MVP) ---
TASKS=(
  "Phase1: Setup Spring Boot 3.4.x project with Java 21, PostgreSQL, Flyway, Spring Security JWT in salva-ledger/backend/"
  "Phase1: Create JPA entities for Service, Veterinarian, Driver, Expense, BusinessSettings with all fields from PRD"
  "Phase1: Create Spring Data JPA repositories for all entities"
  "Phase1: Implement Service CRUD REST API with pagination"
  "Phase1: Implement profit/tax calculation logic server-side (netProfit = totalAmount - vetCost - driverCost - extraCost - taxAmount)"
  "Phase1: Implement Veterinarian and Driver CRUD REST API"
  "Phase1: Implement Expense CRUD REST API with category filtering"
  "Phase1: Add Flyway migration scripts for all tables and indexes"
  "Phase1: Implement JWT authentication endpoints (login, register)"
  "Phase1: Add Dashboard aggregation endpoint (monthly income, expenses, profit, pending/completed counts)"
  "Phase2: Finish React + Vite + TypeScript + TailwindCSS frontend setup in salva-ledger/frontend/"
  "Phase2: Build mobile-first layout system with navigation"
  "Phase2: Implement Login page with JWT auth"
  "Phase2: Build Service list screen with infinite scroll and status badges"
  "Phase2: Build Create/Edit Service form with real-time calculation preview"
  "Phase2: Build Expense list and create/edit screens"
  "Phase2: Build Dashboard screen with summary cards (income, expenses, profit)"
  "Phase2: Connect all frontend screens to backend API using React Query"
)

# --- Functions ---

get_completed_tasks() {
  if [[ -f "$PROGRESS_FILE" ]]; then
    local count
    count=$(grep -c "^DONE:" "$PROGRESS_FILE" 2>/dev/null) || true
    echo "${count:-0}"
  else
    echo 0
  fi
}

get_next_task() {
  local completed
  completed=$(get_completed_tasks)
  if [[ $completed -ge ${#TASKS[@]} ]]; then
    echo ""
  else
    echo "${TASKS[$completed]}"
  fi
}

build_prompt() {
  local task="$1"
  local iteration="$2"
  local completed
  completed=$(get_completed_tasks)
  local total=${#TASKS[@]}

  local progress_context=""
  if [[ -f "$PROGRESS_FILE" && -s "$PROGRESS_FILE" ]]; then
    progress_context=$(cat "$PROGRESS_FILE")
  fi

  cat <<EOF
You are implementing the Vet Transport Ledger SPA project.
Read the full PRD at: $PRD_FILE

PROGRESS SO FAR ($completed/$total tasks done):
$progress_context

YOUR CURRENT TASK (iteration $iteration):
$task

INSTRUCTIONS:
1. Read the PRD for full context on entities, fields, business rules.
2. Implement ONLY the current task described above.
3. Write clean, production-quality code.
4. When done, append a line to $PROGRESS_FILE:
   DONE: <task description> | <brief summary of what was created/changed>
5. If the task depends on something not yet built, create stubs/interfaces.
6. Do NOT skip steps. Do NOT modify unrelated code.
7. Commit your changes with a clear message.
EOF
}

# --- Main Loop ---

echo "========================================="
echo "  Ralph Loop — Vet Transport Ledger"
echo "========================================="
echo "Total tasks: ${#TASKS[@]}"
echo "Max iterations: $MAX_ITERATIONS"
echo ""

# Ensure progress file exists
touch "$PROGRESS_FILE"

for ((i=1; i<=MAX_ITERATIONS; i++)); do
  task=$(get_next_task)

  if [[ -z "$task" ]]; then
    echo ""
    echo "==========================================="
    echo "  ALL TASKS COMPLETE! ($i iterations used)"
    echo "==========================================="
    cat "$PROGRESS_FILE"
    exit 0
  fi

  completed=$(get_completed_tasks)
  total=${#TASKS[@]}

  echo "-------------------------------------------"
  echo "  Iteration $i | Task $((completed+1))/$total"
  echo "  $task"
  echo "-------------------------------------------"

  prompt=$(build_prompt "$task" "$i")

  # Call Claude Code
  claude --model "$MODEL" --dangerously-skip-permissions --print "$prompt"

  # Check if task was marked done
  new_completed=$(get_completed_tasks)
  if [[ $new_completed -le $completed ]]; then
    echo ""
    echo "WARNING: Task was not marked as DONE in $PROGRESS_FILE"
    echo "Appending task completion manually..."
    echo "DONE: $task | completed in iteration $i" >> "$PROGRESS_FILE"
  fi

  echo ""
  echo "  Task completed. Moving to next..."
  echo ""

  # Brief pause between iterations
  sleep 2
done

echo ""
echo "==========================================="
echo "  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
echo "  Completed: $(get_completed_tasks)/${#TASKS[@]} tasks"
echo "==========================================="
cat "$PROGRESS_FILE"
exit 1
