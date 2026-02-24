extends Node

# Dictionary service for word validation
# This is an autoload singleton

var dictionary = {}
var first_letter_index = {}

func _ready():
	load_dictionary()

func load_dictionary():
	# Load the full dictionary from file
	var file = FileAccess.open("res://data/dictionary_en_5000.txt", FileAccess.READ)
	if file != null:
		dictionary = {}
		first_letter_index = {}

		while not file.eof_reached():
			var word = file.get_line().strip_edges().to_lower()
			if word != "":
				dictionary[word] = true
				var first_letter = word.left(1)
				if not first_letter_index.has(first_letter):
					first_letter_index[first_letter] = []
				first_letter_index[first_letter].append(word)

		file.close()
	else:
		# Fallback to sample dictionary if file not found
		dictionary = {
			"cat": true,
			"dog": true,
			"elephant": true,
			"tiger": true,
			"rabbit": true,
			"bird": true,
			"fish": true,
			"horse": true,
			"snake": true,
			"zebra": true
		}

		# Precompute index by first letter
		first_letter_index = {}
		for word in dictionary:
			var first_letter = word.left(1).to_lower()
			if not first_letter_index.has(first_letter):
				first_letter_index[first_letter] = []
			first_letter_index[first_letter].append(word)

func is_valid_word(word):
	return dictionary.has(word.to_lower())

func get_words_by_first_letter(letter):
	if first_letter_index.has(letter):
		return first_letter_index[letter]
	return []