import os

DIR = os.path.dirname(__file__)

AR_WORDS = None
EN_WORDS = None


def load_arabic(file=f'{DIR}\\1M_arabic_words.txt'):
    global AR_WORDS
    if AR_WORDS is None:
        with open(file, encoding='utf-16') as file:
            AR_WORDS = set(file.read().split('\n'))


def load_english(file=f'{DIR}\\english_words.txt'):
    global EN_WORDS
    if EN_WORDS is None:
        with open(file, encoding='utf-8') as file:
            EN_WORDS = set(file.read().split('\n'))


def is_arabic(word):
    load_arabic()
    return word.strip().lower() in AR_WORDS


def is_english(word):
    load_english()
    return word.strip().upper() in EN_WORDS


if __name__ == '__main__':
    print(is_english('hello'))
    print(is_arabic('مرحبا'))
