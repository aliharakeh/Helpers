from googletrans import Translator
from Scrapping.chrome import ChromeManager
import time


class ChromeTranslate:

    def __init__(self, headless=True):
        self._cm = ChromeManager(headless=headless)
        self._cm.load_page('https://translate.google.com/', '#source')

    def translate(self, text):
        self._cm.set_text('#source', text)
        time.sleep(3)
        return self._cm.get_text('span.tlid-translation.translation')

    def close(self):
        self._cm.close()

    def __del__(self):
        try:
            self.close()
        except:
            pass


class LanguageUtil:

    def __init__(self):
        self.translator = Translator()

    def quick_lang_detect(self, text):
        return self.translator.translate(text).src

    def translate(self, text, src_lang='auto', dest_lang='en', with_correction=False):
        translation = self.translator.translate(text, src=src_lang, dest=dest_lang)
        possible_mistakes = translation.extra_data.get('possible-mistakes', None)
        corrected_text = possible_mistakes[1] if possible_mistakes else None
        if with_correction and corrected_text:
            translation = self.translator.translate(corrected_text, src=src_lang, dest=dest_lang)
        return {
            'original': translation.origin,
            'correction': corrected_text,
            'translation': translation.text,
            'src_lang': translation.src,
            'dest_lang': translation.dest
        }

    def chrome_translate(self, text):
        t = ChromeTranslate()
        try:
            return {
                'original': text,
                'translated': t.translate(text),
                'src_lang': 'auto-detect',
                'dest_lang': 'en'
            }
        except:
            return {
                'original': text,
                'translated': None,
                'src_lang': None,
                'dest_lang': None
            }
        finally:
            t.close()
