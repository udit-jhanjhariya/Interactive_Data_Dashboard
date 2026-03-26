"""`nMain application module for the Interactive Data Dashboard.`nHandles routing, file uploads, and data preprocessing.`n"""`nfrom flask import Flask, jsonify, render_template, request
import pandas as pd
import os

app = Flask(__name__)

# Global dataframe to store the dataset state
global_df = None

def load_default_data():
    """Loads the default dataset into the global dataframe."""
    global global_df
    try:
        try:
            global_df = pd.read_csv("data.csv", encoding='utf-8')
        except UnicodeDecodeError:
            global_df = pd.read_csv("data.csv", encoding='windows-1252')
    except Exception as e:
        print(f"Error loading data.csv: {e}")
        global_df = pd.DataFrame(columns=["Order Date", "Category", "Sub-Category", "Sales", "Profit", "Region"])

# Load data on startup
load_default_data()

def get_column_metadata(df):
    """
    Analyzes DataFrame columns to distinguish between date, numerical, and categorical fields.
    """
    metadata = {
        'categorical': [],
        'numerical': [],
        'date': []
    }
    for col in df.columns:
        # Check numerical
        if pd.api.types.is_numeric_dtype(df[col]):
            metadata['numerical'].append(col)
        # Check datetime
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            metadata['date'].append(col)
        else:
            # Fallback for string cols: see if the first valid item looks like a date
            first_valid = df[col].dropna()
            if not first_valid.empty:
                val_str = str(first_valid.iloc[0])
                # Simple check: if it can be parsed as a datetime and has date-like chars (- or /)
                try:
                    if '-' in val_str or '/' in val_str:
                        pd.to_datetime(first_valid.iloc[:5])
                        metadata['date'].append(col)
                        continue
                except:
                    pass
            # If not numerical and not date, it's categorical (or text)
            metadata['categorical'].append(col)
    return metadata

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/upload", methods=["POST"])
def upload_file():
    global global_df
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files.get("file")
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file and file.filename.endswith('.csv'):
        try:
            # Try to read the uploaded CSV
            global_df = pd.read_csv(file)
            return jsonify({"message": "File uploaded successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    else:
        return jsonify({"error": "Only CSV files are allowed"}), 400

@app.route("/api/data")
def data():
    global global_df
    if global_df is None:
        return jsonify({"error": "No data loaded"}), 400
        
    # Clean up NaN for JSON
    df_clean = global_df.fillna('')
    metadata = get_column_metadata(global_df)
    
    return jsonify({
        "data": df_clean.to_dict(orient="records"),
        "metadata": metadata
    })

if __name__ == "__main__":
    app.run(debug=True)


