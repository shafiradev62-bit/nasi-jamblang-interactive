import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDeviceId, saveCompletedSession } from "@/hooks/useExamSession";

interface Unit9PisaProps { onExit?: () => void; studentId?: string; }

type DyeType = "Synthetic" | "Natural";
type WaterLevel = "Low" | "Medium" | "High";
type TreatmentLevel = "None" | "Partial" | "Full";
type ScaleLevel = "Small" | "Medium" | "Large";
type Quality = "Good" | "Medium" | "Poor";
type RiskLevel = "Low" | "Medium" | "High";

interface SimResult { waterQuality: Quality; ecosystemRisk: RiskLevel; feasibility: RiskLevel; }

// 2D lookup table: [dye][water][treatment] -> SimResult
const SIM_TABLE: Record<DyeType, Record<WaterLevel, Record<TreatmentLevel, SimResult>>> = {
  Synthetic: {
    Low:    { None: {waterQuality:"Poor",  ecosystemRisk:"High",   feasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    feasibility:"Low"}  },
    Medium: { None: {waterQuality:"Poor",  ecosystemRisk:"High",   feasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    feasibility:"Low"}  },
    High:   { None: {waterQuality:"Poor",  ecosystemRisk:"High",   feasibility:"High"},  Partial:{waterQuality:"Poor",  ecosystemRisk:"High",  feasibility:"Medium"}, Full:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Low"}  },
  },
  Natural: {
    Low:    { None: {waterQuality:"Medium",ecosystemRisk:"Medium", feasibility:"High"},  Partial:{waterQuality:"Good",  ecosystemRisk:"Low",   feasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    feasibility:"Low"}  },
    Medium: { None: {waterQuality:"Medium",ecosystemRisk:"Medium", feasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Medium"}, Full:{waterQuality:"Good",  ecosystemRisk:"Low",    feasibility:"Low"}  },
    High:   { None: {waterQuality:"Poor",  ecosystemRisk:"High",   feasibility:"High"},  Partial:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Medium"}, Full:{waterQuality:"Medium",ecosystemRisk:"Medium",feasibility:"Low"}  },
  },
};

const STEP_LABELS_EN = ["Introduction","Question 1","Question 2","Question 3","Question 4","Question 5"];
const STEP_LABELS_ID = ["Pendahuluan","Soal 1","Soal 2","Soal 3","Soal 4","Soal 5"];

const q1Items = [
  {key:"synth_no_treat", en:"Using synthetic dyes with no wastewater treatment.",       id:"Menggunakan pewarna sintetis tanpa pengolahan limbah."},
  {key:"less_water",     en:"Using less water in the process.",                          id:"Menggunakan lebih sedikit air dalam proses."},
  {key:"untreated_river",en:"Releasing untreated dye wastewater into a river.",          id:"Membuang limbah pewarna tanpa pengolahan ke sungai."},
  {key:"full_treat",     en:"Applying full wastewater treatment before disposal.",       id:"Menerapkan pengolahan limbah penuh sebelum dibuang."},
];

const Unit9Pisa = ({ onExit, studentId }: Unit9PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [currentStep, setCurrentStep] = useState(0);
  const [timer] = useState("20:00");
  const [showWritingGuide, setShowWritingGuide] = useState(false);

  // Controls
  const [dyeType,   setDyeType]   = useState<DyeType>("Synthetic");
  const [waterUse,  setWaterUse]  = useState<WaterLevel>("High");
  const [treatment, setTreatment] = useState<TreatmentLevel>("None");
  const [scale,     setScale]     = useState<ScaleLevel>("Medium");

  // Outputs (start with defaults matching Synthetic/High/None)
  const [outputs, setOutputs] = useState<SimResult>({waterQuality:"Poor", ecosystemRisk:"High", feasibility:"High"});
  const [simRan, setSimRan] = useState(false);
  const [history, setHistory] = useState<Array<{id:number;dye:DyeType;water:WaterLevel;treatment:TreatmentLevel;scale:ScaleLevel}&SimResult>>([]);

  // Answers
  const [q1Answers, setQ1Answers] = useState<Record<string,string>>({});
  const [q2Answer,  setQ2Answer]  = useState("");
  const [q3Choice,  setQ3Choice]  = useState("");
  const [q4Answer,  setQ4Answer]  = useState("");
  const [q5Answer,  setQ5Answer]  = useState("");

  const getWordCount = (text: string) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  };

  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return Object.keys(q1Answers).length >= 4;
    if (currentStep === 2) {
      const count = getWordCount(q2Answer);
      return count >= 15 && count <= 50;
    }
    if (currentStep === 3) return !!q3Choice;
    if (currentStep === 4) {
      const count = getWordCount(q4Answer);
      return count >= 15 && count <= 50;
    }
    if (currentStep === 5) {
      const count = getWordCount(q5Answer);
      return count >= 15 && count <= 50;
    }
    return false;
  };

  // AUTO-SYNC / AUTO-SAVE
  const deviceId = getDeviceId();
  useEffect(() => {
    const data = {
      q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, currentStep,
      dyeType, waterUse, treatment, scale, outputs, history, simRan
    };
    localStorage.setItem(`unit9_autosave_${deviceId}`, JSON.stringify(data));
  }, [q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, currentStep, history, dyeType, waterUse, treatment, scale, outputs, simRan]);

  // LOAD AUTO-SAVE
  useEffect(() => {
    const saved = localStorage.getItem(`unit9_autosave_${deviceId}`);
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.q1Answers !== undefined) setQ1Answers(d.q1Answers);
        if (d.q2Answer !== undefined) setQ2Answer(d.q2Answer);
        if (d.q3Choice !== undefined) setQ3Choice(d.q3Choice);
        if (d.q4Answer !== undefined) setQ4Answer(d.q4Answer);
        if (d.q5Answer !== undefined) setQ5Answer(d.q5Answer);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.dyeType !== undefined) setDyeType(d.dyeType);
        if (d.waterUse !== undefined) setWaterUse(d.waterUse);
        if (d.treatment !== undefined) setTreatment(d.treatment);
        if (d.scale !== undefined) setScale(d.scale);
        if (d.outputs !== undefined) setOutputs(d.outputs);
        if (d.history !== undefined) setHistory(d.history);
        if (d.simRan !== undefined) setSimRan(d.simRan);
      } catch (e) {
        console.error("Failed to load unit9 autosave", e);
      }
    }
  }, []);

  const runSimulation = () => {
    const base = SIM_TABLE[dyeType][waterUse][treatment];
    // Scale affects feasibility: Large scale boosts feasibility, Full treatment reduces it
    let feas = base.feasibility;
    if (scale === "Large" && feas === "Low")    feas = "Medium";
    if (scale === "Small" && feas === "High")   feas = "Medium";
    setOutputs({ ...base, feasibility: feas });
    setSimRan(true);
  };

  const handleRecord = () => {
    if (!simRan) return;
    setHistory(prev => [...prev, { id: prev.length + 1, dye: dyeType, water: waterUse, treatment, scale, ...outputs }]);
  };

  // Color helpers
  const qColor = (v: Quality) => v === "Good" ? "text-primary bg-primary/10 border-primary/30" : v === "Poor" ? "text-foreground/50 bg-muted/50 border-border" : "text-foreground/70 bg-muted/30 border-border";
  const rColor = (v: RiskLevel, inv = false) => {
    if (!inv) { if (v==="High") return "text-foreground/50 bg-muted/50 border-border"; if (v==="Low") return "text-primary bg-primary/10 border-primary/30"; return "text-foreground/70 bg-muted/30 border-border"; }
    if (v==="High") return "text-primary bg-primary/10 border-primary/30"; if (v==="Low") return "text-foreground/50 bg-muted/50 border-border"; return "text-foreground/70 bg-muted/30 border-border";
  };

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  // SVG flow diagram colors
  const riverColor   = treatment === "Full" ? "#4a7c59" : treatment === "Partial" ? "#6b7280" : "#9ca3af";
  const arrowColor   = treatment === "None" ? "#9ca3af" : treatment === "Partial" ? "#6b7280" : "#4a7c59";
  const treatVisible = treatment !== "None";

  // ── SHARED WRITING GUIDE BUTTON ──
  const WritingGuideBtn = ({ text }: { text: string }) => (
    <>
      <button onClick={() => setShowWritingGuide(!showWritingGuide)}
        className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-colors text-[11px] font-bold text-foreground/70">
        {isId ? "Tampilkan Panduan Menulis" : "Show Writing Guide"}
        <svg className={`w-3 h-3 ml-auto transition-transform ${showWritingGuide ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>
      {showWritingGuide && (
        <div className="bg-muted/40 border border-border p-4 rounded-lg">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">{isId ? "Panduan Menulis" : "Writing Guide"}</p>
          <p className="text-[12px] text-foreground/70 leading-relaxed italic">{text}</p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">

      {/* ── HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">9</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">
              {isId ? "Unit 9: Produksi Batik Berkelanjutan" : "Unit 9: Sustainable Batik Production"}
            </span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map(s => (
                <div key={s} className="flex flex-col items-center gap-0.5">
                  <div className={`w-7 h-1.5 rounded-full transition-all ${currentStep >= s ? "bg-primary" : "bg-border"}`} />
                  <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep >= s ? "text-primary" : "text-muted-foreground/40"}`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentStep(p => Math.max(0, p-1))} disabled={currentStep === 0}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button onClick={() => setCurrentStep(p => Math.min(5, p+1))} disabled={currentStep === 5 || !isStepValid()}
            className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-1 rounded">{stepLabels[currentStep]}</span>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <button onClick={() => {
            const score = [
              Object.keys(q1Answers).length >= 4,
              q2Answer.trim().length > 0,
              q3Choice.trim().length > 0,
              q4Answer.trim().length > 0,
              q5Answer.trim().length > 0
            ].filter(Boolean).length;
            saveCompletedSession(9, { q1Answers, q2Answer, q3Choice, q4Answer, q5Answer, history }, score, 5);
            onExit?.();
          }} className="px-3 py-1.5 bg-background text-foreground text-[10px] font-bold rounded border border-border hover:bg-muted transition-colors uppercase tracking-wider">
            {isId ? "Kembali" : "Back"}
          </button>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 flex overflow-hidden">

        {/* ── LEFT: Questions ── */}
        <div className="w-[45%] bg-white border-r border-border/60 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {/* ── STEP 0: Introduction ── */}
            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">{isId ? "Pendahuluan" : "Introduction"}</h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{isId ? "PRODUKSI BATIK BERKELANJUTAN" : "SUSTAINABLE BATIK PRODUCTION"}</h1>
                  <p className="text-[11px] text-muted-foreground font-medium">{isId ? "Batik Trusmi, Cirebon" : "Batik Trusmi, Cirebon"}</p>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>{isId
                    ? "Batik Trusmi adalah salah satu industri batik tradisional yang paling terkenal di Cirebon. Produksi batik penting bagi budaya lokal dan menyediakan lapangan kerja serta pendapatan bagi masyarakat."
                    : "Batik Trusmi is one of the best-known traditional batik industries in Cirebon. Batik production is important for local culture and provides jobs and income for the community."}</p>
                  <p>{isId
                    ? "Namun, produksi batik juga menggunakan air dan pewarna dalam jumlah besar. Selama proses pewarnaan dan pencucian, limbah cair dapat mengandung sisa pewarna, lilin, senyawa organik, dan logam berat."
                    : "However, batik production also uses large amounts of water and dyes. During dyeing and washing, wastewater can contain leftover dyes, wax, organic compounds, and heavy metals."}</p>
                  <p>{isId
                    ? "Jika limbah cair dibuang tanpa pengolahan yang tepat, dapat mengurangi kualitas air dan merusak ekosistem perairan. Dalam penyelidikan ini, siswa memeriksa tiga faktor penting: jenis pewarna, penggunaan air, dan pengolahan limbah."
                    : "If wastewater is released without proper treatment, it can reduce water quality and harm aquatic ecosystems. In this investigation, students examine three important factors: dye type, water use, and waste treatment."}</p>
                  <div className="bg-muted/40 border border-border p-4 rounded-lg flex items-start gap-4">
                    <div className="p-2 bg-primary/5 rounded text-primary shrink-0">
                    </div>
                    <div>
                      <p className="text-[12px] text-foreground/70 mb-4">{isId
                        ? "Baca pendahuluan dengan saksama. Gunakan simulasi di sebelah kanan untuk membantu menjawab pertanyaan. Klik tombol di bawah atau tanda panah di atas untuk memulai."
                        : "Read the introduction carefully. Use the simulation on the right to help answer the questions. Click the button below or the arrows above to begin."}</p>
                      <button 
                        onClick={() => setCurrentStep(1)}
                        className="w-full py-2.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {isId ? "MULAI PENILAIAN" : "START ASSESSMENT"}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 1: Q1 — Yes/No Grid ── */}
            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 1 / 5" : "Question 1 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Data Produksi Batik" : "Batik Production Data"}</p>
                  <p>{isId
                    ? "Produksi batik dapat menggunakan pewarna sintetis atau pewarna alami. Kedua jenis tersebut dapat memengaruhi lingkungan jika penggunaan air tinggi dan limbah tidak diolah dengan baik."
                    : "Batik production can use synthetic dyes or natural dyes. Both types can affect the environment if water use is high and wastewater is not treated properly."}</p>
                  <table className="w-full text-[11px] border-collapse mt-2">
                    <thead><tr className="bg-muted/50">
                      <th className="border border-border/40 px-2 py-1 text-left">{isId ? "Faktor produksi" : "Production factor"}</th>
                      <th className="border border-border/40 px-2 py-1 text-left">{isId ? "Dampak lingkungan yang mungkin terjadi" : "Possible environmental effect"}</th>
                    </tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pewarna sintetis":"Synthetic dye"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat menambahkan bahan kimia persisten dan kadang logam berat ke limbah":"Can add persistent chemicals and sometimes heavy metals to wastewater"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Pewarna alami":"Natural dye"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tetap dapat meningkatkan limbah organik di air jika digunakan berlebihan":"Can still increase organic waste in water if used excessively"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Penggunaan air tinggi":"High water use"}</td><td className="border border-border/40 px-2 py-1">{isId?"Menghasilkan lebih banyak limbah cair":"Produces more wastewater"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Tanpa pengolahan":"No treatment"}</td><td className="border border-border/40 px-2 py-1">{isId?"Meningkatkan risiko pencemaran di sungai":"Raises pollution risk in rivers"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId
                  ? "Tabel berikut menunjukkan beberapa kondisi produksi batik. Apakah setiap kondisi tersebut akan meningkatkan risiko pencemaran lingkungan? Pilih Ya atau Tidak untuk setiap kondisi."
                  : "The table below lists possible batik production conditions. Would each condition increase environmental pollution risk? Choose Yes or No for each condition."}</p>
                <div className="overflow-x-auto rounded-lg border border-border/60">
                  <table className="w-full text-[12px] border-collapse">
                    <thead><tr className="bg-muted/60">
                      <th className="border-b border-border/40 px-3 py-2.5 text-left font-bold text-[10px] uppercase tracking-wide text-muted-foreground">{isId ? "Kondisi produksi" : "Production condition"}</th>
                      <th className="border-b border-l border-border/40 px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wide text-primary w-16">{isId ? "Ya" : "Yes"}</th>
                      <th className="border-b border-l border-border/40 px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wide text-muted-foreground w-16">{isId ? "Tidak" : "No"}</th>
                    </tr></thead>
                    <tbody>
                      {q1Items.map((item, i) => (
                        <tr key={item.key} className={i % 2 === 0 ? "bg-white" : "bg-muted/20"}>
                          <td className="border-b border-border/30 px-3 py-3 text-[12px] text-foreground/80">{isId ? item.id : item.en}</td>
                          <td className="border-b border-l border-border/30 px-4 py-3 text-center">
                            <input type="radio" name={`q1_${item.key}`} className="w-4 h-4 accent-primary" checked={q1Answers[item.key]==="yes"} onChange={() => setQ1Answers(p => ({...p,[item.key]:"yes"}))}/>
                          </td>
                          <td className="border-b border-l border-border/30 px-4 py-3 text-center">
                            <input type="radio" name={`q1_${item.key}`} className="w-4 h-4 accent-primary" checked={q1Answers[item.key]==="no"} onChange={() => setQ1Answers(p => ({...p,[item.key]:"no"}))}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── STEP 2: Q2 — Open (natural dye misconception) ── */}
            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 2 / 5" : "Question 2 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Produksi Batik" : "Batik Production"}</p>
                  <p>{isId
                    ? "Produksi batik dapat menggunakan pewarna sintetis atau pewarna alami. Kedua jenis tersebut dapat memengaruhi lingkungan jika penggunaan air tinggi dan limbah tidak diolah dengan baik."
                    : "Batik production can use synthetic dyes or natural dyes. Both types can affect the environment if water use is high and wastewater is not treated properly."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Beberapa pengrajin batik berpendapat bahwa menggunakan pewarna alami selalu aman bagi lingkungan, terlepas dari seberapa banyak air yang mereka gunakan. Mengapa pendapat ini tidak sepenuhnya benar?"
                  : "Some batik craftspeople think that using natural dyes is always environmentally safe, regardless of how much water they use. Why is this opinion not entirely correct?"}</p>
                <WritingGuideBtn text={isId ? "Jawaban yang kuat menjelaskan bahwa pewarna alami dalam konsentrasi tinggi masih dapat mengganggu ekosistem karena limbah organik yang berlebihan, dan penggunaan air yang tinggi tetap menghasilkan volume limbah yang besar." : "A strong answer explains that natural dyes in high concentrations can still disrupt ecosystems due to excessive organic waste, and high water use still generates large volumes of waste."} />
                <textarea value={q2Answer} onChange={e => setQ2Answer(e.target.value)} className="w-full h-32 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q2Answer) >= 15 && getWordCount(q2Answer) <= 50 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q2Answer)} {isId ? "kata (Butuh 15-50)" : "words (Need 15-50)"}
                </p>
              </div>
            )}

            {/* ── STEP 3: Q3 — MCQ ── */}
            {currentStep === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">3</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 3 / 5" : "Question 3 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Perbandingan Produksi" : "Production Comparison"}</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] border-collapse">
                      <thead><tr className="bg-muted/50">
                        <th className="border border-border/40 px-2 py-1">{isId?"Metode":"Method"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Jenis pewarna":"Dye type"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Penggunaan air":"Water use"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Pengolahan":"Treatment"}</th>
                        <th className="border border-border/40 px-2 py-1">{isId?"Hasil yang diharapkan":"Expected result"}</th>
                      </tr></thead>
                      <tbody>
                        <tr><td className="border border-border/40 px-2 py-1 text-center font-bold">A</td><td className="border border-border/40 px-2 py-1">{isId?"Sintetis":"Synthetic"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tinggi":"High"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran tertinggi":"Highest pollution risk"}</td></tr>
                        <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1 text-center font-bold">B</td><td className="border border-border/40 px-2 py-1">{isId?"Alami":"Natural"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tinggi":"High"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran tetap tinggi":"Pollution risk remains high"}</td></tr>
                        <tr><td className="border border-border/40 px-2 py-1 text-center font-bold">C</td><td className="border border-border/40 px-2 py-1">{isId?"Sintetis":"Synthetic"}</td><td className="border border-border/40 px-2 py-1">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1">{isId?"Tidak ada":"None"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran berkurang sebagian":"Pollution risk decreases partly"}</td></tr>
                        <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1 text-center font-bold">D</td><td className="border border-border/40 px-2 py-1">{isId?"Alami":"Natural"}</td><td className="border border-border/40 px-2 py-1">{isId?"Rendah":"Low"}</td><td className="border border-border/40 px-2 py-1">{isId?"Penuh":"Full"}</td><td className="border border-border/40 px-2 py-1">{isId?"Risiko pencemaran terendah":"Lowest pollution risk"}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Sebuah workshop batik mengurangi penggunaan air tetapi masih menggunakan pewarna sintetis dan tidak melakukan pengolahan limbah.\n\nPernyataan manakah yang paling tepat menggambarkan hasilnya?"
                  : "A batik workshop reduces water use but still uses synthetic dyes and provides no wastewater treatment.\n\nWhich statement best describes the result?"}</p>
                <div className="space-y-2.5">
                  {[
                    {val:"A",en:"Environmental impact disappears completely.",id:"Dampak lingkungan hilang sepenuhnya."},
                    {val:"B",en:"Environmental impact decreases partly, but pollution can still occur.",id:"Dampak lingkungan berkurang sebagian, tetapi pencemaran masih dapat terjadi."},
                    {val:"C",en:"Environmental impact increases only because water use is lower.",id:"Dampak lingkungan meningkat hanya karena penggunaan air lebih rendah."},
                    {val:"D",en:"There is no relation between dye type and pollution.",id:"Tidak ada hubungan antara jenis pewarna dan pencemaran."},
                  ].map(opt => (
                    <label key={opt.val} className="flex items-center gap-3 p-3.5 bg-white border border-border rounded-lg hover:border-primary/20 hover:bg-muted/10 cursor-pointer transition-all">
                      <input type="radio" name="q3" className="w-4 h-4 accent-primary" checked={q3Choice===opt.val} onChange={() => setQ3Choice(opt.val)}/>
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{opt.val}</span>
                      <span className="text-[13px] text-foreground/70">{isId ? opt.id : opt.en}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 4: Q4 — Open (best combination) ── */}
            {currentStep === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">4</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 4 / 5" : "Question 4 / 5"}</h2>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Pilih satu kombinasi: jenis pewarna, penggunaan air, dan pengolahan limbah yang memberikan keseimbangan terbaik antara keberlanjutan lingkungan dan kelayakan produksi.\n\nJelaskan mengapa pilihanmu merupakan opsi yang paling berkelanjutan."
                  : "Choose one combination of: dye type, water use, and waste treatment that gives the best balance between environmental sustainability and production feasibility.\n\nExplain why your choice is the most sustainable option."}</p>
                <WritingGuideBtn text={isId
                  ? "Jawaban yang baik biasanya memilih penggunaan air yang lebih rendah, pengolahan limbah minimal sebagian atau penuh, serta jenis pewarna yang lebih aman. Jawaban juga harus menjelaskan keseimbangan antara pengurangan pencemaran dan kebutuhan produksi yang praktis."
                  : "A strong answer usually chooses lower water use, at least partial or full treatment, and a safer dye option. It should explain the trade-off between lower pollution and practical production needs."} />
                <textarea value={q4Answer} onChange={e => setQ4Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q4Answer) >= 15 && getWordCount(q4Answer) <= 50 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q4Answer)} {isId ? "kata (Butuh 15-50)" : "words (Need 15-50)"}
                </p>
              </div>
            )}

            {/* ── STEP 5: Q5 — Open (balance economy & environment) ── */}
            {currentStep === 5 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">5</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 5 / 5" : "Question 5 / 5"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-2">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Pengambilan Keputusan" : "Decision Making"}</p>
                  <table className="w-full text-[11px] border-collapse">
                    <thead><tr className="bg-muted/50"><th className="border border-border/40 px-2 py-1 text-left">{isId?"Tujuan":"Goal"}</th><th className="border border-border/40 px-2 py-1 text-left">{isId?"Mengapa penting":"Why it matters"}</th></tr></thead>
                    <tbody>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Mempertahankan produksi batik":"Maintain batik production"}</td><td className="border border-border/40 px-2 py-1">{isId?"Mendukung lapangan kerja, pendapatan, dan warisan budaya":"Supports local jobs, income, and cultural heritage"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Mengurangi pencemaran air":"Reduce water pollution"}</td><td className="border border-border/40 px-2 py-1">{isId?"Melindungi sungai, organisme air, dan kesehatan masyarakat":"Protects rivers, aquatic organisms, and community health"}</td></tr>
                      <tr><td className="border border-border/40 px-2 py-1">{isId?"Menggunakan teknologi pengolahan":"Use treatment technology"}</td><td className="border border-border/40 px-2 py-1">{isId?"Membantu mengurangi zat berbahaya sebelum dibuang":"Helps reduce harmful contaminants before disposal"}</td></tr>
                      <tr className="bg-muted/20"><td className="border border-border/40 px-2 py-1">{isId?"Meningkatkan efisiensi produksi":"Improve production efficiency"}</td><td className="border border-border/40 px-2 py-1">{isId?"Dapat mengurangi penggunaan air dan limbah":"Can reduce water use and waste generation"}</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed whitespace-pre-line">{isId
                  ? "Industri batik di Trusmi mendukung lapangan kerja dan perekonomian lokal, tetapi juga menimbulkan tantangan lingkungan.\n\nJelaskan mengapa penting untuk menyeimbangkan manfaat ekonomi dan perlindungan lingkungan dalam produksi batik."
                  : "The batik industry in Trusmi supports jobs and the local economy, but it also creates environmental challenges.\n\nExplain why it is important to balance economic benefits and environmental protection in batik production."}</p>
                <WritingGuideBtn text={isId
                  ? "Jawaban yang baik menjelaskan bahwa batik mendukung mata pencaharian dan warisan budaya, tetapi limbah yang tidak diolah dapat merusak sungai dan ekosistem. Metode berkelanjutan membantu melindungi pendapatan masyarakat sekaligus lingkungan dalam jangka panjang."
                  : "A strong answer explains that batik supports livelihoods and cultural heritage, but untreated wastewater can damage rivers and ecosystems. Sustainable methods help protect both community income and the environment in the long term."} />
                <textarea value={q5Answer} onChange={e => setQ5Answer(e.target.value)}
                  className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                  placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <p className={`text-[10px] font-bold text-right ${getWordCount(q5Answer) >= 15 && getWordCount(q5Answer) <= 50 ? "text-green-600" : "text-amber-600"}`}>
                  {getWordCount(q5Answer)} {isId ? "kata (Butuh 15-50)" : "words (Need 15-50)"}
                </p>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: Simulation ── */}
        <div className="flex-1 bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto exam-scrollbar">

            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  {isId ? "Simulasi Produksi Batik" : "Batik Production Simulation"}
                </h3>
              </div>
            </div>

            {/* ── CONTROLS ── */}
            <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm space-y-4">
              <div className="space-y-4">
                {/* Dye Type */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{isId?"Jenis Pewarna":"Dye Type"}</label>
                  <div className="flex gap-2">
                    {(["Synthetic", "Natural"] as DyeType[]).map(v => (
                      <button key={v} onClick={() => { setDyeType(v); setSimRan(false); }}
                        className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all ${dyeType===v ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
                        {v === "Synthetic" ? (isId ? "Sintetis" : "Synthetic") : (isId ? "Alami" : "Natural")}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Water Use */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{isId?"Penggunaan Air":"Water Use"}</label>
                  <div className="flex gap-2">
                    {(["Low", "Medium", "High"] as WaterLevel[]).map(v => (
                      <button key={v} onClick={() => { setWaterUse(v); setSimRan(false); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all ${waterUse===v ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
                        {v === "Low" ? (isId ? "Rendah" : "Low") : v === "Medium" ? (isId ? "Sedang" : "Medium") : (isId ? "Tinggi" : "High")}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Waste Treatment */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">{isId?"Pengolahan Limbah":"Waste Treatment"}</label>
                  <div className="flex gap-2">
                    {(["None", "Partial", "Full"] as TreatmentLevel[]).map(v => (
                      <button key={v} onClick={() => { setTreatment(v); setSimRan(false); }}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all ${treatment===v ? "bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]" : "bg-muted/40 text-muted-foreground hover:bg-muted"}`}>
                        {v === "None" ? (isId ? "Tidak Ada" : "None") : v === "Partial" ? (isId ? "Sebagian" : "Partial") : (isId ? "Penuh" : "Full")}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={runSimulation}
                  className="flex-1 py-3 bg-green-700 hover:bg-green-600 text-white text-[13px] font-black rounded-xl transition-all shadow-md active:scale-95">
                  {isId ? "JALANKAN SIMULASI" : "RUN SIMULATION"}
                </button>
                <button onClick={handleRecord} disabled={!simRan}
                  className="px-6 py-3 bg-white text-gray-700 text-[13px] font-bold rounded-xl border-2 border-border/60 hover:bg-muted transition-all disabled:opacity-40">
                  {isId ? "CATAT" : "RECORD"}
                </button>
              </div>
            </div>

            {/* ── HIGH-FIDELITY SVG WASTEWATER SIMULATION ── */}
            <div className="bg-white p-6 rounded-2xl border border-border/50 shadow-sm relative overflow-hidden group">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                {isId ? "DIAGRAM ALIRAN LIMBAH" : "WASTEWATER FLOW DIAGRAM"}
              </p>
              <svg viewBox="0 0 340 120" className="w-full drop-shadow-sm" aria-label={isId?"Diagram aliran limbah cair":"Wastewater flow diagram"}>
                <defs>
                   <pattern id="batikPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                      <circle cx="5" cy="5" r="2" fill="#94a3b8" opacity="0.4" />
                      <path d="M0,0 L10,10 M10,0 L0,10" stroke="#94a3b8" strokeWidth="0.5" opacity="0.3" />
                   </pattern>
                   <linearGradient id="dyeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor={dyeType === "Synthetic" ? "#3b82f6" : "#713f12"} />
                      <stop offset="100%" stopColor={dyeType === "Synthetic" ? "#1e40af" : "#451a03"} />
                   </linearGradient>
                   <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={outputs.waterQuality === "Good" ? "#0ea5e9" : outputs.waterQuality === "Medium" ? "#64748b" : "#475569"} />
                      <stop offset="100%" stopColor={outputs.waterQuality === "Good" ? "#38bdf8" : outputs.waterQuality === "Medium" ? "#94a3b8" : "#64748b"} />
                   </linearGradient>
                   <filter id="premium-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" />
                      <feOffset dx="0.5" dy="1" result="offsetblur" />
                      <feComponentTransfer><feFuncA type="linear" slope="0.2"/></feComponentTransfer>
                      <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                   </filter>
                </defs>

                {/* Production Site (Batik Workshop) */}
                <g transform="translate(10, 30)" filter="url(#premium-glow)">
                  <rect width="60" height="60" rx="10" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5"/>
                  <rect width="60" height="60" rx="10" fill="url(#batikPattern)" />
                  <path d="M15,45 L15,25 L30,15 L45,25 L45,45 Z" fill="#cbd5e1"/>
                  <path d="M15,25 L30,15 L45,25" fill="#94a3b8" />
                  <rect x="25" y="32" width="10" height="13" fill="#64748b"/>
                  <text x="30" y="54" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill="#475569">{isId?"Batik Workshop":"Workshop"}</text>
                </g>

                {/* Dye Tank (Realistic Basin) */}
                <g transform="translate(95, 40)" filter="url(#premium-glow)">
                   <path d="M0,0 L50,0 Q55,0 55,5 L55,30 Q55,35 50,35 L0,35 Q-5,35 -5,30 L-5,5 Q-5,0 0,0" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5"/>
                   <rect x="2" y={waterUse === "High" ? 5 : waterUse === "Medium" ? 15 : 25} width="46" height={waterUse === "High" ? 25 : waterUse === "Medium" ? 15 : 5} rx="2" fill="url(#dyeGrad)" opacity="0.9"/>
                   <path d="M2,5 L48,5" stroke="white" strokeOpacity="0.3" strokeWidth="1"/>
                   <text x="25" y="44" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#64748b">{isId?"Bak Pewarna":"Dye Tank"}</text>
                </g>

                {/* Treatment Plant (Detailed Tanks) */}
                {treatment !== "None" && (
                   <g transform="translate(175, 35)" filter="url(#premium-glow)">
                      <rect width="65" height="50" rx="8" fill="#f0fdf4" stroke="#4ade80" strokeWidth="1.5"/>
                      <rect x="10" y="10" width="18" height="25" rx="3" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                      <rect x="35" y="10" width="18" height="25" rx="3" fill="#dcfce7" stroke="#4ade80" strokeWidth="1"/>
                      <circle cx="19" cy="22" r="3" fill="#4ade80" fillOpacity="0.4" />
                      <circle cx="44" cy="22" r="3" fill="#4ade80" fillOpacity="0.4" />
                      <line x1="28" y1="22" x2="35" y2="22" stroke="#4ade80" strokeWidth="1.5"/>
                      <text x="32.5" y="44" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#166534">{isId?"Instalasi IPAL":"IPal Treatment"}</text>
                   </g>
                )}

                {/* Connections (Pipes) */}
                <line x1="70" y1="60" x2="95" y2="60" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round"/>
                <line x1="145" y1="60" x2={treatment === "None" ? "270" : "175"} y2={60} stroke={treatment === "None" ? "#ef4444" : "#cbd5e1"} strokeWidth="4" strokeDasharray={treatment === "None" ? "4" : "0"} strokeLinecap="round"/>
                {treatment !== "None" && <line x1="240" y1="60" x2="270" y2="60" stroke="#22c55e" strokeWidth="4" strokeLinecap="round"/>}

                {/* River (Dynamic Waves) */}
                <g transform="translate(270, 20)" filter="url(#premium-glow)">
                   <rect width="60" height="80" rx="12" fill="url(#riverGrad)" />
                   <g opacity="0.4">
                      {Array.from({length: 3}).map((_, i) => (
                         <path key={i} d={`M10,${20 + i*20} Q25,${10 + i*20} 40,${20 + i*20} T70,${20 + i*20}`} stroke="white" strokeWidth="1.5" fill="none" transform={`translate(-5, ${i*5})`}/>
                      ))}
                   </g>
                   <text x="30" y="94" textAnchor="middle" fontSize="8" fontWeight="black" fill="white" style={{letterSpacing: '1px'}}>{isId?"SUNGAI":"RIVER"}</text>
                </g>
              </svg>
              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] font-bold">
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-500"/> {isId?"Pewarna":"Dye"}</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-400"/> {isId?"Tanpa Olah":"Untreated"}</div>
                 <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-green-500"/> {isId?"Terolah":"Treated"}</div>
              </div>
            </div>

            {/* ── OUTPUTS ── */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: isId?"Kualitas Air":"Water Quality", val: outputs.waterQuality, display: isId?{Good:"Baik",Medium:"Sedang",Poor:"Buruk"}[outputs.waterQuality]:outputs.waterQuality },
                { label: isId?"Risiko Ekosistem":"Ecosystem Risk", val: outputs.ecosystemRisk, display: isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[outputs.ecosystemRisk]:outputs.ecosystemRisk },
                { label: isId?"Kelayakan":"Feasibility", val: outputs.feasibility, display: isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[outputs.feasibility]:outputs.feasibility },
              ].map(item => (
                <div key={item.label} className="bg-white rounded-2xl border border-gray-200 p-3 text-center shadow-sm">
                  <div className="text-[10px] text-gray-400 mb-1.5 font-medium tracking-wide uppercase leading-tight">{item.label}</div>
                  <div className="text-[1.4rem] font-extrabold text-gray-900 leading-none mb-1.5">{item.display}</div>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white ${
                    (item.val === "High" || item.val === "Good") ? "bg-green-600" : item.val === "Medium" ? "bg-green-500" : "bg-green-400"
                  }`}>{item.val}</span>
                </div>
              ))}
            </div>
            {!simRan && <p className="text-[11px] text-gray-400 text-center italic">{isId?"Klik 'Jalankan Simulasi' untuk melihat hasil.":"Click 'Run Simulation' to see results."}</p>}

            {/* ── RECORDED DATA TABLE ── */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">{isId?"Data Tercatat":"Recorded Data"}</span>
                  <button onClick={() => setHistory([])} className="text-[11px] text-gray-400 hover:text-gray-600 font-bold uppercase tracking-wider">{isId?"Hapus":"Clear"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {["#", isId?"Pewarna":"Dye", isId?"Air":"Water", isId?"Pengolahan":"Treatment", isId?"Kualitas Air":"Water Q.", isId?"Risiko Ekosistem":"Eco Risk", isId?"Kelayakan":"Feasibility"].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map((row, i) => (
                        <tr key={row.id} className={i % 2 === 1 ? "bg-gray-50/60" : ""}>
                          <td className="px-3 py-2.5 text-gray-400 font-medium">{row.id}</td>
                          <td className="px-3 py-2.5 text-gray-700">{isId?{Synthetic:"Sintetis",Natural:"Alami"}[row.dye]:row.dye}</td>
                          <td className="px-3 py-2.5 text-gray-700">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.water]:row.water}</td>
                          <td className="px-3 py-2.5 text-gray-700">{isId?{None:"Tidak Ada",Partial:"Sebagian",Full:"Penuh"}[row.treatment]:row.treatment}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{isId?{Good:"Baik",Medium:"Sedang",Poor:"Buruk"}[row.waterQuality]:row.waterQuality}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.ecosystemRisk]:row.ecosystemRisk}</td>
                          <td className="px-3 py-2.5 font-semibold text-gray-900">{isId?{Low:"Rendah",Medium:"Sedang",High:"Tinggi"}[row.feasibility]:row.feasibility}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Unit9Pisa;
