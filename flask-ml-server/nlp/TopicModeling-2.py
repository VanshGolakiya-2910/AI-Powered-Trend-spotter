"""Here we will be implementing Bertopic for getting more precised meaning for the text """

import re 
from bertopic import BERTopic 
from sentence_transformers import SentenceTransformer
import pandas as pd 
import numpy as np 
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
import string
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import CountVectorizer
import redis
import json
from datetime import datetime
from urllib.parse import quote_plus
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import google.generativeai as genai
import time 


# Connection work for redis server 

redis_connect = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)



custom_stop_words = ['trend', 'viral', 'trending', 'india', 'post', 'news', 'update','trendingnow','trendingreels','latest','relatable','viralvideo','reel','fyp','us','know','series','business', 'digital', 'online', 'growth', 'market','better', 'things', 'best', 'one', 'zoomed cleavage','youtube', 'written', 'april 2025', '2025 written', 'written episode','github repo', 'github', 'repo', 'web', 'framework','daily', 'like', 'time', 'anna']

additional_noise_words = [
'look', 'take', 'make', 'get', 'see', 'check', 'click', 'life', 'love',
'watch', 'share', 'amazing', 'awesome', 'today', 'new', 'now', 'live',
'happening', 'go', 'back', 'day', 'night', 'people', 'thing', 'stuff',
'guy', 'girl', 'video', 'photo', 'pic', 'story', 'view', 'upload',
'reels', 'videos', 'likes', 'followers', 'insta', 'snap', 'bio', 'caption','vs','funny','comedy','please','let','details link', 'subscribe', 'via youtube', 'via', 'like subscribe','social', 'media', 'social media', 'brand','read', 'comment', 'tip', 'work', 'need upon','tweeting daily', 'tweeting', 'untill', 'daily untill', 'reply','engagement', 'marketing', 'platforms', 'strategies', 'content','grow','seo', 'strategy', 'engage','instagram'
]


custom_stop_words += additional_noise_words


def Generate_description(visual_df):
    genai.configure(api_key="AIzaSyDV1WIQR-aQotA2Fxxn-mVnu4VDF11vesw")
    model = genai.GenerativeModel('gemini-1.5-flash')

    descriptions = []
    for index, row in visual_df.iterrows():
        prompt = f"Write a short and catchy description about a trend named '{row['trend_name']}', which includes keywords: {', '.join(row['top_keywords'])}, has a {row['sentiment']} sentiment, and is currently popular on social media."
        
        try:
            response = model.generate_content(prompt)
            descriptions.append(response.text.strip())
        except Exception as e:
            print(f"Error for index {index}: {e}")
            descriptions.append("Description generation failed.")

    visual_df["trend_description"] = descriptions
    return visual_df


def split_concatenated_tokens(tokens):
    split_tokens = []
    for token in tokens:
        parts = re.findall(r'[A-Za-z]+|\d+', token)
        split_tokens.extend(parts)
    return split_tokens

def clean_tokens(tokens):
    cleaned = []
    for token in tokens:
        if token.isalnum():  
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

def remove_custom_words(tokens):
    remove_words = set(custom_stop_words)
    return [token for token in tokens if token not in remove_words]

def nlp_processing(text):
    text = re.sub(r"#\w+", "", text)
    removed_links = remove_links(text)
    removed_punct = remove_punctuation(removed_links)
    tokens = tokenization(removed_punct)
    tokens = split_concatenated_tokens(tokens)
    removed_stop_words = stop_words_removal(tokens)
    cleaned_tokens = clean_tokens(removed_stop_words)
    lemmatized_words = lemmatization(cleaned_tokens)
    final_tokens = remove_custom_words(lemmatized_words)
    return final_tokens

def clean_topic_keywords(topic_model, stop_words):
    cleaned_topics = {}
    for topic_id in topic_model.get_topics().keys():
        if topic_id == -1:
            continue
        filtered = [(word, weight) for word, weight in topic_model.get_topic(topic_id)
                    if word.lower() not in stop_words]
        cleaned_topics[topic_id] = filtered
    topic_model.topic_words = cleaned_topics

def Sentiment_analysis(tweet):
    def clean_tweet(tweet):
        text = re.sub(r'http\S+', '', tweet)  
        text = re.sub(r'@\w+', '', text)  
        text = re.sub(r'#', '', text)  
        text = re.sub(r'[^a-zA-Z0-9\s]', '', text)  
        text = text.lower().strip() 
        return text

    sia = SentimentIntensityAnalyzer()

    cleaned_tweet = clean_tweet(tweet)
    sentiment_scores = sia.polarity_scores(cleaned_tweet)

    return sentiment_scores['compound']

