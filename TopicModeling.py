import numpy as np
import pandas as pd
import string
import gensim
import gensim.corpora as corpora
from gensim.models import Phrases
from gensim.models.phrases import Phraser
import nltk
import re 
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from pprint import pprint

def split_concatenated_tokens(tokens):
    split_tokens = []
    for token in tokens:
        # Split where numbers and letters change
        parts = re.findall(r'[A-Za-z]+|\d+', token)
        split_tokens.extend(parts)
    return split_tokens

def clean_tokens(tokens):
    cleaned = []
    for token in tokens:
        if token.isalnum():  # keeps only alphanumeric tokens (no punctuation)
            cleaned.append(token)
    return cleaned

def remove_links(text):
    return re.sub(r"http\S+|www\S+|https\S+", "", text, flags=re.MULTILINE)

def remove_punctuation(text):
    removed_punctuation = text.translate(str.maketrans('', '', string.punctuation))
    return removed_punctuation

def tokenization(removed_punctuations):
    tokens = word_tokenize(removed_punctuations)
    return tokens


def stop_words_removal(tokenized_content):
    stop_words = set(stopwords.words("english"))
    filtered_words = [word for word in tokenized_content if word.lower() not in stop_words]
    
    removed_stop_words = []
    seen = set()
    for word in filtered_words:
        if word not in seen:
            seen.add(word)
            removed_stop_words.append(word)
    return removed_stop_words

def lemmatization(text):
    lemmatizer = WordNetLemmatizer()
    lemmatized_words = []
    for word in text:
        lemmatized_words.append(lemmatizer.lemmatize(word,pos="v"))
    return lemmatized_words


def nlp_processing(text):
    removed_links = remove_links(text)
    removed_punct = remove_punctuation(removed_links)
    tokens = tokenization(removed_punct)
    tokens = split_concatenated_tokens(tokens)
    removed_stop_words = stop_words_removal(tokens)
    cleaned_tokens = clean_tokens(removed_stop_words)
    lemmatized_words = lemmatization(cleaned_tokens)
    return lemmatized_words


if __name__ == '__main__':

    dataframe = pd.read_csv('Scrapers/Data/Data.csv')
    dataframe['Keywords'] = dataframe['Tweets'].apply(nlp_processing)

    Keywords_list = [nlp_processing(tweet) for tweet in dataframe['Tweets']]

    bigram = Phrases(Keywords_list, min_count=3, threshold=10)  
    bigram_mod = Phraser(bigram)

    Keyword_modifed = [bigram_mod[doc] for doc in Keywords_list]

    id2word = corpora.Dictionary(Keyword_modifed)
    corpus = [id2word.doc2bow(text) for text in Keyword_modifed]

    num_topics = 5 
    lda_model = gensim.models.LdaMulticore(
        corpus=corpus,id2word=id2word,num_topics=num_topics
    )


    pprint(lda_model.print_topics())
    x = lda_model.print_topics()

    tweet_topics = []

    for i , row in enumerate(lda_model[corpus]):
        row = sorted(row,key=lambda x: -x[1])
        topic_id , prob = row[0]
        tweet_topics.append((i,topic_id,prob))

    topic_df = pd.DataFrame(tweet_topics, columns=["Tweet_Index", "Topic", "Confidence"])

    dataframe['Dominant_topic'] = topic_df["Topic"]
    dataframe["Topic_Confidence"] = topic_df["Confidence"]

    for topic_num in range(5):
        print(f'\nTopic number {topic_num}')
        print('--------------------------')
        sample_tweets = dataframe[dataframe['Dominant_topic'] == topic_num]['Tweets'].sample(3)
        for tweet in sample_tweets:
            print(tweet) 