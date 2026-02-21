# Pixel Frog Game

A simple pixel-style frog jumping game created in Godot.

## Game Description
You control a frog that jumps over incoming leaves. Touching a leaf ends the run.

## Controls
- Press `SPACE` (default `ui_accept`) to jump
- Press `R` to restart after game over

## Features
- Frog movement with gravity and jumping physics
- Leaves that move in from the right
- Score increases when you successfully pass a leaf
- Game over + restart flow
- Built-in procedural visuals (no external sprite assets required)

## Files
- `main.tscn` - Main game scene
- `frog.gd` - Frog character script with physics
- `leaf.gd` - Leaf movement script
- `game.gd` - Main game logic

## How to Play
1. Run the main scene in Godot
2. Press `SPACE` to make the frog jump
3. Avoid colliding with leaves
4. Try to get the highest score possible!

## Technical Details
- Uses custom hitboxes for collision detection
- Leaves spawn at regular intervals
- Frog has gravity and jumping mechanics
- Score increases when leaves move past the frog

## Troubleshooting
If you're having issues running the game:
1. Make sure scene/script file paths in the project are valid
2. In Godot editor, set `main.tscn` as the main scene
3. Make sure the Frog node in main.tscn has `frog.gd` attached as its script
4. The game uses `ui_accept` action for jumping (default: SPACE/ENTER)