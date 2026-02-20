extends Node2D

@export var speed := 100.0
@export var leaf_size := Vector2(42, 18)

var counted := false

func _ready():
	add_to_group("leaves")

func _process(delta):
	# Move leaf to the left
	position.x -= speed * delta

	# Remove leaf if it goes off screen
	if position.x < -50:
		queue_free()

	queue_redraw()

func get_hitbox() -> Rect2:
	return Rect2(position - leaf_size * 0.5, leaf_size)

func _draw():
	draw_rect(Rect2(-leaf_size * 0.5, leaf_size), Color(0.15, 0.75, 0.2), true)