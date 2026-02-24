extends Control

@onready var required_letter_label = $MarginContainer/VBoxContainer/RequiredLetter
@onready var word_input = $MarginContainer/VBoxContainer/WordInput
@onready var submit_button = $MarginContainer/VBoxContainer/SubmitButton
@onready var timer_label = $MarginContainer/VBoxContainer/Timer
@onready var score_label = $MarginContainer/VBoxContainer/Score
@onready var chain_history = $MarginContainer/VBoxContainer/ChainHistory
@onready var feedback_label = $MarginContainer/VBoxContainer/Feedback

func _ready():
	# Initialize game
	$GameState.reset_session("timed")
	update_ui()

func update_ui():
	# Update UI elements with current game state
	required_letter_label.text = "Required letter: " + get_required_letter()
	score_label.text = "Score: " + str($GameState.score)
	timer_label.text = "Time: " + str($GameState.time_remaining)

	# Update chain history display
	var history_text = ""
	for i in range($GameState.current_chain.size()):
		history_text += $GameState.current_chain[i] + "\n"
	chain_history.text = history_text

func get_required_letter():
	# Get the last letter of the last word in the chain
	if $GameState.current_chain.size() > 0:
		var last_word = $GameState.current_chain[-1]
		return last_word.right(1).to_upper()
	else:
		# For first word, return a random letter
		var letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
		return letters[randi() % letters.size()]

func _on_submit_button_pressed():
	var word = word_input.text.strip_edges()
	if word.length() > 0:
		var result = $GameState.submit_word(word)
		if result.success:
			# Word accepted
			feedback_label.text = "Good! +" + str(result.points) + " points"
			feedback_label.modulate = Color.GREEN
		else:
			# Word rejected
			feedback_label.text = "Invalid: " + result.error
			feedback_label.modulate = Color.RED
		word_input.text = ""
		update_ui()
	else:
		feedback_label.text = "Please enter a word"
		feedback_label.modulate = Color.RED

func _process(delta):
	# Handle timer for timed mode
	if $GameState.current_mode == "timed":
		$GameState.time_remaining -= delta
		if $GameState.time_remaining <= 0:
			$GameState.time_remaining = 0
			$GameState.end_session()
			# Return to main menu or show game over
			get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")
		update_ui()