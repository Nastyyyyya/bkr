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
    if (loading || !hasMore) return;
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
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="container mx-auto py-10 px-4 mt-32">
        {/* Грід для статей */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-28">
          {articles.map((article) => (
            <ArticleCard key={article._id} article={article} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-12">
            <button
              onClick={loadArticles}
              disabled={loading}
              className="px-8 py-2 bg-[#354024] text-white rounded-full hover:bg-[#4a5a32] transition-colors disabled:opacity-50"
            >
              {loading ? "Завантаження..." : "Завантажити більше"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Articles;