def label_sentiment(score):
    if score >= 0.05:
        return "Positive"
    elif score <= -0.05:
        return "Negative"
    else:
        return "Neutral"
    

def Create_Data_Visulization(df, topic_model):
    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    grouped = df.groupby('topics')
    trends = []

    for topic_id, group in grouped:
        if topic_id == -1:
            continue  

        volume = len(group)

        # Top keywords
        keywords = [word for word, _ in topic_model.get_topic(topic_id)[:5]]
        trend_name = " ".join(keywords[:2]).title()

        # Sentiment majority
        sentiment_counts = group['Sentiment_label'].value_counts()
        sentiment = sentiment_counts.idxmax()

        # Collect all hashtags from this topic's tweets
        hashtags_in_topic = []
        for tweet in group['Tweets']:
            hashtags = re.findall(r"#\w+", tweet)
            hashtags_in_topic.extend(hashtags)

        # Remove duplicates, lowercase
        hashtags_in_topic = list(set([tag.lower() for tag in hashtags_in_topic]))

        # Semantic filtering
        if hashtags_in_topic:
            cleaned_hashtags = [tag.strip('#') for tag in hashtags_in_topic]

            try:
                keyword_embeddings = embedding_model.encode(keywords)
                hashtag_embeddings = embedding_model.encode(cleaned_hashtags)

                avg_keyword_vec = np.mean(keyword_embeddings, axis=0).reshape(1, -1)
                sims = cosine_similarity(hashtag_embeddings, avg_keyword_vec).flatten()

                top_indices = np.argsort(sims)[-5:][::-1]
                top_hashtags = [hashtags_in_topic[i] for i in top_indices]
            except:
                top_hashtags = hashtags_in_topic[:5]  # fallback
        else:
            top_hashtags = []

        # Assemble the trend data
        trend_data = {
            "trend_name": trend_name,
            "top_keywords": keywords,
            "sentiment": sentiment,
            "volume": volume,
            "Top_Hastags": top_hashtags
        }

        trends.append(trend_data)

    return pd.DataFrame(trends)




if __name__ == '__main__':
    df = pd.read_csv('Scrapers/Data/Data.csv')
    df['Keywords'] = df['Tweets'].apply(nlp_processing)
          
    vector_model = CountVectorizer(
        stop_words=custom_stop_words,
        ngram_range=(1,2)
        )

    embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    tweets = df['Keywords'].apply(lambda tokens:' '.join(tokens))

    topic_model = BERTopic(
    embedding_model=embedding_model,
    vectorizer_model= vector_model
    )
    
    topics , probs = topic_model.fit_transform(tweets)
    topic_model.update_topics(tweets, topics, vectorizer_model=vector_model)
    df['topics'] = topics

    
    print('------------------label modeling completed succesfully---------------')
    topic_info = topic_model.get_topic_info()
    clean_topic_keywords(topic_model, set(custom_stop_words))
    print('------------------printing specific keywords that are trending---------------')

    print('---------------------------------------------------------------------')

    print('---------------------Performing sentiment analysis------------------')
    df['Sentiment_score'] = df['Tweets'].apply(Sentiment_analysis)
    df['Sentiment_label'] = df['Sentiment_score'].apply(label_sentiment)

    print('------------Sentiment Analysis done successfully----------------------')
    df.to_csv('Scrapers/Data/Future_analysis.csv')
    visual_df = Create_Data_Visulization(df,topic_model)

    print('------------Generating Short description---------------')
    visual_df = Generate_description(visual_df)
    print('------------Generated Short description---------------')
    print(visual_df.info())
    visual_df.to_csv('Scrapers/Data/Visual_Analysis.csv')
    username = quote_plus('DhairyaVaghela')
    password = quote_plus('xYQtoQ1yaYTiBJO2')
    uri = f"mongodb+srv://{username}:{password}@ai-powered-trend-cluste.ja1xbvz.mongodb.net/?retryWrites=true&w=majority&appName=AI-Powered-Trend-Cluster"

    client = MongoClient(uri, server_api=ServerApi('1'))

    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")
        db = client['trendspotter']
        collection = db['Current_Trend']
        new_trend = visual_df.to_dict(orient="records")
        print(new_trend)
        for trend in new_trend:
            trend["timestamp"] = datetime.utcnow()
        collection.insert_many(new_trend)
        print('Data stored Sucessfully')
    except Exception as e:
        print(e)

    # storing all the created data to Redis 

    data_json = df.to_json(orient='records')
    redis_connect.lpush('Future_trends_list', data_json)  
    redis_connect.ltrim('Future_trends_list', 0, 2)  
    print('----------Data Successfully stored on Redis server---------')


    
    