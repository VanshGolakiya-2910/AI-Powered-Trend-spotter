import joblib 
import pandas as pd 
import numpy as np 
import json 
import redis 
from sklearn.preprocessing import StandardScaler
from collections import Counter 
from urllib.parse import quote_plus
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
from pymongo.errors import DuplicateKeyError
from datetime import datetime
import google.generativeai as genai
import time
import re
import spacy
nlp = spacy.load("en_core_web_sm")

custom_stopwords = set([
    "always", "every", "win", "friend", "love", "like", "good", "day", "time",
    "people", "best", "make", "feel", "life", "today", "thank", "thanks", "happy",'never','dream','keeping','think','real','matter',"start", "follow", "matter","tweeting","comment","every","folio",'give','joke',"say",
])
def Extract_names(keywords):
    candidates = []
    
    doc = nlp(" ".join(keywords))
    entities = {ent.text.strip() for ent in doc.ents if ent.label_ in ("PERSON", "ORG", "GPE", "EVENT")}
    
    # Use entities if available
    for ent in entities:
        if ent.lower() not in custom_stopwords and len(ent) >= 4:
            candidates.append(ent)
            
    # Fallback: use the previous strict filtering over individual keywords
    if not candidates:
        for kw in keywords:
            kw_clean = kw.strip()
            if len(kw_clean) < 5:
                continue
            if kw_clean.lower() in custom_stopwords:
                continue
            if kw_clean.startswith('#') and len(kw_clean) > 4:
                candidates.append(kw_clean)
            elif re.match(r'^[A-Za-z0-9_]+$', kw_clean) and len(kw_clean) > 4:
                candidates.append(kw_clean)
    
    if candidates:
        return candidates[0]
    return "Misc"   

def Generate_description(Top_trends):
    # Configure Gemini API
    genai.configure(api_key="AIzaSyDV1WIQR-aQotA2Fxxn-mVnu4VDF11vesw")
    model = genai.GenerativeModel('gemini-1.5-flash')

    descriptions = []
    for trend in Top_trends:
        prompt = (
            f"Write a short, catchy, and meaningful description for a current social media trend called '{trend}' "
            f"that is currently popular online. Use internet knowledge to make it meaningful and relevant. "
            f"The description should feel natural, engaging, and summarize the core theme in 1-2 sentences."
        )
        try:
            time.sleep(2) 
            response = model.generate_content(prompt)
            descriptions.append(response.text.strip() if response.text else "No description generated.")
        except Exception as e:
            print(f"[Error] Trend: {trend} | {e}")
            descriptions.append("Description generation failed.")

    return descriptions


def Preprocessing_features(df):
    df['Likes'] = df['Likes'].apply(lambda x: 1 if x == 0 else x)
    df['Views'] = df['Views'].apply(lambda x: 10 if x == 0 else x)

    df_trending = df[df['topics']!=-1]
    topic_count = df_trending['topics'].value_counts()
    print(topic_count)  

    all_keywords = sum(df['Keywords'],[])
    keyword_count = Counter(all_keywords)

    top_keywords = {kw for kw, _ in keyword_count.most_common(30)}

    df['trend_name'] = df['Keywords'].apply(Extract_names)
    return df 

def preprocess_tweet_data(df):
    df['Date'] = pd.to_datetime(df['Date'])
    df['Tweet_Lenght'] = df['Tweets'].apply(len)
    df['Word_Count']  = df['Tweets'].apply(lambda x: len(x.split()))
    df['Engagement'] = (df['Likes'] + df['Views']) / (df['Tweet_Lenght'] + 1)
    df['Hour_of_Day'] = df['Date'].dt.hour
    df['Day_of_Week'] = df['Date'].dt.dayofweek
    df['Is_Weekend'] = df['Day_of_Week'].apply(lambda x: 1 if x >= 5 else 0)
    df['Hashtag_Count'] = df['Hastags'].apply(lambda x: len(str(x).split(',')) if pd.notnull(x) else 0)
    df['Keyword_Count'] = df['Keywords'].apply(lambda x: len(x) if isinstance(x, list) else 0)
    df['Contains_Mention'] = df['Tweets'].apply(lambda x: 1 if '@' in x else 0)
    df['Contains_Link'] = df['Tweets'].apply(lambda x: 1 if 'http' in x or 'www' in x else 0)
    
    sentiment_map = {'Positive': 1, 'Neutral': 0, 'Negative': -1}
    df['Sentiment_Encoded'] = df['Sentiment_label'].map(sentiment_map)

    return df

