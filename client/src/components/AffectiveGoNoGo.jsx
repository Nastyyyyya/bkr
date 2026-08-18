import React, { useState, useEffect, useCallback, useRef } from "react";

const TOTAL_TIME = 60;
const INTERVAL_TIME = 1300;

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

  const nextCircle = useCallback(() => {
    if (
      stateRef.current.currentColor === "green" &&
      !stateRef.current.hasClicked
    ) {
      setStats((prev) => ({ ...prev, misses: prev.misses + 1 }));
    }

    const isGo = Math.random() < 0.7;
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
          await fetch(`${backendUrl}/api/child-go-no-go/save/${childId}`, {
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
      if (e.code === "Space") {
        e.preventDefault();
      }

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
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto bg-[#f8f9f5] p-10 sm:p-16 rounded-[50px] shadow-[0_20px_50px_rgba(44,72,50,0.1)] border border-white relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 bg-rose-100/50 rounded-full blur-3xl"></div>

          <div className="relative z-10 text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-[#2c4832] mb-6 uppercase tracking-tight leading-none">
              Перевір свою <br />{" "}
              <span className="text-emerald-600">увагу!</span> 🚀
            </h1>

            <div className="bg-white/60 backdrop-blur-md p-8 rounded-[35px] border border-white shadow-inner mb-10">
              <p className="text-[#2c4832]/80 text-lg sm:text-xl font-medium leading-relaxed">
                Побачиш{" "}
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-xl font-black mx-1">
                  ЗЕЛЕНИЙ
                </span>{" "}
                — тисни Пробіл.
              </p>
              <div className="h-4"></div>
              <p className="text-[#2c4832]/80 text-lg sm:text-xl font-medium leading-relaxed">
                На{" "}
                <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-xl font-black mx-1">
                  ЧЕРВОНИЙ
                </span>{" "}
                — замри і чекай.
              </p>
            </div>

            <button
              onClick={startGame}
              className="group relative bg-[#2c4832] text-white px-20 py-6 rounded-[30px] font-black text-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(44,72,50,0.3)] active:scale-95"
            >
              <span className="relative z-10">ПОЧАТИ ГРУ</span>
              <div className="absolute inset-0 bg-white/10 rounded-[30px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
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
