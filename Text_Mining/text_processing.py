from Text_Mining.pre_processing import PreProcessing
import pandas as pd


class TextProcessing:

    def __init__(self, df, text_column):
        self.df = df
        self.text_col = text_column
        self.pre_process = PreProcessing(df, text_column)

    def n_grams(self, n=2):
        all_words = (" ".join(self.df[self.text_col])).split()
        ngrams = []
        words_range = range(len(all_words))
        for i in words_range:
            ngrams.append(" ".join(all_words[i: i + n]))
        return pd.Series(ngrams)

    def most_frequent_n_grams(self, n=2, limit=10):
        return self.n_grams(n).value_counts()[:limit]
