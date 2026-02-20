extends Node2D

@export var jump_force := 200.0
@export var gravity := 500.0
@export var ground_level := 300.0
@export var frog_size := Vector2(36, 28)

var velocity := Vector2.ZERO
var is_jumping := false

func _process(delta):
	# Apply gravity
	velocity.y += gravity * delta

	# Update position
	position += velocity * delta

	# Check if frog is on ground
	if position.y >= ground_level:
		position.y = ground_level
		velocity.y = 0
		is_jumping = false

	queue_redraw()

func jump():
	if not is_jumping:
		velocity.y = -jump_force
		is_jumping = true

func get_hitbox() -> Rect2:
	return Rect2(position - frog_size * 0.5, frog_size)

func _draw():
	var radius: float = minf(frog_size.x, frog_size.y) * 0.5
	draw_circle(Vector2.ZERO, radius, Color(0.3, 0.85, 0.35))
