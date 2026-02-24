extends Node

# Achievement system for the game
# This is an autoload singleton

var unlocked_achievements = []

func check_and_unlock_achievement(achievement_name):
	# Check if achievement should be unlocked and unlock it
	if not unlocked_achievements.has(achievement_name):
		unlocked_achievements.append(achievement_name)
		print("Achievement unlocked: " + achievement_name)
		return true
	return false

func is_achievement_unlocked(achievement_name):
	return unlocked_achievements.has(achievement_name)

func _ready():
	# Load achievements from save file
	pass