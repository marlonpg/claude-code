extends Control

func _ready():
	# Setup main menu buttons
	pass

func _on_quick_play_pressed():
	# Navigate to gameplay scene
	$GameState.reset_session("quick")
	get_tree().change_scene_to_file("res://scenes/GamePlay.tscn")

func _on_timed_challenge_pressed():
	# Navigate to timed challenge mode
	$GameState.reset_session("timed")
	get_tree().change_scene_to_file("res://scenes/GamePlay.tscn")

func _on_daily_challenge_pressed():
	# Navigate to daily challenge mode
	$GameState.reset_session("daily")
	get_tree().change_scene_to_file("res://scenes/GamePlay.tscn")

func _on_leaderboard_pressed():
	# Navigate to leaderboard scene
	get_tree().change_scene_to_file("res://scenes/Leaderboard.tscn")

func _on_settings_pressed():
	# Navigate to settings scene
	get_tree().change_scene_to_file("res://scenes/Settings.tscn")