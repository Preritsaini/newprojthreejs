"use client";

import { useState, useRef, useEffect } from "react";

interface MusicPlayerProps {
  songTitle?: string;
  artist?: string;
}

export default function MusicPlayer({
  songTitle = "Until I Found You",
  artist = "Stephen Sanchez",
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useYoutube, setUseYoutube] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Synchronize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const sendYtCommand = (command: string) => {
    if (ytIframeRef.current && ytIframeRef.current.contentWindow) {
      ytIframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
          args: [],
        }),
        "*"
      );
    }
  };

  const startPlayback = () => {
    if (!useYoutube && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.log("Autoplay blocked by browser policy, waiting for first user interaction.", err);
          setAutoplayBlocked(true);
        });
    } else {
      setIsPlaying(true);
      setAutoplayBlocked(false);
      sendYtCommand("playVideo");
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      if (!useYoutube && audioRef.current) {
        audioRef.current.pause();
      } else {
        sendYtCommand("pauseVideo");
      }
      setIsPlaying(false);
    } else {
      startPlayback();
    }
  };

  // Attempt instant autoplay on mount + Listen for ANY user interaction on the webpage
  useEffect(() => {
    // Attempt instant autoplay on mount
    startPlayback();

    const handleFirstInteraction = () => {
      if (!isPlaying) {
        startPlayback();
      }
      // Remove listeners once playback has successfully started or attempted
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };

    window.addEventListener("click", handleFirstInteraction);
    window.addEventListener("touchstart", handleFirstInteraction);
    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);

    return () => {
      window.removeEventListener("click", handleFirstInteraction);
      window.removeEventListener("touchstart", handleFirstInteraction);
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, [useYoutube, isPlaying]);

  const handleAudioError = () => {
    console.log("Local audio source not found or blocked. Switching to YouTube audio stream for Until I Found You.");
    setUseYoutube(true);
  };

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* HTML5 Audio element */}
      <audio
        ref={audioRef}
        id="love-song"
        loop
        preload="auto"
        src="/music/until-i-found-you.mp3"
        onError={handleAudioError}
      />

      {/* Hidden YouTube player iframe for Until I Found You by Stephen Sanchez (ID: GxldQ9eX2wo) */}
      <iframe
        ref={ytIframeRef}
        id="yt-love-song"
        className="hidden w-0 h-0 opacity-0 pointer-events-none"
        src="https://www.youtube-nocookie.com/embed/GxldQ9eX2wo?enablejsapi=1&autoplay=1&loop=1&playlist=GxldQ9eX2wo&controls=0"
        allow="autoplay"
        title="Until I Found You - Stephen Sanchez Audio"
      />

      {/* Glassmorphic Music Player Controls */}
      <div className="glass-panel px-3 py-2 rounded-full flex items-center gap-3 shadow-lg border border-pink-500/20 backdrop-blur-md bg-white/40 hover:bg-white/60 transition-all duration-300">
        <button
          onClick={togglePlay}
          className="flex items-center gap-2 text-xs font-semibold text-rose-900 hover:text-rose-950 transition-colors cursor-pointer"
          title={isPlaying ? "Pause Song" : "Play Until I Found You"}
        >
          {/* Animated Equalizer or Pulse */}
          {isPlaying ? (
            <span className="flex items-end gap-[2px] h-3.5 w-3.5 pb-0.5">
              <span className="w-1 bg-pink-500 rounded-full animate-bounce [animation-delay:-0.3s] h-full" />
              <span className="w-1 bg-rose-500 rounded-full animate-bounce [animation-delay:-0.15s] h-2/3" />
              <span className="w-1 bg-purple-500 rounded-full animate-bounce h-5/6" />
            </span>
          ) : (
            <span className="text-pink-500 text-sm">🎵</span>
          )}

          <div className="flex flex-col text-left leading-none">
            <span className="text-[11px] font-bold text-rose-900">
              {isPlaying ? "Until I Found You" : "Play Song 🎵"}
            </span>
            <span className="text-[9px] text-pink-700 font-medium">
              {isPlaying ? artist : "Stephen Sanchez"}
            </span>
          </div>
        </button>

        {/* Play/Pause Action Button */}
        <button
          onClick={togglePlay}
          className="ml-1 w-7 h-7 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white flex items-center justify-center text-xs shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
      </div>

      {/* Autoplay prompt toast if waiting for user touch */}
      {autoplayBlocked && !isPlaying && (
        <div className="animate-pulse glass-panel px-3 py-1 rounded-full text-[10px] text-rose-900 font-semibold shadow-sm border border-pink-500/20 bg-pink-50/80">
          ✨ Tap anywhere on screen to start music 🎵
        </div>
      )}
    </div>
  );
}
