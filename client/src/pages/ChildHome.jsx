import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/assets";

import { AppContext } from "../context/AppContext";
import MoodModal from "../components/MoodModal";
import MoodCalendar from "../components/MoodCalendar";
import Garden from "../components/Garden";
import LuscherTest from "./LuscherTest";
import AffectiveGoNoGo from "../components/AffectiveGoNoGo";
import ChildrenAnxietyMeter from "../components/ChildrenAnxietyMeter";
import SDQTest from "../components/SDQTest";
import WilsonTreeTest from "../components/WilsonTreeTest";
import DemboRubinstein from "../components/DemboRubinstein";
import FutureLetter from "../components/FutureLetter";
import ChildNavbar from "../components/ChildNavbar";

import "../index.css";

const ChildHome = () => {
  const { childId } = useParams();
  const navigate = useNavigate();
  const { backendUrl, setUserData, setIsLoggedin } = useContext(AppContext);

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [garden, setGarden] = useState(null);
  const [todayMood, setTodayMood] = useState("happy");

  const [assistantText, setAssistantText] = useState("Привіт! Давай пограємо?");

  const sectionPhrases = {
    "section-welcome": "Привіт! Радий тебе бачити. З чого почнемо?",
    "section-mood": "Тут ти можеш переглянути свій настрій",
    "section-garden": "Подивись, який гарний сад ми виростили разом!",
    "section-future": "Напиши листа собі у майбутнє",
    "section-dembo": "Як ти почуваєшся? Познач з допомогою повзунка.",
    "section-wilson": "Хто ти сьогодні на цьому дереві? Обери свого чоловічка.",
    "section-luscher": "Кольори можуть розповісти про твій настрій. Спробуй!",
    "section-twine": "Час для казки! Тут ти обираєш, що буде далі.",
    "section-anxiety": "Давай послухаємо, як б'ється твоє серденько.",
    "section-gonogo": "Будь уважним! Це гра на швидкість та точність.",
    "section-sdq": "Тест для тебе",
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setAssistantText(sectionPhrases[entry.target.id] || assistantText);
          }
        });
      },
      { threshold: 0.5 },
    );

    Object.keys(sectionPhrases).forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [loading, assistantText]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childRes = await axios.get(`${backendUrl}/api/child/${childId}`, {
          withCredentials: true,
        });
        if (childRes.data.success) setChild(childRes.data.child);

        const moodRes = await axios.get(
          `${backendUrl}/api/child-mood/today/${childId}`,
          { withCredentials: true },
        );
        setTodayMood(moodRes.data.mood || "happy");
        if (!moodRes.data.hasMood) setShowModal(true);

        const gardenRes = await axios.get(
          `${backendUrl}/api/child-garden/${childId}`,
          { withCredentials: true },
        );
        setGarden(gardenRes.data);
      } catch (err) {
        console.error("Помилка завантаження даних:", err.message);
      } finally {
        setLoading(false);
      }
    };
    if (childId) fetchData();
  }, [childId, backendUrl]);

  const handleChildLogout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setUserData(false);
        setIsLoggedin(false);
        navigate("/");
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#D4E6B8]">
        <p className="text-[#2c4832] font-black uppercase tracking-widest">
          Завантаження...
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#D4E6B8]">
      <ChildNavbar childName={child?.name} onLogout={handleChildLogout} />

      <div
        className="assistant-container group cursor-pointer"
        onClick={() => navigate(`/child-chatbot/${childId}`)}
      >
        <div className="speech-bubble group-hover:scale-105 transition-transform">
          <p className="p-assist">{assistantText}</p>
        </div>
        <img
          src={assets.header_img}
          alt="Helper"
          className="assistant-img transition-all duration-300 group-hover:scale-110 group-active:scale-90"
        />
      </div>

      <div className="flex flex-col items-center justify-center relative container pb-20 mx-auto px-4">
        {showModal && (
          <MoodModal
            childId={childId}
            backendUrl={backendUrl}
            onYes={() => {
              setShowModal(false);
              navigate(`/child-chatbot/${childId}`);
            }}
            onNo={() => setShowModal(false)}
          />
        )}

        {childId && (
          <div className="w-full flex flex-col items-center gap-12">
            <div id="section-mood" className="w-full flex justify-center">
              <MoodCalendar childId={childId} />
            </div>
            <div id="section-garden" className="w-full">
              {garden && (
                <Garden
                  flowers={garden.flowers}
                  treeStage={garden.treeStage}
                  rain={garden.rain}
                  beaver={garden.beaver}
                  clouds={garden.clouds}
                  currentMood={todayMood}
                />
              )}
            </div>
          </div>
        )}

        <div id="section-dembo" className="w-full mt-16 px-4">
          <DemboRubinstein childId={childId} backendUrl={backendUrl} />
        </div>

        <div id="section-wilson" className="w-full max-w-5xl mt-16">
          <WilsonTreeTest
            childId={childId}
            backendUrl={backendUrl}
            onSelect={(num) => console.log(num)}
          />
        </div>

        <div
          id="section-luscher"
          className="w-full max-w-5xl mt-16 bg-[#f8f9f5] rounded-[40px] border border-white overflow-hidden shadow-[0_20px_50px_rgba(44,72,50,0.1)]"
        >
          <LuscherTest childId={childId} />
        </div>

        <div id="section-anxiety" className="w-full mt-16">
          <ChildrenAnxietyMeter childId={childId} backendUrl={backendUrl} />
        </div>

        <div
          id="section-gonogo"
          className="w-full max-w-5xl mt-16 rounded-[40px] overflow-hidden shadow-[0_20px_50px_rgba(44,72,50,0.1)]"
        >
          <AffectiveGoNoGo childId={childId} backendUrl={backendUrl} />
        </div>

        <div id="section-sdq" className="w-full mt-16">
          <SDQTest childId={childId} backendUrl={backendUrl} />
        </div>

        <div id="section-future" className="w-full max-w-5xl mt-16">
          <FutureLetter childId={childId} backendUrl={backendUrl} />
        </div>
      </div>
    </div>
  );
};

export default ChildHome;
