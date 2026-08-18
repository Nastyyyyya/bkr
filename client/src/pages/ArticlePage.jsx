import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./ArticlePage.css";
import { assets } from "../assets/assets";
import Navbar from "../components/Navbar";

const ArticlePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/articles/${id}`, {
          withCredentials: true,
        });
        if (data.success) {
          setArticle(data.article);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchArticle();
  }, [id]);

  if (!article) return <p className="loading">Завантаження...</p>;

  return (
    <div>
      {" "}
      <Navbar />
      <div className="article-container container">
        <h1 className="article-title">{article.title}</h1>

        {article.image && (
          <img
            src={assets[article.image]}
            alt={article.title}
            className="article-image"
          />
        )}

        <div
          className="article-text"
          dangerouslySetInnerHTML={{ __html: article.text }}
        ></div>

        <button className="back-button" onClick={() => navigate(-1)}>
          ← Назад
        </button>
      </div>
    </div>
  );
};

export default ArticlePage;
