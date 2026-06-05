import React, { useRef, useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Film, Clapperboard, Baby, Vote, Trophy, Heart, Globe, Cpu, Music, Star, X, Play, MessageCircle, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import VideoModalPortal from "./VideoModalPortal";

const categories = [
  { id: "all", label: "כל הסרטונים", icon: Film, color: "from-purple-500 to-pink-500", image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=300&fit=crop" },
  { id: "entertainment", label: "דרמה ובידור", icon: Clapperboard, color: "from-red-500 to-orange-500", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop" },
  { id: "kids", label: "ילדים", icon: Baby, color: "from-blue-500 to-cyan-500", image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop" },
  { id: "politics", label: "פוליטיקה", icon: Vote, color: "from-gray-600 to-gray-800", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=300&fit=crop" },
  { id: "sports", label: "ספורט", icon: Trophy, color: "from-green-500 to-emerald-500", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop" },
  { id: "health", label: "בריאות", icon: Heart, color: "from-pink-500 to-rose-500", image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=300&fit=crop" },
  { id: "world", label: "עולם", icon: Globe, color: "from-indigo-500 to-purple-500", image: "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=400&h=300&fit=crop" },
  { id: "technology", label: "טכנולוגיה", icon: Cpu, color: "from-cyan-500 to-blue-500", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop" },
  { id: "music", label: "מוזיקה", icon: Music, color: "from-yellow-500 to-orange-500", image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=300&fit=crop" },
  { id: "breaking", label: "חמות", icon: Star, color: "from-red-600 to-pink-600", image: "https://images.unsplash.com/photo-1495020689067-958852a7765e?w=400&h=300&fit=crop" },
  { id: "security", label: "ביטחון", icon: Film, color: "from-gray-700 to-gray-900", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop" },
  { id: "economy", label: "כלכלה", icon: Clapperboard, color: "from-emerald-600 to-green-700", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=300&fit=crop" },
  { id: "crime", label: "פלילים", icon: Film, color: "from-orange-600 to-red-700", image: "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?w=400&h=300&fit=crop" },
  { id: "education", label: "חינוך", icon: Baby, color: "from-blue-600 to-indigo-700", image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop" },
  { id: "culture", label: "תרבות", icon: Star, color: "from-purple-600 to-pink-700", image: "https://images.unsplash.com/photo-1499781350541-7783f6c6a0c8?w=400&h=300&fit=crop" },
  { id: "environment", label: "סביבה", icon: Globe, color: "from-green-600 to-teal-700", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop" },
  { id: "science", label: "מדע", icon: Cpu, color: "from-indigo-600 to-blue-700", image: "https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=400&h=300&fit=crop" },
  { id: "military", label: "צבא", icon: Film, color: "from-slate-700 to-gray-800", image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop" },
  { id: "law", label: "משפט", icon: Vote, color: "from-amber-600 to-yellow-700", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=300&fit=crop" },
  { id: "local", label: "מקומי", icon: Globe, color: "from-teal-500 to-cyan-600", image: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=400&h=300&fit=crop" }
];

export default function VideosCategoriesStrip() {
  const scrollRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [message, setMessage] = useState("");
  const [userName, setUserName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chat_username') || '';
    }
    return '';
  });
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();
  const videoContainerRef = useRef(null);



  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Load videos from localStorage or database
  // Reuse the shared "home-all-videos" cache — no extra API call
  const { data: allVideos = [] } = useQuery({
    queryKey: ['home-all-videos'],
    queryFn: () => base44.entities.UserVideo.list('-created_date', 30),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });

  const categoryVideos = React.useMemo(() => {
    const clean = allVideos.filter(v => {
      if (!v.video_url || v.feed === 'podcasts') return false;
      const t = (v.title || '').trim();
      return t && !/^[a-f0-9]{16,}$/i.test(t);
    }).map(v => ({
      id: v.id,
      title: v.title || 'סרטון ללא כותרת',
      video_url: v.video_url,
      thumbnail_url: v.thumbnail_url || v.video_url,
      created_date: v.created_date,
      views: v.views || 0,
      category: v.category || 'all'
    }));
    if (!selectedCategory || selectedCategory === 'all') return clean;
    return clean.filter(v => v.category === selectedCategory);
  }, [allVideos, selectedCategory]);



  const currentVideo = categoryVideos[currentVideoIndex];

  // Fetch comments for current video
  const { data: comments = [] } = useQuery({
    queryKey: ['video-comments', currentVideo?.id],
    queryFn: async () => {
      if (!currentVideo?.id) return [];
      return await base44.entities.VideoComment.filter({ video_id: currentVideo.id }, '-created_date', 100);
    },
    enabled: !!currentVideo?.id,
    staleTime: 30000,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData) => {
      return await base44.entities.VideoComment.create(messageData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-comments', currentVideo?.id] });
      setMessage("");
    },
  });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !currentVideo) return;

    let finalUserName = userName.trim();
    if (!finalUserName) {
      finalUserName = 'אורח' + Math.floor(Math.random() * 1000);
      setUserName(finalUserName);
      localStorage.setItem('chat_username', finalUserName);
    }

    sendMessageMutation.mutate({
      video_id: currentVideo.id,
      user_name: finalUserName,
      content: message.trim(),
      is_approved: true
    });
  };

  // Handle scroll for TikTok-style navigation
  const handleScroll = (e) => {
    const container = videoContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    const viewportHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / viewportHeight);

    if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < categoryVideos.length) {
      setCurrentVideoIndex(newIndex);
    }
  };

  // Hide body scroll when modal is open
  React.useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [selectedCategory]);

  React.useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  const itemWidth = 76; // px per item including gap
  const totalWidth = categories.length * itemWidth;

  return (
    <div className="relative bg-[#0a0a0a] border-b border-[#1a3a6b]/40 z-[34]" style={{ height: '72px' }}>
      {/* Static scrollable strip */}
      <div
        ref={scrollRef}
        className="h-full flex items-center gap-3 px-4 overflow-x-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentVideoIndex(0);
              }}
              className="flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              <div className="relative w-16 h-12 rounded-xl overflow-hidden border border-[#1565C0]/40 shadow-lg shadow-[#0057B8]/20">
                <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d2a5e]/90 via-[#0d2a5e]/30 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                  <Icon className="w-3.5 h-3.5 text-[#5ba3ff] mb-0.5 drop-shadow-lg" />
                  <p className="text-white font-bold text-[9px] text-center drop-shadow-lg leading-tight">
                    {cat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <VideoModalPortal
        isOpen={!!selectedCategory}
        onClose={() => {
          setSelectedCategory(null);
          setCurrentVideoIndex(0);
        }}
        videos={categoryVideos}
        currentVideoIndex={currentVideoIndex}
        onScroll={handleScroll}
      />
    </div>
  );
}