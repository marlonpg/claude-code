extends Node

# Local save system for progress and settings
# This is an autoload singleton

var save_file_path = "user://savegame.json"

func save_game():
	var save_data = {
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

	var file = FileAccess.open(save_file_path, FileAccess.WRITE)
	if file != null:
		file.store_string(JSON.stringify(save_data))
		file.close()
	else:
		print("Error: Could not save game data")

func load_game():
	var file = FileAccess.open(save_file_path, FileAccess.READ)
	if file != null:
		var content = file.get_as_text()
		file.close()
		return JSON.parse_string(content)
	else:
		# Return default save data if file doesn't exist
		return {
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