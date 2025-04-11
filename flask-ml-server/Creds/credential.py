"""This file contains import Credentials that are essential for Project and will be removed later on"""

api_key = "AIzaSyDV1WIQR-aQotA2Fxxn-mVnu4VDF11vesw"
User_name = 'DhairyaVaghela'
Password = 'xYQtoQ1yaYTiBJO2'


from pymongo import MongoClient
from pymongo.server_api import ServerApi
from urllib.parse import quote_plus

username = quote_plus('DhairyaVaghela')
password = quote_plus('xYQtoQ1yaYTiBJO2')
uri = f"mongodb+srv://{username}:{password}@ai-powered-trend-cluste.ja1xbvz.mongodb.net/?retryWrites=true&w=majority&appName=AI-Powered-Trend-Cluster"

client = MongoClient(uri, server_api=ServerApi('1'))
db = client["trendspotter"]
collection = db["Current_Trend"]

# Group by the field you want to de-duplicate on
pipeline = [
    {
        "$group": {
            "_id": "$Tweets",  # <-- change this field as needed
            "ids": {"$addToSet": "$_id"},
            "count": {"$sum": 1}
        }
    },
    {
        "$match": {
            "count": {"$gt": 1}
        }
    }
]

duplicates = collection.aggregate(pipeline)

for doc in duplicates:
    ids = doc['ids']
    # Keep one, delete the rest
    ids.pop(0)
    collection.delete_many({"_id": {"$in": ids}})
