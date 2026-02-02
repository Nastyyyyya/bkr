import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const ChildChatBot = () => {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { name: "Child", message: inputValue };
    setMessages([...messages, userMsg]);
    setInputValue("");

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.message }),
      });
      const data = await res.json();
      const botMsg = { name: "Bot", message: data.answer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = {
        name: "Bot",
        message: "Мені зараз трохи важко відповісти 😔",
      };
      setMessages((prev) => [...prev, errorMsg]);
      console.error(err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-yellow-200 to-pink-300 p-8">
      <h1 className="text-3xl sm:text-5xl font-bold mb-6">
        Поділися своїми емоціями 💛
      </h1>

      <div className="w-full max-w-md mb-6 bg-white p-4 rounded-lg shadow-md h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.name === "Bot" ? "text-blue-700 mb-2" : "text-green-700 mb-2"
            }
          >
            <b>{msg.name}:</b> {msg.message}
          </div>
        ))}
      </div>

      <div className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 p-2 rounded-lg border border-gray-300"
          placeholder="Напиши повідомлення..."
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Надіслати
        </button>
      </div>

      <button
        onClick={() => navigate(`/child-home/${childId}`)}
        className="mt-6 px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        Назад
      </button>
    </div>
  );
};

export default ChildChatBot;
