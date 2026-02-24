extends Node

# Save service for persisting game data
# This is an autoload singleton

var save_file = "user://savegame.json"

func _ready():
	pass

func save_game():
	var save_data = {
		"schema_version": 1,
		"high_scores": {
			"timed": [],
			"daily": []
		},
		"settings": {
			"vibration_enabled": true,
			"sound_enabled": true
		},
		"daily_completion": {},
		"achievements": {}
	}

	var file = FileAccess.open(save_file, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(save_data, "\t"))
		file.close()
	else:
		print("Error: Could not save game data")

func load_game():
	var file = FileAccess.open(save_file, FileAccess.READ)
	if file != null:
		var content = file.get_as_text()
		file.close()
		var data = JSON.parse_string(content)
		if data != null:
			return data
	return null