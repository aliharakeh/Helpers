# Special Characters
SPACES = ' \t\n'
PROBLEM_CHARS = '[]=+/&<>;:!\\|*^\'"?%$#@)(_,.\t\r\n0-9-—'

# Arabic Language
AR_REGEX = '[\u0621-\u064A]+'
AR_LETTERS = 'ابتثجحخدذرزسشصضطظعغفقكلمنهويء'

# English Language
EN_LETTERS = 'abcdefghijklmnopqrstuvwxyz'

# Lebanese Language
LB_LETTERS = EN_LETTERS + '23578' + SPACES
LB_SINGLES = {
    'a': 'ا',
    'b': 'ب',
    't': 'ت',
    'g': 'ج',
    'j': 'ج',
    'd': 'د',
    'z': 'ز',
    'r': 'ر',
    's': 'س',
    'f': 'ف',
    'q': 'ق',
    'k': 'ك',
    'l': 'ل',
    'm': 'م',
    'n': 'ن',
    'h': 'ه',
    'o': 'و',
    'w': 'و',
    'y': 'ي',
    'e': 'ي',
    'i': 'ي',
    '2': 'ا',
    '3': 'ع',
    '5': 'خ',
    '7': 'ح',
    '8': 'غ'
}
LB_DOUBLES = {
    'aa': 'ع',
    'th': 'ث',
    'sh': 'ش',
    'sa': 'ص',
    'da': 'ض',
    'ta': 'ط',
    'fa': 'ف',
    '2e': 'ء',
    'eh': 'اي',
    'en': 'ين',
    'll': 'لا'
}


def remove_non_letters(string):
    letters_only = []
    for char in string:
        if char in LB_LETTERS:
            letters_only.append(char)
    return ''.join(letters_only)
