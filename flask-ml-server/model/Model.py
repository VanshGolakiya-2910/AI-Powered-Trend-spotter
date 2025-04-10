"""This file contains all work necessary to create a Machine learning based model"""
import pandas as pd 
import numpy as np 
import json 
import redis 
from collections import Counter
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier 
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import classification_report , confusion_matrix

def Retrive_data_from_redis(redis_client):

    print('-------------Fetching data from Redis server-----------')
    json_data = redis_client.lrange(name='Future_prediction_data',start=0,end=-1)
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

def Preprocessing_features(df):
    df['Likes'] = df['Likes'].apply(lambda x: 1 if x == 0 else x)
    df['Views'] = df['Views'].apply(lambda x: 10 if x == 0 else x)

    df_trending = df[df['topics']!=-1]
    topic_count = df_trending['topics'].value_counts()
    print(topic_count)  

    all_keywords = sum(df['Keywords'],[])
    keyword_count = Counter(all_keywords)

    top_keywords = {kw for kw, _ in keyword_count.most_common(30)}

    def Extract_names(keywords):
        for kw in keywords:
            if kw in top_keywords:
                return kw 
        return "Misc"

    df['trend_name'] = df['Keywords'].apply(Extract_names)
    return df 

def feature_engg(df):
    df['Date'] = pd.to_datetime(df['Date'])

    df['Tweet_Lenght'] = df['Tweets'].apply(len)
    df['Word_Count']  = df['Tweets'].apply(lambda x: len(x.split()))
    df['Engagement'] = (df['Likes'] + df['Views']) / (df['Tweet_Lenght']+1)

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

if __name__ == '__main__':
        
    redis_client = redis.Redis(
    host= 'localhost',
    port = 6379,
    db = 0
    )

    df = Retrive_data_from_redis(redis_client)
    df = Preprocessing_features(df)
    df = feature_engg(df)

    features = [
    'Tweet_Lenght', 'Word_Count', 'Engagement', 'Hour_of_Day', 'Day_of_Week',
    'Is_Weekend', 'Hashtag_Count', 'Keyword_Count', 'Contains_Mention',
    'Contains_Link', 'Sentiment_Encoded']

    df['Is_Trending'] = df['topics'].apply(lambda x: 1 if x != -1 else 0)
    print(df['Is_Trending'].value_counts())

    X = df[features]
    y = df['Is_Trending']

    X_train , X_test,Y_train,Y_test = train_test_split(X,y,test_size=0.2,random_state=45)

    scaler = MinMaxScaler()

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    Model = RandomForestClassifier(
        n_estimators=100,
    )

    Model.fit(X_train_scaled,Y_train)

    Y_preds = Model.predict(X_test_scaled)

    print(classification_report(Y_test,Y_preds))




