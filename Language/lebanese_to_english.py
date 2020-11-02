from Language.language_utils import LanguageUtil
from Language.lebanese_to_arabic import LebaneseToArabic
from difflib import SequenceMatcher
import json
import os

DIR = os.path.dirname(__file__)


class LebaneseToEnglish:
    lb_en_dict = None
    lb_words = None

    def __init__(self, lang_util=None):
        self.lang_util = lang_util if lang_util else LanguageUtil()
        self._load_data()
        self.lb_ar = LebaneseToArabic(self.lang_util)

    @classmethod
    def _load_data(cls):
        with open(f'{DIR}\\lb_en.json') as f:
            data = json.loads(f.read())
        cls.lb_en_dict = data
        cls.lb_words = list(data.keys())

    @classmethod
    def search_word(cls, word, accepted_ratio=80):
        word = word.lower()
        best_match = (None, 0)
        if word in cls.lb_en_dict:
            best_match = (word, 100)
        else:
            for lb_word in cls.lb_words:
                similarity = SequenceMatcher(None, lb_word, word).ratio() * 100
                if not best_match[0] or similarity >= best_match[1]:
                    best_match = (lb_word, similarity)
                    if similarity >= accepted_ratio:
                        break
        return {
            'searched': word,
            'matched_lb': best_match[0],
            'matched_en': cls.lb_en_dict.get(best_match[0], None),
            'similarity_percentage': best_match[1]
        }

    def lb_to_ar_to_en(self, text):
        return self.lang_util.translate(
            self.lb_ar.map_lb_to_ar(text),
            src_lang='ar',
            dest_lang='en',
            with_correction=True
        )['translation']

    def lb_to_en(self, text, accepted_similarity=80):
        words = text.lower().split()
        res = []
        for word in words:
            match = self.search_word(word)
            if match['similarity_percentage'] >= accepted_similarity:
                res.append(match['matched_en'])
            else:
                res.append(self.lb_to_ar_to_en(word))
        return " ".join(res)
