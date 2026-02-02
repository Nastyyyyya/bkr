import { useEffect, useState } from "react";
import axios from "axios";
import ArticleCard from "../components/ArticleCard";
import Navbar from "../components/Navbar";

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const loadArticles = async () => {
    if (!hasMore) return;

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${backendUrl}/api/articles?page=${page}`,
        { withCredentials: true },
      );

      if (data.success) {
        setArticles((prev) => [...prev, ...data.articles]);
        setHasMore(data.hasMore);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto pt-32 px-4">
        <h1 className="text-3xl font-semibold mb-8">Статті</h1>

        {/* Грід для статей, максимум 2 в ряд */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={loadArticles}
              disabled={loading}
              className="px-6 py-2 bg-[#354024] text-white rounded-full hover:brightness-110"
            >
              {loading ? "Завантаження..." : "Завантажити більше"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Articles;
