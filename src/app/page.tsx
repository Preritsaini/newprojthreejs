"use client";

import { useState } from "react";
import ThreeBackground from "@/components/ThreeBackground";
import MessageCard from "@/components/MessageCard";
import PhotoBooth from "@/components/PhotoBooth";
import MusicPlayer from "@/components/MusicPlayer";

export default function Home() {
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [isPhotoBoothOpen, setIsPhotoBoothOpen] = useState(false);
  const [isUiVisible, setIsUiVisible] = useState(true);

  const handleSelectObject = (objectName: string) => {
    setSelectedObject(objectName);
    setIsUiVisible(true); // Automatically show UI if they click a 3D object
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between overflow-hidden bg-glow-main px-4">
      {/* Background Music Player - 'Until I Found You' */}
      <MusicPlayer songTitle="Until I Found You" artist="Stephen Sanchez" />

      {/* Interactive 3D World */}
      <ThreeBackground onSelectObject={handleSelectObject} />

      {/* Floating Action Button: Toggle UI View */}
      <div className="fixed top-4 left-4 z-20 flex gap-2 pointer-events-auto">
        <button
          onClick={() => setIsUiVisible(!isUiVisible)}
          className="glass-panel px-3 py-2 rounded-full text-xs font-semibold uppercase tracking-wider text-rose-700 hover:text-rose-950 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        >
          {isUiVisible ? "👁️ Hide HUD" : "👁️ Show HUD"}
        </button>
      </div>

      {/* Floating Instructions/HUD */}
      {isUiVisible && (
        <div className="fixed top-16 left-4 z-20 pointer-events-none max-w-[220px] sm:max-w-xs animate-fade-in">
          <div className="glass-panel rounded-2xl p-4 text-xs space-y-1 text-rose-950/85">
            <p className="font-bold text-pink-600 uppercase tracking-wider">Love World 3D ✨</p>
            <p>🖱️ Drag to rotate view</p>
            <p>🔍 Pinch/Scroll to zoom</p>
            <p>👉 Tap objects to explore</p>
          </div>
        </div>
      )}

      {/* Music and Story Content Controller */}
      <div className="w-full flex-grow flex items-center justify-center py-12">
        {isUiVisible && (
          <div className="w-full animate-fade-in">
            <MessageCard
              selectedObject={selectedObject}
              onCloseCard={() => setSelectedObject(null)}
              onOpenPhotoBooth={() => setIsPhotoBoothOpen(true)}
              onSelectObject={handleSelectObject}
            />
          </div>
        )}
      </div>

      {/* Vintage Photo Booth Modal Overlay */}
      {isPhotoBoothOpen && (
        <PhotoBooth onClose={() => setIsPhotoBoothOpen(false)} />
      )}

      {/* Bottom Footer Credits */}
      <footer className="w-full pb-4 text-center pointer-events-none z-20">
        <p className="text-rose-800/70 text-xs tracking-wider font-semibold">
          Built with ❤️ by Prerit Saini
        </p>
      </footer>
    </main>
  );
}
