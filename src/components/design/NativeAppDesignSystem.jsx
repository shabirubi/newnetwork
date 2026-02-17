import React from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Share2, Search, Home, Compass, Plus, Mail, User } from "lucide-react";

// Design System Colors
export const colors = {
  primary: "#0080FF",
  secondary: "#E31E24",
  background: "#000000",
  surface: "#1a1a1a",
  text: "#FFFFFF",
  textSecondary: "#A0A0A0",
  accent: "#00D4FF",
  success: "#00C853",
  warning: "#FFC107",
  error: "#E31E24"
};

// Native App Typography Component
export function NativeText({ variant = "body", className = "", ...props }) {
  const variants = {
    h1: "text-3xl sm:text-4xl font-black",
    h2: "text-2xl sm:text-3xl font-bold",
    h3: "text-xl font-bold",
    title: "text-lg font-bold",
    body: "text-base font-medium",
    caption: "text-sm font-medium",
    small: "text-xs font-regular"
  };

  return (
    <p className={`${variants[variant]} text-white ${className}`} {...props} />
  );
}

// Native Video Card Component
export function NativeVideoCard({ video, onClick, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-xl overflow-hidden"
    >
      {/* Video Container */}
      <div className="relative aspect-[9/16] bg-black">
        {/* Video/Thumbnail */}
        {video.thumbnail_url ? (
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <video
            src={video.video_url}
            className="w-full h-full object-cover"
            muted
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white">
            <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white fill-white ml-0.5" />
          </div>
        </div>

        {/* Number Badge */}
        <div className="absolute top-2 right-2 z-10">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <span className="text-sm sm:text-lg font-black text-white">{index + 1}</span>
          </div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black to-transparent">
          <p className="text-white font-bold text-xs sm:text-sm line-clamp-2">{video.title}</p>
          <div className="flex items-center gap-2 mt-2 text-[10px] sm:text-xs text-gray-300">
            <Eye className="w-3 h-3" />
            <span>{video.views || 0}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Native Bottom Tab Bar Component
export function NativeTabBar({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'home', label: 'בית', icon: Home },
    { id: 'search', label: 'חיפוש', icon: Search },
    { id: 'create', label: 'יצירה', icon: Plus },
    { id: 'inbox', label: 'הודעות', icon: Mail },
    { id: 'profile', label: 'פרופיל', icon: User }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 safe-area-inset-bottom">
      <div className="grid grid-cols-5 gap-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
                isActive
                  ? 'text-[#0080FF]'
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Native Header Component
export function NativeAppHeader({ title, subtitle, showBack = false, onBack }) {
  return (
    <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-gray-800/50 safe-area-inset-top">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        {showBack && (
          <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        <div className={showBack ? "" : "flex-1"}>
          <NativeText variant="title" className="line-clamp-1">
            {title}
          </NativeText>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Native Video Interaction Bar Component
export function NativeVideoInteractions({ video, onLike, onComment, onShare }) {
  const [liked, setLiked] = React.useState(false);

  return (
    <div className="flex items-center justify-around py-3 px-4 border-t border-gray-800 bg-black/80">
      <button
        onClick={() => {
          setLiked(!liked);
          onLike?.();
        }}
        className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors group"
      >
        <Heart
          className="w-6 h-6 group-active:scale-75 transition-transform"
          fill={liked ? "currentColor" : "none"}
        />
        <span className="text-xs font-bold">{video.likes || 0}</span>
      </button>

      <button
        onClick={onComment}
        className="flex items-center gap-2 text-gray-300 hover:text-blue-500 transition-colors group"
      >
        <MessageCircle className="w-6 h-6 group-active:scale-75 transition-transform" />
        <span className="text-xs font-bold">{video.comments || 0}</span>
      </button>

      <button
        onClick={onShare}
        className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors group"
      >
        <Share2 className="w-6 h-6 group-active:scale-75 transition-transform" />
        <span className="text-xs font-bold">שתף</span>
      </button>
    </div>
  );
}

// Native Feed Container Component
export function NativeFeedContainer({ children, pb = "pb-24" }) {
  return (
    <div className={`min-h-screen bg-black overflow-y-auto scrollbar-hide ${pb}`}>
      {children}
    </div>
  );
}

// Native Loading Skeleton
export function NativeLoadingSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 pb-24">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="aspect-[9/16] bg-gray-900 rounded-xl animate-pulse"
        />
      ))}
    </div>
  );
}