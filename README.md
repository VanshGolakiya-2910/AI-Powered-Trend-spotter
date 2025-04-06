<h1 align="center">🌟 AI-Powered Trend Spotter 🌟</h1>

<p align="center">
  A smart website that detects <strong>current trending topics</strong> and predicts <strong>future trends</strong> using AI.<br />
  Classifies hashtags & topics to determine whether they'll trend in the <strong>next hour</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/github/stars/VanshGolakiya-2910/AI-Powered-Trend-Spotter?style=social" />
  <img src="https://img.shields.io/github/forks/VanshGolakiya-2910/AI-Powered-Trend-Spotter?style=social" />
  <img src="https://img.shields.io/github/license/VanshGolakiya-2910/AI-Powered-Trend-Spotter" />
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

## 📄 WorkFLow 
1. Scrapes data from twitter every hour
2. process all the data (performs sentiment analysis,topic modeling,generating short desc)
3. after processing we have our current trend data sents it to front end
4. start processing other part of data for future prediction and trains the model 
