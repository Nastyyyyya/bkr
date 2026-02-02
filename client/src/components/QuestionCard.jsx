import React from "react";

const defaultOptions = [
  { value: 1, label: "Ніколи" },
  { value: 2, label: "Рідко" },
  { value: 3, label: "Іноді" },
  { value: 4, label: "Часто" },
  { value: 5, label: "Завжди" },
];

const QuestionCard = ({ question, answer, setAnswer }) => {
  const options = defaultOptions;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-4">
      <h3 className="font-semibold mb-4">{question.text}</h3>
      <div className="flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setAnswer(opt.value)}
            className={`px-4 py-2 rounded border ${
              answer === opt.value ? "bg-[#354024] text-white" : "bg-gray-100"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuestionCard;
