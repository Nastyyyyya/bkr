import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const getSDQAnalysis = (scores) => {
  if (!scores) return { categories: {}, getLevelInfo: () => ({}) };

  const categories = {
    emotional: {
      label: "Емоційні симптоми",
      desc: "Тривожність, страхи, соматика.",
    },
    conduct: {
      label: "Проблеми з поведінкою",
      desc: "Дотримання правил, послух.",
    },
    hyperactivity: {
      label: "Гіперактивність",
      desc: "Увага та непосидючість.",
    },
    peer: {
      label: "Взаємодія з однолітками",
      desc: "Стосунки та наявність друзів.",
    },
    prosocial: {
      label: "Просоціальна поведінка",
      desc: "Доброта, емпатія, допомога.",
    },
  };

  const getLevelInfo = (score, key) => {
    if (key === "prosocial") {
      if (score >= 6)
        return { text: "Норма", color: "text-green-500", bg: "bg-green-50" };
      if (score === 5)
        return { text: "Межа", color: "text-amber-500", bg: "bg-amber-50" };
      return { text: "Низький", color: "text-red-500", bg: "bg-red-50" };
    }
    if (score <= 3)
      return { text: "Норма", color: "text-green-500", bg: "bg-green-50" };
    if (score <= 5)
      return { text: "Межа", color: "text-amber-500", bg: "bg-amber-50" };
    return { text: "Високий", color: "text-red-500", bg: "bg-red-50" };
  };

  return { categories, getLevelInfo };
};

