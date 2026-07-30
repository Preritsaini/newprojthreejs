"use client";

import { useState, useEffect } from "react";
import HeartMirror from "@/components/HeartMirror";

interface ConfettiItem {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  translateX: string;
}

interface MessageCardProps {
  selectedObject: string | null;
  onCloseCard: () => void;
  onOpenPhotoBooth: () => void;
  onSelectObject?: (objectName: string) => void;
}

export default function MessageCard({ selectedObject, onCloseCard, onOpenPhotoBooth, onSelectObject }: MessageCardProps) {
  const [confetti, setConfetti] = useState<ConfettiItem[]>([]);
  const [isLetterOpen, setIsLetterOpen] = useState(false);

  // Trigger confetti effect on client-side only to avoid hydration mismatch
  const triggerConfetti = () => {
    const colors = ["#ec4899", "#a855f7", "#fbbf24", "#3b82f6", "#f43f5e"];
    const newConfetti = Array.from({ length: 40 }).map((_, i) => ({
      id: Math.random() + i,
      x: Math.random() * 100,
      y: Math.random() * 20 + 80,
      size: Math.random() * 8 + 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
      translateX: `${(Math.random() - 0.5) * 100}px`,
    }));
    setConfetti(newConfetti);
    setTimeout(() => {
      setConfetti([]);
    }, 2500);
  };

  // Trigger confetti when gift box is selected
  useEffect(() => {
    if (selectedObject === "gift_box") {
      triggerConfetti();
      setIsLetterOpen(false); // Reset letter view
    }
  }, [selectedObject]);

  return (
    <div className="relative w-full max-w-md mx-auto z-10 px-4">

      {/* Main Glassmorphic Card */}
      <div className="glass-panel-heavy rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-all duration-500 hover:shadow-[0_0_50px_rgba(236,72,153,0.12)] min-h-[320px] flex flex-col justify-between">
        
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-pink-500/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />

        {/* Dynamic Card Headings */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-pink-600/70 font-semibold">
            {selectedObject ? `Viewing: ${selectedObject.replace("_", " ")}` : "Welcome to Love World"}
          </span>
          {selectedObject && (
            <button
              onClick={onCloseCard}
              className="text-xs text-rose-700 hover:text-rose-950 bg-rose-500/5 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg transition-all cursor-pointer border border-rose-500/10"
            >
              Close ✕
            </button>
          )}
        </div>

        {/* Card Body Content based on selection */}
        <div className="flex-grow flex flex-col justify-center py-2">
          {!selectedObject && (
            <div className="animate-fade-in space-y-4 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight glow-text-pink text-rose-900 font-romantic">
                Happy Girlfriend's Day, My Love! ❤️
              </h1>
              <p className="text-rose-950/85 text-xs sm:text-sm leading-relaxed font-medium italic">
                You bring endless sunshine into my life and make every single day feel magical. I created this special little world just for you—explore our favorite memories, step inside my heart, and uncover all the love waiting for you! 💖
              </p>
              
              <button
                onClick={onOpenPhotoBooth}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
              >
                📸 Open Vintage Photo Booth & Collage Studio
              </button>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  onClick={() => onSelectObject?.("gift_box")}
                  className="glass-panel p-3 rounded-xl text-center hover:bg-pink-500/10 border border-pink-500/10 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform block">🎁</span>
                  <p className="text-[10px] text-rose-900 font-bold mt-1">Gift Box</p>
                </button>
                <button
                  onClick={() => {
                    onSelectObject?.("photo_frame");
                    onOpenPhotoBooth();
                  }}
                  className="glass-panel p-3 rounded-xl text-center hover:bg-pink-500/10 border border-pink-500/10 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform block">📸</span>
                  <p className="text-[10px] text-rose-900 font-bold mt-1">Photo Booth</p>
                </button>
                <button
                  onClick={() => onSelectObject?.("main_heart")}
                  className="glass-panel p-3 rounded-xl text-center hover:bg-pink-500/10 border border-pink-500/10 transition-all cursor-pointer hover:scale-105 active:scale-95 group"
                >
                  <span className="text-xl group-hover:scale-125 transition-transform block">💖</span>
                  <p className="text-[10px] text-rose-900 font-bold mt-1">My Heart</p>
                </button>
              </div>
            </div>
          )}

          {selectedObject === "photo_frame" && (
            <div className="animate-fade-in space-y-3">
              <h2 className="text-2xl font-bold glow-text-purple text-purple-900">Our Story</h2>
              
              <div className="relative w-full h-32 sm:h-40 rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_4px_20px_rgba(168,85,247,0.1)]">
                <img
                  src="/images/couple.png"
                  alt="Cozy couple photo"
                  className="w-full h-full object-cover hover:scale-105 transition-all duration-700 ease-in-out"
                />
              </div>

              <button
                onClick={onOpenPhotoBooth}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                📸 Open Studio Photo Booth & Collage
              </button>

              <div className="border-l-2 border-pink-500/30 pl-4 space-y-3">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_#ec4899]" />
                  <span className="text-[11px] sm:text-xs text-pink-700 font-bold">The Beginning</span>
                  <p className="text-rose-950/80 text-xs sm:text-sm mt-0.5">Every moment since we met has felt brighter and more meaningful.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]" />
                  <span className="text-[11px] sm:text-xs text-purple-700 font-bold">Today & Forever</span>
                  <p className="text-rose-950/80 text-xs sm:text-sm mt-0.5">I am so lucky to walk beside you, holding your hand through every journey, sharing endless laughs, and creating a lifetime of beautiful memories together.</p>
                </div>
              </div>
            </div>
          )}

          {selectedObject === "main_heart" && (
            <HeartMirror />
          )}

          {selectedObject === "gift_box" && (
            <div className="animate-fade-in space-y-4 text-center">
              {!isLetterOpen ? (
                <div className="space-y-4">
                  <span className="text-5xl animate-bounce inline-block">🎁</span>
                  <h2 className="text-2xl font-bold text-rose-900">You opened the Gift!</h2>
                  <p className="text-rose-950/80 text-sm leading-relaxed">
                    Inside the gift box is a sealed love letter written just for you.
                  </p>
                  <button
                    onClick={() => {
                      setIsLetterOpen(true);
                      triggerConfetti();
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white text-xs font-bold uppercase tracking-widest shadow-md hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    💌 Open Letter
                  </button>
                </div>
              ) : (
                <div className="animate-fade-in relative bg-[#fdfaf2] border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-[0_4px_25px_rgba(244,63,94,0.06)] text-left font-romantic text-rose-950 text-base sm:text-lg leading-relaxed space-y-3 max-h-[55vh] overflow-y-auto">
                  {/* Decorative lined paper style */}
                  <div className="absolute top-0 bottom-0 left-6 border-l border-red-200/50" />
                  
                  <div className="pl-6 space-y-2.5">
                    <p className="font-bold text-rose-900 text-2xl">Hey Anamika ❤️,</p>
                    <p>
                      I wanted to write down how much you truly mean to me. You bring so much light, warmth, and happiness into my life every single day.
                    </p>
                    <p>
                      I know I can be a handful sometimes, and I am so sorry for all the chaos I cause! But despite everything, I am totally, head-over-heels in love with you, and I love you a lot.
                    </p>
                    <p>
                      You are the one I imagine my whole life together with, and I promise to be the best version of myself for you. Today is your day—enjoy it all to the fullest! I wish us to always be the best together.
                    </p>
                    <p className="font-bold text-rose-900 pt-1">
                      I just loveee uuuu so much, Anamika! 💖✨
                    </p>
                    <p className="text-right font-bold text-rose-900 pt-2">
                      With all my love, <br/>
                      <span className="inline-block pt-1">Prerit Saini</span>
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setIsLetterOpen(false)}
                    className="w-full mt-4 py-2 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 text-rose-900 font-sans text-xs font-semibold rounded-lg transition-all cursor-pointer text-center"
                  >
                    Close Letter
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation Indicator */}
        <div className="mt-4 pt-4 border-t border-pink-500/10 text-center">
          <p className="text-[10px] text-rose-950/60 font-medium">
            {selectedObject ? "Click 'Close' to return to instructions" : "Interact with the 3D scene directly"}
          </p>
        </div>
      </div>

      {/* Confetti Animation Elements */}
      {confetti.map((c) => (
        <span
          key={c.id}
          className="absolute pointer-events-none rounded-full animate-confetti"
          style={{
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: `${c.size}px`,
            height: `${c.size}px`,
            backgroundColor: c.color,
            boxShadow: `0 0 8px ${c.color}`,
            // @ts-ignore
            "--translate-x": c.translateX,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
