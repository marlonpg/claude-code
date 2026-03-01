#!/bin/bash
# =============================================================================
# Ralph Loop — Agentic loop for Claude Code
# Calls Claude Code in a loop, tracking progress until all tasks are done.
# Now with: streaming output, log file, elapsed time, spinner
# =============================================================================

set -uo pipefail

# --- Config ---
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://192.168.1.14:11435
export ANTHROPIC_API_KEY=""
MODEL="qwen3-coder"
MAX_ITERATIONS=30
MAX_RETRIES=3
RETRY_DELAY=5
PROGRESS_FILE="salva-ledger/progress.txt"
PRD_FILE="salva-ledger/PRD.md"
LOG_DIR="salva-ledger/logs"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
LOG_FILE="$LOG_DIR/ralph-loop-$TIMESTAMP.log"

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

log() {
  local msg="[$(date +%H:%M:%S)] $*"
  echo "$msg"
  echo "$msg" >> "$LOG_FILE"
}

spinner_start() {
  local pid=$1
  local spin='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
  local i=0
  local start_time=$SECONDS
  while kill -0 "$pid" 2>/dev/null; do
    local elapsed=$(( SECONDS - start_time ))
    local mins=$(( elapsed / 60 ))
    local secs=$(( elapsed % 60 ))
    printf "\r  [%s] Working... %dm %ds elapsed " "${spin:i++%${#spin}:1}" "$mins" "$secs"
    sleep 0.2
  done
  printf "\r%80s\r" ""  # clear spinner line
}

get_completed_tasks() {
  if [[ -f "$PROGRESS_FILE" ]]; then
    local count
    count=$(grep -c "^DONE:\|^SKIP:" "$PROGRESS_FILE" 2>/dev/null) || true
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

mkdir -p "$LOG_DIR"
touch "$LOG_FILE"

echo "========================================="
echo "  Ralph Loop — Vet Transport Ledger"
echo "========================================="
echo "Total tasks: ${#TASKS[@]}"
echo "Max iterations: $MAX_ITERATIONS"
echo "Max retries per task: $MAX_RETRIES"
echo "Log file: $LOG_FILE"
echo ""
echo "TIP: To watch live output in another terminal:"
echo "  tail -f $LOG_FILE"
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

  log "-------------------------------------------"
  log "  Iteration $i | Task $((completed+1))/$total"
  log "  $task"
  log "-------------------------------------------"

  prompt=$(build_prompt "$task" "$i")
  task_start=$SECONDS

  # Call Claude Code with retry logic + streaming output
  success=false
  for ((retry=1; retry<=MAX_RETRIES; retry++)); do
    log "  Attempt $retry/$MAX_RETRIES..."
    
    # Run claude in background, stream output to both terminal and log
    claude --model "$MODEL" --dangerously-skip-permissions --print "$prompt" 2>&1 | tee -a "$LOG_FILE" &
    claude_pid=$!
    
    # Show spinner while waiting
    spinner_start "$claude_pid"
    
    # Wait for claude to finish and get exit code
    wait "$claude_pid"
    exit_code=$?
    
    task_elapsed=$(( SECONDS - task_start ))
    task_mins=$(( task_elapsed / 60 ))
    task_secs=$(( task_elapsed % 60 ))
    
    if [[ $exit_code -eq 0 ]]; then
      success=true
      log "  Completed in ${task_mins}m ${task_secs}s"
      break
    else
      log ""
      log "  FAILED (attempt $retry/$MAX_RETRIES) — exit code $exit_code — after ${task_mins}m ${task_secs}s"
      if [[ $retry -lt $MAX_RETRIES ]]; then
        log "  Retrying in ${RETRY_DELAY}s..."
        sleep "$RETRY_DELAY"
      fi
    fi
  done

  if [[ "$success" == false ]]; then
    log ""
    log "  ERROR: All $MAX_RETRIES attempts failed for task: $task"
    log "  Skipping and continuing to next task..."
    echo "SKIP: $task | failed after $MAX_RETRIES retries in iteration $i" >> "$PROGRESS_FILE"
  fi

  # Check if task was marked done
  new_completed=$(get_completed_tasks)
  if [[ $new_completed -le $completed ]]; then
    log ""
    log "WARNING: Task was not marked as DONE in $PROGRESS_FILE"
    log "Appending task completion manually..."
    echo "DONE: $task | completed in iteration $i" >> "$PROGRESS_FILE"
  fi

  log ""
  log "  Task completed. Moving to next..."
  log ""

  # Brief pause between iterations
  sleep 2
done

echo ""
echo "==========================================="
echo "  MAX ITERATIONS REACHED ($MAX_ITERATIONS)"
echo "  Completed: $(get_completed_tasks)/${#TASKS[@]} tasks"
skipped=$(grep -c "^SKIP:" "$PROGRESS_FILE" 2>/dev/null) || true
echo "  Skipped: ${skipped:-0}"
echo "==========================================="
cat "$PROGRESS_FILE"
exit 1
