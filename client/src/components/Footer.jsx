import React from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#354024] text-[#F3F0E8] py-12 px-4 md:px-16 mt-20">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 text-left">
          <div className="flex flex-col">
            <Link to="/">
              <img
                src={assets.logo}
                alt="CALMLI"
                className="w-40 brightness-0 invert mb-6"
              />
            </Link>
            <p className="text-sm leading-relaxed opacity-100">
              Дбаємо про ваше ментальне здоров'я!
            </p>
          </div>

          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-6">Сторінки</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-100">
              <li>
                <Link to="/" className="hover:opacity-100 transition">
                  Головна
                </Link>
              </li>
              <li>
                <Link to="/articles" className="hover:opacity-100 transition">
                  Статті
                </Link>
              </li>
              <li>
                <Link to="/exercises" className="hover:opacity-100 transition">
                  Самодопомога
                </Link>
              </li>
              <li>
                <Link
                  to="/my-children"
                  className="hover:opacity-100 transition"
                >
                  Акаунти дітей
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:opacity-100 transition">
                  Про нас
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-6">Юридична інформація</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-100">
              <li>
                <Link to="#" className="hover:opacity-100 transition">
                  Політика конфіденційності
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:opacity-100 transition">
                  Правила користування
                </Link>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="font-bold text-lg mb-6">Зв’язатися з нами</h4>
            <ul className="flex flex-col gap-3 text-sm opacity-100">
              <li>
                <a
                  href="mailto:calmli.support@gmail.com"
                  className="hover:opacity-100 transition"
                >
                  calmli.support@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+380987654321"
                  className="hover:opacity-100 transition"
                >
                  +380987654321
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex justify-center items-center">
          <p className="text-sm opacity-100">© 2026 Паславська Анастасія</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
