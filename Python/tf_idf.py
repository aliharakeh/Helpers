import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
import re
import json
import os

DIR = os.path.dirname(__file__)
print(DIR)

stopwords = []
with open(f'{DIR}\\..\\stop-words\\english.txt', encoding='utf-8') as f:
    stopwords += f.read().split('\n')

with open(f'{DIR}\\..\\stop-words\\arabic.txt', encoding='utf-8') as f:
    stopwords += f.read().split('\n')

# can be changed externally
not_accepted = re.compile(r'\w*\d+\w*|http|twitter|%|com')  # numeric & non alphabets
additional_stopwords = ['d8', 'd9', '08', '83', '86', 'a7', '84', 'a8', 'b1', '88', 'http', 'https', 'twitter', 'com', '']


def accepted_word(w):
    return len(w) > 2 and re.search(not_accepted, w) is None


def get_stopwords(data):
    global stopwords

    # get not accepted words
    words_removed = data.apply(lambda s: " ".join([w for w in s.split() if not accepted_word(w)]))
    stopwords += " ".join(words_removed).split()

    # add the additional stopwords
    stopwords += additional_stopwords

    return stopwords


def tf_idf(documents, max_features=1000, ngram=(2, 2), limit=None, **kwargs):
    # convert iterable to pd.Series
    if not isinstance(documents, pd.Series):
        documents = pd.Series(documents)

    # extract stopwords
    stopwords = get_stopwords(documents)

    # apply tf-idf
    tf_Idf = TfidfVectorizer(stop_words=stopwords, max_features=max_features, ngram_range=ngram, **kwargs)
    tf_Idf_fit = tf_Idf.fit_transform(documents)

    # get keywords
    feature_names = tf_Idf.get_feature_names()

    # get scores
    dense = tf_Idf_fit.todense()
    denselist = dense.tolist()

    # save results of all documents in a dataFrame
    tf_idf_table = pd.DataFrame(denselist, columns=feature_names)

    # get the final result of overall keywords score & sort them
    tf_idf_result = pd.DataFrame()
    tf_idf_result[['topic', 'score']] = tf_idf_table.mean().reset_index()
    tf_idf_result = tf_idf_result.sort_values('score', ascending=False).reset_index(drop=True)

    # return some or all keywords
    if limit:
        return tf_idf_result.loc[:limit]
    return tf_idf_result


def save_json(data, filename):
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(json.dumps(data, indent=2, ensure_ascii=False))
