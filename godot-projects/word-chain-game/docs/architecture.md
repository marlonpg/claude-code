# Word Chain Game Architecture

## Scene Graph
- MainMenu.tscn
- GamePlay.tscn
- Leaderboard.tscn
- Settings.tscn

## Singletons
- GameState (autoload)
- DictionaryService (autoload)
- SaveService (autoload)

## Naming Conventions
- Scripts: snake_case.gd
- Scenes: PascalCase.tscn
- Variables: snake_case
- Functions: snake_case

## Save Data Schema v1
{
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