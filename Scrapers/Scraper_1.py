from selenium import webdriver 
from selenium.webdriver.common.keys import Keys 
from selenium.webdriver.common.by import By 
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC 
import numpy as np 
from collections import Counter
import time 
import matplotlib.pyplot as plt 
import re 
import nltk 
from datetime import datetime

def Scrap_twitter():
    Chrome_options = Options()
    Chrome_options.add_argument("--disable-blink-features=AutomationControlled") 
    Chrome_options.add_argument("--disable-popup-blocking")
    Chrome_options.add_argument("--start-maximized")
    Chrome_options.add_argument(r'--user-data-dir=C:\Users\dhair\AppData\Local\Google\Chrome')
    Chrome_options.add_argument(r'--profile-directory=Profile 1')

    driver = webdriver.Chrome(options=Chrome_options)
    driver.execute_cdp_cmd("Network.setUserAgentOverride", {
        "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    })
    url = 'https://x.com/search?q=(%23TrendingNow%20OR%20%23Trending)%20lang%3Aen%20until%3A2025-04-01%20since%3A2025-03-28&src=typed_query'

    wait = WebDriverWait(driver,30)

    driver.get(url)
    Titles = []
    i = 1 
    screen_height = driver.execute_script('return window.screen.height')

    while True: 
        print(f'iteration{i} height of the screen{screen_height}')
        driver.execute_script(f"window.scrollTo(0,{screen_height}*{i})".format(screen_height=screen_height,i=i))
        i = i + 1 
        time.sleep(1)
        
        element_title = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div.css-146c3p1.r-8akbws.r-krxsd3.r-dnmrzs.r-1udh08x.r-1udbk01.r-bcqeeo.r-1ttztb7.r-qvutc0.r-1qd0xha.r-a023e6.r-rjixqe.r-16dba41.r-bnwqim')))

        """for getting date-time"""
        date_element_fetcher = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div.css-175oi2r.r-18u37iz.r-1q142lx'))) 
        time_element = date_element_fetcher.find_element(By.TAG_NAME,'time')
        date_time = time_element.get_attribute("datetime")

        """for getting Likes , view, repost"""
        Meta_elements_getter = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR,'div.css-175oi2r.r-1kbdv8c.r-18u37iz.r-1wtj0ep.r-1ye8kvj.r-1s2bzr4')))
        Meta_elements = Meta_elements_getter.get_attribute('aria-label')
        # datatime = time_element.get_attribute('datetime')
        # element_hastags = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR,'span.r-18u37iz')))

        # if datatime :
        #     print(datatime)
        #     # for hastag in element_hastags:
        #     #     if hastag :
        #     #         Hastags.append(hastag.text.strip())
        # else:
        #     print('Could not fetch the element')

        if Meta_elements:
            print(Meta_elements)

        if time_element : 
            print(date_time)

        if element_title :
            Titles.append(element_title.text.strip())
        else:
            print('Could not find Title elements ')

        if (i * 1) >= 10:
            return Titles
             

Title = Scrap_twitter()


print(f'Lenght of the Tweets array : {len(Title)}')
print(Title)


# Has_counts = Counter(Hastag)
# print(f'All the similar elements : {Has_counts.most_common(10)}')

def Hastag_fetcher(Text):
    pass
    

def Text_cleaner(Title):
    Clean_titles = []
    for text in Title:
        text = text.lower()
        text = re.sub(r"http\S+|www\S+|https\S+|\n", " ", text)  
        text = re.sub(r"[^\w\s]", " ", text)
        Clean_titles.append(text)
    return Clean_titles


# def Tokenization():