def Retrive_data_from_redis(redis_client):

    print('-------------Fetching data from Redis server-----------')
    json_data = redis_client.lrange(name='Testing_data',start=0,end=-1)
    data = []
    for i, item in enumerate(json_data):
        try:
            parsed = json.loads(item)
            if isinstance(parsed, list):
                data.extend(parsed)
            elif isinstance(parsed, dict):
                data.append(parsed)
        except Exception as e:
            print(e)
    df = pd.DataFrame(data)
    return df 



if __name__ == '__main__':

    Model = joblib.load("flask-ml-server/model/Future-model.pkl")
    Scaler = StandardScaler()

    redis_client = redis.Redis(
    host= 'localhost',
    port = 6379,
    db = 0
    )

    df = Retrive_data_from_redis(redis_client)
    df = Preprocessing_features(df)
    df = preprocess_tweet_data(df)

    features = [
    'Tweet_Lenght', 'Word_Count', 'Engagement', 'Hour_of_Day', 'Day_of_Week',
    'Is_Weekend', 'Hashtag_Count', 'Keyword_Count', 'Contains_Mention',
    'Contains_Link', 'Sentiment_Encoded'
    ]
    
    X = df[features]

    X_scaled = Scaler.fit_transform(X)

    Preds = Model.predict(X_scaled)

    print("Sample predictions:", Preds[:10])
    testing_df = [df['trend_name'][idx] for idx in X.index]
    results = list(zip(testing_df, Preds))
    trending = [trend[0] for trend in results if trend[1] == 1]
    filtered = [t for t in trending if t != 'Misc']
    trend_counter = Counter(filtered)
    # Only pick trends that have frequency >= a threshold (say, 3)
    top_trends = [(trend, freq) for trend, freq in trend_counter.items() if freq >= 3]
    top_trends = sorted(top_trends, key=lambda x: x[1], reverse=True)[:5]
    print("Top trends (after filtering):", top_trends)
    trend_names = [trend for trend, _ in top_trends]

    # Generate descriptions
    descriptions = Generate_description(trend_names)

# Combine and display
    for name, desc in zip(trend_names, descriptions):
        print(f"\nTrend: {name}\n Description: {desc}")

    print(df.info())

    username = quote_plus('DhairyaVaghela')
    password = quote_plus('xYQtoQ1yaYTiBJO2')
    uri = f"mongodb+srv://{username}:{password}@ai-powered-trend-cluste.ja1xbvz.mongodb.net/?retryWrites=true&w=majority&appName=AI-Powered-Trend-Cluster"

    client = MongoClient(uri, server_api=ServerApi('1'))

    try:
        client.admin.command('ping')
        print("Pinged your deployment. You successfully connected to MongoDB!")

        db = client['trendspotter']
        collection = db['Future_Trends']

        inserted_count = 0
        for name, desc in zip(trend_names, descriptions):
            doc = {
                "trend_name": name,
                "description": desc,
                "timestamp": datetime.utcnow()
            }

            try:
        
                result = collection.delete_one({"trend_name": name})
                if result.deleted_count > 0:
                    print(f"Deleted duplicate for trend: {name}")

                # Insert new document
                collection.insert_one(doc)
                inserted_count += 1
                print(f"Inserted trend: {name}")

            except Exception as e:
                print(f"Error inserting trend '{name}': {e}")

        print(f"\nStored {inserted_count} trend(s) into MongoDB.")

    except Exception as e:
        print("[MongoDB Error]", e)
    