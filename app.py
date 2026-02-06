from flask import Flask, jsonify, render_template
import pandas as pd
import os

app = Flask(__name__)

# Load data on startup
# In a real app with large data, you might want to load this differently or use a database
try:
    # Load the dataset
    # Encoding 'windows-1252' is common for Excel CSVs, but 'utf-8' is standard. 
    # Validating encoding might be needed, but let's try default (utf-8) first or 'latin1' if that fails.
    try:
        df = pd.read_csv("data.csv", encoding='utf-8')
    except UnicodeDecodeError:
         df = pd.read_csv("data.csv", encoding='windows-1252')
         
except Exception as e:
    print(f"Error loading data.csv: {e}")
    # Create an empty DataFrame if file not found to prevent crash
    df = pd.DataFrame(columns=["Order Date", "Category", "Sub-Category", "Sales", "Profit", "Region"])

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/data")
def data():
    # Return data as a list of dictionaries (JSON)
    # Convert Date to string if needed, currently it's loaded as object/string usually
    # Return data as a list of dictionaries (JSON)
    # Handle NaN values explicitly by filling with empty string or 0
    # varying by column type would be better but fillna('') is safe for JSON
    df_clean = df.fillna('')
    return jsonify(df_clean.to_dict(orient="records"))

if __name__ == "__main__":
    app.run(debug=True)
