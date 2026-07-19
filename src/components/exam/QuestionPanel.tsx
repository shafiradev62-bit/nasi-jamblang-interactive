import React, { useState, useMemo } from "react";
import { ExamQuestion } from "@/data/examQuestions";
import { useLanguage } from "@/contexts/LanguageContext";

interface QuestionPanelProps {
  question: ExamQuestion;
  answer: string | string[] | undefined;
  isFlagged: boolean;
  onAnswer: (questionId: number, answer: string | string[]) => void;
  onFlag: (questionId: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isFirst: boolean;
  isLast: boolean;
  questionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedSet: Set<number>;
  onGoTo: (index: number) => void;
  unit?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  allAnswers?: Record<number, string | string[]>;
  questions?: ExamQuestion[];
}

const QuestionPanel = ({
  question,
  answer,
  isFlagged,
  onAnswer,
  onFlag,
  onPrev,
  onNext,
  onSubmit,
  isFirst,
  isLast,
  questionIndex,
  totalQuestions,
  answeredCount,
  flaggedSet,
  onGoTo,
  unit = 2,
  allAnswers = {},
  questions = [],
}: QuestionPanelProps) => {
  const { t, lang } = useLanguage();
  const isId = lang === "id";

  const [saltVal, setSaltVal] = useState(22);
  const [dryingDays, setDryingDays] = useState(2);
  const [hygieneVal, setHygieneVal] = useState(60);
  const [shrimpVal, setShrimpVal] = useState(70);
  const [simRuns, setSimRuns] = useState<{no: number; salt: number; drying: number; hygiene: number; shrimp: number; quality: number; safetyRisk: number; sustainability: number}[]>([]);

  const simCalc = useMemo(() => {
    const quality = Math.round(Math.min(100, saltVal * 0.4 + hygieneVal * 0.4 + dryingDays * 3 + shrimpVal * 0.1));
    const safetyRisk = Math.round(Math.max(0, 100 - saltVal * 0.5 - hygieneVal * 0.5 + (7 - dryingDays) * 2));
    const sustainability = Math.round(Math.min(100, shrimpVal * 0.6 + hygieneVal * 0.2 + saltVal * 0.1 + dryingDays * 2));
    const qualityLabel = quality >= 67 ? "High" : quality >= 34 ? "Medium" : "Low";
    const riskLabel = safetyRisk >= 67 ? "High" : safetyRisk >= 34 ? "Medium" : "Low";
    const sustLabel = sustainability >= 67 ? "High" : sustainability >= 34 ? "Medium" : "Low";
    return { quality, safetyRisk, sustainability, qualityLabel, riskLabel, sustLabel };
  }, [saltVal, dryingDays, hygieneVal, shrimpVal]);

  const runSim = () => {
    setSimRuns((prev) => [...prev, {
      no: prev.length + 1,
      salt: saltVal, drying: dryingDays, hygiene: hygieneVal, shrimp: shrimpVal,
      quality: simCalc.quality, safetyRisk: simCalc.safetyRisk, sustainability: simCalc.sustainability
    }]);
  };

  const showSim = unit === 2 && question.id === 2;
  const hasSimData = simRuns.length > 0;

  // Enhanced simulation with visual indicators
  const getQualityColor = (value: number) => {
    if (value >= 75) return "text-green-600";
    if (value >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getRiskColor = (value: number) => {
    if (value <= 25) return "text-green-600";
    if (value <= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getGaugeWidth = (value: number) => `${Math.min(100, Math.max(0, value))}%`;

  // Unit 3 simulation state
  const [potType, setPotType] = useState<"clay" | "metal">("clay");
  const [wallThickness, setWallThickness] = useState(5);
  const [heatInput, setHeatInput] = useState(80);
  const [waterVolume, setWaterVolume] = useState(4);
  const [u3Runs, setU3Runs] = useState<{no: number; pot: string; wall: number; heat: number; water: number; retention: number; evenHeat: number; energy: number; envImpact: number; cookingTime: number}[]>([]);

  const u3Calc = useMemo(() => {
    const isClay = potType === "clay";
    const retention = Math.round(Math.min(100, (isClay ? 40 : 20) + wallThickness * 4 + heatInput * 0.2 - waterVolume * 2));
    const evenHeat = Math.round(Math.min(100, (isClay ? 30 : 50) + heatInput * 0.3 + wallThickness * 2 - waterVolume));
    const energy = Math.round(Math.min(100, (isClay ? 50 : 70) - wallThickness * 2 + heatInput * 0.3 - waterVolume));
    const envImpact = Math.round(Math.min(100, (isClay ? 20 : 60) + waterVolume * 3 + heatInput * 0.2));
    const cookingTime = Math.round(Math.max(10, (isClay ? 90 : 60) + wallThickness * 3 + waterVolume * 4 - heatInput * 0.5));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { retention, evenHeat, energy, envImpact, cookingTime, retLabel: label(retention), evenLabel: label(evenHeat), energyLabel: label(energy), envLabel: label(envImpact) };
  }, [potType, wallThickness, heatInput, waterVolume]);

  const recordU3 = () => {
    setU3Runs(prev => [...prev, { no: prev.length + 1, pot: potType === "clay" ? "Clay" : "Metal", wall: wallThickness, heat: heatInput, water: waterVolume, retention: u3Calc.retention, evenHeat: u3Calc.evenHeat, energy: u3Calc.energy, envImpact: u3Calc.envImpact, cookingTime: u3Calc.cookingTime }]);
  };

  // Unit 4 simulation state
  const [fryMedium, setFryMedium] = useState<"oil" | "sand">("sand");
  const [fryTemp, setFryTemp] = useState(160);
  const [fryTime, setFryTime] = useState(3);
  const [isReused, setIsReused] = useState(false);
  const [u4Runs, setU4Runs] = useState<{no: number; medium: string; temp: number; time: number; reused: string; oilAbsorption: number; crispiness: number; energy: number; sustainability: number}[]>([]);

  const u4Calc = useMemo(() => {
    const isSand = fryMedium === "sand";
    const oilAbsorption = Math.round(Math.max(0, Math.min(100, isSand ? 10 + fryTemp * 0.05 + fryTime * 2 : 30 + fryTemp * 0.1 + fryTime * 3 - (isReused ? 5 : 0))));
    const crispiness = Math.round(Math.min(100, (isSand ? 40 : 30) + fryTemp * 0.3 + fryTime * 4 - (isReused ? 5 : 0)));
    const energy = Math.round(Math.min(100, fryTemp * 0.4 + fryTime * 5 - (isSand ? 10 : 0) - (isReused ? 8 : 0)));
    const sustainability = Math.round(Math.min(100, (isSand ? 70 : 30) + (isReused ? 20 : 0) - fryTemp * 0.1));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { oilAbsorption, crispiness, energy, sustainability, oilLabel: label(oilAbsorption), crispLabel: label(crispiness), energyLabel: label(energy), sustLabel: label(sustainability) };
  }, [fryMedium, fryTemp, fryTime, isReused]);

  const recordU4 = () => {
    setU4Runs(prev => [...prev, {
      no: prev.length + 1,
      medium: fryMedium === "sand" ? "Sand" : "Oil",
      temp: fryTemp, time: fryTime,
      reused: isReused ? "Yes" : "No",
      oilAbsorption: u4Calc.oilAbsorption,
      crispiness: u4Calc.crispiness,
      energy: u4Calc.energy,
      sustainability: u4Calc.sustainability,
    }]);
  };

  const selectedMCQ = answer as string | undefined;
  const selectedCheckbox = (answer as string[]) || [];

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const currentWordCount = question.type === "open" ? getWordCount(answer as string || "") : 0;
  const isAnswerValid = useMemo(() => {
    if (question.type === "open") {
      return currentWordCount >= 15 && currentWordCount <= 50;
    }
    if (question.type === "mcq") {
      return !!answer;
    }
    if (question.type === "checkbox") {
      return (answer as string[] || []).length > 0;
    }
    return true;
  }, [question, answer, currentWordCount]);

  const getOptions = () => {
    if (lang === "id" && question.optionsIdn) {
      return question.optionsIdn;
    }
    return question.options || [];
  };

  const options = getOptions();

  const handleMCQ = (option: string) => {
    onAnswer(question.id, option);
  };

  const handleCheckbox = (option: string) => {
    const updated = selectedCheckbox.includes(option)
      ? selectedCheckbox.filter((o) => o !== option)
      : [...selectedCheckbox, option];
    onAnswer(question.id, updated);
  };

  const getQuestionText = () => {
    if (lang === "id" && question.questionIdn) {
      return question.questionIdn;
    }
    return question.question;
  };

  const getPlaceholder = () => {
    if (lang === "id") {
      return "Tulis jawaban Anda di sini.";
    }
    return "Write your response here.";
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-background via-background to-muted/20">
      {/* Question Navigator */}
      <div className="px-5 pt-4 pb-3 border-b border-exam-divider bg-white/50 backdrop-blur-sm">
        <div className="flex items-center gap-1 mb-2.5">
          {Array.from({ length: totalQuestions }, (_, i) => {
            const qId = i + 1;
            const isItemFlagged = flaggedSet?.has(qId);
            const isAnswered = answeredCount > 0;
            const isCurrent = i === questionIndex;
            const isFuture = i > questionIndex;
            const canNavigate = !isFuture || isAnswerValid;

            return (
              <button
                key={i}
                onClick={() => canNavigate && onGoTo(i)}
                disabled={!canNavigate}
                className={`relative w-8 h-8 text-xs font-semibold rounded-md transition-all duration-200 shadow-sm ${
                  isCurrent
                    ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md"
                    : isItemFlagged
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : !canNavigate
                    ? "bg-muted/30 text-muted-foreground/30 border border-border/30 cursor-not-allowed"
                    : "bg-white text-muted-foreground hover:bg-secondary border border-border/50"
                }`}
              >
                {i + 1}
                {isItemFlagged && (
                  <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            {answeredCount} of {totalQuestions} {t("answered", "dijawab")}
          </p>
          <div className="flex gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary/80"></span>
              <span className="text-[10px] text-muted-foreground">{t("Current", "Aktif")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-[10px] text-muted-foreground">{t("Flagged", "Ditandai")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto exam-scrollbar px-5 py-5">
        <div className="fade-in" key={question.id}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                {questionIndex + 1}
              </div>
              <h2 className="text-base font-bold text-foreground">
                {isId ? `Soal ${questionIndex + 1} / ${totalQuestions}` : `Question ${questionIndex + 1} / ${totalQuestions}`}
              </h2>
            </div>
            <button
              onClick={() => onFlag(question.id)}
              className={`text-[10px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-md transition-all duration-150 ${
                isFlagged
                  ? "bg-primary/20 text-primary border border-primary/40"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {isFlagged ? t("Flagged", "Ditandai") : t("Flag", "Tandai")}
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl border border-border/50 p-4 shadow-sm mb-5">
            <h2 className="text-[14px] font-medium text-foreground leading-relaxed whitespace-pre-line">
              {getQuestionText()}
            </h2>
            
            {/* Question Media (Image/Video) */}
            {question.mediaUrl && (
              <div className="mt-4 mb-3">
                {question.mediaType === "video" ? (
                  <div className="rounded-lg overflow-hidden border border-border/40 bg-muted/10">
                    <video 
                      src={question.mediaUrl} 
                      controls 
                      className="w-full aspect-video object-cover"
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <div className="rounded-lg overflow-hidden border border-border/40 bg-muted/10 group relative">
                    <img 
                      src={question.mediaUrl} 
                      alt="Question media" 
                      className="w-full h-auto object-cover max-h-[400px] cursor-zoom-in"
                      onClick={() => window.open(question.mediaUrl, '_blank')}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                  </div>
                )}
              </div>
            )}
            
            {question.id === 3 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">{isId ? "Gunakan data simulasi Anda untuk menjawab." : "Use your simulation data to answer."}</p>
                <details className="mt-2">
                  <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat menjelaskan bahwa waktu pengeringan yang lebih singkat mengurangi penguapan air, sehingga kadar air tetap tinggi dan memungkinkan lebih banyak pertumbuhan mikroba, yang meningkatkan risiko keamanan." : "A strong answer explains that shorter drying time reduces water evaporation, so moisture remains high and allows more microbial growth, which increases safety risk."}</p>
                </details>
              </div>
            )}
            {question.id === 4 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground">{isId ? "Petunjuk: Lihat kombinasi mana yang menghasilkan risiko TINGGI dalam data Anda." : "Hint: Look at which combination produces HIGH risk in your data."}</p>
                <details className="mt-2">
                  <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat menyebutkan tingkat kebersihan tertinggi yang masih menghasilkan risiko tinggi saat garam sangat rendah, lalu mengutip baris data dari tabel sebagai bukti." : "A strong answer states the highest hygiene level that still produces high risk when salt is very low, then cites a data row from the table as evidence."}</p>
                </details>
              </div>
            )}
            {question.id === 5 && unit === 2 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-[11px] text-muted-foreground mr-auto">{isId ? "Gunakan data simulasi Anda untuk menjawab." : "Use your simulation data to answer."}</p>
                <div className="flex items-center gap-2">
                   <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${currentWordCount >= 15 && currentWordCount <= 50 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {currentWordCount} {isId ? "kata" : "words"} (15-50)
                   </div>
                   <details>
                      <summary className="text-[11px] font-medium text-primary cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{isId ? "Jawaban yang kuat merekomendasikan kombinasi garam tinggi, kebersihan tinggi, dan pengeringan cukup, lalu menjelaskan alasan ilmiahnya dan dampak terhadap keberlanjutan udang." : "A strong answer recommends a combination of high salt, high hygiene, and adequate drying, then explains the scientific reason and the impact on shrimp sustainability."}</p>
                   </details>
                </div>
              </div>
            )}
          </div>

          {/* SIMULATION - Only for Question 2 */}
          {showSim && (
            <div className="mb-5 space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: isId ? "Kualitas" : "Quality Score", value: simCalc.quality, sub: simCalc.qualityLabel },
                  { label: isId ? "Risiko Keamanan" : "Safety Risk", value: simCalc.safetyRisk, sub: simCalc.riskLabel },
                  { label: isId ? "Keberlanjutan" : "Sustainability", value: simCalc.sustainability, sub: simCalc.sustLabel },
                  { label: isId ? "Stok Udang" : "Shrimp Stock", value: shrimpVal, sub: shrimpVal >= 67 ? "Good" : shrimpVal >= 34 ? "Medium" : "Low" },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
                    <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
                    <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
                    <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" || sub === "Good" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Simulation Controls + Diagram */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm">
                  <div className="text-[13px] font-semibold text-foreground mb-4">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
                  <div className="space-y-5">
                  {/* Salt */}
                  <div>
                    <div className="text-[13px] text-foreground mb-2">
                      Salt concentration / Konsentrasi garam (%) : <span className="font-semibold">{saltVal}</span>
                    </div>
                    <input type="range" min={0} max={100} step={1} value={saltVal}
                      onChange={(e) => setSaltVal(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${saltVal}%, #e5e7eb ${saltVal}%)` }}
                    />
                  </div>
                  {/* Drying */}
                  <div>
                    <div className="text-[13px] text-foreground mb-2">
                      Drying time / Waktu pengeringan (days/hari) : <span className="font-semibold">{dryingDays}</span>
                    </div>
                    <input type="range" min={1} max={7} step={1} value={dryingDays}
                      onChange={(e) => setDryingDays(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${((dryingDays - 1) / 6) * 100}%, #e5e7eb ${((dryingDays - 1) / 6) * 100}%)` }}
                    />
                  </div>
                  {/* Hygiene */}
                  <div>
                    <div className="text-[13px] text-foreground mb-2">
                      Hygiene level / Tingkat kebersihan (%) : <span className="font-semibold">{hygieneVal}</span>
                    </div>
                    <input type="range" min={0} max={100} step={1} value={hygieneVal}
                      onChange={(e) => setHygieneVal(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${hygieneVal}%, #e5e7eb ${hygieneVal}%)` }}
                    />
                  </div>
                  {/* Shrimp */}
                  <div>
                    <div className="text-[13px] text-foreground mb-2">
                      Shrimp population availability / Ketersediaan udang (%) : <span className="font-semibold">{shrimpVal}</span>
                    </div>
                    <input type="range" min={0} max={100} step={1} value={shrimpVal}
                      onChange={(e) => setShrimpVal(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${shrimpVal}%, #e5e7eb ${shrimpVal}%)` }}
                    />
                  </div>
                  </div>
                  <button onClick={runSim} className="mt-6 px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
                    Save current run (Simpan run saat ini)
                  </button>
                </div>

                {/* Terasi Process Diagram */}
                <div className="flex flex-col gap-3 w-44">
                  <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 160 240" width="140" height="210" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                          <feOffset dx="0.5" dy="1" result="offsetblur" />
                          <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                          </feComponentTransfer>
                          <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        
                        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#fff9c4" />
                          <stop offset="60%" stopColor="#fdd835" />
                          <stop offset="100%" stopColor="#fbc02d" />
                        </radialGradient>
                        
                        <radialGradient id="shrimpGrad" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor={shrimpVal > 60 ? "#fb923c" : shrimpVal > 30 ? "#fca5a5" : "#fee2e2"} />
                          <stop offset="100%" stopColor={shrimpVal > 60 ? "#c2410c" : shrimpVal > 30 ? "#b91c1c" : "#991b1b"} />
                        </radialGradient>

                        <linearGradient id="jarGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f8fafc" />
                          <stop offset="50%" stopColor="#f1f5f9" />
                          <stop offset="100%" stopColor="#e2e8f0" />
                        </linearGradient>

                        <radialGradient id="pasteGrad" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor={simCalc.quality > 60 ? "#a78bfa" : "#c4b5fd"} />
                          <stop offset="100%" stopColor={simCalc.quality > 60 ? "#4c1d95" : "#6d28d9"} />
                        </radialGradient>

                        <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor={hygieneVal > 60 ? "#34d399" : hygieneVal > 30 ? "#fbbf24" : "#f87171"} />
                          <stop offset="100%" stopColor={hygieneVal > 60 ? "#059669" : hygieneVal > 30 ? "#d97706" : "#dc2626"} />
                        </linearGradient>
                      </defs>

                      {/* Sun Section */}
                      <g transform="translate(80, 25)" filter="url(#shadow)">
                        <circle r="16" fill="url(#sunGrad)" />
                        {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
                          <g key={a} transform={`rotate(${a})`}>
                            <line y1="18" y2="24" stroke="#fbc02d" strokeWidth="2" strokeLinecap="round" />
                          </g>
                        ))}
                        <text y="4" fontSize="8" fontWeight="bold" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{dryingDays}d</text>
                        <text x="-40" y="0" fontSize="7" fill="#64748b" textAnchor="end" fontFamily="sans-serif">{isId ? "Matahari" : "Sun"}</text>
                      </g>

                      {/* Input Section (Shrimp) */}
                      <g transform="translate(80, 85)" filter="url(#shadow)">
                        <ellipse rx="42" ry="20" fill="url(#shrimpGrad)" />
                        <path d="M-30,-5 Q-20,-12 0,-12 Q20,-12 30,-5" fill="none" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
                        <text y="4" fontSize="9" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">
                          {isId ? "UDANG" : "SHRIMP"}
                        </text>
                        <text x="-40" y="0" fontSize="7" fill="#64748b" textAnchor="end" fontFamily="sans-serif">{isId ? "Bahan" : "Input"}</text>
                      </g>

                      {/* Salt Section */}
                      <g transform="translate(80, 120)">
                        {[...Array(8)].map((_, i) => (
                          <rect key={i} x={(i-4)*6} y="-2" width="3" height="3" rx="0.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.5" transform={`rotate(${i*45})`} />
                        ))}
                        <text y="14" fontSize="8" fontWeight="medium" fill="#64748b" textAnchor="middle" fontFamily="sans-serif">
                          {isId ? "Garam" : "Salt"} {saltVal}%
                        </text>
                      </g>

                      {/* Process Section (Jar) */}
                      <g transform="translate(55, 150)" filter="url(#shadow)">
                        <rect width="50" height="60" rx="8" fill="url(#jarGrad)" stroke="#94a3b8" strokeWidth="1" />
                        <rect x="5" y="15" width="40" height={Math.max(10, Math.round(simCalc.quality * 0.4))} rx="3" fill="url(#pasteGrad)" opacity="0.9" />
                        <path d="M-2,0 L52,0 L52,10 Q52,14 45,14 L5,14 Q-2,14 -2,10 Z" fill="#475569" />
                        <text x="25" y="75" fontSize="8" fontWeight="bold" fill="#334155" textAnchor="middle" fontFamily="sans-serif">{isId ? "TERASI" : "PASTE"}</text>
                        <text x="-15" y="30" fontSize="7" fill="#64748b" textAnchor="end" fontFamily="sans-serif">{isId ? "Proses" : "Process"}</text>
                      </g>

                      {/* Hygiene Seal */}
                      <g transform="translate(125, 190)" filter="url(#shadow)">
                        <circle r="12" fill="url(#sealGrad)" stroke="white" strokeWidth="1.5" />
                        <text y="3" fontSize="8" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="sans-serif">H</text>
                        <text y="22" fontSize="7" fontWeight="bold" fill={hygieneVal > 60 ? "#059669" : hygieneVal > 30 ? "#d97706" : "#dc2626"} textAnchor="middle" fontFamily="sans-serif">
                          {isId ? "BERSIH" : "HYGIENE"}
                        </text>
                      </g>
                    </svg>
                  </div>
                  {/* Bar chart */}
                  <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
                    <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
                    <div className="flex items-end gap-1 h-24">
                      {[
                        { v: simCalc.quality, label: "Q" },
                        { v: simCalc.safetyRisk, label: "R" },
                        { v: simCalc.sustainability, label: "S" },
                      ].map(({ v, label }) => (
                        <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-muted-foreground mb-1">0</div>
                    <div className="flex gap-0.5 mt-1">
                      {[{label:"Quality"},{label:"Risk"},{label:"Sust."}].map(({ label }) => (
                        <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Data Table */}
              <div>
                <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Data Tersimpan" : "Saved Data Table"}</div>
                <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["No","Salt %","Drying Days","Hygiene %","Shrimp Stock %","Quality","Safety Risk","Sustainability"].map(h => (
                          <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {simRuns.length === 0 ? (
                        <tr><td colSpan={8} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No saved runs yet"}</td></tr>
                      ) : simRuns.map((r) => (
                        <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                          <td className="p-2">{r.no}</td>
                          <td className="p-2">{r.salt}</td>
                          <td className="p-2">{r.drying}</td>
                          <td className="p-2">{r.hygiene}</td>
                          <td className="p-2">{r.shrimp}</td>
                          <td className="p-2">{r.quality}</td>
                          <td className="p-2">{r.safetyRisk}</td>
                          <td className="p-2">{r.sustainability}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Warning for Question 2 - removed */}

          {/* Unit 3 writing guides for open questions */}
          {unit === 3 && question.type === "open" && (
            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
              <details>
                <summary className="text-[11px] font-medium text-blue-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-blue-600 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat membandingkan efisiensi energi wadah tanah liat vs logam menggunakan data dari tabel, dan menjelaskan mengapa tanah liat lebih hemat energi karena kemampuannya menahan panas lebih lama."
                    : "A strong answer compares energy efficiency of clay vs metal pot using data from the table, and explains why clay is more efficient due to its heat retention properties.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat merekomendasikan kombinasi spesifik (jenis wadah + ketebalan), lalu mengutip dua baris data dari tabel sebagai bukti yang mendukung rekomendasi tersebut."
                    : "A strong answer recommends a specific combination (pot type + thickness), then cites two rows of data from the table as evidence supporting that recommendation.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan wadah tanah liat dan logam dari sisi efisiensi energi, dampak lingkungan, dan keberlanjutan, lalu memberikan rekomendasi yang jelas dengan alasan ilmiah."
                    : "A strong answer compares clay and metal pots in terms of energy efficiency, environmental impact, and sustainability, then makes a clear recommendation with scientific reasoning.")}
                </p>
              </details>
            </div>
          )}

          {/* UNIT 3 SIMULATION */}
          {unit === 3 && (question.id === 1 || question.id === 2) && (
            <div className="mb-5 space-y-4">

              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Heat Retention", value: u3Calc.retention, sub: u3Calc.retLabel },
                  { label: "Even Heating", value: u3Calc.evenHeat, sub: u3Calc.evenLabel },
                  { label: "Energy Efficiency", value: u3Calc.energy, sub: u3Calc.energyLabel },
                  { label: "Env. Impact", value: u3Calc.envImpact, sub: u3Calc.envLabel },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
                    <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
                    <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
                    <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Controls + Chart */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl border border-border/50 p-4 shadow-sm">
                  <div className="text-[13px] font-semibold text-foreground mb-4">Simulation Controls</div>

                  {/* Pot Type */}
                  <div className="mb-4">
                    <div className="text-[12px] text-foreground mb-2 font-medium">Pot Type (Jenis Wadah)</div>
                    <div className="flex gap-4">
                      {(["clay", "metal"] as const).map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" name="potType" value={type} checked={potType === type} onChange={() => setPotType(type)} className="accent-primary w-4 h-4" />
                          <span className="text-[12px]">{type === "clay" ? "Clay Pot (Tanah Liat)" : "Metal Pot (Logam)"}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Wall Thickness */}
                  <div className="mb-4">
                    <div className="text-[12px] text-foreground mb-2">Thickness of Pot Wall / Ketebalan Dinding (cm): <span className="font-semibold">{wallThickness}</span></div>
                    <input type="range" min={1} max={10} step={1} value={wallThickness}
                      onChange={(e) => setWallThickness(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${((wallThickness - 1) / 9) * 100}%, #e5e7eb ${((wallThickness - 1) / 9) * 100}%)` }}
                    />
                  </div>

                  {/* Heat Input */}
                  <div className="mb-4">
                    <div className="text-[12px] text-foreground mb-2">Heat Input / Besar Panas (%): <span className="font-semibold">{heatInput}</span></div>
                    <input type="range" min={0} max={100} step={1} value={heatInput}
                      onChange={(e) => setHeatInput(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${heatInput}%, #e5e7eb ${heatInput}%)` }}
                    />
                  </div>

                  {/* Water Volume */}
                  <div className="mb-5">
                    <div className="text-[12px] text-foreground mb-2">Water / Broth Volume / Volume Air-Kaldu (L): <span className="font-semibold">{waterVolume}</span></div>
                    <input type="range" min={1} max={10} step={1} value={waterVolume}
                      onChange={(e) => setWaterVolume(Number(e.target.value))}
                      className="sim-slider"
                      style={{ background: `linear-gradient(to right, #111827 ${((waterVolume - 1) / 9) * 100}%, #e5e7eb ${((waterVolume - 1) / 9) * 100}%)` }}
                    />
                  </div>

                  <div className="flex gap-3">
                    <button onClick={recordU3} className="px-4 py-2 bg-gray-900 text-white text-[12px] font-semibold rounded-full hover:opacity-90">Record Data (Catat Data)</button>
                    <button onClick={() => setU3Runs([])} className="px-4 py-2 text-[12px] text-foreground hover:text-primary">Clear Data (Hapus Data)</button>
                  </div>
                </div>

                {/* Diagram + Chart column */}
                <div className="flex flex-col gap-3 w-44">
                  {/* Gentong Diagram SVG */}
                  <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="clayGrad" cx="40%" cy="35%" r="60%">
                          <stop offset="0%" stopColor={potType === "clay" ? "#c8622a" : "#9ca3af"} />
                          <stop offset="100%" stopColor={potType === "clay" ? "#7c3410" : "#4b5563"} />
                        </radialGradient>
                        <radialGradient id="innerGrad" cx="50%" cy="40%" r="55%">
                          <stop offset="0%" stopColor="#1a0a00" />
                          <stop offset="100%" stopColor="#3d1a00" />
                        </radialGradient>
                        <radialGradient id="fireGrad" cx="50%" cy="30%" r="60%">
                          <stop offset="0%" stopColor="#fff176" />
                          <stop offset="40%" stopColor={heatInput > 60 ? "#ff6d00" : heatInput > 30 ? "#ff9800" : "#ffb74d"} />
                          <stop offset="100%" stopColor={heatInput > 60 ? "#b71c1c" : "#e65100"} />
                        </radialGradient>
                        <radialGradient id="brothGrad" cx="50%" cy="60%" r="50%">
                          <stop offset="0%" stopColor="#a0522d" />
                          <stop offset="100%" stopColor="#6b3a1f" />
                        </radialGradient>
                      </defs>

                      {/* Stand legs */}
                      <line x1="58" y1="168" x2="42" y2="200" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="102" y1="168" x2="118" y2="200" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/>
                      <line x1="42" y1="185" x2="118" y2="185" stroke="#38bdf8" strokeWidth="5" strokeLinecap="round"/>

                      {/* Pot body outer (clay wall) */}
                      <ellipse cx="80" cy="90" rx="52" ry="14" fill="url(#clayGrad)" />
                      <path d="M28,90 Q20,155 30,168 Q55,180 80,180 Q105,180 130,168 Q140,155 132,90 Z" fill="url(#clayGrad)" />

                      {/* Pot body inner (cooking space) */}
                      <path d={`M${28 + wallThickness * 2},95 Q${22 + wallThickness * 2},152 ${32 + wallThickness * 2},163 Q55,172 80,172 Q105,172 ${128 - wallThickness * 2},163 Q${138 - wallThickness * 2},152 ${132 - wallThickness * 2},95 Z`} fill="url(#innerGrad)" />

                      {/* Broth level based on waterVolume */}
                      <path d={`M${34 + wallThickness},${168 - waterVolume * 7} Q80,${172 - waterVolume * 7} ${126 - wallThickness},${168 - waterVolume * 7} Q${128 - wallThickness * 2},163 ${32 + wallThickness * 2},163 Z`} fill="url(#brothGrad)" opacity="0.85" />

                      {/* Pot rim */}
                      <ellipse cx="80" cy="90" rx="52" ry="14" fill="none" stroke={potType === "clay" ? "#7c3410" : "#374151"} strokeWidth="3" />

                      {/* Pot lid */}
                      <ellipse cx="80" cy="90" rx="52" ry="14" fill="url(#clayGrad)" opacity="0.9"/>
                      <ellipse cx="80" cy="86" rx="44" ry="10" fill={potType === "clay" ? "#a0522d" : "#6b7280"} />
                      <ellipse cx="80" cy="82" rx="30" ry="7" fill={potType === "clay" ? "#8b4513" : "#4b5563"} />
                      {/* Lid knob */}
                      <ellipse cx="80" cy="72" rx="10" ry="6" fill={potType === "clay" ? "#c8622a" : "#9ca3af"} />
                      <ellipse cx="80" cy="69" rx="6" ry="4" fill={potType === "clay" ? "#a0522d" : "#6b7280"} />

                      {/* Fire/heat source */}
                      {heatInput > 0 && (
                        <ellipse cx="80" cy="208" rx={8 + heatInput * 0.18} ry={8 + heatInput * 0.12} fill="url(#fireGrad)" opacity={0.4 + heatInput * 0.005} />
                      )}
                      <ellipse cx="80" cy="205" rx={5 + heatInput * 0.12} ry={5 + heatInput * 0.08} fill="url(#fireGrad)" />

                      {/* Labels */}
                      <text x="88" y="68" fontSize="8" fill="#374151" fontFamily="sans-serif">Inner cooking</text>
                      <text x="88" y="77" fontSize="8" fill="#374151" fontFamily="sans-serif">space</text>
                      <line x1="86" y1="74" x2="80" y2="80" stroke="#9ca3af" strokeWidth="0.8"/>

                      <text x="134" y="108" fontSize="8" fill="#374151" fontFamily="sans-serif">Clay wall</text>
                      <line x1="132" y1="106" x2="126" y2="112" stroke="#9ca3af" strokeWidth="0.8"/>

                      <text x="112" y="178" fontSize="8" fill="#374151" fontFamily="sans-serif">Stand</text>
                      <line x1="112" y1="176" x2="108" y2="185" stroke="#9ca3af" strokeWidth="0.8"/>

                      <text x="10" y="200" fontSize="8" fill="#374151" fontFamily="sans-serif">Fire / heat</text>
                      <text x="10" y="210" fontSize="8" fill="#374151" fontFamily="sans-serif">source</text>
                      <line x1="42" y1="205" x2="68" y2="205" stroke="#9ca3af" strokeWidth="0.8"/>
                    </svg>
                  </div>

                  {/* Bar Chart */}
                  <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
                    <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
                    <div className="flex items-end gap-1 h-24">
                      {[
                        { v: u3Calc.retention, label: "HR" },
                        { v: u3Calc.evenHeat, label: "EH" },
                        { v: u3Calc.energy, label: "EE" },
                        { v: u3Calc.envImpact, label: "EI" },
                      ].map(({ v, label }) => (
                        <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-muted-foreground mb-1">0</div>
                    <div className="flex gap-0.5 mt-1">
                      {[
                        { label: "Heat\nRetention" },
                        { label: "Even\nHeating" },
                        { label: "Energy\nEff." },
                        { label: "Env.\nImpact" },
                      ].map(({ label }) => (
                        <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight whitespace-pre-line">{label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recorded Data Table */}
              <div>
                <div className="text-[13px] font-semibold text-foreground mb-3">Recorded Data Table</div>
                <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["No","Pot\nType","Thickness\n(cm)","Heat\nInput (%)","Water\n(L)","Heat\nRetention","Energy\nEfficiency","Env.\nImpact","Cooking Time\n(min)"].map(h => (
                          <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-pre-line text-[10px] leading-tight">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {u3Runs.length === 0 ? (
                        <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">No data yet</td></tr>
                      ) : u3Runs.map((r) => (
                        <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                          <td className="p-2">{r.no}</td>
                          <td className="p-2">{r.pot}</td>
                          <td className="p-2">{r.wall}</td>
                          <td className="p-2">{r.heat}</td>
                          <td className="p-2">{r.water}</td>
                          <td className="p-2">{r.retention}</td>
                          <td className="p-2">{r.energy}</td>
                          <td className="p-2">{r.envImpact}</td>
                          <td className="p-2">{r.cookingTime}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Unit 4 writing guides for open questions */}
          {unit === 4 && question.type === "open" && (
            <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-100">
              <details>
                <summary className="text-[11px] font-medium text-amber-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-amber-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa pasir tidak mengandung minyak sehingga tidak ada minyak yang diserap oleh kerupuk, berbeda dengan penggorengan minyak di mana minyak meresap ke dalam makanan."
                    : "A strong answer explains that sand contains no oil so there is no oil to be absorbed by the cracker, unlike oil frying where oil penetrates into the food.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat menyebutkan kombinasi terbaik (media + suhu + waktu), lalu mengutip dua baris data dari tabel yang menunjukkan kerenyahan tinggi dengan penggunaan energi rendah atau sedang."
                    : "A strong answer states the best combination (medium + temp + time), then cites two rows from the table showing high crispiness with low or medium energy use.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan penggorengan pasir dan minyak dari sisi kesehatan, penggunaan energi, dan keberlanjutan, lalu memberikan rekomendasi yang jelas."
                    : "A strong answer compares sand and oil frying in terms of health, energy use, and sustainability, then makes a clear recommendation.")}
                </p>
              </details>
            </div>
          )}

          {/* UNIT 4 SIMULATION */}
          {unit === 4 && (question.id === 1 || question.id === 2) && (
            <div className="mb-5 space-y-4">
              {/* Metric Cards */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: isId ? "Serap Minyak" : "Oil Absorption", value: u4Calc.oilAbsorption, sub: u4Calc.oilLabel },
                  { label: isId ? "Kerenyahan" : "Crispiness", value: u4Calc.crispiness, sub: u4Calc.crispLabel },
                  { label: isId ? "Energi" : "Energy Use", value: u4Calc.energy, sub: u4Calc.energyLabel },
                  { label: isId ? "Keberlanjutan" : "Sustainability", value: u4Calc.sustainability, sub: u4Calc.sustLabel },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
                    <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
                    <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
                    <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Controls + Diagram */}
              <div className="flex gap-3">
                <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm">
                  <div className="text-[13px] font-semibold text-foreground mb-4">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
                {/* Frying Medium */}
                <div className="mb-4">
                  <div className="text-[13px] font-medium text-foreground mb-2">Frying Medium (Media Penggorengan)</div>
                  <div className="flex gap-4">
                    {(["sand", "oil"] as const).map((m) => (
                      <label key={m} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="fryMedium" value={m} checked={fryMedium === m} onChange={() => setFryMedium(m)} className="accent-primary w-4 h-4" />
                        <span className="text-[13px]">{m === "sand" ? "Sand (Pasir)" : "Oil (Minyak)"}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Temperature */}
                <div className="mb-4">
                  <div className="text-[13px] text-foreground mb-2">Temperature / Suhu (°C) : <span className="font-semibold">{fryTemp}</span></div>
                  <input type="range" min={120} max={220} step={5} value={fryTemp}
                    onChange={(e) => setFryTemp(Number(e.target.value))}
                    className="sim-slider"
                    style={{ background: `linear-gradient(to right, #111827 ${((fryTemp - 120) / 100) * 100}%, #e5e7eb ${((fryTemp - 120) / 100) * 100}%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>120°C</span><span>170°C</span><span>220°C</span></div>
                </div>

                {/* Frying Time */}
                <div className="mb-4">
                  <div className="text-[13px] text-foreground mb-2">Frying Time / Waktu Penggorengan (minutes/menit) : <span className="font-semibold">{fryTime}</span></div>
                  <input type="range" min={1} max={10} step={1} value={fryTime}
                    onChange={(e) => setFryTime(Number(e.target.value))}
                    className="sim-slider"
                    style={{ background: `linear-gradient(to right, #111827 ${((fryTime - 1) / 9) * 100}%, #e5e7eb ${((fryTime - 1) / 9) * 100}%)` }}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>1 min</span><span>5 min</span><span>10 min</span></div>
                </div>

                {/* Reused toggle */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="text-[13px] text-foreground">Reused Material (Material Digunakan Ulang)</div>
                  <button
                    onClick={() => setIsReused(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors ${isReused ? "bg-gray-900" : "bg-gray-300"}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isReused ? "left-5" : "left-0.5"}`} />
                  </button>
                  <span className="text-[12px] text-muted-foreground">{isReused ? "Yes (Ya)" : "No (Tidak)"}</span>
                </div>

                <button onClick={recordU4} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
                  Run (Jalankan)
                </button>
                </div>

                {/* Kerupuk Frying Diagram */}
                <div className="flex flex-col gap-3 w-44">
                  <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
                    <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <radialGradient id="panGrad" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor="#9ca3af" />
                          <stop offset="100%" stopColor="#4b5563" />
                        </radialGradient>
                        <radialGradient id="mediumGrad" cx="50%" cy="40%" r="60%">
                          <stop offset="0%" stopColor={fryMedium === "sand" ? "#fde68a" : "#fbbf24"} />
                          <stop offset="100%" stopColor={fryMedium === "sand" ? "#d97706" : "#b45309"} />
                        </radialGradient>
                        <radialGradient id="heatGrad2" cx="50%" cy="30%" r="60%">
                          <stop offset="0%" stopColor="#fff176" />
                          <stop offset="40%" stopColor={fryTemp > 180 ? "#ff6d00" : "#ff9800"} />
                          <stop offset="100%" stopColor="#b71c1c" />
                        </radialGradient>
                      </defs>
                      {/* Pan */}
                      <ellipse cx="80" cy="100" rx="55" ry="15" fill="url(#panGrad)" />
                      <path d="M25,100 Q18,155 28,168 Q55,180 80,180 Q105,180 132,168 Q142,155 135,100 Z" fill="url(#panGrad)" />
                      {/* Medium (sand or oil) */}
                      <path d="M30,105 Q55,115 80,115 Q105,115 130,105 Q135,140 128,155 Q105,165 80,165 Q55,165 32,155 Z" fill="url(#mediumGrad)" opacity="0.85" />
                      {/* Kerupuk pieces */}
                      {[50, 70, 90, 110].map((x, i) => (
                        <ellipse key={i} cx={x} cy={108 + (i % 2) * 5} rx="10" ry="5"
                          fill={u4Calc.crispiness > 60 ? "#fef3c7" : "#fde68a"}
                          stroke="#d97706" strokeWidth="0.8" opacity="0.9" />
                      ))}
                      {/* Heat source */}
                      <ellipse cx="80" cy="195" rx={10 + fryTemp * 0.1} ry={6 + fryTemp * 0.05} fill="url(#heatGrad2)" opacity="0.7" />
                      {/* Handle */}
                      <rect x="130" y="95" width="25" height="8" rx="4" fill="#6b7280" />
                      {/* Labels */}
                      <text x="80" y="140" fontSize="7" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{fryMedium === "sand" ? (isId ? "Pasir" : "Sand") : (isId ? "Minyak" : "Oil")}</text>
                      <text x="80" y="155" fontSize="7" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{fryTemp}°C</text>
                      <text x="80" y="210" fontSize="7" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{isId ? "Sumber Panas" : "Heat Source"}</text>
                      {/* Reused badge */}
                      {isReused && (
                        <g>
                          <circle cx="20" cy="30" r="12" fill="#d1fae5" stroke="#10b981" strokeWidth="1.5" />
                          <text x="20" y="34" fontSize="6" fill="#065f46" textAnchor="middle" fontFamily="sans-serif">Reuse</text>
                        </g>
                      )}
                    </svg>
                  </div>
                  {/* Bar chart */}
                  <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
                    <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
                    <div className="flex items-end gap-1 h-24">
                      {[
                        { v: u4Calc.oilAbsorption, label: "Oil" },
                        { v: u4Calc.crispiness, label: "Cri" },
                        { v: u4Calc.energy, label: "Eng" },
                        { v: u4Calc.sustainability, label: "Sus" },
                      ].map(({ v, label }) => (
                        <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                          <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="text-[9px] text-muted-foreground mb-1">0</div>
                    <div className="flex gap-0.5 mt-1">
                      {[{label:"Oil"},{label:"Cri"},{label:"Eng"},{label:"Sus"}].map(({ label }) => (
                        <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Table */}
              <div>
                <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
                <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="border-b border-border/50">
                        {["No", isId ? "Media" : "Medium", isId ? "Suhu °C" : "Temp °C", isId ? "Waktu (min)" : "Time (min)", isId ? "Dipakai Ulang" : "Reused", isId ? "Serap Minyak" : "Oil Absorption", isId ? "Kerenyahan" : "Crispiness", isId ? "Energi" : "Energy", isId ? "Keberlanjutan" : "Sustainability"].map(h => (
                          <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {u4Runs.length === 0 ? (
                        <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
                      ) : u4Runs.map((r) => (
                        <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                          <td className="p-2">{r.no}</td>
                          <td className="p-2">{r.medium}</td>
                          <td className="p-2">{r.temp}</td>
                          <td className="p-2">{r.time}</td>
                          <td className="p-2">{r.reused}</td>
                          <td className="p-2">{r.oilAbsorption}</td>
                          <td className="p-2">{r.crispiness}</td>
                          <td className="p-2">{r.energy}</td>
                          <td className="p-2">{r.sustainability}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Unit 5 writing guides for open questions */}
          {unit === 5 && question.type === "open" && (
            <div className="mb-3 p-3 bg-green-50 rounded-lg border border-green-100">
              <details>
                <summary className="text-[11px] font-medium text-green-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-green-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa semakin lama fermentasi, mikroorganisme mengubah lebih banyak gula menjadi asam, sehingga rasa manis menurun dan keasaman meningkat."
                    : "A strong answer explains that as fermentation time increases, microorganisms convert more sugar into acid, so sweetness decreases and acidity increases.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat menyebutkan satu kombinasi terbaik, lalu mengutip dua baris dari tabel sebagai bukti untuk rasa, keasaman, dan daya simpan."
                    : "A strong answer states one best combination, then cites two rows from the table as evidence for taste, acidity, and shelf life.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat membandingkan daun pisang dan plastik dari sisi biodegradabilitas, kualitas pangan, dan pengurangan limbah, lalu memberikan rekomendasi yang jelas."
                    : "A strong answer compares banana leaf and plastic in terms of biodegradability, food quality, and waste reduction, then makes a clear recommendation.")}
                </p>
              </details>
            </div>
          )}

          {/* UNIT 5 SIMULATION */}
          {unit === 5 && (question.id === 1 || question.id === 2 || question.id === 3 || question.id === 4) && (
            <Unit5Simulation isId={isId} />
          )}

          {/* Unit 6 writing guides for open questions */}
          {unit === 6 && question.type === "open" && (
            <div className="mb-3 p-3 bg-teal-50 rounded-lg border border-teal-100">
              <details>
                <summary className="text-[11px] font-medium text-teal-700 cursor-pointer">{isId ? "Panduan Menulis" : "Writing Guide"}</summary>
                <p className="text-[11px] text-teal-700 mt-1 leading-relaxed">
                  {question.id === 3 && (isId
                    ? "Jawaban yang kuat menjelaskan bahwa mangrove menyediakan habitat, sumber makanan, dan area pembesaran bagi ikan. Ketika tutupan mangrove berkurang, lebih sedikit ikan muda yang bertahan hidup sehingga produksi ikan menurun."
                    : "A strong answer explains that mangroves provide habitat, food, and nursery areas for fish. When mangrove cover decreases, fewer young fish survive so fish production declines.")}
                  {question.id === 4 && (isId
                    ? "Jawaban yang kuat membandingkan hasil simulasi pada tutupan mangrove tinggi vs rendah, menyebutkan dampak jangka pendek dan panjang, serta menggunakan minimal dua bukti dari data simulasi."
                    : "A strong answer compares simulation results at high vs low mangrove cover, mentions short-term and long-term effects, and uses at least two pieces of evidence from simulation data.")}
                  {question.id === 5 && (isId
                    ? "Jawaban yang kuat merekomendasikan satu strategi utama (misalnya restorasi mangrove), memberikan alasan ilmiah, dan menjelaskan dampak jangka panjang terhadap ekosistem pesisir."
                    : "A strong answer recommends one main strategy (e.g. mangrove restoration), provides a scientific reason, and explains the long-term effect on the coastal ecosystem.")}
                </p>
              </details>
            </div>
          )}

          {/* UNIT 6 SIMULATION */}
          {unit === 6 && (question.id === 1 || question.id === 2 || question.id === 3 || question.id === 4) && (
            <Unit6Simulation isId={isId} />
          )}

          {/* UNIT 7 SIMULATION */}
          {unit === 7 && (question.id === 2 || question.id === 3 || question.id === 4 || question.id === 5) && (
            <Unit7Simulation isId={isId} />
          )}

          {/* Options Container */}
          <div className="space-y-2.5">
            {/* MCQ Options */}
            {question.type === "mcq" && options && (
              <div className="grid gap-3">
                {options.map((option) => {
                  const isSelected = selectedMCQ === option;
                  return (
                    <button
                      key={option}
                      onClick={() => handleMCQ(option)}
                      className={`group w-full text-left px-4 py-3.5 text-[14px] rounded-lg transition-all duration-200 border flex items-center gap-4 ${
                        isSelected
                          ? "bg-primary/5 border-primary/30 text-foreground shadow-sm"
                          : "bg-white border-border/50 text-foreground/80 hover:bg-secondary/50 hover:border-primary/20"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Checkbox Options */}
            {question.type === "checkbox" && options && (
              <div className="grid gap-3">
                {options.map((option) => {
                  const isSelected = selectedCheckbox.includes(option);
                  return (
                    <button
                      key={option}
                      onClick={() => handleCheckbox(option)}
                      className={`group w-full text-left px-4 py-3.5 text-[14px] rounded-lg transition-all duration-200 border flex items-center gap-4 ${
                        isSelected
                          ? "bg-primary/5 border-primary/30 text-foreground shadow-sm"
                          : "bg-white border-border/50 text-foreground/80 hover:bg-secondary/50 hover:border-primary/20"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-muted-foreground/30 group-hover:border-primary/50"
                        }`}
                      >
                        {isSelected && (
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 leading-relaxed">{option}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Open-ended */}
            {question.type === "open" && (() => {
              const text = (answer as string) || "";
              const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
              const tooShort = wordCount > 0 && wordCount < 15;
              const tooLong = wordCount > 50;
              const wordColor = tooLong ? "text-rose-500" : tooShort ? "text-amber-500" : wordCount >= 15 ? "text-emerald-600" : "text-muted-foreground";
              return (
                <div className={`bg-white rounded-xl border shadow-sm p-1 ${tooLong ? "border-rose-300" : tooShort ? "border-amber-300" : "border-border/50"}`}>
                  <textarea
                    value={text}
                    onChange={(e) => onAnswer(question.id, e.target.value)}
                    placeholder={getPlaceholder()}
                    rows={10}
                    className="w-full px-4 py-4 text-[14px] rounded-lg border-0 bg-transparent text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-150 resize-none leading-relaxed"
                  />
                  <div className="px-4 pb-3 flex items-center justify-between border-t border-border/30">
                    <span className={`text-[10px] font-medium ${wordColor}`}>
                      {wordCount} {t("words", "kata")}
                      {tooShort && <span className="ml-1">({t("min. 15", "min. 15")})</span>}
                      {tooLong && <span className="ml-1">({t("max. 50", "maks. 50")})</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {t("15–50 words", "15–50 kata")}
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="px-5 py-3 border-t border-exam-divider bg-white/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={onPrev}
            disabled={isFirst}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {isLast ? (
            <button
              onClick={onSubmit}
              disabled={!isAnswerValid}
              className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-700 transition-colors uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t("Submit Assessment", "Kirim Penilaian")}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {question.type === "open" && (
                <span className={`text-[10px] font-bold ${currentWordCount >= 15 && currentWordCount <= 50 ? "text-green-600" : "text-amber-600/70"}`}>
                  {isId ? `${currentWordCount} kata (Butuh 15-50)` : `${currentWordCount} words (Need 15-50)`}
                </span>
              )}
              <button
                onClick={onNext}
                disabled={!isAnswerValid}
                className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-colors border border-indigo-200 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionPanel;

function Unit5Simulation({ isId }: { isId: boolean }) {
  const [fermTime, setFermTime] = React.useState(48);
  const [fermTemp, setFermTemp] = React.useState(28);
  const [packaging, setPackaging] = React.useState<"banana" | "plastic">("banana");
  const [starterQuality, setStarterQuality] = React.useState<"good" | "poor">("good");
  const [u5Runs, setU5Runs] = React.useState<{no: number; time: number; temp: number; pkg: string; starter: string; sweetness: number; acidity: number; shelfLife: number; sustainability: number}[]>([]);

  const u5Calc = React.useMemo(() => {
    const isGoodStarter = starterQuality === "good";
    const isBanana = packaging === "banana";
    const optimalTemp = fermTemp >= 25 && fermTemp <= 30;
    const sweetness = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 60 : 30) + (optimalTemp ? 15 : -10) - (fermTime > 48 ? (fermTime - 48) * 0.8 : 0)
    )));
    const acidity = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 20 : 40) + fermTime * 0.5 + (fermTemp > 30 ? (fermTemp - 30) * 2 : 0)
    )));
    const shelfLife = Math.round(Math.min(100, Math.max(0,
      (isGoodStarter ? 50 : 25) + (isBanana ? 10 : 5) + (fermTime >= 24 && fermTime <= 48 ? 20 : 0)
    )));
    const sustainability = Math.round(Math.min(100, (isBanana ? 80 : 30) + (isGoodStarter ? 10 : 0)));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { sweetness, acidity, shelfLife, sustainability, sLabel: label(sweetness), aLabel: label(acidity), slLabel: label(shelfLife), susLabel: label(sustainability) };
  }, [fermTime, fermTemp, packaging, starterQuality]);

  const runU5 = () => {
    setU5Runs(prev => [...prev, {
      no: prev.length + 1,
      time: fermTime, temp: fermTemp,
      pkg: packaging === "banana" ? "Banana leaf" : "Plastic",
      starter: starterQuality === "good" ? "Good" : "Poor",
      sweetness: u5Calc.sweetness, acidity: u5Calc.acidity,
      shelfLife: u5Calc.shelfLife, sustainability: u5Calc.sustainability,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: isId ? "Rasa Manis" : "Sweetness", value: u5Calc.sweetness, sub: u5Calc.sLabel },
          { label: isId ? "Keasaman" : "Acidity", value: u5Calc.acidity, sub: u5Calc.aLabel },
          { label: isId ? "Daya Simpan" : "Shelf Life", value: u5Calc.shelfLife, sub: u5Calc.slLabel },
          { label: isId ? "Keberlanjutan" : "Sustainability", value: u5Calc.sustainability, sub: u5Calc.susLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-2xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls + Diagram */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
          <div className="text-[13px] font-semibold text-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
        {/* Fermentation Time */}
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Waktu Fermentasi (jam)" : "Fermentation Time (hours)"}: <span className="font-semibold">{fermTime}</span></div>
          <input type="range" min={12} max={96} step={12} value={fermTime}
            onChange={(e) => setFermTime(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${((fermTime - 12) / 84) * 100}%, #e5e7eb ${((fermTime - 12) / 84) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>12h</span><span>48h</span><span>96h</span></div>
        </div>

        {/* Temperature */}
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Suhu Fermentasi (°C)" : "Fermentation Temperature (°C)"}: <span className="font-semibold">{fermTemp}</span></div>
          <input type="range" min={15} max={40} step={1} value={fermTemp}
            onChange={(e) => setFermTemp(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${((fermTemp - 15) / 25) * 100}%, #e5e7eb ${((fermTemp - 15) / 25) * 100}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>15°C</span><span>28°C</span><span>40°C</span></div>
        </div>

        {/* Packaging */}
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Jenis Kemasan" : "Packaging Type"}</div>
          <div className="flex gap-4">
            {(["banana", "plastic"] as const).map((p) => (
              <label key={p} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u5pkg" value={p} checked={packaging === p} onChange={() => setPackaging(p)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{p === "banana" ? (isId ? "Daun pisang" : "Banana leaf") : (isId ? "Plastik" : "Plastic")}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Starter Quality */}
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Kualitas Starter (Ragi)" : "Starter Quality (Ragi)"}</div>
          <div className="flex gap-4">
            {(["good", "poor"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u5starter" value={s} checked={starterQuality === s} onChange={() => setStarterQuality(s)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{s === "good" ? (isId ? "Baik" : "Good") : (isId ? "Buruk" : "Poor")}</span>
              </label>
            ))}
          </div>
        </div>

        <button onClick={runU5} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
        </div>

        {/* Tape Ketan Diagram */}
        <div className="flex flex-col gap-3 w-44">
          <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="riceGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor="#fef9c3" />
                  <stop offset="100%" stopColor="#fde68a" />
                </radialGradient>
                <radialGradient id="tapeGrad" cx="50%" cy="40%" r="60%">
                  <stop offset="0%" stopColor={u5Calc.sweetness > 60 ? "#bbf7d0" : "#fef08a"} />
                  <stop offset="100%" stopColor={u5Calc.sweetness > 60 ? "#4ade80" : "#facc15"} />
                </radialGradient>
              </defs>
              {/* Thermometer */}
              <rect x="140" y="20" width="10" height="80" rx="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1"/>
              <rect x="142" y={100 - Math.round(((fermTemp - 15) / 25) * 70)} width="6" height={Math.round(((fermTemp - 15) / 25) * 70)} rx="3" fill={fermTemp > 32 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"} />
              <circle cx="145" cy="105" r="7" fill={fermTemp > 32 ? "#ef4444" : fermTemp > 25 ? "#f97316" : "#3b82f6"} />
              <text x="145" y="120" fontSize="7" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{fermTemp}°C</text>

              {/* Leaf wrapper */}
              <ellipse cx="80" cy="60" rx="45" ry="20" fill={packaging === "banana" ? "#86efac" : "#93c5fd"} opacity="0.7" />
              <ellipse cx="80" cy="60" rx="38" ry="15" fill={packaging === "banana" ? "#4ade80" : "#60a5fa"} opacity="0.5" />
              <text x="80" y="64" fontSize="7" fill="#166534" textAnchor="middle" fontFamily="sans-serif">{packaging === "banana" ? (isId ? "Daun Pisang" : "Banana Leaf") : "Plastic"}</text>

              {/* Rice/tape container */}
              <rect x="45" y="80" width="70" height="80" rx="8" fill="url(#riceGrad)" stroke="#d97706" strokeWidth="1.5" />
              {/* Fermentation bubbles */}
              {starterQuality === "good" && [55,70,85,100].map((x, i) => (
                <circle key={i} cx={x} cy={90 + i * 12} r={2 + i} fill="white" opacity={0.4 + i * 0.1} />
              ))}
              {/* Tape color overlay based on sweetness */}
              <rect x="47" y={160 - Math.round(u5Calc.sweetness * 0.6)} width="66" height={Math.round(u5Calc.sweetness * 0.6)} rx="6" fill="url(#tapeGrad)" opacity="0.7" />
              <text x="80" y="130" fontSize="8" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{isId ? "Tape Ketan" : "Tape Ketan"}</text>

              {/* Time indicator */}
              <rect x="10" y="80" width="28" height="14" rx="3" fill="#ddd6fe" />
              <text x="24" y="91" fontSize="7" fill="#5b21b6" textAnchor="middle" fontFamily="sans-serif">{fermTime}h</text>

              {/* Starter indicator */}
              <circle cx="24" cy="120" r="12" fill={starterQuality === "good" ? "#bbf7d0" : "#fecaca"} stroke={starterQuality === "good" ? "#16a34a" : "#dc2626"} strokeWidth="1.5" />
              <text x="24" y="124" fontSize="6" fill={starterQuality === "good" ? "#166534" : "#991b1b"} textAnchor="middle" fontFamily="sans-serif">{starterQuality === "good" ? "Good" : "Poor"}</text>
              <text x="24" y="140" fontSize="6" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{isId ? "Ragi" : "Starter"}</text>

              {/* Labels */}
              <text x="80" y="175" fontSize="7" fill="#374151" textAnchor="middle" fontFamily="sans-serif">{isId ? "Fermentasi" : "Fermentation"}</text>
            </svg>
          </div>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
            <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
            <div className="flex items-end gap-1 h-24">
              {[
                { v: u5Calc.sweetness, label: "Sw" },
                { v: u5Calc.acidity, label: "Ac" },
                { v: u5Calc.shelfLife, label: "SL" },
                { v: u5Calc.sustainability, label: "Su" },
              ].map(({ v, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mb-1">0</div>
            <div className="flex gap-0.5 mt-1">
              {[{label:"Sweet"},{label:"Acid"},{label:"Shelf"},{label:"Sust."}].map(({ label }) => (
                <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Waktu (jam)" : "Time (h)", isId ? "Suhu °C" : "Temp °C", isId ? "Kemasan" : "Packaging", isId ? "Starter" : "Starter", isId ? "Manis" : "Sweetness", isId ? "Asam" : "Acidity", isId ? "Daya Simpan" : "Shelf Life", isId ? "Keberlanjutan" : "Sustainability"].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u5Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u5Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.time}</td>
                  <td className="p-2">{r.temp}</td>
                  <td className="p-2">{r.pkg}</td>
                  <td className="p-2">{r.starter}</td>
                  <td className="p-2">{r.sweetness}</td>
                  <td className="p-2">{r.acidity}</td>
                  <td className="p-2">{r.shelfLife}</td>
                  <td className="p-2">{r.sustainability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Unit6Simulation({ isId }: { isId: boolean }) {
  const [mangrove, setMangrove] = React.useState(60);
  const [waveStrength, setWaveStrength] = React.useState(50);
  const [pollution, setPollution] = React.useState(30);
  const [u6Runs, setU6Runs] = React.useState<{no: number; mangrove: number; wave: number; pollution: number; erosion: number; floodRisk: number; fishProd: number; carbon: number; biodiversity: number}[]>([]);

  const u6Calc = React.useMemo(() => {
    const erosion = Math.round(Math.max(0, Math.min(100, 80 - mangrove * 0.7 + waveStrength * 0.4 + pollution * 0.2)));
    const floodRisk = Math.round(Math.max(0, Math.min(100, 70 - mangrove * 0.6 + waveStrength * 0.3 + pollution * 0.1)));
    const fishProd = Math.round(Math.max(0, Math.min(100, mangrove * 0.7 - pollution * 0.4 + 20)));
    const carbon = Math.round(Math.max(0, Math.min(100, mangrove * 0.8 - pollution * 0.2)));
    const biodiversity = Math.round(Math.max(0, Math.min(100, mangrove * 0.75 - pollution * 0.3 - waveStrength * 0.1 + 10)));
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { erosion, floodRisk, fishProd, carbon, biodiversity, eLabel: label(erosion), fLabel: label(floodRisk), fpLabel: label(fishProd), cLabel: label(carbon), bLabel: label(biodiversity) };
  }, [mangrove, waveStrength, pollution]);

  const runU6 = () => {
    setU6Runs(prev => [...prev, {
      no: prev.length + 1,
      mangrove, wave: waveStrength, pollution,
      erosion: u6Calc.erosion, floodRisk: u6Calc.floodRisk,
      fishProd: u6Calc.fishProd, carbon: u6Calc.carbon, biodiversity: u6Calc.biodiversity,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-5 gap-2">
        {[
          { label: isId ? "Abrasi" : "Erosion", value: u6Calc.erosion, sub: u6Calc.eLabel },
          { label: isId ? "Risiko Banjir" : "Flood Risk", value: u6Calc.floodRisk, sub: u6Calc.fLabel },
          { label: isId ? "Prod. Ikan" : "Fish Prod.", value: u6Calc.fishProd, sub: u6Calc.fpLabel },
          { label: isId ? "Karbon" : "Carbon", value: u6Calc.carbon, sub: u6Calc.cLabel },
          { label: isId ? "Biodiversitas" : "Biodiversity", value: u6Calc.biodiversity, sub: u6Calc.bLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls + Diagram */}
      <div className="flex gap-3">
        <div className="flex-1 bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
          <div className="text-[13px] font-semibold text-foreground mb-2">{isId ? "Kontrol Simulasi" : "Simulation Controls"}</div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Tutupan Mangrove (%)" : "Mangrove Cover (%)"}: <span className="font-semibold">{mangrove}</span></div>
          <input type="range" min={0} max={100} step={5} value={mangrove}
            onChange={(e) => setMangrove(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${mangrove}%, #e5e7eb ${mangrove}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Kekuatan Gelombang (%)" : "Wave Strength (%)"}: <span className="font-semibold">{waveStrength}</span></div>
          <input type="range" min={0} max={100} step={5} value={waveStrength}
            onChange={(e) => setWaveStrength(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${waveStrength}%, #e5e7eb ${waveStrength}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Tingkat Polusi (%)" : "Pollution Level (%)"}: <span className="font-semibold">{pollution}</span></div>
          <input type="range" min={0} max={100} step={5} value={pollution}
            onChange={(e) => setPollution(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${pollution}%, #e5e7eb ${pollution}%)` }}
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>0%</span><span>50%</span><span>100%</span></div>
        </div>
        <button onClick={runU6} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
        </div>

        {/* Mangrove Coastal Diagram */}
        <div className="flex flex-col gap-3 w-44">
          <div className="bg-white rounded-xl border border-border/50 p-2 shadow-sm flex items-center justify-center">
            <svg viewBox="0 0 160 220" width="140" height="196" xmlns="http://www.w3.org/2000/svg">
              {/* Sky */}
              <rect x="0" y="0" width="160" height="100" fill="#e0f2fe" />
              {/* Sea */}
              <rect x="0" y="100" width="160" height="120" fill={`rgba(14,165,233,${0.4 + pollution * 0.004})`} />
              {/* Wave lines */}
              {[110, 125, 140].map((y, i) => (
                <path key={i} d={`M0,${y} Q20,${y - 5 + waveStrength * 0.05} 40,${y} Q60,${y + 5 - waveStrength * 0.05} 80,${y} Q100,${y - 5 + waveStrength * 0.05} 120,${y} Q140,${y + 5 - waveStrength * 0.05} 160,${y}`}
                  fill="none" stroke="white" strokeWidth="1.5" opacity="0.5" />
              ))}
              {/* Shore */}
              <rect x="0" y="95" width="160" height="12" fill="#fde68a" />
              {/* Mangrove trees based on coverage */}
              {Array.from({ length: Math.round(mangrove / 14) }, (_, i) => {
                const x = 10 + i * 22;
                const h = 30 + (i % 3) * 8;
                return (
                  <g key={i}>
                    <line x1={x} y1={95} x2={x} y2={95 - h} stroke="#92400e" strokeWidth="3" />
                    <circle cx={x} cy={95 - h} r={10 + (i % 2) * 3} fill="#16a34a" opacity="0.85" />
                    {/* Roots */}
                    <line x1={x - 6} y1={95} x2={x} y2={85} stroke="#92400e" strokeWidth="1.5" />
                    <line x1={x + 6} y1={95} x2={x} y2={85} stroke="#92400e" strokeWidth="1.5" />
                  </g>
                );
              })}
              {/* Pollution indicator */}
              {pollution > 40 && (
                <g>
                  <circle cx="130" cy="130" r="8" fill="#ef4444" opacity="0.6" />
                  <circle cx="115" cy="145" r="5" fill="#f97316" opacity="0.5" />
                </g>
              )}
              {/* Fish indicator */}
              {u6Calc.fishProd > 40 && (
                <g>
                  <ellipse cx="50" cy="150" rx="8" ry="4" fill="#fbbf24" opacity="0.7" />
                  <ellipse cx="70" cy="160" rx="6" ry="3" fill="#fbbf24" opacity="0.6" />
                </g>
              )}
              {/* Labels */}
              <text x="80" y="12" fontSize="7" fill="#0369a1" textAnchor="middle" fontFamily="sans-serif">{isId ? "Pesisir" : "Coastline"}</text>
              <text x="80" y="210" fontSize="7" fill="#0369a1" textAnchor="middle" fontFamily="sans-serif">{isId ? "Laut" : "Sea"}</text>
              <text x="80" y="92" fontSize="6" fill="#92400e" textAnchor="middle" fontFamily="sans-serif">{mangrove}% {isId ? "mangrove" : "mangrove"}</text>
            </svg>
          </div>
          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-border/50 p-3 shadow-sm flex flex-col justify-between flex-1">
            <div className="text-[9px] text-muted-foreground text-right mb-1">100</div>
            <div className="flex items-end gap-0.5 h-24">
              {[
                { v: u6Calc.erosion, label: "Er" },
                { v: u6Calc.floodRisk, label: "Fl" },
                { v: u6Calc.fishProd, label: "Fi" },
                { v: u6Calc.carbon, label: "C" },
                { v: u6Calc.biodiversity, label: "Bd" },
              ].map(({ v, label }) => (
                <div key={label} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full bg-gray-900 rounded-sm transition-all duration-300" style={{ height: `${v}%` }} />
                </div>
              ))}
            </div>
            <div className="text-[9px] text-muted-foreground mb-1">0</div>
            <div className="flex gap-0.5 mt-1">
              {[{label:"Eros"},{label:"Flood"},{label:"Fish"},{label:"C"},{label:"Bio"}].map(({ label }) => (
                <div key={label} className="flex-1 text-center text-[7px] text-muted-foreground leading-tight">{label}</div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Mangrove %" : "Mangrove %", isId ? "Gelombang %" : "Wave %", isId ? "Polusi %" : "Pollution %", isId ? "Abrasi" : "Erosion", isId ? "Banjir" : "Flood", isId ? "Ikan" : "Fish", isId ? "Karbon" : "Carbon", isId ? "Biodiv." : "Biodiv."].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u6Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u6Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.mangrove}</td>
                  <td className="p-2">{r.wave}</td>
                  <td className="p-2">{r.pollution}</td>
                  <td className="p-2">{r.erosion}</td>
                  <td className="p-2">{r.floodRisk}</td>
                  <td className="p-2">{r.fishProd}</td>
                  <td className="p-2">{r.carbon}</td>
                  <td className="p-2">{r.biodiversity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Unit7Simulation({ isId }: { isId: boolean }) {
  const [fishingIntensity, setFishingIntensity] = React.useState(70);
  const [awareness, setAwareness] = React.useState(30);
  const [wasteMgmt, setWasteMgmt] = React.useState<"good" | "poor">("poor");
  const [conservation, setConservation] = React.useState(20);
  const [u7Runs, setU7Runs] = React.useState<{no: number; fishing: number; awareness: number; waste: string; conservation: number; fishPop: number; waterQuality: number; biodiversity: number; sustainability: number}[]>([]);

  const u7Calc = React.useMemo(() => {
    const isWasteGood = wasteMgmt === "good";
    const fishPop = Math.round(Math.max(0, Math.min(100, 80 - fishingIntensity * 0.6 + awareness * 0.15 + conservation * 0.25 - (isWasteGood ? 0 : 15))));
    const waterQuality = Math.round(Math.max(0, Math.min(100, (isWasteGood ? 85 : 35) + awareness * 0.1 + conservation * 0.05)));
    const biodiversity = Math.round(Math.max(0, Math.min(100, conservation * 0.7 + awareness * 0.1 + (isWasteGood ? 10 : 0) + 10)));
    const sustainability = Math.round((fishPop + waterQuality + biodiversity) / 3);
    const label = (v: number) => v >= 67 ? "High" : v >= 34 ? "Medium" : "Low";
    return { fishPop, waterQuality, biodiversity, sustainability, fLabel: label(fishPop), wLabel: label(waterQuality), bLabel: label(biodiversity), sLabel: label(sustainability) };
  }, [fishingIntensity, awareness, wasteMgmt, conservation]);

  const runU7 = () => {
    setU7Runs(prev => [...prev, {
      no: prev.length + 1,
      fishing: fishingIntensity, awareness,
      waste: wasteMgmt === "good" ? "Good" : "Poor",
      conservation,
      fishPop: u7Calc.fishPop, waterQuality: u7Calc.waterQuality,
      biodiversity: u7Calc.biodiversity, sustainability: u7Calc.sustainability,
    }]);
  };

  return (
    <div className="mb-5 space-y-4">
      {/* Metric Cards */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: isId ? "Populasi Ikan" : "Fish Pop.", value: u7Calc.fishPop, sub: u7Calc.fLabel },
          { label: isId ? "Kualitas Air" : "Water Quality", value: u7Calc.waterQuality, sub: u7Calc.wLabel },
          { label: isId ? "Biodiversitas" : "Biodiversity", value: u7Calc.biodiversity, sub: u7Calc.bLabel },
          { label: isId ? "Keberlanjutan" : "Sustainability", value: u7Calc.sustainability, sub: u7Calc.sLabel },
        ].map(({ label, value, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-border/50 p-3 shadow-sm text-center">
            <div className="text-[10px] text-muted-foreground mb-1 leading-tight">{label}</div>
            <div className="text-xl font-bold text-foreground leading-none">{value}</div>
            <div className={`text-[10px] mt-1 font-semibold px-2 py-0.5 rounded-full inline-block text-white ${sub === "High" ? "bg-gray-800" : sub === "Medium" ? "bg-gray-500" : "bg-gray-400"}`}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl border border-border/50 p-5 shadow-sm space-y-4">
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Intensitas Penangkapan Ikan (%)" : "Fishing Intensity (%)"}: <span className="font-semibold">{fishingIntensity}</span></div>
          <input type="range" min={0} max={100} step={5} value={fishingIntensity}
            onChange={(e) => setFishingIntensity(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${fishingIntensity}%, #e5e7eb ${fishingIntensity}%)` }}
          />
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Kesadaran Masyarakat (%)" : "Community Awareness (%)"}: <span className="font-semibold">{awareness}</span></div>
          <input type="range" min={0} max={100} step={5} value={awareness}
            onChange={(e) => setAwareness(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${awareness}%, #e5e7eb ${awareness}%)` }}
          />
        </div>
        <div>
          <div className="text-[13px] font-medium text-foreground mb-2">{isId ? "Pengelolaan Limbah" : "Waste Management"}</div>
          <div className="flex gap-4">
            {(["good", "poor"] as const).map((w) => (
              <label key={w} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="u7waste" value={w} checked={wasteMgmt === w} onChange={() => setWasteMgmt(w)} className="accent-primary w-4 h-4" />
                <span className="text-[13px]">{w === "good" ? (isId ? "Baik" : "Good") : (isId ? "Buruk" : "Poor")}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[13px] text-foreground mb-2">{isId ? "Upaya Konservasi (%)" : "Conservation Efforts (%)"}: <span className="font-semibold">{conservation}</span></div>
          <input type="range" min={0} max={100} step={5} value={conservation}
            onChange={(e) => setConservation(Number(e.target.value))}
            className="sim-slider"
            style={{ background: `linear-gradient(to right, #111827 ${conservation}%, #e5e7eb ${conservation}%)` }}
          />
        </div>
        <button onClick={runU7} className="px-5 py-2 bg-gray-900 text-white text-[13px] font-semibold rounded-full hover:opacity-90">
          {isId ? "Jalankan" : "Run"}
        </button>
      </div>

      {/* Results Table */}
      <div>
        <div className="text-[13px] font-semibold text-foreground mb-3">{isId ? "Tabel Hasil Simulasi" : "Simulation Results Table"}</div>
        <div className="bg-white rounded-xl border border-border/50 shadow-sm overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border/50">
                {["No", isId ? "Tangkapan" : "Fishing", isId ? "Sadar" : "Aware", isId ? "Limbah" : "Waste", isId ? "Konservasi" : "Cons.", isId ? "Pop. Ikan" : "Fish Pop.", isId ? "Kual. Air" : "Water Q.", isId ? "Biodiv." : "Biodiv.", isId ? "Keberlanjutan" : "Sustain."].map(h => (
                  <th key={h} className="p-2 text-left font-semibold text-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {u7Runs.length === 0 ? (
                <tr><td colSpan={9} className="p-3 text-center text-muted-foreground text-[11px]">{isId ? "Belum ada data" : "No data yet"}</td></tr>
              ) : u7Runs.map((r) => (
                <tr key={r.no} className="border-t border-border/30 hover:bg-muted/20">
                  <td className="p-2">{r.no}</td>
                  <td className="p-2">{r.fishing}</td>
                  <td className="p-2">{r.awareness}</td>
                  <td className="p-2">{r.waste}</td>
                  <td className="p-2">{r.conservation}</td>
                  <td className="p-2">{r.fishPop}</td>
                  <td className="p-2">{r.waterQuality}</td>
                  <td className="p-2">{r.biodiversity}</td>
                  <td className="p-2">{r.sustainability}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
