import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, ChevronUp, ChevronDown, MessageCircle, 
  Video, Send, Mic, Phone, PhoneOff, Volume2, VolumeX
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ReportersTikTokModal({ isOpen, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [message, setMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const queryClient = useQueryClient();

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const { data: userInfo } = useQuery({
    queryKey: ['user-info'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    }
  });

  const createChatMutation = useMutation({
    mutationFn: (data) => base44.entities.ReporterChat.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['reporter-chats']);
      setMessage("");
    }
  });

  const currentReporter = reporters[currentIndex];

  const handleNext = () => {
    if (currentIndex < reporters.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowChat(false);
      setShowVideo(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowChat(false);
      setShowVideo(false);
    }
  };

  const handleSendMessage = () => {
    if (!message.trim() || !currentReporter) return;

    createChatMutation.mutate({
      reporter_id: currentReporter.id,
      reporter_name: currentReporter.name,
      user_email: userInfo?.email || "guest@example.com",
      user_name: userInfo?.full_name || "אורח",
      message: message,
      sender_type: "user"
    });
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setShowChat(false);
      setShowVideo(false);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        handlePrev();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, reporters.length]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
        onClick={onClose}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-[10001] w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all"
        >
          <X size={20} />
        </button>

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 -mt-20 z-[10000] w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <ChevronUp size={24} />
          </button>
        )}

        {currentIndex < reporters.length - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 mt-20 z-[10000] w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-all"
          >
            <ChevronDown size={24} />
          </button>
        )}

        {/* Reporter Card Container */}
        <div 
          className="relative w-full max-w-md h-[80vh] sm:h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <AnimatePresence mode="wait">
            {currentReporter && (
              <motion.div
                key={currentReporter.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ duration: 0.3 }}
                className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl"
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={currentReporter.image}
                    alt={currentReporter.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </div>

                {/* Reporter Info */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <h2 className="text-3xl font-bold text-white">{currentReporter.name}</h2>
                    <p className="text-white/90 text-lg">{currentReporter.role}</p>
                    <p className="text-white/80 text-sm">{currentReporter.bio}</p>
                    
                    {/* Categories */}
                    <div className="flex flex-wrap gap-2">
                      {currentReporter.categories?.map((cat, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white text-xs font-bold bg-[length:200%_200%]"
                        >
                          {cat === 'breaking' && 'חדשות חמות'}
                          {cat === 'security' && 'ביטחון'}
                          {cat === 'economy' && 'כלכלה'}
                          {cat === 'politics' && 'פוליטיקה'}
                          {cat === 'technology' && 'טכנולוגיה'}
                          {cat === 'sports' && 'ספורט'}
                          {cat === 'entertainment' && 'בידור'}
                          {cat === 'world' && 'עולם'}
                          {cat === 'health' && 'בריאות'}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                      <Button
                        onClick={() => {
                          setShowChat(!showChat);
                          setShowVideo(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500 hover:from-blue-600 hover:via-cyan-600 hover:to-teal-600 text-white rounded-full py-6 text-lg font-bold shadow-lg shadow-cyan-500/50 bg-[length:200%_200%] transition-all"
                      >
                        <MessageCircle className="w-5 h-5 mr-2" />
                        צ'אט
                      </Button>
                      <Button
                        onClick={() => {
                          setShowVideo(!showVideo);
                          setShowChat(false);
                        }}
                        className="flex-1 bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 hover:from-red-600 hover:via-orange-600 hover:to-pink-600 text-white rounded-full py-6 text-lg font-bold shadow-lg shadow-pink-500/50 bg-[length:200%_200%] transition-all"
                      >
                        <Video className="w-5 h-5 mr-2" />
                        וידאו
                      </Button>
                    </div>
                  </motion.div>
                </div>

                {/* Chat Overlay */}
                <AnimatePresence>
                  {showChat && (
                    <motion.div
                      initial={{ x: "100%" }}
                      animate={{ x: 0 }}
                      exit={{ x: "100%" }}
                      transition={{ type: "spring", damping: 25 }}
                      className="absolute inset-0 bg-black/95 backdrop-blur-xl z-20"
                    >
                      <div className="flex flex-col h-full">
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={currentReporter.image}
                              alt={currentReporter.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h3 className="text-white font-bold">{currentReporter.name}</h3>
                              <p className="text-white/60 text-sm">פעיל/ה כעת</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowChat(false)}
                            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                          >
                            <X size={18} className="text-white" />
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                          <div className="flex justify-start">
                            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                              <p className="text-white text-sm">שלום! איך אני יכול/ה לעזור לך?</p>
                            </div>
                          </div>
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 border-t border-white/10">
                          <div className="flex gap-2">
                            <Textarea
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="כתוב/כתבי הודעה..."
                              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                            />
                            <div className="flex flex-col gap-2">
                              <Button
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 p-3"
                              >
                                <Send size={20} />
                              </Button>
                              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3">
                                <Mic size={20} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Call Overlay */}
                <AnimatePresence>
                  {showVideo && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="absolute inset-0 bg-black z-20 flex items-center justify-center"
                    >
                      <div className="relative w-full h-full">
                        {/* Video Feed */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center space-y-4">
                            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center animate-pulse">
                              <Video className="w-16 h-16 text-white" />
                            </div>
                            <p className="text-white text-xl font-bold">מתחבר/ת ל{currentReporter.name}...</p>
                            <p className="text-white/60">הצלצול מתחיל</p>
                          </div>
                        </div>

                        {/* Video Controls */}
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-4">
                          <button
                            onClick={() => setIsMuted(!isMuted)}
                            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                              isMuted 
                                ? 'bg-red-500 hover:bg-red-600' 
                                : 'bg-white/20 hover:bg-white/30'
                            }`}
                          >
                            {isMuted ? <VolumeX className="text-white" /> : <Volume2 className="text-white" />}
                          </button>
                          <button
                            onClick={() => setShowVideo(false)}
                            className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-all"
                          >
                            <PhoneOff className="text-white" />
                          </button>
                        </div>

                        {/* Close Button */}
                        <button
                          onClick={() => setShowVideo(false)}
                          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                        >
                          <X size={20} className="text-white" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress Indicator */}
          <div className="absolute top-4 right-4 z-[10000] flex flex-col gap-1">
            {reporters.map((_, idx) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all ${
                  idx === currentIndex 
                    ? 'w-8 bg-white' 
                    : 'w-4 bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}