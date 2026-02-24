extends Node

# Dictionary tooling script for normalizing and generating dictionary files

func normalize_word(word):
	# Normalize word: trim, lowercase, remove special characters
	return word.strip_edges().to_lower()

func deduplicate_words(words_array):
	# Remove duplicates from array of words
	var unique_words = {}
	for word in words_array:
		unique_words[word] = true
	return unique_words.keys()

func generate_dictionary_file(input_file, output_file):
	# Generate final packed dictionary file from source
	print("Generating dictionary from " + input_file + " to " + output_file)
	# This would be implemented in Task 2.2
	pass