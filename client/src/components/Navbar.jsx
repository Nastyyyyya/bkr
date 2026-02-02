import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        backendUrl + "/api/auth/send-verify-otp",
      );

      if (data.success) {
        navigate("/email-verify");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 absolute top-0 z-50">
      {/* Логотип */}
      <img
        src={assets.logo}
        alt=""
        className="w-28 sm:w-32 cursor-pointer"
        onClick={() => navigate("/")}
      />

      {/* Справа: посилання + кнопка/аватар */}
      <div className="flex items-center gap-4">
        {/* Посилання навігації */}
        <div className="hidden sm:flex gap-4 mr-4">
          <span
            onClick={() => navigate("/articles")}
            className="cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-all"
          >
            Статті
          </span>
          <span
            onClick={() => navigate("/forum")}
            className="cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-all"
          >
            Форум
          </span>
          <span
            onClick={() => navigate("/self-help")}
            className="cursor-pointer px-3 py-2 rounded hover:bg-gray-100 transition-all"
          >
            Самодопомога
          </span>
        </div>

        {/* Правий блок: аватар або кнопка Вхід */}
        {userData ? (
          <div className="relative group">
            {/* Аватарка */}
            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-black text-white cursor-pointer">
              {userData.name[0].toUpperCase()}
            </div>

            {/* Dropdown меню */}
            <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-gray-100 rounded shadow-lg text-sm z-50">
              <ul className="list-none m-0 p-2 flex flex-col gap-1">
                {!userData.isAccountVerified && (
                  <li
                    onClick={sendVerificationOtp}
                    className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                  >
                    Верифікувати емейл
                  </li>
                )}

                <li
                  onClick={() => navigate("/add-child")}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                >
                  Додати дитину
                </li>

                <li
                  onClick={() => navigate("/my-children")}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                >
                  Переглянути дітей
                </li>

                <li
                  onClick={logout}
                  className="py-2 px-3 hover:bg-gray-200 cursor-pointer rounded"
                >
                  Вийти
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 bg-[#354024] text-white rounded-full px-6 py-2 hover:brightness-110 transition-all"
          >
            Вхід
            <img
              src={assets.arrow_icon}
              alt=""
              className="filter invert" // робимо стрілку білою
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
