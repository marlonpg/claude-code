extends Node2D

@export var spawn_rate := 1.5
@export var ground_level := 300.0

var frog: Node2D
var score_label: Label
var status_label: Label
var leaf_scene = preload("res://leaf.tscn")
var score := 0
var game_over := false
var spawn_timer := 0.0

func _ready():
	frog = $Frog
	score_label = $CanvasLayer/ScoreLabel
	status_label = $CanvasLayer/StatusLabel
	frog.set("ground_level", ground_level)
	update_ui()

	# Spawn first leaf
	spawn_leaf()

func _process(delta):
	if game_over:
		if Input.is_key_pressed(KEY_R):
			restart_game()
		return

	spawn_timer += delta

	# Spawn new leaves at intervals
	if spawn_timer >= spawn_rate:
		spawn_leaf()
		spawn_timer = 0

	# Handle jump input
	if Input.is_action_just_pressed("ui_accept"):
		frog.call("jump")

	# Check for collisions
	check_collisions()
	update_score()
	update_ui()

func spawn_leaf():
	var leaf = leaf_scene.instantiate()
	leaf.position.x = 800  # Start off-screen to the right
	leaf.position.y = ground_level - 50  # Slightly above ground level
	add_child(leaf)

func check_collisions():
	var frog_rect: Rect2 = frog.call("get_hitbox")

	for leaf in get_tree().get_nodes_in_group("leaves"):
		var leaf_rect: Rect2 = leaf.call("get_hitbox")

		if frog_rect.intersects(leaf_rect):
			# Collision detected - game over
			game_over = true
			status_label.text = "Game Over! Press R to restart"
			print("Game Over! Score: ", score)
			return

func update_score():
	for leaf in get_tree().get_nodes_in_group("leaves"):
		if not leaf.counted and leaf.position.x < frog.position.x:
			leaf.counted = true
			score += 1

func restart_game():
	for leaf in get_tree().get_nodes_in_group("leaves"):
		leaf.queue_free()

	frog.position = Vector2(100, ground_level)
	frog.call("set", "velocity", Vector2.ZERO)
	frog.call("set", "is_jumping", false)

	score = 0
	spawn_timer = 0.0
	game_over = false
	status_label.text = "Press Space to jump"
	spawn_leaf()
	update_ui()

func update_ui():
	score_label.text = "Score: %d" % score
