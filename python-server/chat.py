import os
from google import genai
from google.genai.errors import APIError

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
        "You are a helpful, friendly assistant. "
        "Keep answers short and simple."
    )

    gemini_history = []
    for msg in history:
        role = 'user' if msg['role'] == 'user' else 'model'
        gemini_history.append({'role': role, 'parts': [{'text': msg['content']}]})

    contents = gemini_history + [{'role': 'user', 'parts': [{'text': user_input}]}]

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=contents,
            config={"system_instruction": system_instruction, "temperature": 0.7}
        )
        return response.text.strip()
    except APIError as e:
        print(f"[API Error]: {e}")
        return "Sorry, an API error occurred."
    except Exception as e:
        print(f"[Unexpected Error]: {e}")
        return "Sorry, an unexpected error occurred."
