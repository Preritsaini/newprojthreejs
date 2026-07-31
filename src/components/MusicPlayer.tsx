"use client";

import { useState, useRef, useEffect } from "react";

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT?: any;
  }
}

interface MusicPlayerProps {
  songTitle?: string;
  artist?: string;
}

export default function MusicPlayer({
  songTitle = "Until I Found You",
  artist = "Stephen Sanchez",
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const isYtReadyRef = useRef<boolean>(false);

  // Synchronize audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
    if (ytPlayerRef.current && ytPlayerRef.current.setVolume) {
      try {
        ytPlayerRef.current.setVolume(Math.round(volume * 100));
      } catch (e) {
        // ignore
      }
    }
  }, [volume]);

  // Initialize YouTube IFrame API safely for production hosting
  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!isMounted) return;
      try {
        ytPlayerRef.current = new window.YT.Player("yt-player-element", {
          height: "1",
          width: "1",
          videoId: "GxldQ9eX2wo", // 'Until I Found You' - Stephen Sanchez
          playerVars: {
            autoplay: 1,
            loop: 1,
            playlist: "GxldQ9eX2wo",
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            origin: typeof window !== "undefined" ? window.location.origin : "",
          },
          events: {
            onReady: (event: any) => {
              isYtReadyRef.current = true;
              event.target.setVolume(Math.round(volume * 100));
              // Attempt play
              event.target.playVideo();
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                setIsPlaying(true);
                setAutoplayBlocked(false);
              }
            },
          },
        });
      } catch (err) {
        console.log("YouTube Player init error, using HTML5 audio fallback", err);
      }
    };

    if (typeof window !== "undefined") {
      if (!window.YT) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
          initPlayer();
        };
      } else if (window.YT && window.YT.Player) {
        initPlayer();
      }
    }

    return () => {
      isMounted = false;
      if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const playMusic = () => {
    let started = false;

    // 1. Try YouTube Player first
    if (ytPlayerRef.current && isYtReadyRef.current) {
      try {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        setAutoplayBlocked(false);
        started = true;
      } catch (e) {
        console.log("YouTube play error:", e);
      }
    }

    // 2. Try HTML5 Audio element fallback if YT isn't ready
    if (!started && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => {
          console.log("Autoplay blocked by browser policy, waiting for tap", err);
          setAutoplayBlocked(true);
        });
    }
  };

  const pauseMusic = () => {
    if (ytPlayerRef.current && ytPlayerRef.current.pauseVideo) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {
        // ignore
      }
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };

  // Listen for ANY first user click/touch anywhere on screen to trigger music on hosted sites
  useEffect(() => {
    // Attempt instant start on mount
    playMusic();

    const handleFirstInteraction = () => {
      playMusic();
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
  }, []);

  return (
    <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2 pointer-events-auto">
      {/* HTML5 Backup Audio element */}
      <audio
        ref={audioRef}
        id="love-song"
        loop
        preload="auto"
        src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      />

      {/* Offscreen YouTube iframe container (Not display:none, so browser decodes audio properly on hosting) */}
      <div className="fixed -bottom-96 -right-96 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
        <div id="yt-player-element" />
      </div>

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
