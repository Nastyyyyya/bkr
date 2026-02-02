import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";

const TestResult = () => {
  const location = useLocation();
  const { test, answers } = location.state;
  const [result, setResult] = useState(null);
  const [articles, setArticles] = useState([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    // обчислюємо середні бали по блоках
    const blocks = {};
    test.questions.forEach((q, i) => {
      if (!blocks[q.block]) blocks[q.block] = [];
      blocks[q.block].push(answers[i] || 0);
    });

    const averages = {};
    Object.keys(blocks).forEach((block) => {
      const arr = blocks[block];
      const sum = arr.reduce((a, b) => a + b, 0);
      averages[block] = sum / arr.length;
    });

    // переважаючий стиль
    const maxBlock = Object.keys(averages).reduce((a, b) =>
      averages[a] > averages[b] ? a : b,
    );

    setResult({ averages, maxBlock });

    // запит до бекенду, щоб витягнути статті по стилях
    const fetchArticles = async () => {
      try {
        const styles = Object.keys(averages).join(",");
        const { data } = await axios.get(`${backendUrl}/api/recommendations`, {
          params: { styles },
          withCredentials: true,
        });
        if (data.success) setArticles(data.articles);
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticles();
  }, [test, answers]);

  if (!result) return <p>Обробка результатів...</p>;

  const interpretations = {
    "Авторитетний стиль": "Ви надаєте дитині підтримку та чутливість.",
    "Авторитарний стиль": "Ви суворі та вимогливі.",
    "Ліберальний стиль": "Ви поблажливі до дитини.",
  };

  return (
    <div className="min-h-screen px-4 pt-32">
      <h1 className="text-3xl font-bold mb-4">Результати тесту</h1>

      <div className="mb-6">
        {Object.entries(result.averages).map(([block, avg]) => (
          <p key={block}>
            {block}: {avg.toFixed(2)}
          </p>
        ))}
      </div>

      <h2 className="text-2xl font-semibold mb-2">
        Переважаючий стиль: {result.maxBlock}
      </h2>
      <p className="max-w-md mb-8">{interpretations[result.maxBlock]}</p>

      <h2 className="text-2xl font-semibold mb-4">Рекомендовані статті</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard key={article._id} article={article} />
        ))}
      </div>
    </div>
  );
};

export default TestResult;
