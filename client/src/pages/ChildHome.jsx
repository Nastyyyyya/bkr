import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

import { AppContext } from "../context/AppContext";
import MoodModal from "../components/MoodModal";
import MoodCalendar from "../components/MoodCalendar";
import Garden from "../components/Garden";

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
        const childRes = await axios.get(`${backendUrl}/api/child/${childId}`);

        if (!childRes.data.success) {
          toast.error(childRes.data.message);
          navigate("/");
          return;
        }

        setChild(childRes.data.child);

        const moodRes = await axios.get(
          `${backendUrl}/api/child-mood/today/${childId}`,
        );

        setTodayMood(moodRes.data.mood || "happy");

        if (!moodRes.data.hasMood) {
          setShowModal(true);
        }

        const gardenRes = await axios.get(
          `${backendUrl}/api/child-garden/${childId}`,
        );

        setGarden(gardenRes.data);
      } catch (err) {
        toast.error(err.message);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [childId, backendUrl, navigate]);

  const handleYes = () => {
    setShowModal(false);
    navigate(`/child-chatbot/${childId}`);
  };

  const handleNo = () => {
    setShowModal(false);
  };

  const handleChildLogout = () => {
    setUserData(false);
    setIsLoggedin(false);
    navigate("/");
  };

  if (loading) {
    return <p className="text-center mt-20">Завантаження...</p>;
  }

  if (!child) return null;

  return (
    <div className="flex flex-col items-center justify-center relative container">
      {showModal && (
        <MoodModal
          childId={childId}
          backendUrl={backendUrl}
          onYes={handleYes}
          onNo={handleNo}
        />
      )}

      <h1 className="text-3xl sm:text-5xl font-bold mb-4">
        Привіт, {child.name}! 🌈
      </h1>

      <p className="text-lg mb-6">Тут твій простір для гри 🎮</p>

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

      <button
        onClick={handleChildLogout}
        className="mt-10 px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600"
      >
        Вийти
      </button>
    </div>
  );
};

export default ChildHome;
