"use client";

import { useEffect, useRef, useState } from "react";

export default function HeartMirror() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<"loading" | "active" | "denied" | "unsupported">("loading");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraState("unsupported");
        return;
      }

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 640 },
          },
          audio: false,
        });

        activeStream = mediaStream;
        setStream(mediaStream);
        setCameraState("active");

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access denied or unequipped:", err);
        setCameraState("denied");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const takeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    // Mirror image horizontally for selfie view
    ctx.save();
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setCapturedPhoto(dataUrl);
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4 animate-fade-in text-center py-2">
      {/* SVG Clip Path Definition for Heart Shape */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <clipPath id="heart-clip-path" clipPathUnits="objectBoundingBox">
            <path d="M 0.5, 0.22 C 0.38, 0.05, 0.12, 0.05, 0.08, 0.35 C 0.05, 0.60, 0.28, 0.78, 0.5, 0.96 C 0.72, 0.78, 0.95, 0.60, 0.92, 0.35 C 0.88, 0.05, 0.62, 0.05, 0.5, 0.22 Z" />
          </clipPath>
        </defs>
      </svg>

      {/* Hidden Canvas for Snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Heading */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold glow-text-pink text-rose-900">My Heart 💖</h2>
        <p className="text-xs text-rose-950/70">Take a look inside my heart...</p>
      </div>

      {/* Heart Mirror Container */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-2 group">
        {/* Outer Pulsing Pink Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 rounded-full blur-xl opacity-40 animate-pulse group-hover:opacity-70 transition-opacity" />

        {/* Heart Frame Border Wrapper */}
        <div className="relative w-full h-full p-2 bg-gradient-to-tr from-pink-400 via-rose-300 to-amber-200 shadow-2xl rounded-[3rem] transition-transform duration-500 hover:scale-105">
          {/* Heart Clipped Content Area */}
          <div
            className="w-full h-full bg-rose-950/80 relative overflow-hidden flex items-center justify-center"
            style={{ clipPath: "url(#heart-clip-path)" }}
          >
            {capturedPhoto ? (
              <img
                src={capturedPhoto}
                alt="Heart Snapshot"
                className="w-full h-full object-cover animate-fade-in"
              />
            ) : cameraState === "active" ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : cameraState === "loading" ? (
              <div className="flex flex-col items-center justify-center text-pink-200 text-xs p-4 space-y-2">
                <span className="animate-spin text-2xl">💖</span>
                <span>Opening Camera Mirror...</span>
              </div>
            ) : (
              /* Fallback if camera denied/unsupported: Show couple image with heart glow */
              <img
                src="/images/us.jpg"
                alt="You in my heart"
                className="w-full h-full object-cover"
              />
            )}

            {/* Sparkle reflection overlay */}
            <div className="absolute top-2 left-4 w-12 h-6 bg-white/20 blur-sm rounded-full transform -rotate-45 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Romantic Caption Below Heart Mirror */}
      <div className="space-y-1 max-w-xs pt-1">
        <p className="text-lg sm:text-xl font-bold text-rose-900 font-romantic tracking-wide">
          You're in here ❤️
        </p>
        <p className="text-xs text-rose-950/80 leading-relaxed font-medium">
          Whenever I look deep into my heart, you're the only one I see.
        </p>
      </div>

      {/* Action Controls */}
      <div className="flex gap-2 pt-1 w-full max-w-xs">
        {cameraState === "active" && !capturedPhoto && (
          <button
            onClick={takeSnapshot}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>📸</span>
            <span>Take Heart Selfie</span>
          </button>
        )}

        {capturedPhoto && (
          <button
            onClick={retakePhoto}
            className="flex-1 py-2 px-3 rounded-xl bg-pink-100 hover:bg-pink-200 text-rose-950 font-bold text-xs uppercase tracking-wider border border-pink-300 shadow-sm transition-all cursor-pointer"
          >
            ↺ Open Live Mirror
          </button>
        )}
      </div>
    </div>
  );
}
