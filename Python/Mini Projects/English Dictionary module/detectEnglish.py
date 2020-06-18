UPPERLETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
LETTERS_AND_SPACE = UPPERLETTERS + UPPERLETTERS.lower() + ' \t\n'

def load_dictionary():
    dictionary_file = open('dictionary.txt')
    english_words = {}
    for word in dictionary_file.read().split('\n'):
        english_words[word] = None
    dictionary_file.close()
    return english_words

ENGLISH_WORDS = load_dictionary()


def get_english_count(text):
    text = text.upper()
    text = remove_non_letters(text)
    possible_words = text.split()

    if possible_words == []:
        return 0.0 # No words at all, so return 0.0

    matches = 0
    for word in possible_words:
        if word in ENGLISH_WORDS:
            matches += 1
    return float(matches) / len(possible_words)


def remove_non_letters(text):
    letters_only = []
    for symbol in text:
        if symbol in LETTERS_AND_SPACE:
            letters_only.append(symbol)
    return ''.join(letters_only)


def detect_English(text, words_percentage=20, letters_percentage=85):
    # By default, 20% of the words must exist in the dictionary file, and
    # 85% of all the characters in the text must be letters or spaces
    # (not punctuation or numbers).
    words_match = get_english_count(text) * 100 >= words_percentage
    num_letters = len(remove_non_letters(text))
    text_letters_percentage = float(num_letters) / len(text) * 100
    letters_match = text_letters_percentage >= letters_percentage
    return words_match and letters_match

# in case you want to run the file and not import it
if __name__ == '__main__':
    text = input("Enter english text here --> ")
    print("The result of isEnglish() is =", detect_English(text))
    input()
