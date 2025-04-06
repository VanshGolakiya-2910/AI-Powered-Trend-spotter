"""This file contains all work necessary to create a Machine learning based model"""
import pandas as pd 
import numpy as np 
import json 
import redis 

def Retrive_data_from_redis(redis_client):

    Data_list = redis_client.lrange('Future_trends_list',0,-1)
    Data_list = [pd.read_json(row) for row in Data_list]
    print(Data_list)
    return Data_list


if __name__ == '__main__':
        
    redis_client = redis.Redis(
    host= 'localhost',
    port = 6379,
    db = 0
    )

    Data = Retrive_data_from_redis(redis_client)
    df = pd.concat(Data,ignore_index=True)
    print(df.info())