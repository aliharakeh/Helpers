from Language.language_config import PROBLEM_CHARS, LB_LETTERS
from Language.lang_detection.lang_words import is_arabic, is_english
import re


class BaseLang:
    def __init__(self, text):
        self.text = self.clean_text(text.lower())
        self.words = text.split()
        self.word_count = len(self.words)
        self.word_indexes = []

    def clean_text(self, text):
        return re.sub(rf'[{re.escape(PROBLEM_CHARS)}]+', '', text)

    def word_percentage(self):
        return 0

    def detect(self, accepted_percentage=80):
        return self.word_percentage() >= accepted_percentage

    def connect_indexes(self):
        if not self.word_indexes:
            return []
        if len(self.word_indexes) == 1:
            return [(self.word_indexes[0], self.word_indexes[0] + 1)]
        res = []
        curr_start = None
        curr_end = None
        for index in self.word_indexes:
            # first time
            if curr_start is None:
                curr_start = index
            # gap btw current end and index ==> save previous & update curr_start
            elif index != curr_end:
                res.append((curr_start, curr_end))
                curr_start = index
            # curr_end is the next sequentially index ([start:end] has `exclusive end` ==> [start:end+1] has `inclusive end`)
            curr_end = index + 1
        # last one curr_end == index ==> no save ==> save manually
        res.append((curr_start, curr_end))
        return res


class AR(BaseLang):

    def __init__(self, text):
        super().__init__(text)

    def is_arabic(self, word):
        return is_arabic(word)

    def word_percentage(self):
        ar_count = 0
        for index, word in enumerate(self.words):
            if self.is_arabic(word):
                ar_count += 1
                self.word_indexes.append(index)
        return (ar_count / self.word_count) * 100


class EN(BaseLang):

    def __init__(self, text):
        super().__init__(text)

    def is_english(self, word):
        return is_english(word)

    def word_percentage(self):
        en_count = 0
        for index, word in enumerate(self.words):
            if self.is_english(word):
                en_count += 1
                self.word_indexes.append(index)
        return (en_count / self.word_count) * 100


class LB(BaseLang):

    def __init__(self, text, ar=None, en=None):
        super().__init__(text)
        self.ar = ar if ar else AR(text)
        self.en = en if en else EN(text)

    def is_lebanese(self, word):
        word = word.lower()
        if not self.ar.is_arabic(word) and not self.en.is_english(word):
            for ch in word:
                if ch not in LB_LETTERS:
                    return False
            return True
        return False

    def word_percentage(self):
        lb_count = 0
        for index, word in enumerate(self.words):
            if self.is_lebanese(word):
                lb_count += 1
                self.word_indexes.append(index)
        return (lb_count / self.word_count) * 100


class LangDetector:
    def __init__(self, text):
        text = text.lower()
        self.ar = AR(text)
        self.en = EN(text)
        self.lb = LB(text, ar=self.ar, en=self.en)
        self.langs = [
            {'name': 'AR', 'class': self.ar},
            {'name': 'EN', 'class': self.en},
            {'name': 'LB', 'class': self.lb},
        ]

    def detect(self, accepted_percentage=80):
        for lang in self.langs:
            detected = lang['class'].detect(accepted_percentage)
            if detected:
                return lang['name']
        return None

    def lang_percentage(self):
        res = {
            'best_lang': None,
            'best_percentage': 0
        }
        for lang in self.langs:
            percentage = lang['class'].word_percentage()
            res[lang['name']] = percentage
            if percentage >= res['best_percentage']:
                res['best_percentage'] = percentage
                res['best_lang'] = lang['name']
        return res

    def lang_distribution(self):
        res = {}
        for lang in self.langs:
            res[lang['name']] = {
                'percentage': lang['class'].word_percentage(),
                'indexes': lang['class'].connect_indexes()
            }
        return res


if __name__ == '__main__':
    from pprint import pprint
    l = LangDetector('Hello Kefak salam hello yes no why eh')
    pprint(l.lang_distribution())
    pprint(l.lang_percentage())
