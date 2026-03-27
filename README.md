# 📊 Interactive Data Dashboard

**Live Demo:** [https://interactive-data-dashboard-0f43.onrender.com](https://interactive-data-dashboard-0f43.onrender.com)


## 📊 Project Overview
The **Interactive Data Dashboard** is a full-stack web application that visualizes real-world retail sales data using interactive charts and tables. The project is built using **Flask** for the backend and **HTML**, **CSS**, and **JavaScript** for the frontend. It uses the **Superstore Sales** dataset to demonstrate data aggregation, API development, and data visualization.

---

## 📂 Deliverables
The following components are implemented in the project:

- **Backend**
  - `app.py` – Flask server updated to load and serve `superstore.csv` (as `data.csv`)

- **Dataset**
  - `data.csv` – Real-world retail sales dataset

- **Frontend**
  - `templates/index.html` – Dashboard layout updated for Superstore fields
  - `static/js/main.js` – Data processing, visualization logic, and interactive filters
  - `static/css/style.css` – Styling and layout

- **Deployment**
  - `Procfile` – Configuration for Render deployment
  - `requirements.txt` – Python dependencies

---

## 🏗️ Architecture Implemented

### Backend (Flask)
- Loads `data.csv` on server startup.
- Exposes a REST API endpoint to serve the dataset.
- Handles data cleaning (e.g., handling missing values).

**API Endpoint**
```http
GET /api/data
```

### Frontend (Visualization)
The dashboard includes:

- **Line Chart**: Sales trends over time using Order Date.
- **Bar Chart**: Sales by Category (Furniture, Office Supplies, Technology).
- **Doughnut Chart**: Sales by Region.
- **Data Table**: Detailed data view with **Profit** column color-coded:
  - 🟢 Green → Positive profit
  - 🔴 Red → Negative profit
- **Interactive Filters**: Filter data by Category and Region.

---

## ✅ Verification Results
- `data.csv` loaded successfully.
- Flask server running at `http://127.0.0.1:5000`.
- Chart logic correctly aggregates data by date, category, and region.
- Interactivity tested (Filters update charts dynamically).

---

## 🚀 How to Run Locally

### 1️⃣ Install dependencies
```bash
pip install -r requirements.txt
```

### 2️⃣ Run the server
```bash
python app.py
```

### 3️⃣ Open in browser
Visit: [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## ☁️ Deployment
The project is ready for cloud deployment using **Render**.

**Deployment steps:**
1. Push the project to GitHub.
2. Connect the repository to Render.
3. Deploy the application.


## 🛠️ Technologies Used
- **Python** (Backend Logic)
- **Flask** (Web Framework)
- **Pandas** (Data Processing)
- **HTML5** (Structure)
- **CSS3** (Styling)
- **JavaScript** (Interactivity)
- **Chart.js** (Data Visualization)

<!-- Setup instructions complete -->
