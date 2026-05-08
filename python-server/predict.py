import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

from datetime import datetime, timedelta
from bson import ObjectId
from db import db
from sklearn.tree import plot_tree


model = joblib.load("rf_model.pkl")
print("MODEL LOADED")

def safe_id(child_id):
    try:
        return ObjectId(child_id)
    except:
        return child_id


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

    print("\n FEATURES:")
    print(features)

    return features


def predict(features):
    prediction = model.predict(features)[0]
    proba = model.predict_proba(features)[0]

    print(f"Class: {prediction}")
    print(f"Confidence: {max(proba):.3f}")

    return prediction, proba

def plot_tree_model():
    print("\nГЕНЕРУЮ ЧИТАБЕЛЬНЕ ДЕРЕВО РІШЕНЬ...")
    
    # Вибираємо перше дерево з лісу
    tree = model.estimators_[0]
    
    # Налаштовуємо розмір полотна. 
    # Для глибини 3 оптимально 20x10 або 25x12 дюймів, щоб вузли розійшлися.
    fig, ax = plt.subplots(figsize=(20, 10), dpi=300) 

    # Візуалізація
    plot_tree(
        tree,
        feature_names=[
            "hitRate",
            "misses",
            "falseAlarmRate",
            "reactionTime",
            "mood",
            "dembo",
            "anxiety"
        ],
        class_names=["Low Risk", "Medium Risk", "High Risk"],
        filled=True,          # Колір відповідно до класу
        rounded=True,         # Закруглені кути вузлів
        fontsize=10,          # Розмір шрифту (збільшено для читабельності)
        max_depth=3,          # Обмежуємо глибину, щоб не було "каші"
        precision=2,          # Кількість знаків після коми в цифрах
        impurity=False,       # Прибираємо показник Gini, щоб було менше тексту у вузлі
        proportion=True       # Показуємо відсотки замість кількості samples (виглядає чистіше)
    )

    plt.title("                     Random Forest", fontsize=20, pad=20)
    
    # Зберігаємо у файл з високою якістю
    file_name = "decision_tree_high_res.png"
    plt.savefig(file_name, bbox_inches='tight', pad_inches=0.5)
    
    print(f"ГРАФІК ЗБЕРЕЖЕНО ЯК: {file_name}")
    plt.show()


if __name__ == "__main__":

    child_id = "697f2ee86361774ff7707b9e"
    data = get_data(child_id)
    features = build_features(data)
    if features is not None:
        prediction, proba = predict(features)
        plot_tree_model()
    else:
        print("STOPPED - NO DATA")