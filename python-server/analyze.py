# import numpy as np
# from datetime import datetime, timedelta

# # -----------------------------
# # helper: trend (нахил динаміки)
# # -----------------------------
# def calculate_trend(values):
#     if len(values) < 2:
#         return 0.0
#     return float(np.polyfit(range(len(values)), values, 1)[0])


# # -----------------------------
# # MAIN AI ANALYSIS
# # -----------------------------
# def perform_deep_analysis(data):
#     try:
#         # -----------------------------
#         # 1. отримуємо дані з фронта
#         # -----------------------------
#         mood = data.get("mood_history", [])
#         dembo = data.get("dembo_history", [])
#         anxiety = data.get("anxiety_history", [])
#         sdq = data.get("sdq_history", [])
#         gonogo = data.get("gonogo_history", [])

#         # -----------------------------
#         # 2. перетворення в числа
#         # -----------------------------
#         mood_values = [m.get("value", 3) for m in mood] if mood else [3]
#         anxiety_values = [a.get("level", 5) for a in anxiety] if anxiety else [5]

#         dembo_values = [
#             d.get("happiness", 50) if isinstance(d, dict) else 50
#             for d in dembo
#         ] if dembo else [50]

#         sdq_values = [
#             s.get("total", 10) for s in sdq
#         ] if sdq else [10]

#         # GoNoGo (імпульсивність)
#         gonogo_values = [
#             g.get("falseAlarmRate", 0.3) for g in gonogo
#         ] if gonogo else [0.3]

#         # -----------------------------
#         # 3. СЕРЕДНІ + ТРЕНДИ
#         # -----------------------------
#         avg_mood = float(np.mean(mood_values))
#         avg_anxiety = float(np.mean(anxiety_values))
#         avg_dembo = float(np.mean(dembo_values))
#         avg_sdq = float(np.mean(sdq_values))
#         avg_impulsivity = float(np.mean(gonogo_values))

#         mood_trend = calculate_trend(mood_values)
#         anxiety_trend = calculate_trend(anxiety_values)

#         # -----------------------------
#         # 4. НОРМАЛІЗАЦІЯ (0–1 шкала)
#         # -----------------------------
#         norm_anxiety = avg_anxiety / 10
#         norm_mood = avg_mood / 5
#         norm_sdq = avg_sdq / 25

#         # -----------------------------
#         # 5. "AI SCORE" (ВАЖЛИВІСТЬ МОДЕЛІ)
#         # -----------------------------
#         risk_score = (
#             norm_anxiety * 0.35 +
#             (1 - norm_mood) * 0.25 +
#             norm_sdq * 0.2 +
#             avg_impulsivity * 0.2
#         )

#         # -----------------------------
#         # 6. КЛАСИФІКАЦІЯ (AI OUTPUT)
#         # -----------------------------
#         if risk_score > 0.65:
#             risk_level = "high_risk"
#             summary = "Виявлено стабільно високий рівень емоційного навантаження протягом місяця."
#         elif risk_score > 0.4:
#             risk_level = "warning"
#             summary = "Спостерігається нестабільна емоційна динаміка."
#         else:
#             risk_level = "stable"
#             summary = "Емоційний стан протягом місяця стабільний."

#         # -----------------------------
#         # 7. AI INSIGHTS (НЕ IF-ELSE)
#         # -----------------------------
#         insights = []

#         if anxiety_trend > 0.2:
#             insights.append("Тривожність має тенденцію до зростання.")
#         elif anxiety_trend < -0.2:
#             insights.append("Тривожність зменшується.")

#         if mood_trend < -0.2:
#             insights.append("Настрій поступово погіршується.")

#         if avg_impulsivity > 0.5:
#             insights.append("Підвищена імпульсивність у поведінці.")

#         # -----------------------------
#         # 8. ПОВЕРНЕННЯ РЕЗУЛЬТАТУ
#         # -----------------------------
#         return {
#             "success": True,
#             "risk_level": risk_level,
#             "risk_score": round(risk_score, 3),
#             "summary": summary,

#             "metrics": {
#                 "mood": {
#                     "title": "Настрій",
#                     "value": round(avg_mood, 2),
#                     "status": "Норма" if avg_mood > 3 else "Знижений",
#                     "desc": "Середній настрій за місяць"
#                 },
#                 "anxiety": {
#                     "title": "Тривожність",
#                     "value": round(avg_anxiety, 2),
#                     "status": "Норма" if avg_anxiety < 5 else "Підвищена",
#                     "desc": "Середній рівень тривоги"
#                 },
#                 "sdq": {
#                     "title": "Поведінкові ризики",
#                     "value": round(avg_sdq, 2),
#                     "status": "Норма" if avg_sdq < 15 else "Підвищено",
#                     "desc": "Загальний SDQ індекс"
#                 },
#                 "trend": {
#                     "title": "Емоційна динаміка",
#                     "value": round(mood_trend, 2),
#                     "status": "Стабільний" if abs(mood_trend) < 0.2 else "Зміни",
#                     "desc": "Тренд зміни настрою"
#                 }
#             },

#             "ai_insights": insights,

#             "parent_advice": [
#                 "Слідкуйте за змінами настрою протягом тижня",
#                 "Підтримуйте стабільний режим сну",
#                 "Зменшуйте стресові фактори",
#                 "Звертайте увагу на негативні тренди"
#             ]
#         }

#     except Exception as e:
#         print("AI ERROR:", e)
#         return {
#             "success": False,
#             "message": str(e)
#         }