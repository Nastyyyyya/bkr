from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import generate_local_response as get_response

app = Flask(__name__)
CORS(app)

@app.post("/predict")
def predict():
    data = request.get_json()
    if not data or "message" not in data:
        return jsonify({"error": "No message provided"}), 400

    user_message = data["message"]
    bot_response = get_response(user_message)
    return jsonify({"answer": bot_response})

if __name__ == "__main__":
    print("Сервер запущено. Модель завантажена локально.")
    app.run(debug=True, port=8000)
