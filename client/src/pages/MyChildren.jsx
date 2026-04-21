import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const MyChildren = () => {
  const { backendUrl } = useContext(AppContext);
  const [children, setChildren] = useState([]);
  const navigate = useNavigate();

  const fetchChildren = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/child/my`);
      if (data.success) {
        setChildren(data.children);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  const handleSelectChild = (childId) => {
    navigate(`/child/${childId}`);
  };

  return (
    <div className="min-h-screen bg-[#b7c1a8] py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#354024] mb-4">
            Мої діти
          </h1>
          <div className="w-24 h-1 bg-[#354024] mx-auto opacity-20 rounded-full"></div>
        </header>

        {children.length === 0 ? (
          <div className="bg-[#f3f0e8]/50 backdrop-blur-md rounded-3xl p-12 text-center border border-[#354024]/10">
            <p className="text-[#354024] font-serif italic text-lg">
              У вас ще немає доданих дітей
            </p>
            <button
              onClick={() => navigate("/add-child")} // Припустимий шлях
              className="mt-6 px-8 py-3 bg-[#354024] text-[#f3f0e8] rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#354024]/90 transition-all shadow-lg"
            >
              Додати першу дитину
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {children.map((child) => (
              <div
                key={child._id}
                onClick={() => handleSelectChild(child._id)}
                className="group relative bg-[#f3f0e8] rounded-[2rem] p-8 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#354024]/20 border border-transparent hover:border-[#354024]/10"
              >
                {/* Декоративний елемент у кутку */}
                <div className="absolute top-6 right-6 w-10 h-10 bg-[#b7c1a8]/20 rounded-full flex items-center justify-center group-hover:bg-[#354024] group-hover:text-[#f3f0e8] transition-colors duration-500">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>

                {/* Аватар-заглушка (можна замінити на іконку) */}
                <div className="w-16 h-16 bg-[#b7c1a8] rounded-2xl mb-6 flex items-center justify-center text-[#354024] text-2xl font-serif font-bold">
                  {child.name.charAt(0)}
                </div>

                <h2 className="text-2xl font-serif font-bold text-[#354024] mb-2">
                  {child.name}
                </h2>

                <div className="flex flex-col space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#354024]/40 font-bold">
                    Профіль дитини
                  </span>
                  <p className="text-[#354024]/70 font-medium italic">
                    @{child.username}
                  </p>
                </div>

                {/* Ефект підсвічування знизу */}
                <div className="mt-8 pt-6 border-t border-[#354024]/5">
                  <span className="text-[#354024] text-sm font-semibold group-hover:underline underline-offset-4">
                    Переглянути успіхи →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyChildren;
