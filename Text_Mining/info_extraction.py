from nltk.corpus import stopwords
import pandas as pd

DIGITS = '0123456789'
BREAKS = ' \t\r\n'
SPECIAL_CHARS = '!?@#$%^&*()_-+=[]{}<>:;.,"\'|/\\'


class InfoExtraction:

    def __init__(self, df, text_column):
        self.df = df
        self.text_col = text_column

    def word_count(self):
        return self.df[self.text_col].apply(lambda s: len(str(s).split()))

    def char_count(self, include_space=True):
        if include_space:
            return self.df[self.text_col].str.len()
        return self.df[self.text_col].apply(lambda s: sum(len(w) for w in s.split()))

    def __avg_word_length(self, sentence):
        words = sentence.split()
        return sum(len(word) for word in words) // len(words)

    def average_word_length(self):
        return self.df[self.text_col].apply(lambda s: self.__avg_word_length(s))

    def stopwords_count(self, additional_stopwords=None):
        stop_words = set(stopwords.words('english'))
        if additional_stopwords:
            stop_words.update(additional_stopwords)
        return self.df[self.text_col].apply(lambda s: len([sw for sw in s.split() if sw in stop_words]))

    def special_chars_count(self):
        return self.df[self.text_col].apply(lambda s: len([c for c in s if c in SPECIAL_CHARS]))

    def numeric_count(self):
        return self.df[self.text_col].apply(lambda s: len([s for s in s.split() if s.isdigit()]))

    def most_frequent_words(self, limit=10):
        # join all text ==> split words ==> create a pd.Series ==> call Series.value_counts()
        return pd.Series((" ".join(self.df[self.text_col])).split()).value_counts()[:limit]

    def most_rare_words(self, limit=10):
        # join all text ==> split words ==> create a pd.Series ==> call Series.value_counts()
        return pd.Series((" ".join(self.df[self.text_col])).split()).value_counts()[-limit:]
