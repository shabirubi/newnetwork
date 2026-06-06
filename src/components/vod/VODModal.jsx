import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Play, ChevronUp, ChevronDown, Crown, Tv } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function VODModal({ isOpen, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartRef = useRef(0);

    const { data: userVideos = [] } = useQuery({
        queryKey: ["vod-modal-videos"],
        queryFn: () => base44.entities.UserVideo.filter({ status: "ready" }, "-created_date", 30),
        enabled: isOpen,
        initialData: [],
    });

    const staticVideos = [
        { id: "yt-1", url: "https://www.youtube.com/embed/k7WPygB6GlI?autoplay=1&rel=0", title: "שידור חי" },
        { id: "yt-2", url: "https://www.youtube.com/embed/4miQnYCTdS8?autoplay=1&rel=0", title: "חדשות" },
        { id: "yt-3", url: "https://www.youtube.com/embed/2q9lcnXBicQ?autoplay=1&rel=0", title: "כתבות" },
    ];

    const allVideos = [
        ...staticVideos,
        ...userVideos.map(v => ({ id: v.id, url: v.video_url, title: v.title, thumb: v.thumbnail_url })),
    ];

    const current = allVideos[currentIndex] || allVideos[0];

    const handleTouchStart = (e) => { touchStartRef.current = e.touches[0].clientY; };
    const handleTouchEnd = (e) => {
        const diff = touchStartRef.current - e.changedTouches[0].clientY;
        if (Math.abs(diff) > 50) {
            if (diff > 0) setCurrentIndex(i => Math.min(allVideos.length - 1, i + 1));
            else setCurrentIndex(i => Math.max(0, i - 1));
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    dir="rtl"
                >
                    {/* Header */}
                    <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-4 py-3"
                        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.9), transparent)" }}>
                        <button onClick={onClose} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <span className="text-white font-bold text-sm">VOD פרמיום</span>
                        <div className="text-white/60 text-xs">{currentIndex + 1} / {allVideos.length}</div>
                    </div>

                    {/* Video */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current?.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -40 }}
                            transition={{ duration: 0.3 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            {current?.url ? (
                                <iframe
                                    src={current.url}
                                    className="w-full"
                                    style={{ height: "100svh" }}
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; encrypted-media"
                                />
                            ) : (
                                <div className="text-white text-center">
                                    <Tv className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                                    <p>אין סרטונים זמינים</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation arrows */}
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                            disabled={currentIndex === 0}
                            className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
                        >
                            <ChevronUp className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setCurrentIndex(i => Math.min(allVideos.length - 1, i + 1))}
                            disabled={currentIndex === allVideos.length - 1}
                            className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white disabled:opacity-30 transition-opacity"
                        >
                            <ChevronDown className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Title */}
                    {current?.title && (
                        <div className="absolute bottom-8 inset-x-4 z-10 text-center"
                            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)", borderRadius: 16, padding: "12px" }}>
                            <p className="text-white font-bold text-sm">{current.title}</p>
                        </div>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
}