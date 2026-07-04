import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

const SPRITES = Array.from({ length: 12 }, (_, i) => `/karakter/sprite_${i + 1}.png`);

const BUBBLES_EN = [
  "Welcome! Let's explore traditional food science.",
  "Did you know teak leaves are biodegradable?",
  "Terasi fermentation reduces harmful bacteria!",
  "Clay pots retain heat more efficiently than metal.",
  "Sand frying uses no oil — pretty cool, right?",
  "Traditional food practices can be sustainable too.",
  "Get ready to run some simulations!",
  "Read the stimulus carefully before answering.",
  "You can record data and use it to answer questions.",
  "Science and tradition go hand in hand here.",
];

const BUBBLES_ID = [
  "Selamat datang! Yuk eksplorasi sains pangan tradisional.",
  "Tahukah kamu daun jati bersifat biodegradable?",
  "Fermentasi terasi mengurangi bakteri berbahaya!",
  "Kuali tanah liat lebih efisien menahan panas.",
  "Goreng pasir tidak pakai minyak — keren kan?",
  "Praktik pangan tradisional bisa berkelanjutan.",
  "Bersiaplah untuk menjalankan simulasi!",
  "Baca stimulus dengan teliti sebelum menjawab.",
  "Catat data dan gunakan untuk menjawab soal.",
  "Sains dan tradisi berjalan beriringan di sini.",
];

interface LoadingScreenProps {
  onDone: () => void;
  duration?: number; // ms
}

export default function LoadingScreen({ onDone, duration = 30000 }: LoadingScreenProps) {
  const { lang } = useLanguage();
  const isId = lang === "id";
  const bubbles = isId ? BUBBLES_ID : BUBBLES_EN;

  const [spriteIdx, setSpriteIdx] = useState(0);
  const [bubbleIdx, setBubbleIdx] = useState(() => Math.floor(Math.random() * bubbles.length));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Cycle sprites every 120ms
  useEffect(() => {
    const t = setInterval(() => {
      setSpriteIdx((i) => (i + 1) % SPRITES.length);
    }, 120);
    return () => clearInterval(t);
  }, []);

  // Cycle bubble text every 700ms
  useEffect(() => {
    const t = setInterval(() => {
      setBubbleIdx((i) => (i + 1) % bubbles.length);
    }, 700);
    return () => clearInterval(t);
  }, [bubbles.length]);

  // Auto-dismiss after duration
  useEffect(() => {
    const t = setTimeout(() => {
      onDoneRef.current();
    }, duration);
    return () => clearTimeout(t);
  }, [duration]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-sky-200 via-green-100 to-green-200 overflow-hidden">
      {/* Animated Clouds */}
      <div className="absolute top-10 left-10 w-32 h-16 bg-white rounded-full opacity-80 animate-float" style={{ animationDuration: "15s" }} />
      <div className="absolute top-24 right-20 w-24 h-12 bg-white rounded-full opacity-70 animate-float" style={{ animationDuration: "20s", animationDelay: "-5s" }} />
      <div className="absolute top-40 left-1/3 w-40 h-20 bg-white rounded-full opacity-90 animate-float" style={{ animationDuration: "18s", animationDelay: "-10s" }} />
      
      {/* Trees on bottom */}
      <div className="absolute bottom-0 left-0 w-full h-32">
        <svg viewBox="0 0 400 100" className="w-full h-full" preserveAspectRatio="none">
          <rect x="30" y="60" width="12" height="40" fill="#8B4513" />
          <circle cx="36" cy="50" r="30" fill="#228B22" />
          <circle cx="26" cy="55" r="20" fill="#32CD32" />
          <circle cx="46" cy="55" r="20" fill="#32CD32" />
          
          <rect x="350" y="60" width="12" height="40" fill="#8B4513" />
          <circle cx="356" cy="50" r="30" fill="#228B22" />
          <circle cx="346" cy="55" r="20" fill="#32CD32" />
          <circle cx="366" cy="55" r="20" fill="#32CD32" />
        </svg>
      </div>
      
      {/* Floating Particles */}
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="absolute bg-yellow-300 rounded-full opacity-70 animate-pulse"
          style={{
            width: `${4 + Math.random() * 6}px`,
            height: `${4 + Math.random() * 6}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDuration: `${2 + Math.random() * 3}s`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      <div className="flex flex-col items-center gap-6 select-none relative z-10">
        {/* Speech bubble */}
        <div className="relative bg-white border-2 border-green-400 rounded-2xl px-5 py-3 shadow-lg max-w-xs text-center">
          <p className="text-[14px] text-foreground font-medium leading-snug">
            {bubbles[bubbleIdx]}
          </p>
          {/* Bubble tail */}
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r-2 border-b-2 border-green-400 rotate-45" />
        </div>

        {/* Sprite with animation */}
        <img
          src={SPRITES[spriteIdx]}
          alt="character"
          className="w-32 h-32 object-contain animate-bounce drop-shadow-lg"
          draggable={false}
          style={{ animationDuration: "1.5s" }}
        />

        {/* Dots loader */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-3 h-3 rounded-full bg-green-600 animate-bounce shadow-md"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onDone}
          className="mt-2 px-4 py-2 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          {isId ? "Lewati" : "Skip"}
        </button>
      </div>

      {/* Bottom grass strip */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-green-600 to-green-400" />
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(30px); }
        }
        .animate-float {
          animation-name: float;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
      `}</style>
    </div>
  );
}
