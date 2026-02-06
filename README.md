# Interactive Data Dashboard

A full-stack data visualization dashboard built with **Flask**, **Pandas**, and **Chart.js**. This project loads sales data from a CSV file, processes it on the backend, and serves it via a REST API to a responsive frontend.

## 🚀 Features

- **Data Processing**: Backend uses Pandas for data aggregation.
- **Interactive Charts**: Visualizes sales trends, category distribution, and regional data using Chart.js.
- **REST API**: Exposes processed data via `/api/data`.
- **Responsive Design**: Built with Bootstrap 5.
- **Cloud Ready**: Configured for easy deployment on Render.

## 🛠️ Tech Stack

- **Backend**: Python 3, Flask, Pandas
- **Frontend**: HTML5, CSS3, JavaScript, Chart.js, Bootstrap 5
- **Deployment**: Gunicorn, Render

## 📦 Project Structure

```
/
├── app.py                  # Flask Application
├── data.csv                # Sample Dataset
├── requirements.txt        # Python Dependencies
├── Procfile                # Render Deployment Config
├── static/
│   ├── css/style.css       # Custom Styles
│   └── js/main.js          # Chart & Data Logic
└── templates/
    └── index.html          # Dashboard HTML
```

## 🔧 Local Setup

1. **Clone the repository** (or download the files).
2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
4. **Run the application**:
   ```bash
   python app.py
   ```
5. **Open your browser**:
   Visit `http://127.0.0.1:5000`

## ☁️ Deployment (Render)

1. Push this code to a **GitHub** repository.
2. Sign up at [Render.com](https://render.com).
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Render will automatically detect the `Procfile` and `requirements.txt`.
6. Click **Deploy**.

## 📊 API Endpoints

- `GET /api/data`: Returns the full sales dataset as JSON.

---
*Created for the Interactive Data Dashboard Project.*
