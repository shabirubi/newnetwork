import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Mic, Video, VideoOff, MicOff, Phone, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function ReporterVideoChat({ reporter, isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    if (reporter && isOpen) {
      setMessages([
        {
          role: "assistant",
          content: `שלום! אני ${reporter.name}. אני כאן לשוחח איתך על ${reporter.specialty}. מה תרצה לדעת?`,
          timestamp: new Date()
        }
      ]);
    }
  }, [reporter, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const { data } = await base44.functions.invoke('reporterChat', {
        reporterName: reporter.name,
        reporterSpecialty: reporter.specialty,
        reporterCategories: reporter.categories?.join(', ') || 'כללי',
        reporterBio: reporter.bio,
        userMessage: inputValue
      });

      const aiMessage = {
        role: "assistant",
        content: data?.message || "סליחה, לא הצלחתי לטעון תשובה כעת.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const userMessage = { 
          role: "user", 
          content: "🎤 הודעה קולית נשלחה", 
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, userMessage]);
        
        stream.getTracks().forEach(track => track.stop());
        toast.success("הקלטה נשמרה בהצלחה");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("מקליט...");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("שגיאה בהקלטה");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVideo = async () => {
    if (!videoEnabled) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setVideoEnabled(true);
        toast.success("מצלמה הופעלה");
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        toast.error("לא ניתן להפעיל מצלמה");
      }
    } else {
      setVideoEnabled(false);
      toast.info("מצלמה כובתה");
    }
  };

  if (!isOpen || !reporter) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[300]"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl w-full max-w-7xl h-[95vh] flex flex-col overflow-hidden border-4 border-[#E31E24] shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 sm:p-6 flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <img
                src={reporter.image}
                alt={reporter.name}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover border-4 border-white/30"
              />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white">{reporter.name}</h2>
                <p className="text-white/90 text-xs sm:text-sm">{reporter.role} • {reporter.specialty}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400"></span>
                  </span>
                  <span className="text-green-200 text-xs font-bold">זמין עכשיו</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 sm:p-3 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Video Area */}
            <div className="lg:w-2/3 bg-black relative flex items-center justify-center">
              {videoEnabled ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <Video className="w-16 h-16 mx-auto mb-4 text-[#E31E24]" />
                    <p className="text-lg">שיחת וידאו פעילה</p>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <img
                    src={reporter.image}
                    alt={reporter.name}
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-full object-cover mx-auto mb-6 border-8 border-[#E31E24]/50"
                  />
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{reporter.name}</h3>
                  <p className="text-white/70">{reporter.specialty}</p>
                </div>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 sm:gap-4">
                <button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`p-3 sm:p-4 rounded-full transition-all ${
                    audioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {audioEnabled ? (
                    <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>

                <button
                  onClick={toggleVideo}
                  className={`p-3 sm:p-4 rounded-full transition-all ${
                    videoEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {videoEnabled ? (
                    <Video className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </button>

                <button
                  onClick={onClose}
                  className="p-3 sm:p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
                >
                  <Phone className="w-5 h-5 sm:w-6 sm:h-6 text-white transform rotate-[135deg]" />
                </button>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="lg:w-1/3 bg-gray-900 flex flex-col border-t lg:border-t-0 lg:border-r border-[#E31E24]/30">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <img
                        src={reporter.image}
                        alt={reporter.name}
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                        message.role === "user"
                          ? "bg-[#E31E24] text-white"
                          : "bg-gray-700 text-white"
                      }`}
                    >
                      <p className="leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {moment(message.timestamp).format("HH:mm")}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-2">
                    <img
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="bg-gray-700 px-3 py-2 rounded-2xl">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-2 sm:p-3 rounded-full transition-all flex-shrink-0 ${
                      isRecording 
                        ? 'bg-red-600 animate-pulse' 
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </button>
                  <Input
                    type="text"
                    placeholder="שלח הודעה..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                    className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-[#E31E24] hover:bg-[#B91C1C] px-3 sm:px-4 flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}