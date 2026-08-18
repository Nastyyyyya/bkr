import numpy as np
import pandas as pd

np.random.seed(42)

data = []

for _ in range(1000):

    hitRate = np.random.uniform(50, 100)
    misses = np.random.uniform(0, 15)
    falseAlarmRate = np.random.uniform(0, 80)
    reactionTime = np.random.uniform(250, 900)
    mood = np.random.uniform(1, 5)
    dembo = np.random.uniform(20, 100)


    anxiety = np.random.uniform(1, 10)

    risk = 0

    if hitRate < 70:
        risk += 1
    if falseAlarmRate > 40:
        risk += 1
    if reactionTime > 650:
        risk += 1
    if mood < 2.5:
        risk += 1
    if dembo < 50:
        risk += 1
    if misses > 8:
        risk += 1

    if anxiety > 7:
        risk += 1
    if anxiety > 9:
        risk += 2  

    if risk <= 1:
        label = 0  
    elif risk <= 3:
        label = 1  
    else:
        label = 2  

    data.append([
        hitRate,
        misses,
        falseAlarmRate,
        reactionTime,
        mood,
        dembo,
        anxiety,
        label
    ])

df = pd.DataFrame(data, columns=[
    "hitRate",
    "misses",
    "falseAlarmRate",
    "reactionTime",
    "mood",
    "dembo",
    "anxiety",
    "label"
])

df.to_csv("dataset.csv", index=False)

print("Dataset created: 1000 samples with ANXIETY")
print(df.head())