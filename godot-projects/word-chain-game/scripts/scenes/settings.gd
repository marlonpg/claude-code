extends Control

func _ready():
	# Initialize settings UI
	pass

func _on_back_button_pressed():
	# Return to main menu
	get_tree().change_scene_to_file("res://scenes/MainMenu.tscn")