extends Node

# Test scene to verify project structure
func _ready():
	print("Word Chain Game Project Structure Initialized")
	print("Folders created:")
	print("- scenes/")
	print("- scripts/")
	print("- assets/")
	print("- data/")
	print("- ui/")
	print("- tests/")
	print("- docs/")
	print("Singletons:")
	print("- GameState (autoload)")
	print("- DictionaryService (autoload)")
	print("- SaveService (autoload)")
	print("- Achievements (autoload)")