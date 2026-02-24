extends Node

# Central source of truth for session state
# This is an autoload singleton

var current_chain = []
var used_words = []
var score = 0
var time_remaining = 0
var current_mode = "timed" # "timed", "daily", "quick"

func reset_session(mode):
	current_mode = mode
	current_chain = []
	used_words = []
	score = 0
	time_remaining = 60 if mode == "timed" else 0

func submit_word(word):
	# Validate the word
	if not $DictionaryService.is_valid_word(word):
		return { "success": false, "error": "Not a valid word" }

	# Check if word was already used
	if used_words.has(word.to_lower()):
		return { "success": false, "error": "Word already used" }

	# Check if word starts with required letter
	if current_chain.size() > 0:
		var required_letter = current_chain[-1].right(1).to_lower()
		if word.left(1).to_lower() != required_letter:
			return { "success": false, "error": "Word doesn't start with required letter" }

	# Add word to chain
	current_chain.append(word)
	used_words.append(word.to_lower())

	# Calculate score (simple scoring: 1 point per letter)
	var points = word.length()
	score += points

	# Check for achievements
	if current_chain.size() >= 5:
		$Achievements.unlock_achievement("chain_5")
	if current_chain.size() >= 10:
		$Achievements.unlock_achievement("chain_10")

	# Unlock first word achievement if this is the first word
	if current_chain.size() == 1:
		$Achievements.unlock_achievement("first_word")

	# Return success
	return { "success": true, "points": points }

func end_session():
	# Check for perfect game achievement
	if current_chain.size() > 0 and used_words.size() == current_chain.size():
		$Achievements.unlock_achievement("perfect_game")

	# Save high score if needed
	if current_mode == "timed":
		$SaveService.save_game()

	# Reset session
	reset_session(current_mode)