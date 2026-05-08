import io
import base64
import joblib
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from bson import ObjectId
from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import generate_gemini_response as get_response
from db import db  # Переконайтеся, що файл db.py поруч
from google import genai
from google.genai.errors import APIError

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = 'AIzaSyCKsn45clrgQcYYOYPjNAQWkGEryn6moCo'

try:
    gemini_client = genai.Client(api_key=GEMINI_API_KEY)
    print("Gemini client initialized successfully.")
except Exception as e:
    print(f"Gemini initialization error: {e}")
    gemini_client = None

def generate_gemini_response(user_input: str, history: list = None) -> str:
    if gemini_client is None:
        return "Bot not initialized due to API error."
    if history is None:
        history = []

    system_instruction = (
        "You are a helpful, friendly child psychologist and neurophysiologist. "
        "Keep answers short and simple. Use Ukrainian language."
    )

    gemini_history = []
    for msg in history:
        role = 'user' if msg['role'] == 'user' else 'model'
        gemini_history.append({'role': role, 'parts': [{'text': msg['content']}]})

    contents = gemini_history + [{'role': 'user', 'parts': [{'text': user_input}]}]

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite", # або gemini-1.5-flash
            contents=contents,
            config={"system_instruction": system_instruction, "temperature": 0.7}
        )
        return response.text.strip()
    except Exception as e:
        print(f"[Gemini Error]: {e}")
        return "Не вдалося згенерувати розширений аналіз."

# 1. ЗАВАНТАЖЕННЯ МОДЕЛІ
try:
    model = joblib.load("rf_model.pkl")
    print("MODEL LOADED SUCCESSFULLY")
except:
    print("ERROR: rf_model.pkl not found!")

# 2. ДОПОМІЖНІ ФУНКЦІЇ (ЛОГІКА ML)
def safe_id(child_id):
    try: return ObjectId(child_id)
    except: return child_id

def get_data(child_id):
    c_id = safe_id(child_id)
    # Шукаємо дані без жорсткого фільтра по даті, щоб точно знайти реальні записи
    
    # 1. Go/NoGo
    gonogo = list(db.gonogos.find({"childId": c_id}))
    
    # 2. Настрій (перетворюємо текст у числа та рахуємо середнє)
    mood_map = {"sad": 1, "angry": 2, "neutral": 3, "good": 4, "happy": 5}
    mood_records = list(db.childmoods.find({"childId": c_id}))
    mood_val = np.mean([mood_map.get(m.get("mood"), 3) for m in mood_records]) if mood_records else 3.0
    
    # 3. Дембо-Рубінштейн (середнє по результатах)
    dembo_records = list(db.demboresults.find({"childId": c_id}))
    if dembo_records:
        all_scores = []
        for rec in dembo_records:
            r = rec.get("results", {})
            # Середнє арифметичне 4-х шкал одного тесту
            score = (r.get("health", 50) + r.get("intelligence", 50) + 
                     r.get("character", 50) + r.get("happiness", 50)) / 4
            all_scores.append(score)
        dembo_val = np.mean(all_scores)
    else:
        dembo_val = 50.0

    # 4. Тривожність (середній level)
    anxiety_records = list(db.anxieties.find({"childId": c_id}))
    anxiety_val = np.mean([a.get("level", 5) for a in anxiety_records]) if anxiety_records else 5.0

    return {
        "gonogo": gonogo,
        "mood": mood_val,
        "dembo": dembo_val,
        "anxiety": anxiety_val
    }

def build_features(data):
    if not data["gonogo"]: return None
    df = pd.DataFrame(data["gonogo"])
    
    # ТУТ ТІЛЬКИ 7 ОЗНАК, ЯКІ ОЧІКУЄ МОДЕЛЬ (БЕЗ ЗАГЛУШОК)
    return np.array([[
        df["hitRate"].mean(),
        df["misses"].mean(),
        df["falseAlarmRate"].mean(),
        df["avgReactionTime"].mean(),
        data["mood"],
        data["dembo"],
        data["anxiety"]
    ]])

def predict_logic(features):
    prediction = model.predict(features)[0]
    proba = model.predict_proba(features)[0]
    return prediction, proba

def get_tree_base64():
    import matplotlib.pyplot as plt
    from sklearn.tree import plot_tree
    
    tree = model.estimators_[0]
    fig, ax = plt.subplots(figsize=(20, 10), dpi=100)
    plot_tree(tree, 
              feature_names=["hitRate", "misses", "falseAlarmRate", "reactionTime", "mood", "dembo", "anxiety"],
              class_names=["Low", "Medium", "High"],
              filled=True, rounded=True, fontsize=10, max_depth=2, precision=2)
    
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    plt.close(fig)
    return img_str

data_json = request.get_json()
child_id = data_json.get("childId", "697f2ee86361774ff7707b9e")
current_class = class_map.get(prediction, 0)
ai_interpretation = generate_gemini_response(prompt)

# 3. ЕНДПОІНТИ FLASK

@app.post("/analyze-dynamics")
def deep_analysis():

    raw_data = get_data(child_id)
    features = build_features(raw_data)

    prediction, proba = predict_logic(features)

    result = {
        "success": True,
        "predicted_class": current_class,
        "interpretation": ai_interpretation,

        "features": {
            "Hit Rate": float(features[0][0]),
            "Misses": float(features[0][1]),
            "False Alarms": float(features[0][2]),
            "Reaction Time": float(features[0][3]),
            "mood": float(raw_data["mood"]),
            "anxiety": float(raw_data["anxiety"]),
            "dembo": float(raw_data["dembo"])
        },

        "analysis": {
            "decision_tree": {
                "path": [
                    f"Результат: {prediction}",
                    f"Впевненість: {round(max(proba)*100, 1)}%"
                ]
            }
        }
    }

    return jsonify(result)

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)

if __name__ == '__main__':
    app.run(debug=True, port=8000)