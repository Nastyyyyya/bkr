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

// Використовуємо деструктуризацію прямо в аргументах функції
const getSDQAnalysis = (scores) => {
  // Тепер ми використовуємо scores, щоб витягнути дані (це задовольнить ESLint)
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
    // Тут ми неявно використовуємо логіку, що базується на вхідних даних
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

  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const reportRef = useRef(null);

  // Дані настрою
  const [moodHistory, setMoodHistory] = useState([]);
  const [moodInsight, setMoodInsight] = useState("");
  const [viewRange, setViewRange] = useState(7);

  // Дані Дембо
  const [demboData, setDemboData] = useState(null);

  // Дані Люшера
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
      // Перевірте, чи backendUrl закінчується на / чи ні
      const resData = await axios.get(
        `${backendUrl}/api/analytics/monthly/${id}`,
      );

      if (resData.data.success) {
        const resPython = await axios.post(
          `http://localhost:8000/analyze-dynamics`,
          {
            mood_history: resData.data.data.moods,
            dembo_history: resData.data.data.dembo,
            anxiety_history: resData.data.data.anxiety,
            sdq_history: resData.data.data.sdq,
            gonogo_history: resData.data.data.gonogo,
          },
        );
        setDeepAnalysis(resPython.data);
      }
    } catch (err) {
      console.error("Помилка аналізу:", err);
      alert("Не вдалося отримати дані для аналізу. Перевірте консоль.");
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

    // Увага
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

    // Гальмування
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

    // ВИКОРИСТОВУЄМО avgReactionTime (щоб прибрати помилку)
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
          // Тут ми припускаємо, що бекенд повертає об'єкт з інтерпретацією.
          // Якщо бекенд повертає тільки ID, знадобиться додатковий пошук опису.
          setWilsonData(latest);
        }

        if (resLuscher.data.success) {
          setLuscherData(resLuscher.data.result);
        }

        if (resGoNoGo.data.success && resGoNoGo.data.history.length > 0) {
          setGoNoGoData(resGoNoGo.data.history[0]); // Беремо останній тест
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
          setSdqData(resSDQ.data.history[0]); // Беремо найсвіжіший тест
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

    // 1. Використовуємо opacity замість visibility, щоб елемент не зникав з DOM
    if (downloadBtn) downloadBtn.style.opacity = "0";
    if (backBtn) backBtn.style.opacity = "0";

    // Додаємо невелику затримку, щоб переконатися, що всі графіки відрендерені
    setTimeout(() => {
      html2canvas(input, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#b7c1a8",
        logging: true, // Вмикаємо логи, щоб бачити помилки в консолі браузера
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

          // Перша сторінка
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalHeightMm);
          heightLeft -= pdfHeight;

          // Наступні сторінки
          while (heightLeft > 0) {
            position = heightLeft - totalHeightMm;
            pdf.addPage();
            pdf.addImage(imgData, "PNG", 0, position, pdfWidth, totalHeightMm);
            heightLeft -= pdfHeight;
          }

          pdf.save(`Звіт_${child?.name || "дитини"}.pdf`);

          // Повертаємо кнопки
          if (downloadBtn) downloadBtn.style.opacity = "1";
          if (backBtn) backBtn.style.opacity = "1";
        })
        .catch((err) => {
          console.error("Помилка генерації:", err);
          if (downloadBtn) downloadBtn.style.opacity = "1";
          if (backBtn) backBtn.style.opacity = "1";
        });
    }, 500); // 0.5 секунди затримки
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
      className="min-h-screen bg-[#b7c1a8] py-16 px-6 shadow-inner"
    >
      <div className="max-w-3xl mx-auto bg-[#f3f0e8] rounded-[40px] p-8 md:p-12 shadow-2xl">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-[#354024] mb-2">
            {child.name}
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] text-[#354024]/40 font-semibold">
            Звіт для батьків
          </p>
        </header>

        <div className="mb-8 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl">
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Важливо:</strong> Даний звіт сформовано автоматично на
            основі відповідей дитини. Ці дані є лише допоміжним інструментом для
            розуміння емоційного стану та{" "}
            <strong>не є клінічним діагнозом</strong>. Для професійної
            інтерпретації результатів рекомендуємо звернутися до сертифікованого
            психолога.
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
                      : "text-[#354024]/50"
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
                  tick={{ fill: "#354024", fontSize: 12, opacity: 0.5 }}
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

          <div className="mt-8 p-5 bg-[#b7c1a8]/10 rounded-2xl border-l-4 border-[#354024]">
            <p className="text-[#354024] text-sm leading-relaxed italic">
              <span className="font-bold block mb-1 uppercase text-[10px] opacity-50">
                Аналіз періоду:
              </span>
              {moodInsight || "Збираємо дані для точнішого аналізу..."}
            </p>
          </div>
        </section>

        {/* --- БЛОК 2: ДЕМБО (ОНОВЛЕНО) --- */}
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
                    tick={{ fontSize: 10, fill: "#354024", opacity: 0.3 }}
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

            {/* Картки з точними цифрами */}
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
                  <p className="text-[10px] uppercase opacity-50 font-bold">
                    {item.label}
                  </p>
                  <p className="text-xl font-bold text-[#354024]">
                    {item.val}
                    <span className="text-sm opacity-30">/100</span>
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
                  <p className="text-[#354024] text-sm leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- БЛОК 4: ДЕРЕВО ВІЛЬСОНА --- */}
        {wilsonData && (
          <section className="mb-12 bg-white rounded-3xl p-6 shadow-sm border border-[#354024]/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-[#354024] text-[#f3f0e8] rounded-full flex items-center justify-center text-xl font-bold">
                {wilsonData.selectedId}
              </div>
              <h2 className="text-xl font-bold text-[#354024]">
                Емоційна позиція (Дерево Вільсона)
              </h2>
            </div>

            <div className="p-5 bg-blue-50 border-l-4 border-blue-400 rounded-r-2xl">
              <p className="text-[#354024] text-sm leading-relaxed">
                <span className="font-bold block mb-2 uppercase text-[10px] text-blue-800 opacity-70">
                  Аналіз поведінкової моделі:
                </span>
                {/* Якщо інтерпретація приходить з бекенду в об'єкті history */}
                {wilsonData.interpretation?.forParents ||
                  "Дитина обрала позицію, що характеризує поточний стан адаптації та самосприйняття в колективі."}
              </p>
            </div>

            <p className="mt-4 text-[10px] text-[#354024]/40 italic text-right">
              Дата тестування: {new Date(wilsonData.date).toLocaleDateString()}
            </p>
          </section>
        )}

        {/* --- БЛОК 5: GO/NO-GO (КОНТРОЛЬ ІМПУЛЬСИВНОСТІ) --- */}
        {goNoGoData &&
          (() => {
            const analysis = getGoNoGoAnalysis(goNoGoData);
            return (
              <section className="mb-12 bg-white rounded-[40px] p-8 shadow-sm border border-[#354024]/5">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[#354024]">
                      Когнітивний профіль
                    </h2>
                    <p className="text-[10px] text-[#354024]/40 uppercase tracking-[0.2em] font-bold">
                      Тест на самоконтроль
                    </p>
                  </div>
                  <div className="bg-[#354024] text-[#f3f0e8] w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                    <span className="text-[9px] uppercase opacity-60">Бал</span>
                    <span className="text-xl font-black">
                      {Math.round(
                        (goNoGoData.hitRate +
                          (100 - goNoGoData.falseAlarmRate)) /
                          2,
                      )}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="p-5 bg-[#f8fafc] rounded-3xl border border-blue-50">
                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-2">
                      Увага
                    </p>
                    <p
                      className={`text-lg font-bold ${analysis.attention.color}`}
                    >
                      {analysis.attention.status}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      {analysis.attention.desc}
                    </p>
                  </div>

                  <div className="p-5 bg-[#fffafb] rounded-3xl border border-red-50">
                    <p className="text-[10px] font-bold text-red-400 uppercase mb-2">
                      Гальмування
                    </p>
                    <p
                      className={`text-lg font-bold ${analysis.inhibition.color}`}
                    >
                      {analysis.inhibition.status}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      {analysis.inhibition.desc}
                    </p>
                  </div>

                  <div className="p-5 bg-[#fdfcfb] rounded-3xl border border-amber-50">
                    <p className="text-[10px] font-bold text-amber-400 uppercase mb-2">
                      Швидкість
                    </p>
                    <p className="text-lg font-bold text-slate-700">
                      {goNoGoData.avgReactionTime} мс
                    </p>
                    <p className="text-[11px] text-slate-500 leading-tight mt-1">
                      Час обробки сигналу.
                    </p>
                  </div>
                </div>

                <div className="bg-[#f3f0e8] p-6 rounded-[32px] border border-[#354024]/5">
                  <h4 className="text-xs font-bold text-[#354024] uppercase tracking-wider mb-3">
                    Рекомендації для розвитку:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex gap-3 text-sm text-[#354024]/70">
                      <span className="text-[#b7c1a8] font-bold">01</span>
                      <p>
                        При високій імпульсивності ({goNoGoData.falseAlarmRate}
                        %) корисно практикувати ігри з чіткими стоп-сигналами.
                      </p>
                    </li>
                    <li className="flex gap-3 text-sm text-[#354024]/70">
                      <span className="text-[#b7c1a8] font-bold">02</span>
                      <p>
                        Спробуйте вправи на "повільне малювання" або складання
                        дрібних деталей для тренування витримки.
                      </p>
                    </li>
                  </ul>
                </div>
              </section>
            );
          })()}

        {/* --- БЛОК 6: ПСИХОЛОГІЧНИЙ ПРОФІЛЬ (SDQ) --- */}
        {sdqData &&
          (() => {
            const { categories, getLevelInfo } = getSDQAnalysis(sdqData.scores);
            return (
              <section className="mb-12 bg-white rounded-[40px] p-8 shadow-sm border border-[#354024]/5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-[#354024]">
                      Сильні сторони та труднощі
                    </h2>
                    <p className="text-[10px] text-[#354024]/40 uppercase tracking-[0.2em] font-bold">
                      Загальна оцінка адаптації (SDQ)
                    </p>
                  </div>
                  <div className="bg-[#f3f0e8] px-6 py-3 rounded-2xl border border-[#354024]/5">
                    <p className="text-[9px] text-[#354024]/40 uppercase font-black mb-1">
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
                        className={`p-5 rounded-[28px] border transition-all ${info.bg} border-white/50 shadow-sm`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 text-[#354024]">
                            {categories[key].label}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-3 py-1 rounded-full bg-white shadow-sm ${info.color}`}
                          >
                            {info.text}
                          </span>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-[11px] text-[#354024]/60 leading-tight max-w-[70%]">
                            {categories[key].desc}
                          </p>
                          <p className="text-3xl font-black text-[#354024] tracking-tighter">
                            {score}
                            <span className="text-[10px] opacity-20 ml-1">
                              /10
                            </span>
                          </p>
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
                        Порада психолога
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
              {/* Великий індикатор поточного стану */}
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
            {/* Декоративна скріпка або печатка */}
            <div className="absolute -top-4 -right-2 z-10 bg-[#e74c3c] text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12 border-4 border-white font-bold">
              ✉️
            </div>

            <div className="bg-[#fffdfa] rounded-2xl p-8 shadow-md border-t-8 border-[#354024] relative overflow-hidden">
              {/* Фоновий візерунок "в лінійку" */}
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
                  <span className="text-[10px] text-[#354024]/40 font-mono uppercase">
                    Дата створення:{" "}
                    {new Date(letter.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[#2c3e50] leading-[2rem] font-medium text-lg italic whitespace-pre-wrap font-serif">
                  «{letter.content}»
                </div>

                <div className="mt-8 pt-6 border-t border-[#354024]/10 flex justify-end">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-widest text-[#354024]/40 font-bold mb-1">
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
              <p className="text-[11px] text-[#354024]/50 leading-relaxed">
                Це повідомлення є важливою частиною саморефлексії. Рекомендуємо
                обговорити його зміст, <br />
                якщо дитина виявить бажання поділитися своїми думками особисто.
              </p>
            </div>
          </section>
        )}

        <footer className="space-y-4">
          <button
            onClick={() => navigate(`/child-home/${child._id}`)}
            className="w-full py-5 rounded-full bg-[#354024] text-[#f3f0e8] font-bold uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Перейти до профілю дитини
          </button>

          <footer className="space-y-4">
            <button
              id="download-btn"
              onClick={downloadPDF}
              className="w-full py-5 rounded-full bg-[#354024] text-[#f3f0e8] font-bold uppercase tracking-widest text-xs hover:bg-[#4a5a33] transition-all"
            >
              📥 Завантажити PDF звіт
            </button>

            <button
              onClick={handleDeepAnalysis}
              className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold hover:bg-purple-700 transition-all"
            >
              {isAnalysing
                ? "Аналізуємо..."
                : "📊 Глибокий аналіз динаміки за місяць"}
            </button>

            {/* Перевіряємо, що deepAnalysis І metrics існують перед рендером */}
            {deepAnalysis && (
              <div className="mt-8 space-y-6">
                <div className="bg-white p-8 rounded-[40px] shadow-xl border-4 border-purple-100">
                  <h3 className="text-2xl font-bold text-purple-900 mb-6 flex items-center gap-3">
                    <span>🌟</span> Результати глибокого аналізу
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.values(deepAnalysis.metrics).map((m, i) => (
                      <div
                        key={i}
                        className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-purple-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-slate-800">
                            {m.title}
                          </h4>
                          <span
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              m.status === "Норма" ||
                              m.status === "Адекватна" ||
                              m.status === "Стабільний"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="text-3xl font-black text-purple-600 mb-2">
                          {m.value}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed italic">
                          {m.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {deepAnalysis.parent_advice.length > 0 && (
                    <div className="mt-8 p-6 bg-blue-50 rounded-[30px] border-2 border-blue-100">
                      <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <span>💡</span> Рекомендації для батьків:
                      </h4>
                      <ul className="space-y-3">
                        {deepAnalysis.parent_advice.map((adv, i) => (
                          <li
                            key={i}
                            className="text-sm text-blue-800 flex gap-2"
                          >
                            <span className="text-blue-400">•</span> {adv}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <button
              id="back-btn"
              onClick={() => navigate(`/child-home/${child._id}`)}
              className="w-full py-4 text-[#354024]/50 font-bold uppercase tracking-widest text-[10px] hover:text-[#354024]"
            >
              Повернутися назад
            </button>
          </footer>

          <p className="text-center text-[10px] text-[#354024]/30 uppercase tracking-tighter">
            Звіт сформовано автоматично
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ChildOverview;
