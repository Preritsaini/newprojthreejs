"use client";

import React, { useRef, useState, useEffect } from "react";

interface PhotoBoothProps {
  onClose: () => void;
}

type Mode = "polaroid" | "collage";
type CollageLayout = "strip" | "grid2x2" | "sideBySide" | "heartGrid";
type VintageStyle = "sepia" | "chrome" | "warm" | "bw" | "rosy";
type ThemeColor = "cream" | "pink" | "kraft" | "midnight";

interface PhotoSlot {
  id: number;
  src: string;
  rotation: number; // 0, 90, 180, 270
  filter: VintageStyle;
}

export default function PhotoBooth({ onClose }: PhotoBoothProps) {
  const [activeTab, setActiveTab] = useState<Mode>("polaroid");

  // Single Polaroid State
  const [singleImageSrc, setSingleImageSrc] = useState<string>("/images/us.jpg");
  const [singleRotation, setSingleRotation] = useState<number>(0);
  const [singleCaption, setSingleCaption] = useState<string>("Us Forever ❤️");
  const [singleFilter, setSingleFilter] = useState<VintageStyle>("sepia");

  // Collage Builder State
  const [layout, setLayout] = useState<CollageLayout>("grid2x2");
  const [collageTheme, setCollageTheme] = useState<ThemeColor>("pink");
  const [collageTitle, setCollageTitle] = useState<string>("Happy Girlfriend's Day ✨");
  const [selectedStickers, setSelectedStickers] = useState<string[]>(["💖", "✨", "🌸"]);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number>(0);

  // Default 4 photo slots with couple image
  const [slots, setSlots] = useState<PhotoSlot[]>([
    { id: 0, src: "/images/us.jpg", rotation: 0, filter: "sepia" },
    { id: 1, src: "/images/us.jpg", rotation: 0, filter: "rosy" },
    { id: 2, src: "/images/us.jpg", rotation: 0, filter: "warm" },
    { id: 3, src: "/images/us.jpg", rotation: 0, filter: "chrome" },
  ]);

  const [isProcessing, setIsProcessing] = useState(false);
  const polaroidCanvasRef = useRef<HTMLCanvasElement>(null);
  const collageCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const slotFileInputRef = useRef<HTMLInputElement>(null);

  // Available stickers
  const availableStickers = ["💖", "✨", "🌸", "💋", "👑", "💌", "🦋", "🎀", "⭐", "🌹"];

  // Handle file select for Single Polaroid
  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSingleImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file select for specific Collage Slot
  const handleSlotFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newSrc = event.target.result as string;
          setSlots((prev) =>
            prev.map((slot, idx) => (idx === activeSlotIndex ? { ...slot, src: newSrc } : slot))
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Rotate single photo
  const rotateSingle = () => {
    setSingleRotation((prev) => (prev + 90) % 360);
  };

  // Rotate specific slot photo in collage
  const rotateSlot = (index: number) => {
    setSlots((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, rotation: (slot.rotation + 90) % 360 } : slot))
    );
  };

  // Change slot filter
  const changeSlotFilter = (index: number, filter: VintageStyle) => {
    setSlots((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, filter } : slot))
    );
  };

  // Toggle sticker in collage
  const toggleSticker = (sticker: string) => {
    setSelectedStickers((prev) =>
      prev.includes(sticker) ? prev.filter((s) => s !== sticker) : [...prev, sticker]
    );
  };

  // Helper to draw filtered and rotated image on canvas
  const drawTransformedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    dx: number,
    dy: number,
    dWidth: number,
    dHeight: number,
    rotationDeg: number,
    style: VintageStyle
  ) => {
    ctx.save();
    
    // Create temporary offscreen canvas for rotation & crop
    const offCanvas = document.createElement("canvas");
    offCanvas.width = dWidth;
    offCanvas.height = dHeight;
    const offCtx = offCanvas.getContext("2d");
    if (!offCtx) {
      ctx.restore();
      return;
    }

    // Apply rotation on offscreen context
    offCtx.save();
    offCtx.translate(dWidth / 2, dHeight / 2);
    offCtx.rotate((rotationDeg * Math.PI) / 180);

    // Calculate crop for square or slot rect
    let sWidth = img.width;
    let sHeight = img.height;
    let sx = 0;
    let sy = 0;

    // Swap dimensions if 90 or 270 deg
    const isRotated90 = rotationDeg % 180 !== 0;
    const targetW = isRotated90 ? dHeight : dWidth;
    const targetH = isRotated90 ? dWidth : dHeight;

    const imgAspect = img.width / img.height;
    const targetAspect = targetW / targetH;

    if (imgAspect > targetAspect) {
      sWidth = img.height * targetAspect;
      sx = (img.width - sWidth) / 2;
    } else {
      sHeight = img.width / targetAspect;
      sy = (img.height - sHeight) / 2;
    }

    offCtx.drawImage(
      img,
      sx,
      sy,
      sWidth,
      sHeight,
      -targetW / 2,
      -targetH / 2,
      targetW,
      targetH
    );
    offCtx.restore();

    // Apply Filter Shader
    const imgData = offCtx.getImageData(0, 0, dWidth, dHeight);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (style === "sepia") {
        data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
      } else if (style === "chrome") {
        data[i] = Math.min(255, r * 1.1 - 10);
        data[i + 1] = Math.min(255, g * 0.9 + 10);
        data[i + 2] = Math.min(255, b * 1.2 - 20);
      } else if (style === "warm") {
        data[i] = Math.min(255, r * 1.15);
        data[i + 1] = Math.min(255, g * 1.02);
        data[i + 2] = Math.min(255, b * 0.85);
      } else if (style === "rosy") {
        data[i] = Math.min(255, r * 1.2 + 15);
        data[i + 1] = Math.min(255, g * 0.85 + 10);
        data[i + 2] = Math.min(255, b * 1.05 + 15);
      } else if (style === "bw") {
        const avg = 0.299 * r + 0.587 * g + 0.114 * b;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
    }
    offCtx.putImageData(imgData, 0, 0);

    // Draw processed offscreen image onto main canvas
    ctx.drawImage(offCanvas, dx, dy);
    ctx.restore();
  };

  // Render Single Polaroid
  useEffect(() => {
    if (activeTab !== "polaroid" || !polaroidCanvasRef.current) return;

    setIsProcessing(true);
    const canvas = polaroidCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.src = singleImageSrc;
    img.onload = () => {
      // Clear Canvas & Draw Polaroid Card
      ctx.fillStyle = "#faf6ed";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(0,0,0,0.06)";
      ctx.lineWidth = 2;
      ctx.strokeRect(60, 60, 680, 680);

      // Draw transformed single image
      drawTransformedImage(ctx, img, 60, 60, 680, 680, singleRotation, singleFilter);

      // Light leak overlay
      const leakGrad = ctx.createRadialGradient(740, 60, 0, 740, 60, 500);
      leakGrad.addColorStop(0, "rgba(255, 120, 50, 0.2)");
      leakGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = leakGrad;
      ctx.fillRect(60, 60, 680, 680);
      ctx.globalCompositeOperation = "source-over";

      // Caption
      ctx.fillStyle = "#4c2c36";
      ctx.textAlign = "center";
      ctx.font = "italic 46px 'Dancing Script', cursive, sans-serif";
      ctx.fillText(singleCaption, canvas.width / 2, 855);

      setIsProcessing(false);
    };
  }, [activeTab, singleImageSrc, singleRotation, singleCaption, singleFilter]);

  // Render Collage Canvas
  useEffect(() => {
    if (activeTab !== "collage" || !collageCanvasRef.current) return;

    setIsProcessing(true);
    const canvas = collageCanvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Theme Background Colors
    const themeBgMap: Record<ThemeColor, string> = {
      cream: "#faf6ed",
      pink: "#fde8ef",
      kraft: "#e6d5bc",
      midnight: "#2b1c2b",
    };
    const textColorMap: Record<ThemeColor, string> = {
      cream: "#4c2c36",
      pink: "#831843",
      kraft: "#3e2723",
      midnight: "#fbcfe8",
    };

    ctx.fillStyle = themeBgMap[collageTheme];
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative inner border
    ctx.strokeStyle = "rgba(236, 72, 153, 0.25)";
    ctx.lineWidth = 4;
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Header Title
    ctx.fillStyle = textColorMap[collageTheme];
    ctx.textAlign = "center";
    ctx.font = "bold 38px 'Dancing Script', cursive, sans-serif";
    ctx.fillText(collageTitle, canvas.width / 2, 85);

    // Load images for slots
    let loadedCount = 0;
    const loadedImgs: (HTMLImageElement | null)[] = [null, null, null, null];

    slots.forEach((slot, index) => {
      const img = new Image();
      img.src = slot.src;
      img.onload = () => {
        loadedImgs[index] = img;
        loadedCount++;
        if (loadedCount === slots.length) {
          renderCollageSlots();
        }
      };
    });

    const renderCollageSlots = () => {
      if (layout === "grid2x2") {
        const slotSize = 340;
        const gap = 20;
        const startX = (canvas.width - (slotSize * 2 + gap)) / 2;
        const startY = 120;

        const coords = [
          { x: startX, y: startY },
          { x: startX + slotSize + gap, y: startY },
          { x: startX, y: startY + slotSize + gap },
          { x: startX + slotSize + gap, y: startY + slotSize + gap },
        ];

        coords.forEach((coord, i) => {
          if (loadedImgs[i]) {
            // White photo frame border
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(coord.x - 8, coord.y - 8, slotSize + 16, slotSize + 16);
            ctx.shadowColor = "rgba(0,0,0,0.12)";
            ctx.shadowBlur = 10;

            drawTransformedImage(
              ctx,
              loadedImgs[i]!,
              coord.x,
              coord.y,
              slotSize,
              slotSize,
              slots[i].rotation,
              slots[i].filter
            );
          }
        });
      } else if (layout === "strip") {
        const slotW = 540;
        const slotH = 220;
        const gap = 18;
        const startX = (canvas.width - slotW) / 2;
        const startY = 120;

        [0, 1, 2].forEach((i) => {
          const y = startY + i * (slotH + gap);
          if (loadedImgs[i]) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(startX - 8, y - 8, slotW + 16, slotH + 16);
            drawTransformedImage(
              ctx,
              loadedImgs[i]!,
              startX,
              y,
              slotW,
              slotH,
              slots[i].rotation,
              slots[i].filter
            );
          }
        });
      } else if (layout === "sideBySide") {
        const slotW = 340;
        const slotH = 500;
        const gap = 30;
        const startX = (canvas.width - (slotW * 2 + gap)) / 2;
        const startY = 180;

        [0, 1].forEach((i) => {
          const x = startX + i * (slotW + gap);
          if (loadedImgs[i]) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x - 12, startY - 12, slotW + 24, slotH + 24);
            drawTransformedImage(
              ctx,
              loadedImgs[i]!,
              x,
              startY,
              slotW,
              slotH,
              slots[i].rotation,
              slots[i].filter
            );
          }
        });
      } else if (layout === "heartGrid") {
        // 3 staggered photos
        const coords = [
          { x: 100, y: 150, w: 320, h: 320 },
          { x: 380, y: 150, w: 320, h: 320 },
          { x: 240, y: 440, w: 320, h: 320 },
        ];

        coords.forEach((coord, i) => {
          if (loadedImgs[i]) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(coord.x - 10, coord.y - 10, coord.w + 20, coord.h + 20);
            drawTransformedImage(
              ctx,
              loadedImgs[i]!,
              coord.x,
              coord.y,
              coord.w,
              coord.h,
              slots[i].rotation,
              slots[i].filter
            );
          }
        });
      }

      // Draw Selected Stickers along bottom/top corners
      ctx.font = "42px serif";
      ctx.textAlign = "center";

      const stickerPositions = [
        { x: 80, y: 910 },
        { x: 720, y: 910 },
        { x: 400, y: 920 },
        { x: 80, y: 100 },
        { x: 720, y: 100 },
      ];

      selectedStickers.forEach((st, idx) => {
        const pos = stickerPositions[idx % stickerPositions.length];
        ctx.fillText(st, pos.x, pos.y);
      });

      // Footer Date/Love stamp
      ctx.fillStyle = textColorMap[collageTheme];
      ctx.font = "italic 24px sans-serif";
      ctx.fillText("Forever & Always 💕", canvas.width / 2, 920);

      setIsProcessing(false);
    };
  }, [activeTab, layout, collageTheme, collageTitle, selectedStickers, slots]);

  const handleDownloadSingle = () => {
    if (!polaroidCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `polaroid-${Date.now()}.jpg`;
    link.href = polaroidCanvasRef.current.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  const handleDownloadCollage = () => {
    if (!collageCanvasRef.current) return;
    const link = document.createElement("a");
    link.download = `love-collage-${Date.now()}.jpg`;
    link.href = collageCanvasRef.current.toDataURL("image/jpeg", 0.95);
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-rose-950/30 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-5xl glass-panel-heavy rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-[0_20px_60px_rgba(244,63,94,0.2)] max-h-[92vh] overflow-y-auto">
        
        {/* Left Side: Mode Selection & Controls */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between border-b md:border-b-0 md:border-r border-pink-500/10 space-y-5">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-rose-900 tracking-tight">
                Studio Photo Booth 📸
              </h2>
              <button
                onClick={onClose}
                className="text-xs text-rose-700 hover:text-rose-950 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl transition-all cursor-pointer font-semibold"
              >
                ✕ Close
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-pink-500/10 rounded-2xl">
              <button
                onClick={() => setActiveTab("polaroid")}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "polaroid"
                    ? "bg-white text-rose-900 shadow-md"
                    : "text-rose-950/70 hover:text-rose-950"
                }`}
              >
                🖼️ Single Polaroid
              </button>
              <button
                onClick={() => setActiveTab("collage")}
                className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "collage"
                    ? "bg-white text-rose-900 shadow-md"
                    : "text-rose-950/70 hover:text-rose-950"
                }`}
              >
                🎨 Collage Studio
              </button>
            </div>

            {/* TAB 1: SINGLE POLAROID CONTROLS */}
            {activeTab === "polaroid" && (
              <div className="space-y-4 animate-fade-in">
                {/* Upload & Rotate Action Row */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleSingleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-pink-500/20 rounded-xl text-rose-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>📁 Upload Photo</span>
                  </button>
                  <button
                    onClick={rotateSingle}
                    className="py-3 px-4 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 rounded-xl text-purple-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Rotate 90 degrees"
                  >
                    <span>↺</span>
                    <span>Rotate ({singleRotation}°)</span>
                  </button>
                </div>

                {/* Filter Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                    Vintage Filter Tone
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {(["sepia", "rosy", "warm", "chrome", "bw"] as const).map((style) => (
                      <button
                        key={style}
                        onClick={() => setSingleFilter(style)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-bold uppercase tracking-wider capitalize border transition-all cursor-pointer text-center ${
                          singleFilter === style
                            ? "bg-rose-600 border-rose-600 text-white shadow-sm"
                            : "bg-white/40 border-pink-500/10 text-rose-950 hover:bg-white/70"
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption Input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                    Polaroid Handwritten Caption
                  </label>
                  <input
                    type="text"
                    value={singleCaption}
                    onChange={(e) => setSingleCaption(e.target.value)}
                    maxLength={32}
                    className="w-full py-2 px-3 rounded-xl border border-pink-500/20 bg-white/50 text-rose-950 focus:outline-none focus:border-rose-500 text-sm font-romantic font-medium"
                    placeholder="E.g., Us Forever ❤️"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: COLLAGE STUDIO CONTROLS */}
            {activeTab === "collage" && (
              <div className="space-y-4 animate-fade-in text-xs">
                {/* Layout Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                    1. Choose Layout
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "grid2x2", label: "2x2 Grid" },
                      { id: "strip", label: "Photo Strip" },
                      { id: "sideBySide", label: "Dual Frame" },
                      { id: "heartGrid", label: "Triple Stack" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLayout(l.id as CollageLayout)}
                        className={`py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer text-center ${
                          layout === l.id
                            ? "bg-pink-600 border-pink-600 text-white shadow-sm"
                            : "bg-white/40 border-pink-500/10 text-rose-950 hover:bg-white/70"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800">
                    2. Card Theme
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: "pink", label: "Rose Pink" },
                      { id: "cream", label: "Classic Cream" },
                      { id: "kraft", label: "Vintage Kraft" },
                      { id: "midnight", label: "Midnight" },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setCollageTheme(t.id as ThemeColor)}
                        className={`py-1.5 px-1 rounded-xl text-[10px] font-bold uppercase border transition-all cursor-pointer ${
                          collageTheme === t.id
                            ? "bg-rose-700 border-rose-700 text-white shadow-sm"
                            : "bg-white/40 border-pink-500/10 text-rose-950 hover:bg-white/70"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Slot Editor Selector & Rotation */}
                <div className="space-y-1.5 p-3 rounded-2xl bg-white/30 border border-pink-500/10">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block">
                    3. Edit Individual Photos & Rotation
                  </label>
                  <input
                    type="file"
                    ref={slotFileInputRef}
                    onChange={handleSlotFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {slots.map((slot, idx) => (
                      <div key={slot.id} className="flex flex-col gap-1 items-center">
                        <button
                          onClick={() => {
                            setActiveSlotIndex(idx);
                            slotFileInputRef.current?.click();
                          }}
                          className={`w-full py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            activeSlotIndex === idx
                              ? "bg-rose-500 text-white border-rose-500"
                              : "bg-white/60 border-pink-500/15 text-rose-900"
                          }`}
                        >
                          Photo #{idx + 1} 📁
                        </button>
                        <button
                          onClick={() => rotateSlot(idx)}
                          className="w-full py-1 px-1 rounded bg-purple-500/10 hover:bg-purple-500/20 text-purple-900 text-[9px] font-semibold border border-purple-500/20 cursor-pointer"
                        >
                          ↺ {slot.rotation}°
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Title & Stickers */}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={collageTitle}
                    onChange={(e) => setCollageTitle(e.target.value)}
                    maxLength={35}
                    className="w-full py-2 px-3 rounded-xl border border-pink-500/20 bg-white/50 text-rose-950 focus:outline-none focus:border-rose-500 text-sm font-romantic font-bold"
                    placeholder="Collage Header Title"
                  />

                  <div>
                    <label className="text-[10px] uppercase font-bold tracking-wider text-rose-800 block mb-1">
                      Stickers Overlay
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {availableStickers.map((st) => (
                        <button
                          key={st}
                          onClick={() => toggleSticker(st)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border transition-all cursor-pointer ${
                            selectedStickers.includes(st)
                              ? "bg-pink-500/20 border-pink-500 scale-110"
                              : "bg-white/40 border-pink-500/10 hover:bg-white/70"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="pt-2">
            {activeTab === "polaroid" ? (
              <button
                onClick={handleDownloadSingle}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>💾</span>
                <span>{isProcessing ? "Processing..." : "Download Single Polaroid"}</span>
              </button>
            ) : (
              <button
                onClick={handleDownloadCollage}
                disabled={isProcessing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-sm tracking-wider uppercase shadow-lg hover:shadow-pink-500/20 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🎨</span>
                <span>{isProcessing ? "Generating..." : "Download Custom Collage"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Interactive Live Canvas Preview */}
        <div className="flex-1 bg-rose-50/40 p-5 sm:p-7 flex items-center justify-center min-h-[380px] md:min-h-0">
          {activeTab === "polaroid" ? (
            <div className="relative shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden border border-rose-900/5 max-w-[280px] sm:max-w-[320px]">
              <canvas
                ref={polaroidCanvasRef}
                width={800}
                height={960}
                className="w-full h-auto block bg-white"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-bold text-rose-800 uppercase tracking-widest">
                  Rendering Polaroid...
                </div>
              )}
            </div>
          ) : (
            <div className="relative shadow-[0_15px_40px_rgba(0,0,0,0.15)] rounded-lg overflow-hidden border border-rose-900/5 max-w-[300px] sm:max-w-[340px]">
              <canvas
                ref={collageCanvasRef}
                width={800}
                height={960}
                className="w-full h-auto block bg-white"
              />
              {isProcessing && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-xs font-bold text-rose-800 uppercase tracking-widest">
                  Building Collage...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
