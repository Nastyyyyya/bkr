import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

import { AppContext } from "../context/AppContext";
import MoodModal from "../components/MoodModal";
import MoodCalendar from "../components/MoodCalendar";
import Garden from "../components/Garden";
import LuscherTest from "./LuscherTest";
import AffectiveGoNoGo from "../components/AffectiveGoNoGo";
import ChildrenAnxietyMeter from "../components/ChildrenAnxietyMeter";
import SDQTest from "../components/SDQTest";
import WilsonTreeTest from "../components/WilsonTreeTest";
import DemboRubinstein from "../components/DemboRubinstein"; // Імпортуємо новий компонент
import FutureLetter from "../components/FutureLetter";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const childRes = await axios.get(`${backendUrl}/api/child/${childId}`, {
          withCredentials: true,
        });

        if (childRes.data.success) {
          setChild(childRes.data.child);
        }

        const moodRes = await axios.get(
          `${backendUrl}/api/child-mood/today/${childId}`,
          { withCredentials: true },
        );

        setTodayMood(moodRes.data.mood || "happy");

        if (!moodRes.data.hasMood) {
          setShowModal(true);
        }

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

    if (childId) {
      fetchData();
    }
  }, [childId, backendUrl]);

  const handleYes = () => {
    setShowModal(false);
    navigate(`/child-chatbot/${childId}`);
  };

  const handleNo = () => setShowModal(false);

  const handleChildLogout = () => {
    setUserData(false);
    setIsLoggedin(false);
    navigate("/");
  };

  if (loading)
    return (
      <p className="text-center mt-20 text-indigo-500 font-bold">
        Завантаження...
      </p>
    );

  return (
    <div className="flex flex-col items-center justify-center relative container pb-20">
      {showModal && (
        <MoodModal
          childId={childId}
          backendUrl={backendUrl}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}

      <h1 className="text-3xl sm:text-5xl font-bold mb-4 mt-12 text-gray-800">
        Привіт{child ? `, ${child.name}` : ""}! 🌈
      </h1>

      <p className="text-lg mb-8 text-gray-500">
        Твій простір для гри та веселощів 🎮
      </p>

      {childId && (
        <div className="w-full flex flex-col items-center gap-12">
          <MoodCalendar childId={childId} />

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
      )}

      <div className="w-full max-w-5xl mt-16">
        <FutureLetter childId={childId} backendUrl={backendUrl} />
      </div>

      {/* НОВИЙ ТЕСТ: Шкала Дембо-Рубінштейн */}
      <div className="w-full mt-16 px-4">
         <DemboRubinstein childId={childId} backendUrl={backendUrl} />
      </div>

      <div className="w-full max-w-5xl mt-16">
        <WilsonTreeTest 
          childId={childId} 
          backendUrl={backendUrl} 
          onSelect={(num) => console.log("Результат дерева збережено для №:", num)} 
        />
      </div>

      <div className="w-full max-w-5xl mt-16 bg-white rounded-3xl border border-indigo-50 overflow-hidden shadow-2xl">
        <LuscherTest childId={childId} />
      </div>

      <div className="w-full max-w-5xl h-[650px] mt-16 rounded-3xl overflow-hidden shadow-2xl">
        <iframe
          src="/twine/Fairytale.html"
          title="Інтерактивна казка"
          className="w-full h-full border-none"
        />
      </div>

      <div className="w-full mt-16">
        <ChildrenAnxietyMeter childId={childId} backendUrl={backendUrl} />
      </div>

      <div className="w-full max-w-5xl h-[500px] mt-16 rounded-3xl overflow-hidden shadow-2xl">
        <AffectiveGoNoGo childId={childId} backendUrl={backendUrl} />
      </div>

      <div className="w-full mt-16">
        <SDQTest childId={childId} backendUrl={backendUrl} />
      </div>

      <button
        onClick={handleChildLogout}
        className="mt-20 px-12 py-4 bg-gradient-to-r from-red-400 to-red-500 text-white rounded-full font-bold hover:shadow-lg transition-all active:scale-95"
      >
        Вийти
      </button>
    </div>
  );
};

export default ChildHome;