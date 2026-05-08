import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
import joblib

df = pd.read_csv("dataset.csv")

print("DATA LOADED")
print(df.shape)
print(df.head())

X = df.drop("label", axis=1)
y = df["label"]

print("\n FEATURES USED:")
print(list(X.columns))

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

print("Train:", X_train.shape)
print("Test:", X_test.shape)

model = RandomForestClassifier(
    n_estimators=300,
    max_depth=12,
    random_state=42,
    class_weight="balanced"
)

print("\n Training model...")

model.fit(X_train, y_train)
y_pred = model.predict(X_test)

print("\n Clasification report:")
print(classification_report(y_test, y_pred))

importances = pd.DataFrame({
    "feature": X.columns,
    "importance": model.feature_importances_
}).sort_values(by="importance", ascending=False)

print("\nFEATURE IMPORTANCE:")
print(importances)

joblib.dump(model, "rf_model.pkl")

print("\nMODEL SAVED AS rf_model.pkl")