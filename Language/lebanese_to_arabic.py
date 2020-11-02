from Language.language_config import LB_SINGLES, LB_DOUBLES, SPACES, remove_non_letters
from Language.language_utils import LanguageUtil


class LebaneseToArabic:

    def __init__(self, lang_util=None):
        self.lang_util = lang_util if lang_util else LanguageUtil()

    def map_lb_to_ar(self, lb_text):
        lb_text = remove_non_letters(lb_text)
        size = len(lb_text)
        i = 0
        ar_text = ''
        while i < size:
            # double letters check
            double = lb_text[i: i + 2]
            if double in LB_DOUBLES:
                ar_text += LB_DOUBLES[double]
                i += 2
                continue
            # single letter check
            if lb_text[i] in LB_SINGLES:
                ar_text += LB_SINGLES[lb_text[i]]
            # keep spaces
            elif lb_text[i] in SPACES:
                ar_text += lb_text[i]
            i += 1
        return ar_text

    def lb_to_ar(self, text):
        arabic = self.map_lb_to_ar(text)
        correction = self.lang_util.translate(arabic)['correction']
        if correction:
            return correction
        return arabic
