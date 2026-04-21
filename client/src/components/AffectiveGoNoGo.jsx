import React, { useState, useEffect, useCallback, useRef } from "react";

const TOTAL_TIME = 60; // 1 хвилина
const INTERVAL_TIME = 1300; // Час показу одного кружечка

const AffectiveGoNoGoKeyboard = ({ childId, backendUrl }) => {
  const [gameState, setGameState] = useState("ready");
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [currentColor, setCurrentColor] = useState(null);

  const [stats, setStats] = useState({
    goTrials: 0,
    noGoTrials: 0,
    hits: 0,
    falseAlarms: 0,
    misses: 0,
    reactionTimes: [],
  });

  const stateRef = useRef({
    currentColor: null,
    hasClicked: false,
    lastChangeTime: 0,
  });

  // Логіка появи нового кружечка
  const nextCircle = useCallback(() => {
    // Якщо попередній був зеленим і дитина не натиснула - це пропуск
    if (
      stateRef.current.currentColor === "green" &&
      !stateRef.current.hasClicked
    ) {
      setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
    }

    const isGo = Math.random() < 0.7; // 70% Go, 30% No-Go
    const newColor = isGo ? "green" : "red";

    setCurrentColor(newColor);
    setStats((prev) => ({
      ...prev,
      goTrials: isGo ? prev.goTrials + 1 : prev.goTrials,
      noGoTrials: !isGo ? prev.noGoTrials + 1 : prev.noGoTrials,
    }));

    stateRef.current = {
      currentColor: newColor,
      lastChangeTime: Date.now(),
      hasClicked: false,
    };
  }, []);

  // Завершення гри та запис у БД
  const finishGame = useCallback(
    async (finalStats) => {
      setGameState("finished");

      const hitRate =
        finalStats.goTrials > 0
          ? (finalStats.hits / finalStats.goTrials) * 100
          : 0;
      const falseAlarmRate =
        finalStats.noGoTrials > 0
          ? (finalStats.falseAlarms / finalStats.noGoTrials) * 100
          : 0;
      const avgReaction =
        finalStats.reactionTimes.length > 0
          ? Math.round(
              finalStats.reactionTimes.reduce((a, b) => a + b, 0) /
                finalStats.reactionTimes.length,
            )
          : 0;

      if (backendUrl && childId) {
        try {
          await fetch(`${backendUrl}/api/child-go-no-go/${childId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              hits: finalStats.hits,
              misses: finalStats.misses,
              falseAlarms: finalStats.falseAlarms,
              goTrials: finalStats.goTrials,
              noGoTrials: finalStats.noGoTrials,
              avgReactionTime: avgReaction,
              hitRate: Number(hitRate.toFixed(2)),
              falseAlarmRate: Number(falseAlarmRate.toFixed(2)),
              date: new Date(),
            }),
            credentials: "include",
          });
        } catch (err) {
          console.error("Помилка збереження результатів у БД:", err);
        }
      }
    },
    [childId, backendUrl],
  );

  const startGame = () => {
    setStats({
      goTrials: 0,
      noGoTrials: 0,
      hits: 0,
      falseAlarms: 0,
      misses: 0,
      reactionTimes: [],
    });
    setTimeLeft(TOTAL_TIME);
    setGameState("playing");
    nextCircle();
  };

  // Таймери
  useEffect(() => {
    if (gameState !== "playing") return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    const colorTimer = setInterval(nextCircle, INTERVAL_TIME);
    return () => {
      clearInterval(timer);
      clearInterval(colorTimer);
    };
  }, [gameState, nextCircle]);

  // Слідкуємо за часом для фінішу
  useEffect(() => {
    if (timeLeft === 0 && gameState === "playing") {
      finishGame(stats);
    }
  }, [timeLeft, gameState, finishGame, stats]);

  // Обробка пробілу
  const handleKeyDown = useCallback(
    (e) => {
      if (
        e.code !== "Space" ||
        gameState !== "playing" ||
        stateRef.current.hasClicked
      )
        return;

      stateRef.current.hasClicked = true;
      const reaction = Date.now() - stateRef.current.lastChangeTime;

      if (stateRef.current.currentColor === "green") {
        setStats((prev) => ({
          ...prev,
          hits: prev.hits + 1,
          reactionTimes: [...prev.reactionTimes, reaction],
        }));
      } else {
        setStats((prev) => ({ ...prev, falseAlarms: prev.falseAlarms + 1 }));
      }
    },
    [gameState],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const getInterpretation = () => {
    const hitRate =
      stats.goTrials > 0 ? (stats.hits / stats.goTrials) * 100 : 0;
    const falseAlarmRate =
      stats.noGoTrials > 0 ? (stats.falseAlarms / stats.noGoTrials) * 100 : 0;
    const avgRT =
      stats.reactionTimes.length > 0
        ? Math.round(
            stats.reactionTimes.reduce((a, b) => a + b, 0) /
              stats.reactionTimes.length,
          )
        : 0;

    let title = "Гарна спроба! 👍";
    let text = "Твій мозок попрацював на славу.";
    let color = "text-blue-600";

    if (hitRate > 92 && falseAlarmRate < 12) {
      title = "Супер-ніндзя! 🥷";
      text =
        "У тебе надзвичайна увага. Ти вмієш вчасно зупинитися і не пропускаєш головне!";
      color = "text-green-600";
    } else if (falseAlarmRate >= 25) {
      title = "Ти дуже швидкий(а)! ⚡";
      text =
        "Реакція крута, але іноді ти натискаєш занадто поспішно. Спробуй бути трішки терплячішим.";
      color = "text-orange-600";
    } else if (hitRate < 80) {
      title = "Будь уважнішим! 🎯";
      text =
        "Здається, ти трохи відволікаєшся. Спробуй дивитися прямо в центр, щоб нічого не проґавити.";
      color = "text-red-600";
    }

    return { hitRate, falseAlarmRate, avgRT, title, text, color };
  };

  const results = gameState === "finished" ? getInterpretation() : null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[550px] p-6 bg-white font-sans">
      <style>{`
        @keyframes super-pulse { 
          0% { transform: scale(0.4); opacity: 0; } 
          50% { transform: scale(1.15); opacity: 1; } 
          100% { transform: scale(1); opacity: 1; } 
        }
        .circle-active { animation: super-pulse 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {gameState === "ready" && (
        <div className="text-center bg-gray-50 p-10 rounded-[30px] shadow-sm max-w-md border border-gray-100">
          <h1 className="text-3xl font-black text-gray-800 mb-4">
            Перевір свою увагу! 🚀
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            Побачиш <span className="text-green-500 font-bold">зелений</span> —
            тисни Пробіл.
            <br />
            На <span className="text-red-500 font-bold">червоний</span> — замри.
          </p>
          <button
            onClick={startGame}
            className="bg-black text-white px-14 py-5 rounded-full font-bold text-xl hover:bg-gray-800 transition-all active:scale-95 shadow-xl"
          >
            ПОЧАТИ
          </button>
        </div>
      )}

      {gameState === "playing" && (
        <div className="flex flex-col items-center">
          <div className="mb-10 text-3xl font-mono font-black text-gray-300 italic">
            Залишилось: {timeLeft}с
          </div>

          <div className="relative flex items-center justify-center w-64 h-64 bg-gray-50 rounded-full border border-gray-100">
            <div
              key={stats.goTrials + stats.noGoTrials}
              className={`w-52 h-52 rounded-full shadow-2xl circle-active ${currentColor === "green" ? "bg-emerald-500" : "bg-rose-500"}`}
              style={{
                boxShadow: `0 0 60px ${currentColor === "green" ? "rgba(16,185,129,0.4)" : "rgba(244,63,94,0.4)"}`,
              }}
            />
          </div>

          <p className="mt-10 text-gray-400 font-bold tracking-widest uppercase">
            Тисни Space!
          </p>
        </div>
      )}

      {gameState === "finished" && results && (
        <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
          <div className="text-center mb-8">
            <h2 className={`text-4xl font-black mb-2 ${results.color}`}>
              {results.title}
            </h2>
            <p className="text-gray-600 text-lg italic">{results.text}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="bg-emerald-50 p-6 rounded-[25px] text-center border border-emerald-100">
              <span className="block text-2xl mb-1">🎯</span>
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                Уважність
              </p>
              <p className="text-2xl font-black text-emerald-800">
                {results.hitRate.toFixed(0)}%
              </p>
            </div>
            <div className="bg-rose-50 p-6 rounded-[25px] text-center border border-rose-100">
              <span className="block text-2xl mb-1">🛑</span>
              <p className="text-xs font-bold text-rose-700 uppercase tracking-widest">
                Контроль
              </p>
              <p className="text-2xl font-black text-rose-800">
                {(100 - results.falseAlarmRate).toFixed(0)}%
              </p>
            </div>
            <div className="bg-indigo-50 p-6 rounded-[25px] text-center border border-indigo-100">
              <span className="block text-2xl mb-1">⚡</span>
              <p className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                Швидкість
              </p>
              <p className="text-2xl font-black text-indigo-800">
                {results.avgRT}мс
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-6 rounded-3xl text-sm text-gray-500 border border-gray-100">
            <div className="flex justify-between">
              <span>Правильні влучання:</span>{" "}
              <span className="font-bold text-gray-700">{stats.hits}</span>
            </div>
            <div className="flex justify-between">
              <span>Помилки (на червоне):</span>{" "}
              <span className="font-bold text-gray-700">
                {stats.falseAlarms}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Пропущені зелені:</span>{" "}
              <span className="font-bold text-gray-700">{stats.misses}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AffectiveGoNoGoKeyboard;
