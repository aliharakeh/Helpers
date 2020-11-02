import os

UPPER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
LETTERS_AND_SPACE = UPPER_LETTERS + UPPER_LETTERS.lower() + ' \t\n'
DICTIONARY_DIR = os.path.dirname(__file__)


class EnglishDetection:
    ENGLISH_WORDS = {}

    def __init__(self):
        self.load_dictionary()

    @classmethod
    def load_dictionary(cls):
        cls.ENGLISH_WORDS = {}
        with open(f'{DICTIONARY_DIR}\\dictionary.txt') as dictionary_file:
            for word in dictionary_file.read().split('\n'):
                cls.ENGLISH_WORDS[word] = None

    @classmethod
    def get_english_count(cls, text):
        if not cls.ENGLISH_WORDS:
            cls.load_dictionary()

        text = text.upper()
        text = cls.remove_non_letters(text)
        possible_words = text.split()
        indexes = []

        if not possible_words:
            return 0, []  # No words at all, so return 0.0

        matches = 0
        for index, word in enumerate(possible_words):
            if word in cls.ENGLISH_WORDS:
                matches += 1
                indexes.append(index)
        return matches / len(possible_words), indexes

    @staticmethod
    def remove_non_letters(text):
        letters_only = []
        for symbol in text:
            if symbol in LETTERS_AND_SPACE:
                letters_only.append(symbol)
        return ''.join(letters_only)

    @classmethod
    def detect_english(cls, text, words_percentage=50, letters_percentage=80):
        # By default, 20% of the words must exist in the dictionary file, and
        # 85% of all the characters in the text must be letters or spaces
        # (not punctuation or numbers).
        if not text:
            return False

        if not cls.ENGLISH_WORDS:
            cls.load_dictionary()

        words_match = cls.get_english_count(text)[0] * 100 >= words_percentage
        num_letters = len(cls.remove_non_letters(text))
        text_letters_percentage = float(num_letters) / len(text) * 100
        letters_match = text_letters_percentage >= letters_percentage
        return words_match and letters_match


if __name__ == '__main__':
    text = 'hello, how are you?'
    print(EnglishDetection.detect_english(text))  # True
    text = 'sho 2ztez kefak hello there'
    print(EnglishDetection.detect_english(text))  # False
