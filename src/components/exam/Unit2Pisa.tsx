import React, { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { saveCompletedSession } from "@/hooks/useExamSession";

interface Unit2PisaProps { onExit?: () => void; studentId?: string; }

type Level = "Low" | "Medium" | "High";
type SimulationConfig = { salt: number; drying: number; hygiene: number; temp: number };

const STEP_LABELS_EN = ["Introduction", "Question 1", "Question 2"];
const STEP_LABELS_ID = ["Pendahuluan", "Soal 1", "Soal 2"];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

// Correct option index for the multiple-choice question (contamination risk increases)
const Q1_CORRECT = 1;

const Unit2Pisa = ({ onExit }: Unit2PisaProps) => {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const [currentStep, setCurrentStep] = useState(0);
  const [shakeJar, setShakeJar] = useState(false); // State for jar shake animation

  // Simulation variables
  const [salt, setSalt] = useState(50);        // Kadar Garam (%)
  const [drying, setDrying] = useState(4);      // Waktu Penjemuran (hari)
  const [hygiene, setHygiene] = useState(70);   // Tingkat Kebersihan (%)
  const [temp, setTemp] = useState(30);         // Suhu Fermentasi (°C)
  const [ran, setRan] = useState(false);
  const [history, setHistory] = useState<Record<string, string | number>[]>([]);
  const [lastRunConfig, setLastRunConfig] = useState<SimulationConfig | null>(null);

  // Answers
  const [q1Choice, setQ1Choice] = useState<string>("");
  const [q2Answer, setQ2Answer] = useState<string>("");
  const [sessionSaved, setSessionSaved] = useState(false);

  const getWordCount = (t: string) => (!t ? 0 : t.trim().split(/\s+/).filter(Boolean).length);

  // ── AUTO-SAVE ──
  React.useEffect(() => {
    localStorage.setItem("unit2_autosave", JSON.stringify({ currentStep, salt, drying, hygiene, temp, ran, history, q1Choice, q2Answer, lastRunConfig }));
  }, [currentStep, salt, drying, hygiene, temp, ran, history, q1Choice, q2Answer, lastRunConfig]);

  React.useEffect(() => {
    const saved = localStorage.getItem("unit2_autosave");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        if (d.currentStep !== undefined) setCurrentStep(d.currentStep);
        if (d.salt !== undefined) setSalt(d.salt);
        if (d.drying !== undefined) setDrying(d.drying);
        if (d.hygiene !== undefined) setHygiene(d.hygiene);
        if (d.temp !== undefined) setTemp(d.temp);
        if (d.ran !== undefined) setRan(d.ran);
        if (d.history !== undefined) setHistory(d.history);
        if (d.q1Choice !== undefined) setQ1Choice(d.q1Choice);
        if (d.q2Answer !== undefined) setQ2Answer(d.q2Answer);
        if (d.lastRunConfig !== undefined) setLastRunConfig(d.lastRunConfig);
      } catch (e) { console.error("unit2 autosave load failed", e); }
    }
  }, []);

  // ── SIMULATION MODEL ──
  const sim = useMemo(() => {
    // Risk (0 = safe, 100 = very risky). Lower salt / lower hygiene / shorter drying -> higher risk.
    let risk =
      (100 - salt) * 0.4 +
      (100 - hygiene) * 0.35 +
      ((7 - drying) / 7) * 100 * 0.25;
    if (temp > 36) risk += 15;           // too warm -> spoilage microbes thrive
    else if (temp < 24) risk += 5;       // too cold -> unstable, slow preservation
    risk = Math.max(0, Math.min(100, Math.round(risk)));

    // Quality (0 = poor, 100 = excellent). Best with balanced salt, high hygiene, adequate drying, suitable temp.
    const saltScore = 100 - Math.abs(salt - 55) * 1.6;
    const hygieneScore = hygiene;
    const dryScore = 100 - Math.abs(drying - 4) * 22;
    const tempScore = 100 - Math.abs(temp - 31) * 6;
    let quality = (saltScore * 0.3 + hygieneScore * 0.3 + dryScore * 0.2 + tempScore * 0.2);
    quality = Math.max(0, Math.min(100, Math.round(quality - risk * 0.15)));

    // Fermentation activity level based mainly on temperature (and salt slows it).
    let activity: "Slow" | "Balanced" | "Fast";
    if (temp < 26 || salt > 82) activity = "Slow";
    else if (temp > 36) activity = "Fast";
    else activity = "Balanced";

    const riskLevel: Level = risk < 34 ? "Low" : risk < 67 ? "Medium" : "High";
    const qualityLevel: Level = quality < 40 ? "Low" : quality < 70 ? "Medium" : "High";

    return { risk, quality, riskLevel, qualityLevel, activity };
  }, [salt, drying, hygiene, temp]);

  const liveMetrics = useMemo(() => {
    const moisture = clamp(Math.round(82 - drying * 9 - salt * 0.18 + (temp > 35 ? 5 : 0)), 8, 90);
    const beneficial = clamp(Math.round(sim.quality * 0.58 + hygiene * 0.22 + drying * 3 - Math.max(0, temp - 37) * 2), 5, 99);
    const harmful = clamp(Math.round(sim.risk * 0.82 + moisture * 0.18), 1, 99);
    const umami = clamp(Math.round(sim.quality * 0.7 + (temp >= 28 && temp <= 33 ? 10 : 0) + drying * 2 - Math.abs(salt - 55) * 0.35), 0, 100);
    const preservation = clamp(Math.round(salt * 0.45 + hygiene * 0.2 + drying * 6 + (temp >= 28 && temp <= 33 ? 8 : 0) - Math.max(0, temp - 38) * 3), 0, 100);
    const balance = clamp(Math.round((100 - sim.risk) * 0.45 + sim.quality * 0.55), 0, 100);
    const readiness = clamp(Math.round((beneficial + umami + balance + preservation - harmful) / 3), 0, 100);

    let stage: "Unsafe" | "Early" | "Optimal" | "Overactive";
    if (harmful >= 70) stage = "Unsafe";
    else if (sim.activity === "Fast" && temp > 36) stage = "Overactive";
    else if (readiness >= 68 && moisture <= 45) stage = "Optimal";
    else stage = "Early";

    return { moisture, beneficial, harmful, umami, preservation, balance, readiness, stage };
  }, [drying, salt, hygiene, temp, sim]);

  const simulationDirty = !!(ran && lastRunConfig && (
    lastRunConfig.salt !== salt ||
    lastRunConfig.drying !== drying ||
    lastRunConfig.hygiene !== hygiene ||
    lastRunConfig.temp !== temp
  ));

  const insight = useMemo(() => {
    const stageLabels = {
      Unsafe: isId ? "Rentan tercemar" : "High contamination risk",
      Early: isId ? "Fermentasi belum stabil" : "Fermentation still unstable",
      Optimal: isId ? "Fermentasi matang dan stabil" : "Balanced and stable fermentation",
      Overactive: isId ? "Fermentasi terlalu agresif" : "Fermentation is too aggressive",
    } as const;

    let body = isId
      ? "Kondisi saat ini mulai membentuk kualitas terasi, tetapi masih perlu pemantauan."
      : "The current condition is shaping terasi quality, but it still needs monitoring.";
    let recommendation = isId
      ? "Jaga kebersihan, garam, dan suhu tetap seimbang agar fermentasi aman."
      : "Keep hygiene, salt, and temperature balanced for safer fermentation.";

    if (liveMetrics.stage === "Unsafe") {
      body = isId
        ? "Kadar air dan risiko kontaminasi masih tinggi sehingga bakteri berbahaya lebih mudah berkembang."
        : "Moisture and contamination risk remain high, so harmful bacteria can grow more easily.";
      recommendation = isId
        ? "Naikkan garam atau kebersihan, lalu tambah lama penjemuran sebelum menjalankan simulasi lagi."
        : "Increase salt or hygiene, then extend drying time before running the simulation again.";
    } else if (liveMetrics.stage === "Overactive") {
      body = isId
        ? "Suhu yang terlalu tinggi membuat fermentasi berjalan terlalu cepat dan mutu bisa turun."
        : "Temperature is too high, making fermentation run too fast and lowering quality.";
      recommendation = isId
        ? "Turunkan suhu sedikit agar proses fermentasi kembali seimbang."
        : "Lower the temperature slightly to bring fermentation back into balance.";
    } else if (liveMetrics.stage === "Optimal") {
      body = isId
        ? "Kombinasi garam, penjemuran, kebersihan, dan suhu mendukung rasa umami sekaligus menekan pembusukan."
        : "The combination of salt, drying, hygiene, and temperature supports umami while suppressing spoilage.";
      recommendation = isId
        ? "Pertahankan kombinasi ini atau bandingkan dengan satu perubahan kecil untuk melihat trade-off kualitas."
        : "Keep this combination or compare it with one small change to observe quality trade-offs.";
    }

    return {
      stageLabel: stageLabels[liveMetrics.stage],
      body,
      recommendation,
    };
  }, [isId, liveMetrics.stage]);

  // Visual element counts derived from simulation
  const goodCount = Math.max(1, Math.min(9, Math.round(2 + hygiene / 22 + (sim.qualityLevel === "High" ? 2 : 0))));
  const badCount = Math.max(0, Math.min(9, Math.round(sim.risk / 17)));
  const moistureCount = Math.max(0, Math.min(7, Math.round(7 - drying)));
  const saltCount = Math.max(0, Math.min(6, Math.round(salt / 18)));
  const bubbleCount = Math.max(2, Math.min(10, Math.round(liveMetrics.readiness / 13 + (sim.activity === "Fast" ? 2 : 0))));
  const shimmerCount = Math.max(1, Math.min(6, Math.round(liveMetrics.umami / 18)));

  const runSimulation = () => {
    setRan(true);
    setLastRunConfig({ salt, drying, hygiene, temp });
    setHistory((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        salt,
        drying,
        hygiene,
        temp,
        risk: isId ? tr(sim.riskLevel) : sim.riskLevel,
        quality: isId ? tr(sim.qualityLevel) : sim.qualityLevel,
        activity: isId ? trAct(sim.activity) : sim.activity,
      },
    ]);
  };

  const resetSim = () => {
    setSalt(50);
    setDrying(4);
    setHygiene(70);
    setTemp(30);
    setRan(false);
    setLastRunConfig(null);
  };

  const isStepValid = () => {
    if (currentStep === 0) return true;
    if (currentStep === 1) return !!q1Choice;
    if (currentStep === 2) { const c = getWordCount(q2Answer); return c >= 15 && c <= 50; }
    return false;
  };

  const handleExit = () => {
    if (!sessionSaved) {
      let score = 0;
      if (Number(q1Choice) === Q1_CORRECT) score += 1;
      if (q2Answer.trim().length > 0) score += 1;
      saveCompletedSession(2, { q1Choice, q2Answer, history }, score, 2);
      setSessionSaved(true);
    }
    onExit?.();
  };

  function tr(l: Level) { return l === "Low" ? "Rendah" : l === "Medium" ? "Sedang" : "Tinggi"; }
  function trAct(a: "Slow" | "Balanced" | "Fast") { return a === "Slow" ? "Lambat" : a === "Balanced" ? "Seimbang" : "Terlalu Cepat"; }

  const stepLabels = isId ? STEP_LABELS_ID : STEP_LABELS_EN;

  const q1Options = isId
    ? ["Risiko kontaminasi dan pembusukan menurun", "Risiko kontaminasi dan pembusukan meningkat", "Risiko tetap sama persis", "Garam tidak berpengaruh pada pertumbuhan patogen selama fermentasi"]
    : ["Contamination and spoilage risk decreases", "Contamination and spoilage risk increases", "The risk stays exactly the same", "Salt has no effect on pathogen growth during fermentation"];

  // colour helpers for the level bars
  const levelColor = (l: Level, invert = false) => {
    const good = "bg-emerald-500", mid = "bg-amber-500", bad = "bg-red-500";
    if (invert) return l === "Low" ? good : l === "Medium" ? mid : bad;   // for risk (low is good)
    return l === "High" ? good : l === "Medium" ? mid : bad;              // for quality (high is good)
  };
  const levelText = (l: Level) => (isId ? tr(l) : l === "Low" ? "Low" : l === "Medium" ? "Medium" : "High");

  const facts = isId
    ? ["Terasi dibuat dari udang rebon yang difermentasi.", "Fermentasi yang baik menghasilkan rasa umami yang khas.", "Kadar garam, penjemuran, kebersihan, dan suhu saling berpengaruh.", "Proses yang tidak baik dapat menyebabkan kontaminasi dan pembusukan."]
    : ["Terasi is made from fermented rebon shrimp.", "Good fermentation produces a distinctive umami taste.", "Salt, drying, hygiene, and temperature all interact.", "Poor processing can cause contamination and spoilage."];

  const presets = [
    {
      key: "optimal",
      label: isId ? "Stabil" : "Stable",
      action: () => { setSalt(55); setDrying(4); setHygiene(85); setTemp(31); },
    },
    {
      key: "risky",
      label: isId ? "Berisiko" : "Risky",
      action: () => { setSalt(25); setDrying(1); setHygiene(35); setTemp(34); },
    },
    {
      key: "hot",
      label: isId ? "Terlalu Panas" : "Too Hot",
      action: () => { setSalt(50); setDrying(3); setHygiene(70); setTemp(40); },
    },
  ] as const;

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* ── HEADER ── */}
      <header className="h-14 bg-white border-b border-border/60 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
            <span className="font-bold text-sm tracking-tight text-foreground uppercase">{isId ? "Unit 2: Produksi Terasi" : "Unit 2: Shrimp Paste (Terasi)"}</span>
          </div>
          <div className="h-6 w-px bg-border/60" />
          <div className="flex items-center gap-1.5">
            {[1, 2].map((s) => (
              <div key={s} className="flex flex-col items-center gap-0.5">
                <div className={`w-7 h-1.5 rounded-full transition-all ${currentStep >= s ? "bg-primary" : "bg-border"}`} />
                <span className={`text-[8px] font-bold uppercase tracking-wider ${currentStep >= s ? "text-primary" : "text-muted-foreground/40"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setCurrentStep((p) => Math.max(0, p - 1))} disabled={currentStep === 0} className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={() => setCurrentStep((p) => Math.min(2, p + 1))} disabled={currentStep === 2 || !isStepValid()} className="p-1.5 hover:bg-muted rounded-md transition-colors border border-transparent hover:border-border disabled:opacity-30">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground border border-border/60 px-2 py-1 rounded">{stepLabels[currentStep]}</span>
          <div className="w-px h-6 bg-border/60 mx-2" />
          <button onClick={handleExit} className="px-3 py-1.5 bg-background text-foreground text-[10px] font-bold rounded border border-border hover:bg-muted transition-colors uppercase tracking-wider">{isId ? "Kembali" : "Back"}</button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* ── LEFT: QUESTIONS ── */}
        <div className="w-[45%] bg-white border-r border-border/60 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto h-full space-y-4 exam-scrollbar">

            {currentStep === 0 && (
              <div className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-primary font-bold uppercase tracking-widest text-[10px]">{isId ? "Pendahuluan" : "Introduction"}</h2>
                  <h1 className="text-xl font-bold text-foreground leading-tight">{isId ? "PRODUKSI TERASI CIREBON" : "SHRIMP PASTE PRODUCTION (TERASI CIREBON)"}</h1>
                </div>
                <div className="text-[13px] leading-[1.8] text-foreground/80 space-y-3">
                  <p>{isId ? "Terasi dibuat dari udang rebon melalui proses penggaraman, penghalusan, penjemuran, dan fermentasi. Selama fermentasi, mikroorganisme memecah protein menjadi asam amino yang memberi rasa umami." : "Terasi is made from rebon shrimp through salting, grinding, drying, and fermentation. During fermentation, microorganisms break down proteins into amino acids that give the umami taste."}</p>
                  <p>{isId ? "Kondisi produksi — kadar garam, waktu penjemuran, kebersihan, dan suhu — menentukan keamanan, kualitas, serta risiko kontaminasi dan pembusukan." : "Production conditions — salt level, drying time, hygiene, and temperature — determine the safety, quality, and the contamination and spoilage risk."}</p>
                  <div className="bg-muted/40 border border-border p-4 rounded-lg">
                    <p className="text-[12px] text-foreground/70 mb-4">{isId ? "Gunakan simulator di sebelah kanan. Geser slider, klik \"Jalankan Simulasi\", dan amati perubahannya untuk membantu menjawab pertanyaan." : "Use the simulator on the right. Move the sliders, click \"Run Simulation\", and observe the changes to help answer the questions."}</p>
                    <button onClick={() => setCurrentStep(1)} className="w-full py-2.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm flex items-center justify-center gap-2">
                      {isId ? "MULAI PENILAIAN" : "START ASSESSMENT"}
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">1</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 1 / 2" : "Question 1 / 2"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Interpretasi Data" : "Data Interpretation"}</p>
                  <p>{isId ? "Gunakan simulator: turunkan Kadar Garam sambil menjaga Tingkat Kebersihan tetap rendah, lalu jalankan simulasi dan amati indikator hasilnya." : "Use the simulator: lower the Salt Level while keeping the Hygiene Level low, then run the simulation and observe the result indicators."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId ? "Jalankan simulasi dengan menurunkan kadar garam, sementara tingkat kebersihan tetap buruk. Apa yang terjadi pada risiko kontaminasi dan pembusukan?" : "Run the simulation by lowering the salt level while keeping the hygiene level poor. What happens to the contamination and spoilage risk?"}</p>
                <div className="space-y-2.5">
                  {q1Options.map((opt, idx) => (
                    <label key={idx} className={`flex items-center gap-3 p-3.5 bg-white border rounded-lg cursor-pointer transition-all ${q1Choice === String(idx) ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/20 hover:bg-muted/10"}`}>
                      <input type="radio" name="u2q1" className="w-4 h-4 accent-primary" checked={q1Choice === String(idx)} onChange={() => setQ1Choice(String(idx))} />
                      <span className="text-[13px] font-bold text-muted-foreground w-5">{String.fromCharCode(65 + idx)}</span>
                      <span className="text-[13px] text-foreground/80">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">2</div>
                  <h2 className="text-base font-bold text-foreground">{isId ? "Soal 2 / 2" : "Question 2 / 2"}</h2>
                </div>
                <div className="bg-muted/30 border border-border/60 rounded-lg p-4 text-[12px] text-foreground/70 space-y-1">
                  <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{isId ? "Panduan Menulis" : "Writing Guide"}</p>
                  <p>{isId ? "Sebutkan waktu pengeringan, kadar air, pertumbuhan patogen atau mikroba pembusuk, serta pengaruhnya terhadap kualitas atau risiko kontaminasi/pembusukan." : "Mention drying time, moisture/water content, pathogen or spoilage microbe growth, and the effect on quality or contamination/spoilage risk."}</p>
                </div>
                <p className="text-[13px] font-medium text-foreground/90 leading-relaxed">{isId ? "Setelah menjalankan simulasi, jelaskan mengapa waktu pengeringan yang lebih singkat dapat mengubah hasil terasi. Gunakan data simulasi dalam jawabanmu." : "After running the simulation, explain why a shorter drying time can change the terasi result. Use your simulation data in your answer."}</p>
                <textarea value={q2Answer} onChange={(e) => setQ2Answer(e.target.value)} className="w-full h-36 p-3 bg-muted/10 border border-border rounded-lg text-[13px] focus:ring-1 focus:ring-primary outline-none transition-all resize-none" placeholder={isId ? "Ketik jawabanmu di sini..." : "Type your answer here..."} />
                <div className="flex items-center justify-between">
                  <p className={`text-[10px] font-bold ${getWordCount(q2Answer) >= 15 && getWordCount(q2Answer) <= 50 ? "text-green-600" : "text-amber-600"}`}>
                    {getWordCount(q2Answer)} {isId ? "kata (Butuh 15-50)" : "words (Need 15-50)"}
                  </p>
                  <button onClick={handleExit} className="px-4 py-2 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 transition-all shadow-sm disabled:opacity-30" disabled={!isStepValid()}>
                    {isId ? "SELESAI & SIMPAN" : "FINISH & SAVE"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── RIGHT: TERASI FERMENTATION SIMULATOR ── */}
        <div className="flex-1 bg-muted/20 flex flex-col overflow-hidden">
          <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto exam-scrollbar">

            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{isId ? "Simulasi Fermentasi Terasi" : "Terasi Fermentation Simulation"}</h3>
              </div>
              <button onClick={resetSim} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">{isId ? "Atur Ulang" : "Reset"}</button>
            </div>

            {/* ── JAR VISUALISATION ── */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 transition-transform hover:scale-[1.02] cursor-pointer">
              <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-3 text-center">{isId ? "Visualisasi dalam Wadah (klik untuk getar!" : "Inside the Jar (click to shake!)"}</p>
              <div className="flex gap-5 items-center">
                <svg 
                  viewBox="0 0 200 260" 
                  className={`h-56 shrink-0 transition-transform ${shakeJar ? 'animate-shake' : ''}`}
                  onClick={() => {
                    setShakeJar(true);
                    setTimeout(() => setShakeJar(false), 500);
                  }}
                  xmlns="http://www.w3.org/2000/svg">
                  <defs>
                  <linearGradient id="terasiPaste" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6b3f29" />
                    <stop offset="30%" stopColor="#8a5636" />
                    <stop offset="60%" stopColor="#7c4a2d" />
                    <stop offset="100%" stopColor="#4a2a1a" />
                  </linearGradient>
                  <filter id="terasiTexture" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                    <linearGradient id="jarGlass" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                      <stop offset="50%" stopColor="#ffffff" stopOpacity="0.05" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.35" />
                    </linearGradient>
                    <radialGradient id="heatGlow" cx="50%" cy="15%" r="60%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={temp > 36 ? 0.4 : 0} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Lid */}
                  <rect x="55" y="14" width="90" height="24" rx="7" fill="#c0392b" />
                  <rect x="62" y="34" width="76" height="10" rx="3" fill="#a93226" />
                  <ellipse cx="100" cy="28" rx="62" ry="18" fill="url(#heatGlow)" />
                  {temp > 36 && Array.from({ length: 3 }).map((_, i) => (
                    <path
                      key={`steam${i}`}
                      d={`M${78 + i * 18} 20 C ${72 + i * 18} 10, ${88 + i * 18} 5, ${82 + i * 18} -6`}
                      fill="none"
                      stroke="#f8fafc"
                      strokeOpacity="0.7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <animate attributeName="stroke-opacity" values="0;0.8;0" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                    </path>
                  ))}

                  {/* Jar body */}
                  <path d="M52 48 Q52 44 58 44 L142 44 Q148 44 148 48 L148 236 Q148 246 138 246 L62 246 Q52 246 52 236 Z" fill="#eef2f5" stroke="#cbd5e1" strokeWidth="2" />

                  {/* Paste fill */}
                  <clipPath id="jarClip">
                    <path d="M56 70 L144 70 L144 234 Q144 242 136 242 L64 242 Q56 242 56 234 Z" />
                  </clipPath>
                  <g clipPath="url(#jarClip)">
                    <rect x="56" y="70" width="88" height="176" fill="url(#terasiPaste)" filter="url(#terasiTexture)" />
                  
                  {/* Add some texture blobs */}
                  <ellipse cx="75" cy="100" rx="8" ry="12" fill="#5a3320" opacity="0.5" />
                  <ellipse cx="120" cy="130" rx="10" ry="8" fill="#6b3f29" opacity="0.4" />
                  <ellipse cx="90" cy="180" rx="12" ry="10" fill="#4a2a1a" opacity="0.5" />
                    {/* paste top surface */}
                    <ellipse cx="100" cy="72" rx="44" ry="6" fill="#8a5636" />
                    <ellipse cx="100" cy="74" rx={40 - moistureCount} ry="4" fill="#9a6542" opacity="0.75">
                      <animate attributeName="ry" values="4;6;4" dur="4s" repeatCount="indefinite" />
                    </ellipse>

                    {/* Good bacteria (green rods) */}
                    {Array.from({ length: goodCount }).map((_, i) => {
                      const x = 66 + (i * 41) % 70;
                      const y = 92 + (i * 47) % 140;
                      return (
                        <g key={`g${i}`} transform={`translate(${x} ${y})`}>
                          <g>
                            <rect x="-6" y="-2.5" width="12" height="5" rx="2.5" fill="#4ade80" stroke="#16a34a" strokeWidth="0.6" transform={`rotate(${(i * 40) % 180})`} />
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 -5; 0 0" dur={`${3 + (i % 3)}s`} begin={`${i * 0.3}s`} repeatCount="indefinite" additive="sum" />
                          </g>
                        </g>
                      );
                    })}

                    {/* Bad bacteria (red spiky) */}
                    {Array.from({ length: badCount }).map((_, i) => {
                      const x = 72 + (i * 53) % 62;
                      const y = 100 + (i * 61) % 130;
                      return (
                        <g key={`b${i}`} transform={`translate(${x} ${y})`}>
                          <g>
                            <circle r="4.5" fill="#ef4444" />
                            {Array.from({ length: 8 }).map((__, k) => (
                              <line key={k} x1="0" y1="0" x2={6.5 * Math.cos((k * Math.PI) / 4)} y2={6.5 * Math.sin((k * Math.PI) / 4)} stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round" />
                            ))}
                            <animate attributeName="opacity" values="0.55;1;0.55" dur={`${1.8 + (i % 3) * 0.4}s`} begin={`${i * 0.2}s`} repeatCount="indefinite" />
                            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${6 + (i % 4)}s`} repeatCount="indefinite" additive="sum" />
                          </g>
                        </g>
                      );
                    })}

                    {/* Moisture droplets (blue) */}
                    {Array.from({ length: moistureCount }).map((_, i) => {
                      const x = 68 + (i * 37) % 66;
                      const y = 110 + (i * 43) % 118;
                      return (
                        <g key={`m${i}`} transform={`translate(${x} ${y})`}>
                          <path d="M0 -5 C 3 -1, 3.5 3, 0 5 C -3.5 3, -3 -1, 0 -5 Z" fill="#38bdf8" opacity="0.85">
                            <animateTransform attributeName="transform" type="translate" values="0 0; 0 4; 0 0" dur={`${2.4 + (i % 2)}s`} begin={`${i * 0.35}s`} repeatCount="indefinite" additive="sum" />
                          </path>
                        </g>
                      );
                    })}

                    {/* Fermentation bubbles */}
                    {Array.from({ length: bubbleCount }).map((_, i) => {
                      const x = 72 + (i * 19) % 58;
                      const y = 216 - (i * 23) % 122;
                      return (
                        <circle key={`bubble${i}`} cx={x} cy={y} r={1.8 + (i % 3) * 0.45} fill="#f8fafc" opacity="0.55">
                          <animate attributeName="cy" values={`${y};${y - 18};${y}`} dur={`${2.4 + (i % 4) * 0.4}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0;0.65;0" dur={`${2.4 + (i % 4) * 0.4}s`} begin={`${i * 0.15}s`} repeatCount="indefinite" />
                        </circle>
                      );
                    })}

                    {/* Salt crystals (white cubes) */}
                    {Array.from({ length: saltCount }).map((_, i) => {
                      const x = 70 + (i * 49) % 60;
                      const y = 120 + (i * 39) % 110;
                      return (
                        <rect key={`s${i}`} x={x} y={y} width="6" height="6" rx="1" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.6" transform={`rotate(${(i * 30) % 90} ${x + 3} ${y + 3})`}>
                          <animate attributeName="opacity" values="0.7;1;0.7" dur={`${3 + (i % 2)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
                        </rect>
                      );
                    })}

                    {/* Umami shimmer particles */}
                    {Array.from({ length: shimmerCount }).map((_, i) => {
                      const x = 64 + (i * 29) % 70;
                      const y = 88 + (i * 34) % 132;
                      return (
                        <circle key={`spark${i}`} cx={x} cy={y} r="1.6" fill="#fde68a">
                          <animate attributeName="opacity" values="0.2;1;0.2" dur={`${1.6 + (i % 3) * 0.4}s`} repeatCount="indefinite" />
                        </circle>
                      );
                    })}
                  </g>

                  {/* Glass reflection overlay */}
                  <path d="M52 48 Q52 44 58 44 L142 44 Q148 44 148 48 L148 236 Q148 246 138 246 L62 246 Q52 246 52 236 Z" fill="url(#jarGlass)" pointerEvents="none" />
                  <rect x="63" y="60" width="8" height="170" rx="4" fill="#ffffff" opacity="0.35" />
                </svg>

                {/* Legend */}
                <div className="space-y-2.5 text-[11px] min-w-[220px]">
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-600" /><span className="text-foreground/75">{isId ? "Bakteri baik (fermentasi)" : "Good bacteria (fermentation)"}</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500" /><span className="text-foreground/75">{isId ? "Bakteri berbahaya" : "Harmful bacteria"}</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-sky-400" /><span className="text-foreground/75">{isId ? "Kelembapan (kadar air)" : "Moisture (water content)"}</span></div>
                  <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300" /><span className="text-foreground/75">{isId ? "Kristal garam" : "Salt crystals"}</span></div>
                  <p className="text-[10px] text-muted-foreground pt-1 leading-snug">{isId ? "Amati bagaimana bakteri berbahaya bertambah saat garam & kebersihan turun." : "Watch harmful bacteria grow as salt & hygiene drop."}</p>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {[
                      { label: isId ? "Kelembapan" : "Moisture", value: liveMetrics.moisture, tone: "bg-sky-500" },
                      { label: isId ? "Umami" : "Umami", value: liveMetrics.umami, tone: "bg-violet-500" },
                      { label: isId ? "Proteksi" : "Protection", value: liveMetrics.preservation, tone: "bg-emerald-500" },
                      { label: isId ? "Kesiapan" : "Readiness", value: liveMetrics.readiness, tone: "bg-amber-500" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl border border-border/50 bg-muted/20 p-2.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</span>
                          <span className="text-[10px] font-black text-foreground">{item.value}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/80 overflow-hidden border border-border/30">
                          <div className={`h-full ${item.tone}`} style={{ width: `${item.value}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── CONTROLS ── */}
            <div className="bg-white p-5 rounded-2xl border border-border/50 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{isId ? "Atur Variabel Produksi" : "Set Production Variables"}</p>
                <div className="flex items-center gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.key}
                      onClick={preset.action}
                      className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-full border border-border/60 bg-muted/20 text-foreground/70 hover:bg-muted/50 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
              {([
                { key: "salt", label: isId ? "Kadar Garam" : "Salt Level", value: salt, set: setSalt, min: 0, max: 100, step: 5, unit: "%", color: "bg-sky-500", hint: isId ? "Garam menghambat bakteri berbahaya." : "Salt inhibits harmful bacteria." },
                { key: "drying", label: isId ? "Waktu Penjemuran" : "Drying Time", value: drying, set: setDrying, min: 0, max: 7, step: 1, unit: isId ? " hari" : " days", color: "bg-orange-500", hint: isId ? "Penjemuran mengurangi kadar air." : "Drying reduces water content." },
                { key: "hygiene", label: isId ? "Tingkat Kebersihan" : "Hygiene Level", value: hygiene, set: setHygiene, min: 0, max: 100, step: 5, unit: "%", color: "bg-emerald-500", hint: isId ? "Kebersihan menurunkan risiko kontaminasi." : "Hygiene lowers contamination risk." },
                { key: "temp", label: isId ? "Suhu Fermentasi" : "Fermentation Temp", value: temp, set: setTemp, min: 20, max: 45, step: 1, unit: "°C", color: "bg-red-500", hint: isId ? "Suhu yang sesuai membantu fermentasi." : "A suitable temperature helps fermentation." },
              ] as const).map(({ key, label, value, set, min, max, step, unit, color, hint }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[12px] font-bold text-foreground/80">{label}</span>
                    <span className="text-[13px] font-black text-foreground tabular-nums bg-muted px-2 py-0.5 rounded-md border border-border/50">{value}{unit}</span>
                  </div>
                  <div className="relative h-6 flex items-center">
                    <div className="absolute inset-0 h-2 my-auto bg-muted rounded-full overflow-hidden border border-border/20">
                      <div className={`h-full ${color} transition-all duration-300 opacity-70`} style={{ width: `${((value - min) / (max - min)) * 100}%` }} />
                    </div>
                    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => (set as (n: number) => void)(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20
                        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-foreground
                        [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110
                        [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white
                        [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-foreground [&::-moz-range-thumb]:shadow-lg" />
                  </div>
                  <p className="text-[10px] text-muted-foreground px-1">{hint}</p>
                </div>
              ))}
              <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-primary/80">{isId ? "Status Langsung" : "Live Status"}</p>
                  <p className="text-[12px] font-semibold text-foreground">{insight.stageLabel}</p>
                </div>
                <p className="text-[10px] text-right text-foreground/65 max-w-[240px]">{insight.body}</p>
              </div>
              <button onClick={runSimulation} className="w-full py-3.5 bg-emerald-600 text-white text-[13px] font-black rounded-xl hover:bg-emerald-700 transition-all shadow-md active:scale-[0.98] uppercase tracking-wider flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                {isId ? "Jalankan Simulasi" : "Run Simulation"}
              </button>
            </div>

            {/* ── OUTPUTS ── */}
            {!ran ? (
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 text-center text-[12px] text-primary font-medium space-y-2">
                <p>{isId ? "Klik \"Jalankan Simulasi\" untuk melihat hasilnya!" : "Click \"Run Simulation\" to see the results!"}</p>
                <p className="text-[11px] text-foreground/70">{insight.recommendation}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {simulationDirty && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-700">{isId ? "Parameter Berubah" : "Inputs Changed"}</p>
                      <p className="text-[12px] text-amber-900/80">{isId ? "Visual sudah ikut berubah, tapi hasil kartu di bawah masih memakai run terakhir." : "The visuals already react, but the cards below still reflect the last run."}</p>
                    </div>
                    <button onClick={runSimulation} className="shrink-0 px-3 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider hover:bg-amber-600 transition-colors">
                      {isId ? "Run Lagi" : "Re-run"}
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-3">
                  {/* Risk */}
                  <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm text-center">
                    <div className="text-[9px] font-black tracking-widest uppercase text-muted-foreground mb-2">{isId ? "Risiko Kontaminasi" : "Contamination Risk"}</div>
                    <div className="text-[15px] font-black text-foreground mb-2">{levelText(sim.riskLevel)}</div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden"><div className={`h-full transition-all duration-700 ${levelColor(sim.riskLevel, true)}`} style={{ width: `${sim.risk}%` }} /></div>
                    <div className="flex justify-between text-[8px] text-muted-foreground mt-1 uppercase font-bold"><span>{isId ? "Rendah" : "Low"}</span><span>{isId ? "Tinggi" : "High"}</span></div>
                  </div>
                  {/* Quality */}
                  <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm text-center">
                    <div className="text-[9px] font-black tracking-widest uppercase text-muted-foreground mb-2">{isId ? "Kualitas Terasi" : "Terasi Quality"}</div>
                    <div className="text-[15px] font-black text-foreground mb-2">{levelText(sim.qualityLevel)}</div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden"><div className={`h-full transition-all duration-700 ${levelColor(sim.qualityLevel)}`} style={{ width: `${sim.quality}%` }} /></div>
                    <div className="flex justify-between text-[8px] text-muted-foreground mt-1 uppercase font-bold"><span>{isId ? "Kurang" : "Poor"}</span><span>{isId ? "Baik" : "Good"}</span></div>
                  </div>
                  {/* Activity */}
                  <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm text-center">
                    <div className="text-[9px] font-black tracking-widest uppercase text-muted-foreground mb-2">{isId ? "Aktivitas Fermentasi" : "Fermentation Activity"}</div>
                    <div className="text-[15px] font-black text-foreground mb-2">{isId ? trAct(sim.activity) : sim.activity}</div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden"><div className={`h-full transition-all duration-700 ${sim.activity === "Balanced" ? "bg-emerald-500" : "bg-amber-500"}`} style={{ width: sim.activity === "Slow" ? "30%" : sim.activity === "Balanced" ? "65%" : "100%" }} /></div>
                    <div className="flex justify-between text-[8px] text-muted-foreground mt-1 uppercase font-bold"><span>{isId ? "Lambat" : "Slow"}</span><span>{isId ? "Cepat" : "Fast"}</span></div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-border/50 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground">{isId ? "Catatan Fermentasi" : "Fermentation Note"}</p>
                      <p className="text-[15px] font-black text-foreground">{insight.stageLabel}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{isId ? "Skor Kesiapan" : "Readiness Score"}</p>
                      <p className="text-[18px] font-black text-primary">{liveMetrics.readiness}%</p>
                    </div>
                  </div>
                  <p className="text-[12px] leading-relaxed text-foreground/70">{insight.body}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: isId ? "Bakteri baik" : "Good bacteria", value: liveMetrics.beneficial, tone: "text-emerald-600" },
                      { label: isId ? "Bakteri buruk" : "Harmful", value: liveMetrics.harmful, tone: "text-red-500" },
                      { label: isId ? "Keseimbangan" : "Balance", value: liveMetrics.balance, tone: "text-sky-600" },
                      { label: isId ? "Umami" : "Umami", value: liveMetrics.umami, tone: "text-violet-600" },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl bg-muted/25 border border-border/40 p-3 text-center">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{item.label}</p>
                        <p className={`text-[16px] font-black ${item.tone}`}>{item.value}%</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-[11px] text-emerald-900/80">
                    {insight.recommendation}
                  </div>
                </div>
              </div>
            )}

            {/* ── DID YOU KNOW ── */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[11px] font-black uppercase tracking-widest text-amber-700 mb-2 flex items-center gap-1.5">💡 {isId ? "Tahukah Kamu?" : "Did You Know?"}</p>
              <ul className="space-y-1.5">
                {facts.map((f, i) => (
                  <li key={i} className="text-[11px] text-amber-900/80 flex gap-2"><span className="text-amber-500">•</span>{f}</li>
                ))}
              </ul>
            </div>

            {/* ── HISTORY ── */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground/70 uppercase tracking-wider">{isId ? "Riwayat Data Simulasi" : "Simulation Data History"}</span>
                  <button onClick={() => setHistory([])} className="text-[10px] text-muted-foreground hover:text-foreground font-bold uppercase tracking-wider">{isId ? "Hapus" : "Clear"}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border/40">
                        {["#", isId ? "Garam" : "Salt", isId ? "Jemur" : "Dry", isId ? "Bersih" : "Hyg", isId ? "Suhu" : "Temp", isId ? "Risiko" : "Risk", isId ? "Kualitas" : "Quality", isId ? "Aktivitas" : "Activity"].map((h) => (
                          <th key={h} className="px-2.5 py-2 text-left font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {history.map((row, i) => (
                        <tr key={String(row.id)} className={i % 2 === 1 ? "bg-muted/20" : ""}>
                          <td className="px-2.5 py-2 text-muted-foreground font-medium">{row.id}</td>
                          <td className="px-2.5 py-2 font-semibold text-foreground">{row.salt}%</td>
                          <td className="px-2.5 py-2 text-foreground/70">{row.drying}</td>
                          <td className="px-2.5 py-2 text-foreground/70">{row.hygiene}%</td>
                          <td className="px-2.5 py-2 text-foreground/70">{row.temp}°C</td>
                          <td className="px-2.5 py-2 font-semibold text-foreground">{row.risk}</td>
                          <td className="px-2.5 py-2 text-foreground/70">{row.quality}</td>
                          <td className="px-2.5 py-2 text-foreground/70">{row.activity}</td>
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

export default Unit2Pisa;
