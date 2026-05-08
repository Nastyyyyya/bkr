from datetime import datetime, timedelta
from db import db
import pandas as pd
from bson import ObjectId

print("SERVICE LOADED")

def safe_objectid(child_id):
    try:
        return ObjectId(child_id)
    except:
        return child_id


def safe_mean(values):
    if not values:
        return 3
    return sum(values) / len(values)


def safe_mood(value):
    mapping = {
        "happy": 5,
        "calm": 4,
        "neutral": 3,
        "sad": 2,
        "angry": 1,
        "anxious": 2
    }

    if isinstance(value, (int, float)):
        return value

    if isinstance(value, str):
        return mapping.get(value.lower(), 3)

    return 3


def safe_anxiety(value):
    if isinstance(value, (int, float)):
        return float(value)

    if isinstance(value, str):
        mapping = {
            "low": 2,
            "medium": 5,
            "high": 8,
            "panic": 10
        }
        return mapping.get(value.lower(), 5)

    return 5


def get_last_month_gonogo(child_id):
    start = datetime.now() - timedelta(days=200)
    child_id = safe_objectid(child_id)

    data = list(db.gonogos.find({
        "childId": child_id,
        "date": {"$gte": start}
    }))

    print(f"GONOGO RECORDS: {len(data)}")
    return data

def get_last_month_anxiety(child_id):
    child_id = safe_objectid(child_id)
    
    data = list(db.anxieties.find({
        "childId": child_id
    }))

    print(f"ANXIETY RECORDS: {len(data)}")
    return data

def get_last_month_mood(child_id):
    child_id = safe_objectid(child_id)
    data = list(db.childmoods.find({
        "childId": child_id
    }))

    print(f"MOOD RECORDS: {len(data)}")
    return data


def get_last_month_dembo(child_id):
    child_id = safe_objectid(child_id)
    data = list(db.demboresults.find({
        "childId": child_id
    }))

    print(f"DEMBO RECORDS: {len(data)}")
    return data


def build_features(gonogo_data, mood_data=None, dembo_data=None, anxiety_data=None):

    print("\nBUILD FEATURES")
    if not gonogo_data or len(gonogo_data) == 0:
        print("NO GONOGO DATA")
        return None
    df = pd.DataFrame(gonogo_data)

    mood_values = []
    if mood_data:
        for m in mood_data:
            mood_values.append(safe_mood(m.get("mood", 3)))
    mood = safe_mean(mood_values)

    anxiety_values = []
    if anxiety_data:
        for a in anxiety_data:
            anxiety_values.append(safe_anxiety(a.get("level", 5)))
    anxiety = safe_mean(anxiety_values)

    dembo_score = 50

    if dembo_data and len(dembo_data) > 0:
        d = dembo_data[0].get("results", {})

        dembo_score = safe_mean([
            d.get("health", 50),
            d.get("intelligence", 50),
            d.get("character", 50),
            d.get("happiness", 50)
        ])

    features = {
        "hitRate": float(df["hitRate"].mean()),
        "misses": float(df["misses"].mean()),
        "falseAlarmRate": float(df["falseAlarmRate"].mean()),
        "reactionTime": float(df["avgReactionTime"].mean()),

        "mood": mood,
        "dembo": dembo_score,
        "anxiety": anxiety
    }

    print("FEATURES READY:")
    print(features)
    return features

