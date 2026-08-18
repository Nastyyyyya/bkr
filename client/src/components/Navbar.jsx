import React, { useContext, useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { AppContext } from "../context/AppContext.jsx";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobileRange, setIsMobileRange] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobileRange(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sendVerificationOtp = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-verify-otp`,
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
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedin(false);
        setUserData(false);
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container container-nav">
        <img
          src={assets.logo}
          alt="Logo"
          className="logo"
          onClick={() => navigate("/")}
        />

        <div className="nav-right">
          {!isMobileRange && (
            <div className="nav-links">
              <span onClick={() => navigate("/")}>Головна</span>
              <span onClick={() => navigate("/articles")}>Статті</span>
              <span onClick={() => navigate("/exercises")}>Самодопомога</span>
            </div>
          )}

          {userData ? (
            <div className="user-menu">
              <div className="avatar" onClick={toggleMobileMenu}>
                {userData.name[0].toUpperCase()}
              </div>

              {!isMobileRange && (
                <div className="dropdown">
                  <ul>
                    {!userData.isAccountVerified && (
                      <li onClick={sendVerificationOtp}>Верифікувати емейл</li>
                    )}
                    <li onClick={() => navigate("/add-child")}>
                      Додати дитину
                    </li>
                    <li onClick={() => navigate("/my-children")}>
                      Переглянути дітей
                    </li>
                    <li onClick={logout}>Вийти</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => navigate("/login")}>
              Вхід
              <img src={assets.arrow_icon} alt="" className="arrow-icon" />
            </button>
          )}
        </div>
      </div>

      {isMobileRange && mobileMenuOpen && (
        <div className="mobile-menu">
          <div className="back-arrow" onClick={toggleMobileMenu}>
            ←
          </div>
          <ul>
            <li
              onClick={() => {
                navigate("/articles");
                setMobileMenuOpen(false);
              }}
            >
              Статті
            </li>
            <li
              onClick={() => {
                navigate("/forum");
                setMobileMenuOpen(false);
              }}
            >
              Форум
            </li>
            <li
              onClick={() => {
                navigate("/self-help");
                setMobileMenuOpen(false);
              }}
            >
              Самодопомога
            </li>

            {!userData.isAccountVerified && (
              <li
                onClick={() => {
                  sendVerificationOtp();
                  setMobileMenuOpen(false);
                }}
              >
                Верифікувати емейл
              </li>
            )}
            <li
              onClick={() => {
                navigate("/add-child");
                setMobileMenuOpen(false);
              }}
            >
              Додати дитину
            </li>
            <li
              onClick={() => {
                navigate("/my-children");
                setMobileMenuOpen(false);
              }}
            >
              Переглянути дітей
            </li>
            <li
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
            >
              Вийти
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
