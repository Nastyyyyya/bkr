import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";
import Navbar from "../components/Navbar";

const TestResult = () => {
  const location = useLocation();
  const { test, answers } = location.state || { test: null, answers: {} };
  const [result, setResult] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (!test || !answers) return;

    // 1. Обчислюємо середні бали
    const blocks = {};
    test.questions.forEach((q, i) => {
      if (!blocks[q.block]) blocks[q.block] = [];
      blocks[q.block].push(Number(answers[i]) || 0);
    });

    const averages = {};
    Object.keys(blocks).forEach((block) => {
      const arr = blocks[block];
      const sum = arr.reduce((a, b) => a + b, 0);
      averages[block] = sum / arr.length;
    });

    // 2. Визначаємо стилі для рекомендацій (всі, що мають високий бал)
    // Знаходимо максимальний бал
    const maxScore = Math.max(...Object.values(averages));

    // Беремо всі стилі, які набрали максимум (або дуже близькі до нього)
    const topStyles = Object.keys(averages).filter(
      (style) => averages[style] === maxScore || averages[style] > 3.5,
    );

    setResult({ averages, topStyles });

    // 3. Запит до бекенду
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const stylesParam = topStyles.join(",");
        const { data } = await axios.get(`${backendUrl}/api/recommendations`, {
          params: { styles: stylesParam },
          withCredentials: true,
        });
        if (data.success) setArticles(data.articles);
      } catch (error) {
        console.error("Помилка завантаження рекомендацій:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [test, answers]);

  if (!test)
    return <div className="pt-32 text-center">Дані тесту відсутні</div>;
  if (!result)
    return <div className="pt-32 text-center">Обробка результатів...</div>;

  const interpretations = {
    "Авторитетний стиль":
      "Ви надаєте дитині підтримку та чутливість, встановлюючи чіткі межі.",
    "Авторитарний стиль":
      "Ви орієнтовані на контроль та суворе дотримання правил.",
    "Ліберальний стиль":
      "Ви проявляєте багато тепла, але уникаєте встановлення обмежень.",
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex flex-col items-center justify-center p-4 mt-24">
        <div className="bg-[#F3F0E8] rounded-[40px] p-8 md:p-12 mb-12 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-[#2d3422] text-center">
            Ваш результат
          </h1>

          {/* Бали по категоріях */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {Object.entries(result.averages).map(([block, avg]) => (
              <div
                key={block}
                className="bg-white/50 p-6 rounded-2xl text-center border border-[#354024]/10"
              >
                <p className="text-gray-600 text-sm uppercase tracking-wider mb-2">
                  {block}
                </p>
                <p className="text-3xl font-bold text-[#354024]">
                  {avg.toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Висновок */}
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-[#2d3422] mb-4">
              Переважаючий стиль: {result.topStyles.join(" та ")}
            </h2>
            <div className="space-y-2">
              {result.topStyles.map((style) => (
                <p key={style} className="text-gray-700 leading-relaxed italic">
                  — {interpretations[style]}
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* Секція статей */}
        <section>
          <h2 className="text-2xl font-bold text-[#2d3422] mb-8 flex items-center gap-3">
            <span className="w-8 h-[2px] bg-[#354024]"></span>
            Рекомендовані статті для вас
          </h2>

          {loading ? (
            <p className="text-center py-10">Завантаження рекомендацій...</p>
          ) : articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <ArticleCard key={article._id} article={article} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">
              На жаль, за вашим профілем поки немає специфічних статей.
            </p>
          )}
        </section>
      </main>
    </div>
  );
};

export default TestResult;
