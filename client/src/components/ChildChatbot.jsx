import React, { useState, useEffect, useRef } from "react";

const ChildChatbotComponent = () => {
  // Прибрано невикористаний childId
  const [messages, setMessages] = useState([
    {
      name: "Bot",
      message: "Привіт! Я твій помічник. Розкажеш, як минув твій день?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMsg = { name: "Child", message: inputValue };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    try {
      const res = await fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.message }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { name: "Bot", message: data.answer }]);
    } catch {
      // Прибрано невикористаний (err)
      setMessages((prev) => [
        ...prev,
        {
          name: "Bot",
          message: "Ой схоже виникла помилка, спробуй ще раз",
        },
      ]);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-[#f8f9f5] rounded-[40px] shadow-[0_20px_50px_rgba(44,72,50,0.1)] border border-white flex flex-col overflow-hidden h-[550px]">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.name === "Bot" ? "justify-start" : "justify-end"}`}
          >
            <div
              className={`max-w-[75%] px-5 py-3 rounded-[25px] text-lg font-medium shadow-sm ${
                msg.name === "Bot"
                  ? "bg-white text-[#2c4832] rounded-bl-none border border-[#2c4832]/5"
                  : "bg-[#2c4832] text-white rounded-br-none"
              }`}
            >
              {msg.message}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 bg-white border-t border-[#2c4832]/5">
        <div className="flex items-center gap-2 bg-[#f0f2ea] p-2 rounded-[30px] border border-[#2c4832]/10">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 bg-transparent py-3 px-5 outline-none text-[#2c4832] font-bold placeholder-[#2c4832]/70"
            placeholder="Чекаю на твоє повідомлення..."
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim()}
            className="bg-[#2c4832] text-white w-12 h-12 rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all disabled:opacity-50 shadow-md"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.4 20.4l17.45-8.48a1 1 0 000-1.84L3.4 1.6a1 1 0 00-1.39 1.3l3.3 7.1H13v2H5.3l-3.3 7.1A1 1 0 003.4 20.4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChildChatbotComponent;
