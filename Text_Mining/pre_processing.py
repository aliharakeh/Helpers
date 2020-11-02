from Text_Mining.info_extraction import InfoExtraction
from nltk.corpus import stopwords
from nltk.stem import PorterStemmer
from textblob import TextBlob
from textblob import Word


class PreProcessing:

    def __init__(self, df, text_column):
        self.df = df
        self.text_col = text_column
        self.extract = InfoExtraction(df, text_column)

    def to_lower_case(self):
        self.df[self.text_col] = self.df[self.text_col].str.lower()

    def remove_non_alphabet(self):
        self.df[self.text_col] = self.df[self.text_col].str.replace(r'[^\w\s]', '')

    def remove_stop_words(self, additional_stopwords=None):
        stop_words = set(stopwords.words('english'))
        if additional_stopwords:
            stop_words.update(additional_stopwords)
        self.df[self.text_col] = self.df[self.text_col].apply(lambda s: " ".join(s for s in s.split() if s not in stop_words))

    def common_word_removal(self, limit=10):
        most_freq_words = list(self.extract.most_frequent_words(limit).index)
        self.df[self.text_col] = self.df[self.text_col].apply(lambda s: " ".join(s for s in s.split() if s not in most_freq_words))

    def rare_word_removal(self, limit=10):
        most_rare_words = list(self.extract.most_rare_words(limit).index)
        self.df[self.text_col] = self.df[self.text_col].apply(lambda s: " ".join(s for s in s.split() if s not in most_rare_words))

    def spelling_correction(self):
        self.df[self.text_col] = self.df[self.text_col].apply(lambda x: str(TextBlob(x).correct()))

    def stemming(self):
        """
        Stemming refers to the removal of suffices, like “ing”, “ly”, “s”.
        """
        st = PorterStemmer()
        self.df[self.text_col] = self.df[self.text_col].apply(lambda x: " ".join([st.stem(w) for w in x.split()]))

    def lemmatization(self):
        """
        Converts the word into its root word.\n
        **Note:** More effective option than stemming.
        """
        self.df[self.text_col] = self.df[self.text_col].apply(lambda x: " ".join([Word(w).lemmatize() for w in x.split()]))
