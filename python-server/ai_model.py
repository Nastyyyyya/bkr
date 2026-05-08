# import numpy as np
# from sklearn.ensemble import RandomForestRegressor

# # -------------------------
# # TRAIN MODEL
# # -------------------------
# X_train = np.array([
#     [0.9, 0.1, 350, 0.02],
#     [0.6, 0.3, 500, 0.10],
#     [0.4, 0.5, 700, 0.20],
#     [0.2, 0.7, 900, 0.30],
# ])

# y_train = np.array([0, 1, 1, 2])

# model = RandomForestRegressor()
# model.fit(X_train, y_train)


# # -------------------------
# # PREDICT
# # -------------------------
# def predict(features):
#     score = model.predict([features])[0]

#     if score < 0.7:
#         level = "low"
#     elif score < 1.4:
#         level = "medium"
#     else:
#         level = "high"

#     return {"score": float(score), "level": level}


# # -------------------------
# # REPORT
# # -------------------------
# def generate_report(features):
#     pred = predict(features)

#     return {
#         "score": pred["score"],
#         "level": pred["level"],

#         "metrics": {
#             "attention": {
#                 "title": "Увага",
#                 "value": features[0],
#                 "status": "normal" if features[0] > 0.6 else "warning",
#                 "desc": "Рівень концентрації"
#             },
#             "impulsivity": {
#                 "title": "Імпульсивність",
#                 "value": features[1],
#                 "status": "warning" if features[1] > 0.4 else "normal",
#                 "desc": "Контроль реакцій"
#             },
#             "reaction_time": {
#                 "title": "Реакція",
#                 "value": features[2],
#                 "status": "warning" if features[2] > 600 else "normal",
#                 "desc": "Швидкість реакції"
#             },
#             "stability": {
#                 "title": "Стабільність",
#                 "value": features[3],
#                 "status": "risk" if features[3] > 0.2 else "normal",
#                 "desc": "Стабільність поведінки"
#             }
#         },

#         "parent_advice": generate_advice(pred)
#     }


# def generate_advice(pred):
#     if pred["level"] == "low":
#         return ["Стан стабільний", "Продовжуйте спостереження"]

#     if pred["level"] == "medium":
#         return ["Є навантаження", "Зменшити стрес"]

#     return ["Високий ризик", "Рекомендується спеціаліст"]