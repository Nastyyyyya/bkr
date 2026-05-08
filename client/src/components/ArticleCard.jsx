import { assets } from "../assets/assets";
import { useNavigate } from "react-router-dom";

const ArticleCard = ({ article }) => {
  const navigate = useNavigate();

  const handleReadMore = () => {
    navigate(`/articles/${article._id}`);
  };

  const stripHtml = (htmlString) => {
    if (!htmlString) return "";
    const doc = new DOMParser().parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <div className="group h-full">
      <div className="bg-[#F3F0E8] rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full border border-gray-100 pt-2">
        {/* Контейнер картинки з легким зумом при наведенні */}
        <div className="overflow-hidden bg-[#F3F0E8] flex items-center justify-center h-72">
          <img
            src={assets[article.image]}
            alt={article.title}
            className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Контентна частина */}
        <div className="p-4 flex flex-col items-center text-center flex-1">
          <h3 className="text-xl font-bold text-gray-800 mb-3 p-4 min-h-[3.5rem] flex items-center">
            {article.title}
          </h3>

          <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-3">
            {stripHtml(article.text)}
          </p>

          {/* Кнопка по центру */}
          <div className="mt-auto pt-2">
            <button
              onClick={handleReadMore}
              className="px-10 py-3 bg-[#354024] text-white font-medium rounded-full hover:bg-[#45542f] active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Читати далі
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
