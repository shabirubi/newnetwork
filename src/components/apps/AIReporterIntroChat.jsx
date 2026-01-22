import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader, MessageCircle, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AIReporterIntroChat({ preSelectedReporter = null, isOpen: externalIsOpen = null, onClose = null }) {
  const [isOpen, setIsOpen] = useState(externalIsOpen !== null ? externalIsOpen : false);
  const [selectedReporter, setSelectedReporter] = useState(preSelectedReporter || null);
  const [showIntro, setShowIntro] = useState(true);
  const [introVideo, setIntroVideo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Load cached intro video for reporter
  const getCachedIntroVideo = (reporterId) => {
    try {
      const cached = localStorage.getItem(`intro-video-${reporterId}`);
      return cached;
    } catch {
      return null;
    }
  };

  // Save cached intro video for reporter
  const cacheIntroVideo = (reporterId, videoUrl) => {
    try {
      localStorage.setItem(`intro-video-${reporterId}`, videoUrl);
      localStorage.setItem(`intro-video-${reporterId}-time`, new Date().getTime());
    } catch (e) {
      console.warn('Cache save failed:', e);
    }
  };

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-intro'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }),
    initialData: []
  });

  const pollForVideo = async (talkId, maxAttempts = 60) => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 2000));

      try {
        const response = await fetch(`https://api.d-id.com/talks/${talkId}`, {
          headers: {
            'accept': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.status === 'done' && data.result_url) {
            return data.result_url;
          }
          if (data.status === 'error') {
            throw new Error('Video generation failed');
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }
    throw new Error('Timeout waiting for video');
  };

  const generateIntroVideo = async (reporter) => {
    // Check cache first
    const cached = getCachedIntroVideo(reporter.id);
    if (cached) {
      setIntroVideo(cached);
      return;
    }

    setGeneratingVideo(true);
    toast.loading("יוצר וידאו הצגה, אנא המתן...", { id: 'intro-gen' });
    
    try {
      const introText = `שלום! אני ${reporter.name}, כתב/כתבת חדשות. אני מתמחה ב${reporter.specialty}. נשמח לדון איתך בכל נושא שמעניין אותך. בואו נשוחח!`;
      
      const response = await base44.functions.invoke('generateTalkingVideo', {
        text: introText,
        avatarUrl: reporter.image,
        gender: reporter.gender || 'male',
        voiceProvider: 'elevenlabs',
        backgroundType: 'dynamic',
        language: 'he'
      });

      let videoUrl = response.data?.video_url;

      // If we got a talk_id but no video_url yet, poll for it
      if (!videoUrl && response.data?.talk_id) {
        toast.loading("ממתין להכנת הוידאו...", { id: 'intro-gen' });
        videoUrl = await pollForVideo(response.data.talk_id);
      }

      if (videoUrl) {
        setIntroVideo(videoUrl);
        cacheIntroVideo(reporter.id, videoUrl);
        toast.success("וידאו ההצגה מוכן! 🎥", { id: 'intro-gen' });
      } else {
        throw new Error('לא התקבל URL של וידאו');
      }
    } catch (error) {
      console.error('Error generating intro video:', error);
      toast.error("לא הצלחנו ליצור וידאו. נסה שוב בעוד דקה.", { id: 'intro-gen' });
      setIntroVideo(null);
    } finally {
      setGeneratingVideo(false);
    }
  };

  useEffect(() => {
    if (preSelectedReporter) {
      setSelectedReporter(preSelectedReporter);
      setShowIntro(true);
      setIntroVideo(null);
      setMessages([]);
      generateIntroVideo(preSelectedReporter);
    }
  }, [preSelectedReporter]);

  const handleSelectReporter = async (reporter) => {
    setSelectedReporter(reporter);
    setShowIntro(true);
    setIntroVideo(null);
    setMessages([]);
    await generateIntroVideo(reporter);
  };

  const generateVoiceResponse = async (text) => {
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a short Hebrew audio script (max 30 words) based on this: ${text}`,
        add_context_from_internet: false
      });
      
      return response?.script || text;
    } catch (error) {
      return text;
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !selectedReporter) return;

    const userMsg = { id: Date.now(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setShowIntro(false);
    setInput("");
    setLoading(true);

    try {
      const response = await base44.functions.invoke('reporterAIChat', {
        message: input,
        reporterName: selectedReporter.name,
        reporterRole: selectedReporter.role,
        reporterSpecialty: selectedReporter.specialty,
      });

      const responseText = response.data.response;

      // Generate talking video response
      const videoResponse = await base44.functions.invoke('generateTalkingVideo', {
        text: responseText,
        avatarUrl: selectedReporter.image,
        gender: selectedReporter.gender || 'male',
        voiceProvider: 'elevenlabs',
        backgroundType: 'dynamic'
      });

      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        text: responseText,
        reporter: selectedReporter.name,
        videoUrl: videoResponse.data?.video_url
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-black via-[#E31E24] to-black text-white p-4 rounded-xl font-bold flex items-center gap-3 shadow-lg shadow-[#E31E24]/30"
      >
        <MessageCircle className="w-5 h-5" />
        צ'אט וידאו עם כתבים
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-black via-[#E31E24] to-black text-white p-4 flex justify-between items-center">
                <h2 className="font-bold text-lg">צ'אט וידאו עם כתבים</h2>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    setSelectedReporter(null);
                    setShowIntro(true);
                    setIntroVideo(null);
                    setMessages([]);
                    if (onClose) onClose();
                  }}
                  className="hover:bg-white/20 p-2 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto flex flex-col">
                {!selectedReporter ? (
                  // Reporters List
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-sm mb-3 dark:text-white">בחר כתב/כתבת:</h3>
                    {reporters.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => handleSelectReporter(r)}
                        className="w-full text-left p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-3"
                      >
                        <img src={r.image} alt={r.name} className="w-10 h-10 rounded-full object-cover" />
                        <div className="flex-1">
                          <p className="font-bold text-sm dark:text-white">{r.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{r.specialty}</p>
                        </div>
                        <Play className="w-4 h-4 text-indigo-600" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col h-full p-4">
                    {/* Intro Video Section */}
                    {showIntro && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4"
                      >
                        <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                           {introVideo ? (
                             <video
                               ref={videoRef}
                               src={introVideo}
                               autoPlay
                               controls
                               onError={(e) => {
                                 console.error('Video load error:', e);
                                 toast.error("שגיאה בטעינת הוידאו");
                               }}
                               onLoadStart={() => toast.loading("טוען וידאו...", { id: 'video-load' })}
                               onCanPlay={() => toast.dismiss('video-load')}
                               className="w-full h-full object-cover"
                             />
                           ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-800 to-gray-900">
                               <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-[#E31E24]">
                                 <img 
                                   src={selectedReporter.image} 
                                   alt={selectedReporter.name}
                                   className="w-full h-full object-cover"
                                 />
                               </div>
                               {generatingVideo ? (
                                 <div className="flex flex-col items-center gap-2">
                                   <Loader className="w-5 h-5 animate-spin text-[#E31E24]" />
                                   <p className="text-white text-sm">יוצר וידאו הצגה... זה מעט זמן ⏳</p>
                                 </div>
                               ) : (
                                 <div className="flex flex-col items-center gap-3">
                                   <p className="text-gray-400 text-sm text-center">וידאו לא נטען</p>
                                   <button
                                     onClick={() => generateIntroVideo(selectedReporter)}
                                     className="px-4 py-2 bg-[#E31E24] text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                                   >
                                     🔄 נסה שוב
                                   </button>
                                 </div>
                               )}
                             </div>
                           )}
                         </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
                          {selectedReporter.name} מציג/ה את עצמו/ה
                        </p>
                      </motion.div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                      {messages.map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className="max-w-xs">
                            {msg.role === 'assistant' && msg.videoUrl && (
                              <div className="mb-2 rounded-lg overflow-hidden bg-gray-900">
                                <video
                                  src={msg.videoUrl}
                                  controls
                                  autoPlay
                                  className="w-full h-auto max-h-48 object-cover"
                                />
                              </div>
                            )}
                            <div className={`px-4 py-2 rounded-lg ${
                              msg.role === 'user'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
                            }`}>
                              <p className="text-sm">{msg.text}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Input */}
                    <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex gap-2">
                        <Input
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="שלח הודעה..."
                          disabled={loading}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={loading || !input.trim()}
                          className="bg-indigo-600 hover:bg-indigo-700"
                          size="icon"
                        >
                          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                      </div>
                      {!preSelectedReporter && (
                        <button
                          onClick={() => {
                            setSelectedReporter(null);
                            setShowIntro(true);
                            setIntroVideo(null);
                            setMessages([]);
                          }}
                          className="text-xs text-gray-600 dark:text-gray-400 hover:text-indigo-600"
                        >
                          ← בחר כתב/כתבת אחר
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}