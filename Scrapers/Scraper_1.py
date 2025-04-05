from selenium import webdriver 
from selenium.webdriver.common.by import By 
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC 
import pandas as pd 
import time 
import re 

def parse_tweet_metadata(meta_text):

    metadata = {"likes": 0, "views": 0}  
    def convert_to_number(text):
        multipliers = {"K": 1_000, "M": 1_000_000}
        match = re.match(r"([\d.]+)([KM]?)", text)
        if match:
            num, suffix = match.groups()
            return int(float(num) * multipliers.get(suffix, 1))
        return int(text)

    values = meta_text.split("\n")

    if len(values) >= 4:
        metadata["likes"] = convert_to_number(values[2])  
        metadata["views"] = convert_to_number(values[3]) 
    
    return metadata


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
    url = 'https://x.com/search?q=(%23trending%20OR%20%20%23socialmedia)%20lang%3Aen%20geocode%3A20.5937%2C78.9629%2C500km&src=typed_query&f=live'

    wait = WebDriverWait(driver,30)

    driver.get(url)
    i = 1 
    screen_height = driver.execute_script('return window.screen.height')
    Titles_list = []
    Meta_data_list = []
    Date_time_list = []
    while True: 
        driver.execute_script(f"window.scrollTo(0,{screen_height}*{i})".format(screen_height=screen_height,i=i))
        i = i + 1 
        time.sleep(1)

        Full_Tweet_element = wait.until(EC.presence_of_all_elements_located((By.XPATH,"//article[@role='article']")))
        for tweet in Full_Tweet_element:
            try: 
                tweet_text_element = tweet.find_element(By.XPATH,".//div[@data-testid='tweetText']")
                if tweet_text_element.text.strip() in Titles_list:
                    continue
                tweet_text = tweet_text_element.text.strip()
                if tweet_text in [t["Tweets"] for t in Titles_list]:
                    continue

                tweet_date_element = tweet.find_element(By.XPATH,".//time").get_attribute('datetime')
                Date_time_list.append(tweet_date_element)

                tweet_meta_element = tweet.find_element(By.XPATH,".//div[@role='group']")
                Meta_info = parse_tweet_metadata(tweet_meta_element.text.strip())
                Meta_data_list.append(Meta_info)

                Titles_list.append({
                    'Date' : tweet_date_element,
                    'Tweets':tweet_text,
                    'Likes':Meta_info['likes'],
                    'Views' : Meta_info['views']
                })

                print(f'----------- For {i} iteration -------------')
            except Exception as e:
                print("Error fetching Tweets : ",e)

        if (i * 1) >= 1000:
            print('------------------- Data Scraped Successfully --------------------')
            return Titles_list,Meta_data_list,Date_time_list
             



def Hastag_fetcher(Title):
    Hastag_list = []
    for text in Title:
        x = re.findall('#\w+',text)
        Hastag_list.append(x)
    return Hastag_list

Title,Meta_data,Date_array = Scrap_twitter()


# Hash_list = Hastag_fetcher(Title)

# likes = [meta.get('likes', 0) for meta in Meta_data]
# views = [meta.get('views', 0) for meta in Meta_data]
# print(f'Length of HasTag array :{len(Hash_list)}')


print(f'Length of Tweets array : {len(Title)}')
print(f'Length of Meta Data array : {len(Meta_data)}')
print(f'Length of Date time array : {len(Date_array)}')

df = pd.DataFrame(Title)
df['Hastags'] = [", ".join(re.findall(r'#\w+', tweet)) for tweet in df['Tweets']]


print(df.info())
df.to_csv("Scrapers/Data/Data.csv",index=False)
print('---------------Data saved Succesfully-----------------')












