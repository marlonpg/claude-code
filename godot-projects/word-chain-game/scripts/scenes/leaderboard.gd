extends Control

func _ready():
	# Load and display leaderboard data
	load_leaderboard()

func load_leaderboard():
	# This would load high scores from save data
	# For now, just display a placeholder
	$Label.text = "Leaderboard\n\n(Not implemented yet)\n\nThis would show high scores from save data."

func _on_back_button_pressed():
	# Return to main menu
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")