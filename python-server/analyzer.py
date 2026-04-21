import numpy as np

def get_advice(metric, status, value):
    """Генерує поради на основі отриманих результатів."""
    advices = {
        "anxiety": {
            "Висока": "Рекомендується знизити екранний час та додати вечірні прогулянки. Зверніть увагу на якість сну.",
            "Помірна": "Стан дитини стабільний, але чутливий. Підтримайте дитину в її захопленнях."
        },
        "gonogo": {
            "Імпульсивність": "Корисні ігри на витримку (шахи, 'Тихіше їдеш - далі будеш').",
            "Низька точність": "Дитина може бути втомленою. Перевірте режим дня."
        },
        "sdq": {
            "Високий": "Рівень психологічного навантаження перевищує норму. Бажана консультація шкільного психолога.",
        }
    }
    return advices.get(metric, {}).get(status, "Продовжуйте спостереження та підтримуйте емоційний контакт.")

def perform_deep_analysis(data):
    results = {
        "summary": "Аналітичний звіт для батьків",
        "metrics": {},
        "parent_advice": [],
        "alerts": []
    }

    # --- 1. ТРЕКЕР НАСТРОЮ ---
    moods = [m.get('mood', 0) for m in data.get('mood_history', [])]
    if moods:
        avg_mood = np.mean(moods)
        status = "Стабільний" if np.std(moods) < 0.8 else "Емоційні коливання"
        results["metrics"]["Настрій"] = {
            "title": "Емоційний фон",
            "value": f"{avg_mood:.1f}/5",
            "status": status,
            "desc": "Середній рівень задоволеності дитини днем. Показник вище 3.5 вважається позитивним."
        }

    # --- 2. ТРИВОЖНІСТЬ (Anxiety Meter) ---
    anxiety = [a.get('level', 0) for a in data.get('anxiety_history', [])]
    if anxiety:
        last_a = anxiety[-1]
        status = "Висока" if last_a > 7 else "Помірна" if last_a > 4 else "Норма"
        results["metrics"]["Тривожність"] = {
            "title": "Рівень тривоги",
            "value": f"{last_a}/10",
            "status": status,
            "desc": "Показує рівень внутрішньої напруги. 7 — це сигнал до необхідності відпочинку."
        }
        if status != "Норма":
            results["parent_advice"].append(f"По тривожності: {get_advice('anxiety', status, last_a)}")

    # --- 3. САМООЦІНКА (Dembo-Rubinstein) ---
    dembo = data.get('dembo_history', [])
    if dembo:
        latest = dembo[-1].get('scales', {})
        if latest:
            score = np.mean(list(latest.values()))
            status = "Адекватна" if 60 <= score <= 85 else "Занижена" if score < 60 else "Завищена"
            results["metrics"]["Самооцінка"] = {
                "title": "Впевненість у собі",
                "value": f"{score:.1f}%",
                "status": status,
                "desc": "Як дитина оцінює свої можливості порівняно з іншими."
            }

    # --- 4. ПСИХОЛОГІЧНІ ТРУДНОЩІ (SDQ) ---
    sdq = data.get('sdq_history', [])
    if sdq:
        score = sdq[-1].get('scores', {}).get('total', 0)
        status = "Високий ризик" if score > 17 else "Норма"
        results["metrics"]["Соціалізація"] = {
            "title": "Загальні труднощі",
            "value": f"{score} балів",
            "status": status,
            "desc": "Комплексний показник поведінки, стосунків з однолітками та емоцій."
        }
        if score > 17:
            results["parent_advice"].append(get_advice("sdq", "Високий", score))

    # --- 5. УВАГА ТА КОНТРОЛЬ (Go/No-Go) ---
    gonogo = data.get('gonogo_history', [])
    if gonogo:
        acc = [g.get('accuracy', 0) for g in gonogo]
        rt = [g.get('avgResponseTime', 0) for g in gonogo]
        status = "Стабільний" if np.mean(acc) > 80 else "Потребує уваги"
        results["metrics"]["Когнітивний контроль"] = {
            "title": "Концентрація та витримка",
            "value": f"{np.mean(acc):.1f}%",
            "status": status,
            "desc": "Здатність дитини вчасно зупинитися та не реагувати на імпульси."
        }
        if np.mean(acc) < 70:
            results["parent_advice"].append(get_advice("gonogo", "Імпульсивність", 0))

    return results