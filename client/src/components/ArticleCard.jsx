import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/articles/${article._id}`);
  };

  return (
    <div>
      {" "}
      <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col">
        {/* Збільшена висота картинки */}
        <img
          src={assets[article.image]}
          alt={article.title}
          className="w-full h-64 object-cover" // раніше було h-48
        />

        <div className="p-4 flex flex-col gap-4 flex-1">
          <h3 className="text-lg font-semibold">{article.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3">{article.text}</p>

          <button
            onClick={handleReadMore}
            className="mt-auto px-4 py-2 bg-[#354024] text-white rounded-full hover:brightness-110 w-fit"
          >
            Читати далі
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
