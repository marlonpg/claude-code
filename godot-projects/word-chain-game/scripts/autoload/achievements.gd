extends Node

# Achievements system for tracking player progress
# This is an autoload singleton

var achievements = {
	"first_word": false,
	"chain_5": false,
	"chain_10": false,
	"perfect_game": false
}

func _ready():
	pass

func check_achievement(achievement_name):
	if achievements.has(achievement_name):
		return achievements[achievement_name]
	return false

func unlock_achievement(achievement_name):
	if achievements.has(achievement_name):
		achievements[achievement_name] = true
		# Save achievements
		$SaveService.save_game()