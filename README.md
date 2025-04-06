<h1 align="center">🌟 AI-Powered Trend Spotter 🌟</h1>

<p align="center">
  A smart website that detects <strong>current trending topics</strong> and predicts <strong>future trends</strong> using AI.<br />
  Classifies hashtags & topics to determine whether they'll trend in the <strong>next hour</strong>.
</p>
---

## ✨ Features

- ⏱ **Hourly Trend Prediction** – Predicts what's likely to trend in the next hour
- 💸 **Completely Free** – No paid APIs used, built using custom web scrapers
- 🔄 **Real-time-ish** – Pulls fresh data every hour (due to API limitations)
- 💪 **Robust System** – Handles a wide range of social media text data
- 📊 **Interactive Dashboard** – Clean, intuitive UI to browse trends
- 👨‍💻 **Sentiment-Analysis** - also analysis public opinion on the trending topics
- 🧠 **Trend Desciption** - with the help of **Generative AI** can generate short brief of trends 
- ⏰ **Future-Prediction** - Currently under work but soon will be done
---

## 🧠 Tech Stack

- 🧩 **Frontend:** React, Tailwind CSS, Chart.js
- 🚀 **Backend:** Flask 
- 🧠 **AI/NLP:** BERTopic, Sentence Transformers (`all-MiniLM-L6-v2`)
- 🗄 **Database:** MongoDB, Redis
- 🧪 **Scraping:** Selenium (Twitter Scraper)
- 📈 **Visualization:** Recharts, D3.js

## 📄 Workflow

Here's how the AI-Powered Trend Spotter system operates behind the scenes:

1. 🕒 **Hourly Twitter Scraping**
   - A **Selenium-based crawler** runs every hour to fetch fresh tweets.
   - Targets trending hashtags, keywords, and user discussions.

2. 🧼 **Data Preprocessing & Enrichment**
   - Cleans raw tweet text (removes URLs, emojis, special characters).
   - Applies **custom NLP pipeline** to:
     - Perform **Sentiment Analysis** using pre-trained models.
     - Extract **topics and clusters** using **BERTopic**.
     - Generate a **brief description** for each trending topic.

3. 📊 **Current Trends Processing**
   - Processes enriched data to identify **currently trending topics**.
   - Sends this real-time trend data to the **frontend dashboard** via MongoDB.

4. 🔮 **Future Trend Prediction**
   - The system isolates relevant features (e.g., engagement, sentiment, frequency).
   - Uses a **trained machine learning model** to **predict if a topic will trend in the next hour**.
   - Stores future trend predictions in **Redis** for faster retrieval and display.

---

✨ The combination of **real-time scraping**, **advanced NLP**, and **predictive analytics** makes this system a powerful tool for tracking and forecasting social media trends.

