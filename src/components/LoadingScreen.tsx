import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

// Cinematic trailer images
const TRAILERS = ["/images/trailer.jpg", "/images/trailer1.jpg", "/images/trailer2.jpg"];

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

  const [trailerIdx, setTrailerIdx] = useState(0);
  const [bubbleIdx, setBubbleIdx] = useState(() => Math.floor(Math.random() * bubbles.length));
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Cycle trailer slides every 2500ms
  useEffect(() => {
    const t = setInterval(() => {
      setTrailerIdx((i) => (i + 1) % TRAILERS.length);
    }, 2500);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden">
      {/* Cinematic Trailer Slideshow */}
      <div className="absolute inset-0">
        {TRAILERS.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt={`Trailer ${idx + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
              idx === trailerIdx ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="flex flex-col items-center gap-6 select-none relative z-10">
        {/* Speech bubble */}
        <div className="relative bg-white/95 backdrop-blur-md border-2 border-green-400 rounded-2xl px-6 py-4 shadow-2xl max-w-sm text-center">
          <p className="text-[15px] text-foreground font-medium leading-snug">
            {bubbles[bubbleIdx]}
          </p>
          {/* Bubble tail */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-white/95 border-r-2 border-b-2 border-green-400 rotate-45" />
        </div>

        {/* Dots loader */}
        <div className="flex gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-4 h-4 rounded-full bg-white shadow-xl animate-bounce"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>

        {/* Skip button */}
        <button
          onClick={onDone}
          className="mt-3 px-8 py-3 bg-green-600 text-white text-base font-semibold rounded-full hover:bg-green-700 transition-all shadow-2xl hover:shadow-emerald-900/20 active:scale-[0.97]"
        >
          {isId ? "Lewati" : "Skip"}
        </button>
      </div>
    </div>
  );
}
