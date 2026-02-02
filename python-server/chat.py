import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
import os

# Шлях до папки з моделлю
MODEL_PATH = os.path.join(os.path.dirname(__file__), "llama_3b_v2")

# Завантажуємо токенайзер локально
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH, local_files_only=True)

# Завантажуємо модель локально
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    local_files_only=True,  # ⚠️ обов'язково!
    device_map="auto",      # автоматично на CPU або GPU
    torch_dtype=torch.float32
)

def generate_local_response(user_input: str, max_new_tokens=200) -> str:
    inputs = tokenizer(user_input, return_tensors="pt")
    with torch.no_grad():
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=True,
            top_p=0.95,
            temperature=0.7
        )
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response[len(user_input):].strip()
