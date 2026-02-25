# Word Chain Game

A word chain game built with Godot 4.x.

## Project Structure

- `scenes/` - Scene files (MainMenu.tscn, GamePlay.tscn, etc.)
- `scripts/` - GDScript files
  - `autoload/` - Autoload scripts that are loaded at startup
  - `scenes/` - Scene-specific scripts
  - `services/` - Service scripts
  - `tools/` - Utility tools
- `data/` - Game data files including dictionaries
- `assets/` - Game assets (images, sounds, etc.)

## Fixes Applied

1. **Fixed missing DictionaryService**: Created the missing `res://scripts/autoload/dictionary_service.gd` file that was referenced in project.godot
2. **Fixed MainMenu.tscn parse error**: Corrected the invalid tag format in the scene file
3. **Added dictionary files**: Created the required `res://data/dictionary_en_5000.txt` and `res://data/dictionaries/default.txt` files

## Features Implemented

1. **Project Setup** - Folder structure and basic configuration
2. **Game State Manager** - Central source of truth for session state
3. **Dictionary Service** - Local word lookup and validation (using dictionary_en_5000.txt)
4. **Save System** - Local persistence for progress and settings
5. **Achievements System** - Basic achievement tracking
6. **Main Menu** - Entry point for game modes
7. **Gameplay Scene** - Core gameplay interface with chain validation and scoring
8. **Leaderboard** - Display of high scores
9. **Settings** - Configuration options

## Next Steps

The core gameplay mechanics are now implemented. The following tasks still need to be completed:
- Complete UI for all scenes (visual polish)
- Implement daily challenge generator (Task 2.3)
- Add haptic feedback and Android UX improvements (Task 4.1)
- Performance optimization (Task 4.2)
- Android build pipeline (Task 4.3)