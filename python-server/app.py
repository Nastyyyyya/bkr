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

# 3. ЕНДПОІНТИ FLASK
@app.post("/analyze-dynamics")
def deep_analysis():
    data_json = request.get_json()
    child_id = data_json.get("childId", "697f2ee86361774ff7707b9e")
    
    raw_data = get_data(child_id)
    features = build_features(raw_data)
    
    if features is None:
        return jsonify({"success": False, "error": "No data found"})
    
    prediction, proba = predict_logic(features)
    # Розрахунок score для фронтенда (React очікує значення для порівняння)
    risk_score = float(max(proba) * (2 if prediction == "High Risk" else 1 if prediction == "Medium Risk" else 0.5))
    
    prompt = f"""
    Проаналізуй стан дитини. 
    Дані: Уважність={features[0][0]}, Пропуски={features[0][1]}, Імпульсивність={features[0][2]}, Реакція={features[0][3]}мс.
    Результат Random Forest: {prediction}.
    Поясни батькам простими словами, що це означає (стан класифіковано як {prediction}) та дай коротку пораду.
    Відповідь має бути короткою (до 5 речень). Не поводься як психолог і ні в якому разі не давай медичних показань. Кожного разу закінчуй фразою: За більш класифікованою допомогою потрібно звертатися до психолога. Не вітайся, одразу суть пиши
    """
    ai_interpretation = generate_gemini_response(prompt)

    class_map = {
        "Low Risk": 0,
        "Medium Risk": 1,
        "High Risk": 2
    }
    current_class = class_map.get(prediction, 0)

    prediction, proba = predict_logic(features)
    
    # Конвертуємо в рядок для безпечної перевірки, якщо модель поверне текст, 
    # або працюємо безпосередньо з числами
    pred_val = prediction
    
    # Визначаємо індекс класу (0, 1 або 2)
    if isinstance(pred_val, (int, np.integer)):
        current_class = int(pred_val)
    else:
        # Якщо модель повертає рядки типу "High Risk"
        pred_str = str(pred_val).lower()
        if "high" in pred_str: current_class = 2
        elif "medium" in pred_str: current_class = 1
        else: current_class = 0

    # Виправляємо risk_score (використовуємо індекс класу для розрахунку)
    multiplier = 2 if current_class == 2 else 1 if current_class == 1 else 0.5
    risk_score = float(max(proba) * multiplier)

    # ДРУКУЄМО ДЛЯ ПЕРЕВІРКИ
    print(f"DEBUG: prediction={prediction}, type={type(prediction)}, current_class={current_class}")

    result = {
            "success": True,
            "risk_score": round(risk_score, 2),
            "predicted_class": current_class,
            "interpretation": ai_interpretation,
            "features": {
                "Hit Rate": float(features[0][0]),
                "Misses": float(features[0][1]),
                "False Alarms": float(features[0][2]),
                "Reaction Time": float(features[0][3]),
                # ДОДАЙ ЦІ РЯДКИ:
                "mood": float(raw_data["mood"]),
                "anxiety": float(raw_data["anxiety"]),
                "dembo": float(raw_data["dembo"])
            },
            "analysis": {
                "decision_tree": {
                    "image": get_tree_base64(),
                    "path": [f"Результат: {prediction}", f"Впевненість: {round(max(proba)*100, 1)}%"]
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