const ChildOverview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  console.log("backendUrl:", backendUrl);

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  const [moodHistory, setMoodHistory] = useState([]);
  const [moodInsight, setMoodInsight] = useState("");
  const [viewRange, setViewRange] = useState(7);

  const [demboData, setDemboData] = useState(null);

  const [luscherData, setLuscherData] = useState(null);
  const [wilsonData, setWilsonData] = useState(null);
  const [goNoGoData, setGoNoGoData] = useState(null);
  const [sdqData, setSdqData] = useState(null);
  const [anxietyData, setAnxietyData] = useState([]);
  const [letter, setLetter] = useState(null);

  const [deepAnalysis, setDeepAnalysis] = useState(null);
  const [isAnalysing, setIsAnalysing] = useState(false);

  const handleDeepAnalysis = async () => {
    setIsAnalysing(true);
    try {
      const resData = await axios.get(
        `${backendUrl}/api/analytics/monthly/${id}`,
      );

      if (resData.data.success) {
        const resPython = await axios.post(
          `http://localhost:8000/analyze-dynamics`,
          {
            childId: id,
            mood_history: resData.data.data.moods,
            dembo_history: resData.data.data.dembo,
            anxiety_history: resData.data.data.anxiety,
            sdq_history: resData.data.data.sdq,
            gonogo_history: resData.data.data.gonogo,
          },
          {
            withCredentials: false,
          },
        );

        setDeepAnalysis(resPython.data);
      }
    } catch (err) {
      console.error("Помилка аналізу:", err);
      alert(
        "Не вдалося отримати дані. Переконайтеся, що Python-сервер запущено на порті 8000.",
      );
    } finally {
      setIsAnalysing(false);
    }
  };

  const getGoNoGoAnalysis = (data) => {
    const { hitRate, falseAlarmRate, avgReactionTime } = data;

    const analysis = {
      attention: { status: "", desc: "", color: "text-green-600" },
      inhibition: { status: "", desc: "", color: "text-red-600" },
      speed: { status: "", desc: "" },
    };

    if (hitRate >= 95) {
      analysis.attention.status = "Видатна";
      analysis.attention.desc = "Відмінна концентрація.";
    } else if (hitRate >= 80) {
      analysis.attention.status = "Добра";
      analysis.attention.desc = "Стабільна увага.";
    } else {
      analysis.attention.status = "Знижена";
      analysis.attention.desc = "Часті пропуски сигналів.";
      analysis.attention.color = "text-amber-600";
    }

    if (falseAlarmRate <= 25) {
      analysis.inhibition.status = "Відмінне";
      analysis.inhibition.desc = "Чудовий самоконтроль.";
      analysis.inhibition.color = "text-green-600";
    } else if (falseAlarmRate <= 50) {
      analysis.inhibition.status = "Середнє";
      analysis.inhibition.desc = "Схильність до поспіху.";
      analysis.inhibition.color = "text-amber-600";
    } else {
      analysis.inhibition.status = "Імпульсивність";
      analysis.inhibition.desc = "Дитині важко стримати реакцію.";
      analysis.inhibition.color = "text-red-600";
    }

    if (avgReactionTime < 300) {
      analysis.speed.status = "Висока";
      analysis.speed.desc = "Дуже швидка реакція.";
    } else if (avgReactionTime < 500) {
      analysis.speed.status = "Нормальна";
      analysis.speed.desc = "Середній темп обробки.";
    } else {
      analysis.speed.status = "Уповільнена";
      analysis.speed.desc = "Потребує більше часу на відповідь.";
    }

    return analysis;
  };

  const moodWeights = { happy: 5, neutral: 4, tired: 3, sad: 2, angry: 1 };
  const colorMap = {
    1: "#004680",
    2: "#00965e",
    3: "#e2001a",
    4: "#ffed00",
    5: "#964b94",
    6: "#8d5a2d",
    7: "#000000",
    0: "#8c8d8e",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          resChild,
          resMoods,
          resAnalytics,
          resLuscher,
          resDembo,
          resWilson,
          resGoNoGo,
          resSDQ,
          resAnxiety,
          resLetter,
        ] = await Promise.all([
          axios.get(`${backendUrl}/api/child/${id}`, {
            withCredentials: true,
          }),
          axios.get(
            `${backendUrl}/api/child-mood/${id}/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, "0")}`,
          ),
          axios.get(`${backendUrl}/api/child-mood/analytics/${id}`),
          axios.get(`${backendUrl}/api/luscher/latest-parent/${id}`),
          axios.get(`${backendUrl}/api/dembo/dembo-analytics/${id}`),
          axios.get(`${backendUrl}/api/wilson/history/${id}`),
          axios.get(`${backendUrl}/api/child-go-no-go/history/${id}`),
          axios.get(`${backendUrl}/api/sdq-test/history/${id}`),
          axios.get(`${backendUrl}/api/child-anxiety/history/${id}`),
          axios.get(`${backendUrl}/api/future-letter/last/${id}`),
        ]);

        if (resChild.data.success) {
          setChild(resChild.data.child);
        }

        const chartData = resMoods.data
          .map((item) => ({
            date: item.date.split("-").slice(2).join("."),
            fullDate: item.date,
            level: moodWeights[item.mood] || 3,
            label: item.mood,
          }))
          .sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

        setMoodHistory(chartData);
        setMoodInsight(resAnalytics.data.insight);

        if (resWilson.data.success && resWilson.data.history.length > 0) {
          const latest = resWilson.data.history[0];
          setWilsonData(latest);
        }

        if (resLuscher.data.success) {
          setLuscherData(resLuscher.data.result);
        }

        if (resGoNoGo.data.success && resGoNoGo.data.history.length > 0) {
          setGoNoGoData(resGoNoGo.data.history[0]);
        }

        if (resDembo.data.success && resDembo.data.data) {
          setDemboData(resDembo.data);
        }
        if (resAnxiety.data.success) {
          setAnxietyData(resAnxiety.data.history);
        }
        if (resLetter.data.success && resLetter.data.letter) {
          setLetter(resLetter.data.letter);
        }
        if (resSDQ.data.success && resSDQ.data.history?.length > 0) {
          setSdqData(resSDQ.data.history[0]);
        }
      } catch (error) {
        console.error("Помилка завантаження:", error);
        toast.error("Не вдалося завантажити всі дані звіту");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, backendUrl]);

  const filteredMoodData = moodHistory.slice(-viewRange);

  const downloadPDF = () => {
    const input = reportRef.current;
    if (!input) {
      toast.error("Контент для експорту не знайдено");
      return;
    }

    const downloadBtn = document.getElementById("download-btn");
    const backBtn = document.getElementById("back-btn");

    if (downloadBtn) downloadBtn.style.opacity = "0";
    if (backBtn) backBtn.style.opacity = "0";

    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#b7c1a8",
        logging: true,
        width: input.offsetWidth,
        height: input.offsetHeight,
      })
        .then((canvas) => {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");

          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();

          const imgProps = pdf.getImageProperties(imgData);
          const totalHeightMm = (imgProps.height * pdfWidth) / imgProps.width;

          let heightLeft = totalHeightMm;
          let position = 0;

          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalHeightMm);
          heightLeft -= pdfHeight;

          while (heightLeft > 0) {
            position = heightLeft - totalHeightMm;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalHeightMm);
            heightLeft -= pdfHeight;
          }

          pdf.save(`Звіт_${child?.name || "дитини"}.pdf`);

          if (downloadBtn) downloadBtn.style.opacity = "1";
          if (backBtn) backBtn.style.opacity = "1";
        })
        .catch((err) => {
          console.error("Помилка генерації:", err);
          if (downloadBtn) downloadBtn.style.opacity = "1";
          if (backBtn) backBtn.style.opacity = "1";
        });
    }, 500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#b7c1a8]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#354024] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="italic text-[#354024] font-serif text-lg">
            Створюємо щотижневий звіт…
          </p>
        </div>
      </div>
    );
  }

  if (!child) return null;

  return (
    <div
      ref={reportRef}
      className="min-h-screen bg-[#b7c1a8] py-16 md:px-12 lg:px-24 shadow-inner"
    >
      <div className="max-w-7xl mx-auto bg-[#f3f0e8] rounded-[40px] p-8 md:p-12 shadow-2xl">
        <header className="text-center mb-8 flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#354024]/60 font-bold mb-4">
            Персональний звіт для батьків
          </span>

          <div className="relative mb-8">
            <h1 className="text-5xl font-serif font-bold text-[#354024]">
              {child.name}
            </h1>
            <div className="w-12 h-[2px] bg-[#354024]/20 mx-auto mt-4"></div>
          </div>

          <button
            onClick={() => navigate(`/child-home/${child._id}`)}
            className="px-10 py-4 rounded-full bg-[#354024] text-[#f3f0e8] text-[11px] font-bold uppercase tracking-[0.15em] 
               hover:bg-[#45542f] hover:shadow-lg active:scale-95 transition-all duration-300 shadow-md"
          >
            Перейти до профілю дитини
          </button>
        </header>

        <div className="mb-8 p-5 bg-[#B7C1A8] border-l-4 border-[#354024] shadow-sm">
          <p className="text-xs max-w-none w-full text-[#354024] leading-relaxed">
            <strong className="uppercase tracking-wider">Важливо:</strong> Даний
            звіт сформовано автоматично на основі відповідей дитини. Ці дані є
            лише допоміжним інструментом для розуміння емоційного стану та{" "}
            <strong className="font-bold underline decoration-[#354024]/30">
              не є клінічним діагнозом
            </strong>
            . Для професійної інтерпретації результатів рекомендуємо звернутися
            до сертифікованого психолога.
          </p>
        </div>

        {/* --- БЛОК 1: НАСТРІЙ --- */}
        <section className="mb-12 bg-white rounded-3xl p-6 shadow-sm border border-[#354024]/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#354024]">
              Динаміка настрою
            </h2>
            <div className="flex bg-[#f3f0e8] rounded-full p-1">
              {[7, 30].map((range) => (
                <button
                  key={range}
                  onClick={() => setViewRange(range)}
                  className={`px-4 py-1 rounded-full text-xs font-bold transition-all ${
                    viewRange === range
                      ? "bg-[#354024] text-white"
                      : "text-[#354024]/80"
                  }`}
                >
                  {range === 7 ? "Тиждень" : "Місяць"}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredMoodData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#354024", fontSize: 12, opacity: 0.9 }}
                  dy={10}
                />
                <YAxis hide domain={[0, 6]} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#354024"
                  strokeWidth={4}
                  dot={{
                    r: 6,
                    fill: "#354024",
                    stroke: "#fff",
                    strokeWidth: 2,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 p-5 bg-[#b7c1a8]/20 rounded-2xl border-l-4 border-[#354024]">
            <p className="text-[#354024] max-w-none text-sm leading-relaxed italic">
              <span className="font-bold block mb-1 uppercase text-[10px] opacity-90">
                Аналіз періоду:
              </span>
              {moodInsight || "Збираємо дані для точнішого аналізу..."}
            </p>
          </div>
        </section>

        {/* --- БЛОК 2: ДЕМБО  --- */}
        {demboData && (
          <section className="mb-12 bg-white rounded-3xl p-6 shadow-sm border border-[#354024]/5">
            <h2 className="text-xl font-bold text-[#354024] mb-6">
              Профіль самооцінки (Дембо)
            </h2>
            <div className="h-80 w-full mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={[
                    { subject: "Здоров'я", value: demboData.data.health },
                    { subject: "Розум", value: demboData.data.intelligence },
                    { subject: "Характер", value: demboData.data.character },
                    { subject: "Щастя", value: demboData.data.happiness },
                  ]}
                >
                  <PolarGrid stroke="#b7c1a8" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "#354024", fontSize: 13, fontWeight: "bold" }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tickCount={6}
                    tick={{ fontSize: 10, fill: "#354024", opacity: 0 }}
                    axisLine={false}
                  />
                  <Radar
                    name="Самооцінка"
                    dataKey="value"
                    stroke="#354024"
                    strokeWidth={3}
                    fill="#354024"
                    fillOpacity={0.4}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      return (
                        <g key={payload.subject}>
                          <circle cx={cx} cy={cy} r={4} fill="#354024" />
                          <text
                            x={cx}
                            y={cy - 10}
                            textAnchor="middle"
                            fill="#354024"
                            fontSize="12"
                            fontWeight="bold"
                          >
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {[
                { label: "Здоров'я", val: demboData.data.health },
                { label: "Розум", val: demboData.data.intelligence },
                { label: "Характер", val: demboData.data.character },
                { label: "Щастя", val: demboData.data.happiness },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-[#f3f0e8] p-3 rounded-2xl text-center"
                >
                  <p className="text-[10px] uppercase opacity-90 font-bold">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-[#354024]">
                    {item.val}
                    <span className="text-sm opacity-60">/100</span>
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2 border-t border-[#354024]/5 pt-6">
              {demboData.insights.map((text, i) => (
                <p key={i} className="text-sm text-[#354024] flex gap-2">
                  <span className="text-[#b7c1a8] font-bold">•</span> {text}
                </p>
              ))}
            </div>
          </section>
        )}

        {/* --- БЛОК 3: ЛЮШЕР --- */}
        {luscherData && (
          <section className="mb-12 bg-white/60 rounded-3xl p-6 border border-[#354024]/10">
            <h2 className="text-xl font-bold text-[#354024] mb-6">
              Внутрішній стан (Люшер)
            </h2>
            <div className="flex gap-1.5 h-10 w-full mb-8 rounded-xl overflow-hidden shadow-inner">
              {luscherData.selection1.map((c, i) => (
                <div
                  key={i}
                  className="flex-1"
                  style={{ backgroundColor: colorMap[c] }}
                />
              ))}
            </div>
            <div className="space-y-4">
              {luscherData.parentInterpretations?.map((text, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-start border-l-2 border-[#354024]/10 pl-4"
                >
                  <p className="text-[#354024] max-w-none text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- БЛОК 4: ДЕРЕВО ВІЛЬСОНА --- */}
        {wilsonData && (
          <section className="mb-12 bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(53,64,36,0.05)] border border-white">
            {/* Заголовок та номер позиції */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-[#D4E6B8] text-[#2c4832] rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">
                  {wilsonData.selectedId}
                </div>
                <div>
                  <h2 className="text-sm font-black text-[#2c4832]/30 uppercase tracking-[0.3em] mb-1">
                    Тест результати
                  </h2>
                  <h3 className="text-xl font-black text-[#2c4832] uppercase tracking-tighter">
                    Емоційна позиція (Вільсон)
                  </h3>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-[#2c4832] uppercase tracking-widest">
                  Дата тестування
                </p>
                <p className="text-xs font-black text-[#2c4832]">
                  {new Date(wilsonData.date).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="relative overflow-hidden bg-[#F9FBF4] rounded-[30px] p-7 border border-[#D4E6B8]/30">
              <div className="absolute top-[-20px] right-[-20px] text-8xl opacity-[0.03] pointer-events-none">
                🌳
              </div>

              <div className="relative z-10">
                <span className="inline-block mb-3 px-3 py-1 bg-[#2c4832] text-[#D4E6B8] text-[9px] font-black uppercase tracking-[0.2em] rounded-lg">
                  Аналіз моделі
                </span>

                <p className="text-[#2c4832] text-md leading-relaxed font-medium italic">
                  {wilsonData.interpretation?.forParents ||
                    "Дитина обрала позицію, що характеризує поточний стан адаптації та самосприйняття в колективі."}
                </p>
              </div>
            </div>

            <p className="mt-4 sm:hidden text-[10px] text-[#2c4832]/90 italic text-right">
              {new Date(wilsonData.date).toLocaleDateString()}
            </p>
          </section>
        )}

        {/* --- БЛОК 5: GO/NO-GO  --- */}
        {goNoGoData &&
          (() => {
            const analysis = getGoNoGoAnalysis(goNoGoData);
            return (
              <section className="mb-12 bg-white rounded-[40px] p-8 shadow-[0_20px_50px_rgba(53,64,36,0.05)] border border-white">
                {/* Хедер блоку */}
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-sm font-black text-[#2c4832]/50 uppercase tracking-[0.3em] mb-1">
                      Когнітивний аналіз
                    </h2>
                    <h3 className="text-2xl font-black text-[#2c4832] uppercase tracking-tighter">
                      Профіль самоконтролю
                    </h3>
                  </div>

                  <div className="bg-[#2c4832] text-[#D4E6B8] w-20 h-20 rounded-[24px] flex flex-col items-center justify-center shadow-lg">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                      Бал
                    </span>
                    <span className="text-2xl font-black leading-none mt-1">
                      {Math.round(
                        (goNoGoData.hitRate +
                          (100 - goNoGoData.falseAlarmRate)) /
                          2,
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                  <div className="p-6 bg-[#F8FAFC] rounded-[32px] border border-blue-100/50">
                    <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest mb-3">
                      Рівень уваги
                    </p>
                    <p className="text-xl font-black text-slate-800 mb-2">
                      {analysis.attention.status}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {analysis.attention.desc}
                    </p>
                  </div>

                  <div className="p-6 bg-[#FFF9F9] rounded-[32px] border border-red-100/50">
                    <p className="text-[10px] font-black text-red-700 uppercase tracking-widest mb-3">
                      Процеси гальмування
                    </p>
                    <p className="text-xl font-black text-slate-800 mb-2">
                      {analysis.inhibition.status}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {analysis.inhibition.desc}
                    </p>
                  </div>

                  <div className="p-6 bg-[#FEFBF6] rounded-[32px] border border-amber-100/50">
                    <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-3">
                      Реакція моторики
                    </p>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-black text-slate-800">
                        {goNoGoData.avgReactionTime}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        мс
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Час обробки вхідного сигналу мозком.
                    </p>
                  </div>
                </div>

                <div className="bg-[#B7C1A8] p-8 rounded-[32px] border border-[#2c4832]/10 relative overflow-hidden">
                  <h4 className="text-[11px] font-black text-[#2c4832] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    Рекомендації для розвитку
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex gap-4">
                      <span className="text-xl font-black text-white/80">
                        01
                      </span>
                      <p className="text-sm text-[#2c4832] leading-relaxed font-medium">
                        При імпульсивності{" "}
                        <strong className="bg-white/40 px-1 rounded-md">
                          {goNoGoData.falseAlarmRate}%
                        </strong>{" "}
                        корисні ігри з чіткими стоп-сигналами для тренування
                        самоконтролю.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <span className="text-xl font-black text-white/80">
                        02
                      </span>
                      <p className="text-sm text-[#2c4832] leading-relaxed font-medium">
                        Вправи на "повільне малювання" допоможуть дитині
                        розвинути витримку та концентрацію на дрібних деталях.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

        {/* --- БЛОК 6: SDQ --- */}
        {sdqData &&
          (() => {
            const { categories, getLevelInfo } = getSDQAnalysis(sdqData.scores);
            return (
              <section className="mb-12 bg-white rounded-[40px] p-8 shadow-sm border border-[#354024]/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[#354024] pb-4">
                      Сильні сторони та труднощі
                    </h2>
                    <p className="text-[10px] text-[#354024] uppercase tracking-[0.2em] font-bold">
                      Загальна оцінка адаптації (SDQ)
                    </p>
                  </div>
                  <div className="bg-[#f3f0e8] px-6 py-3 rounded-2xl border border-[#354024]/5">
                    <p className="text-[9px] text-[#354024]/60 uppercase font-black mb-1">
                      Загальний висновок
                    </p>
                    <p className="text-sm font-bold text-[#354024]">
                      {sdqData.status}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.keys(categories).map((key) => {
                    const score = sdqData.scores[key];
                    const info = getLevelInfo(score, key);
                    return (
                      <div
                        key={key}
                        className={`p-6 rounded-[32px] border transition-all ${info.bg} border-[#2c4832]/10 shadow-sm flex flex-col justify-between min-h-[150px]`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <span className="text-[11px] font-black uppercase tracking-[0.15em] text-[#2c4832]">
                            {categories[key].label}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg border border-[#2c4832]/10 bg-white/80 shadow-sm ${info.color}`}
                          >
                            {info.text}
                          </span>
                        </div>

                        <div className="flex items-end justify-between gap-4">
                          <p className="text-[12px] text-[#2c4832] leading-tight max-w-[70%] font-medium">
                            {categories[key].desc}
                          </p>
                          <div className="text-right">
                            <p className="text-4xl font-black text-[#2c4832] tracking-tighter leading-none">
                              {score}
                              <span className="text-[14px] text-[#2c4832]/40 ml-1 font-bold">
                                /10
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 p-6 bg-[#354024] rounded-[32px] text-[#f3f0e8] relative overflow-hidden">
                  <div className="relative z-10 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-xl">
                      💡
                    </div>
                    <div>
                      <h4 className="font-bold text-sm mb-1 uppercase tracking-wider">
                        Порада
                      </h4>
                      <p className="text-xs opacity-70 leading-relaxed">
                        {sdqData.scores.total >= 15
                          ? "Результати вказують на наявність певних труднощів. Рекомендується обговорити ці показники з дитиною у довірливій формі або звернутися за консультацією для підтримки емоційного стану."
                          : "Показники в межах норми. Продовжуйте підтримувати відкритий зв'язок з дитиною, приділяючи увагу її емоційним потребам та стосункам з друзями."}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            );
          })()}

        {/* --- БЛОК 7: ТЕРОМЕТР ТРИВОЖНОСТІ --- */}
        {anxietyData.length > 0 && (
          <section className="mb-12 bg-white rounded-[40px] p-8 shadow-sm border border-[#354024]/5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#354024]">
                  Емоційний фон
                </h2>
                <p className="text-[10px] text-[#354024]/40 uppercase tracking-[0.2em] font-bold">
                  Термометр саморегуляції
                </p>
              </div>
              <div className="flex gap-2">
                {anxietyData
                  .slice(0, 5)
                  .reverse()
                  .map((entry, index) => (
                    <div
                      key={index}
                      className="w-2 h-8 rounded-full bg-[#354024]/10 overflow-hidden flex flex-col justify-end"
                      title={new Date(entry.date).toLocaleDateString()}
                    >
                      <div
                        className="w-full bg-red-400 transition-all"
                        style={{ height: `${entry.level * 10}%` }}
                      ></div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="relative w-32 h-32 flex items-center justify-center bg-[#f3f0e8] rounded-full border-4 border-white shadow-inner">
                <span className="text-5xl">
                  {anxietyData[0].level >= 9
                    ? "😡"
                    : anxietyData[0].level >= 7
                      ? "😰"
                      : anxietyData[0].level >= 5
                        ? "😟"
                        : "😃"}
                </span>
                <div className="absolute -bottom-2 bg-[#354024] text-white text-[10px] px-3 py-1 rounded-full font-bold">
                  РІВЕНЬ {anxietyData[0].level}
                </div>
              </div>

              <div className="flex-1">
                <div className="mb-4">
                  <h4 className="text-lg font-bold text-[#354024]">
                    {anxietyData[0].status}
                  </h4>
                  <p className="text-sm text-[#354024]/60 italic">
                    Останній замір:{" "}
                    {new Date(anxietyData[0].date).toLocaleString("uk-UA")}
                  </p>
                </div>

                <div className="p-5 bg-red-50 rounded-[24px] border border-red-100">
                  <p className="text-xs font-bold text-red-800 uppercase mb-1">
                    Порада для батьків:
                  </p>
                  <p className="text-sm text-red-900/80 leading-relaxed">
                    {anxietyData[0].advice ||
                      "Слідкуйте за станом дитини та забезпечте спокійну атмосферу."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* --- БЛОК 8: ЛИСТ В МАЙБУТНЄ --- */}
        {letter && (
          <section className="mb-12 relative">
            <div className="absolute -top-4 -right-2 z-10 bg-[#354024] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12 border-4 border-white font-bold">
              ✉️
            </div>

            <div className="bg-[#fffdfa] rounded-2xl p-8 shadow-md border-t-8 border-[#354024] relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(#354024 1px, transparent 1px)",
                  backgroundSize: "100% 2rem",
                }}
              ></div>

              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-serif italic text-[#354024] font-bold">
                    Особисте послання дитини
                  </h2>
                  <span className="text-[12px] text-[#354024]/90 font-mono uppercase">
                    Дата створення:{" "}
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[#2c3e50] leading-[2rem] font-medium text-lg italic whitespace-pre-wrap font-serif">
                  «{letter.content}»
                </div>

                <div className="mt-8 pt-6 border-t border-[#354024]/10 flex justify-end">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#354024]/60 font-bold mb-1">
                      Підпис
                    </p>
                    <p className="font-serif text-xl text-[#354024] opacity-80">
                      {child.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 px-6 text-center">
              <p className="text-[11px] text-[#354024]/80 leading-relaxed max-w-none">
                Це повідомлення є важливою частиною саморефлексії. Рекомендуємо
                обговорити його зміст, якщо дитина виявить бажання поділитися
                своїми думками особисто.
              </p>
            </div>
          </section>
        )}

        <footer className="space-y-4">
          <button
            id="download-btn"
            onClick={downloadPDF}
            className="w-full py-5 rounded-full bg-[#354024] text-[#f3f0e8] font-bold uppercase tracking-widest text-xs hover:bg-[#4a5a33] transition-all"
          >
            Завантажити PDF звіт
          </button>

          <button
            onClick={handleDeepAnalysis}
            className="w-full py-5 rounded-full bg-[#354024] text-[#f3f0e8] font-bold uppercase tracking-widest text-xs hover:bg-[#4a5a33] transition-all"
          >
            {isAnalysing
              ? "Аналізуємо..."
              : "Глибокий аналіз динаміки за місяць"}
          </button>

          {deepAnalysis?.success && (
            <div className="mt-20 space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
              {(() => {
                const predictedClass = deepAnalysis.predicted_class;

                const isClass2 = predictedClass === 2;
                const isClass1 = predictedClass === 1;
                const isClass0 =
                  predictedClass === 0 || (!isClass1 && !isClass2);

                const getVal = (key) => {
                  const feat = deepAnalysis.features || {};
                  const searchKey = key.toLowerCase().replace(/\s/g, "");
                  return feat[key] !== undefined
                    ? feat[key]
                    : feat[searchKey] || 0;
                };

                return (
                  <div className="bg-[#f3f0e8] p-8 md:p-10 rounded-[50px] shadow-2xl border-2 border-[#b7c1a8]">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-[#b7c1a8] pb-8">
                      <div>
                        <h3 className="text-3xl font-bold text-[#354024] flex items-center gap-3 italic">
                          <span>🌿</span> Аналіз поведінкових показників
                        </h3>
                        <p className="text-[#354024] opacity-70 text-m mt-2 font-medium">
                          Звіт на основі показників
                        </p>
                      </div>

                      <div className="px-8 py-4 rounded-full font-black text-center shadow-inner bg-[#354024] text-[#f3f0e8] tracking-widest uppercase">
                        {isClass2
                          ? "Статус: Стабільний  стан"
                          : isClass1
                            ? "Статус: Потребує  уваги"
                            : "Статус: Підвищений  ризик"}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                      {[
                        {
                          label: "Стабільний  стан",
                          active: isClass0,
                          text: "Показники в межах норми. Дитина демонструє стабільний контроль та фокус.",
                        },
                        {
                          label: "Потребує  уваги",
                          active: isClass1,
                          text: "Спостерігаються окремі ознаки емоційного напруження або зниження концентрації.",
                        },
                        {
                          label: "Підвищений  ризик",
                          active: isClass2,
                          text: "Виявлено виражені ознаки перевтоми, тривожності або імпульсивності. Нервова система потребує розвантаження.",
                        },
                      ].map((state) => (
                        <div
                          key={state.label}
                          className={`p-5 rounded-[30px] border-2 transition-all duration-500 ${
                            state.active
                              ? "bg-[#b7c1a8] border-[#354024] scale-105 shadow-md"
                              : "bg-transparent border-[#b7c1a8] opacity-80"
                          }`}
                        >
                          <h5 className="font-bold text-[#152004] text-l">
                            {state.active && "● "} {state.label}
                          </h5>
                          <p className="text-[14px] text-[#354024] mt-2 leading-tight font-medium">
                            {state.text}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mb-10">
                      <h4 className="font-bold mb-5 text-[#354024] uppercase text-[13px] tracking-widest px-2">
                        Психоемоційний фон
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { label: "Настрій", val: getVal("mood"), max: 5 },
                          {
                            label: "Тривожність",
                            val: getVal("anxiety"),
                            max: 10,
                          },
                          {
                            label: "Самооцінка",
                            val: getVal("dembo"),
                            max: 100,
                          },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="bg-[#b7c1a8] p-6 rounded-[35px] border border-[#354024]/10 flex flex-col items-center justify-center shadow-sm"
                          >
                            <p className="text-[13px] font-bold text-[#354024] uppercase mb-1 opacity-90">
                              {item.label}
                            </p>
                            <p className="text-4xl font-black text-[#354024]">
                              {Number(item.val).toFixed(1)}
                              <span className="text-xs font-normal opacity-70 ml-1">
                                /{item.max === 100 ? "100%" : item.max}
                              </span>
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6 mb-12">
                      <h4 className="font-bold text-[#354024] uppercase text-[13px] tracking-widest px-2">
                        Нейродинамічні показники:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        {Object.entries(deepAnalysis.features || {}).map(
                          ([key, value]) => {
                            if (
                              ["mood", "anxiety", "dembo"].includes(
                                key.toLowerCase(),
                              )
                            )
                              return null;

                            const labels = {
                              "Hit Rate": "Уважність",
                              Misses: "Пропуски",
                              "False Alarms": "Імпульсивність",
                              "Reaction Time": "Швидкість реакції",
                            };

                            const val = typeof value === "number" ? value : 0;
                            let progress = key.includes("Time")
                              ? (val / 1000) * 100
                              : val;

                            return (
                              <div key={key} className="relative">
                                <div className="flex justify-between items-end mb-2 px-1">
                                  <span className="text-[11px] font-bold text-[#354024] uppercase">
                                    {labels[key] || key}
                                  </span>
                                  <span className="text-xl font-black text-[#354024]">
                                    {val.toFixed(0)}
                                  </span>
                                </div>
                                <div className="w-full bg-[#b7c1a8]/40 rounded-full h-[8px]">
                                  <div
                                    className="h-full bg-[#354024] rounded-full transition-all duration-1000"
                                    style={{
                                      width: `${Math.min(progress, 100)}%`,
                                    }}
                                  ></div>
                                </div>
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    <div className="w-full p-10 rounded-[45px] bg-[#354024] text-[#f3f0e8] shadow-2xl border-4 border-[#b7c1a8]">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#b7c1a8] rounded-2xl text-[#354024]">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                        </div>
                        <h4 className="font-bold text-xl uppercase tracking-tight">
                          Пояснення
                        </h4>
                      </div>
                      <div className="w-full">
                        <p className="max-w-none block text-lg md:text-xl opacity-95 font-medium mb-8 whitespace-pre-line break-words leading-relaxed w-full">
                          {deepAnalysis.interpretation
                            ?.replaceAll('"', "")
                            .replaceAll("«", "")
                            .replaceAll("»", "")
                            .replaceAll("*", "")}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default ChildOverview;
