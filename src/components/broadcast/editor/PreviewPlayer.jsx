import React, { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function PreviewPlayer({ videoUrl, overlays, videoMetadata }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const animate = () => {
      if (videoRef.current && canvasRef.current && isPlaying) {
        const ctx = canvasRef.current.getContext("2d");
        
        // Draw video
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);

        // Draw backgrounds
        overlays.backgrounds.forEach(bg => {
          if (currentTime >= bg.startTime && currentTime <= bg.endTime) {
            const img = new Image();
            img.src = bg.url;
            img.onload = () => {
              ctx.globalAlpha = bg.opacity;
              ctx.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
              ctx.globalAlpha = 1;
            };
          }
        });

        // Draw texts
        overlays.texts.forEach(text => {
          if (currentTime >= text.startTime && currentTime <= text.endTime) {
            const padding = 16;
            const lineHeight = text.fontSize * 1.2;
            const textWidth = ctx.measureText(text.content).width + padding * 2;
            
            let y = canvasRef.current.height * 0.5;
            if (text.position === "top") y = padding + text.fontSize;
            else if (text.position === "bottom") y = canvasRef.current.height - padding;

            let x = canvasRef.current.width * 0.5;
            if (text.alignment === "right") x = canvasRef.current.width - padding - textWidth / 2;
            else if (text.alignment === "left") x = padding + textWidth / 2;

            // Background
            ctx.fillStyle = text.backgroundColor + Math.round(text.bgOpacity * 255).toString(16).padStart(2, '0');
            ctx.fillRect(x - textWidth / 2, y - text.fontSize - padding / 2, textWidth, text.fontSize + padding);

            // Text
            ctx.fillStyle = text.color;
            ctx.font = `${text.fontSize}px Arial`;
            ctx.textAlign = "center";
            ctx.fillText(text.content, x, y);
          }
        });

        // Draw news strips
        overlays.newsStrips.forEach((strip, stripIdx) => {
          if (currentTime >= strip.startTime && currentTime <= strip.endTime) {
            const stripHeight = 40;
            const y = canvasRef.current.height - stripHeight;
            
            // Background
            ctx.fillStyle = strip.backgroundColor;
            ctx.fillRect(0, y, canvasRef.current.width, stripHeight);

            // Text animation
            const totalHeadlines = strip.headlines.length;
            const headlineWidth = canvasRef.current.width;
            const scrollPos = ((currentTime - strip.startTime) * strip.speed * 100) % (headlineWidth * 2);
            
            ctx.fillStyle = strip.textColor;
            ctx.font = "bold 16px Arial";
            ctx.textAlign = "left";
            
            strip.headlines.forEach((headline, idx) => {
              const x = canvasRef.current.width - scrollPos + idx * headlineWidth;
              ctx.fillText(` • ${headline} `, x, y + 25);
            });
          }
        });

        setCurrentTime(videoRef.current.currentTime);
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [isPlaying, currentTime, overlays, videoMetadata]);

  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center relative">
      <video
        ref={videoRef}
        src={videoUrl}
        className="hidden"
        onEnded={() => setIsPlaying(false)}
      />
      <canvas
        ref={canvasRef}
        width={videoMetadata?.width || 1280}
        height={videoMetadata?.height || 720}
        className="max-w-full max-h-full"
      />
    </div>
  );
}