import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart } from "lucide-react";
import { createPortal } from "react-dom";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function getUserId() {
  let uid = localStorage.getItem("anon_uid");
  if (!uid) {
    uid = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem("anon_uid", uid);
  }
  return uid;
}

function LikeButton({ video }) {
  const qc = useQueryClient();
  const userId = getUserId();
  const [heartAnim, setHeartAnim] = useState(false);

  const { data: likesData } = useQuery({
    queryKey: ["video-likes", video.id],
    queryFn: () => base44.entities.VideoLike.filter({ video_id: video.id }),
    staleTime: 10000,
    enabled: !!video.id,
  });

  const totalLikes = likesData?.length ?? (video.likes ?? 0);
  const myLike = likesData?.find(l => l.user_identifier === userId);
  const liked = !!myLike;

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (myLike) {
        await base44.entities.VideoLike.delete(myLike.id);
      } else {
        await base44.entities.VideoLike.create({
          video_id: video.id,
          video_url: video.video_url,
          user_identifier: userId,
          is_liked: true,
        });
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["video-likes", video.id] }),
  });

  const handleLike = (e) => {
    e.stopPropagation();
    if (!liked) setHeartAnim(true);
    setTimeout(() => setHeartAnim(false), 700);
    likeMutation.mutate();
  };

  return (
    <button
      onClick={handleLike}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10 hover:bg-black/80 transition-all"
    >
      <motion.div whileTap={{ scale: 1.5 }}>
        <Heart className={`w-5 h-5 transition-all ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
      </motion.div>
      <span className={`text-sm font-bold ${liked ? 'text-red-400' : 'text-white'}`}>{totalLikes}</span>
    </button>
  );
}

export default function VideoModalPortal({
  isOpen,
  onClose,
  videos = [],
  currentVideoIndex,
  onScroll,
}) {
  const videoContainerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] bg-black"
          onClick={onClose}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-[100000] text-white hover:text-red-500 transition-colors bg-black/50 p-2 rounded-full backdrop-blur-sm"
          >
            <X className="w-8 h-8" />
          </button>

          {/* TikTok-Style Scrollable Videos */}
          <div
            ref={videoContainerRef}
            onScroll={onScroll}
            onClick={(e) => e.stopPropagation()}
            className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {videos.length > 0 ? (
              videos.map((video, index) => (
                <div
                  key={video.id}
                  className="h-screen w-screen snap-start snap-always flex items-center justify-center bg-black"
                >
                  {Math.abs(index - currentVideoIndex) <= 1 && (
                    <>
                      <video
                        src={video.video_url}
                        autoPlay={index === currentVideoIndex}
                        loop
                        playsInline
                        controls
                        className="h-full w-full object-contain"
                      />
                      {/* Like button overlay */}
                      <div className="absolute bottom-20 left-4 z-10">
                        <LikeButton video={video} />
                      </div>
                      {/* Title */}
                      {video.title && (
                        <div className="absolute bottom-6 right-4 left-20 pointer-events-none">
                          <p className="text-white font-bold text-sm line-clamp-2 drop-shadow-lg">{video.title}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="h-screen w-screen flex items-center justify-center bg-black">
                <p className="text-white text-xl">אין סרטונים זמינים</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}