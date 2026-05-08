import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import "./Navbar.css";
import { assets } from "../assets/assets";
import "./ChildNavbar.css";

const ChildNavbar = () => {
  // ВИДАЛИЛИ childName звідси
  const navigate = useNavigate();
  const { childId } = useParams();
  const { backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);

  const handleLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);

      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
        toast.success("Бувай! До зустрічі! ✨", {
          position: "top-center",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            textAlign: "center",
            borderRadius: "15px",
            fontWeight: "bold",
          },
        });
      }
    } catch (error) {
      toast.error("Ой, не вдалося вийти");
      console.error(error.message);
    }
  };

  return (
    <nav
      className="navbar"
      style={{ position: "sticky", backgroundColor: "#D4E6B8" }}
    >
      <div className="container container-nav">
        {/* Логотип зліва */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate(`/child-home/${childId}`)}
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <img
            src={assets.logo}
            alt="Logo"
            className="logo"
            onClick={() => navigate("/")}
          />
        </div>

        {/* Навігація та іконки справа */}
        <div className="nav-right fairytale">
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <button
              onClick={() => navigate(`/fairytales/${childId}`)} // Змінено тут
              title="Казки"
            >
              <img
                src={assets.book}
                alt="Казки"
                style={{ width: "32px", height: "32px" }}
              />
            </button>

            <button
              className="game"
              onClick={() => navigate(`/child-chatbot/${childId}`)}
              title="Чат-бот"
            >
              🤖
            </button>

            <button
              className="game"
              onClick={() => navigate(`/exercises`)}
              title="Ігри"
            >
              🎮
            </button>

            <button
              onClick={handleLogout}
              className="login-btn"
              style={{ backgroundColor: "#ef4444", padding: "10px 24px" }}
            >
              Вийти 🚪
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ChildNavbar;
