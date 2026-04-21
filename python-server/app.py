from flask import Flask, request, jsonify
from flask_cors import CORS
from chat import generate_gemini_response as get_response
import numpy as np
from analyzer import perform_deep_analysis

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5173"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, supports_credentials=True)


@app.route("/analyze-dynamics", methods=["POST"])
def analyze_dynamics():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "message": "No data"}), 400
        
        # Виклик винесеної логіки
        analysis_results = perform_deep_analysis(data)
        
        return jsonify(analysis_results)
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
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
