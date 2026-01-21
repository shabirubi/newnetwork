import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Mic, Video, VideoOff, MicOff, Phone, Loader, 
  Sparkles, Camera, MessageCircle, Users, Radio, Play, 
  Pause, Volume2, VolumeX, Settings, Share2, Download,
  User, Clock, AlertCircle, CheckCircle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function ReporterStudio() {
  const [selectedReporter, setSelectedReporter] = useState(() => {
    const saved = localStorage.getItem('selectedReporter');
    return saved ? JSON.parse(saved) : null;
  });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isCallActive, setIsCallActive] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-studio'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }, 'name', 50),
    initialData: []
  });

  useEffect(() => {
    if (selectedReporter) {
      localStorage.setItem('selectedReporter', JSON.stringify(selectedReporter));
    }
  }, [selectedReporter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  const startChat = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([
      {
        role: "assistant",
        content: `שלום! אני ${reporter.name}, ${reporter.role}. אני מתמחה ב${reporter.specialty}. איך אני יכול/ה לעזור לך היום?`,
        timestamp: new Date()
      }
    ]);
    setIsCallActive(true);
    toast.success(`התחברת לשיחה עם ${reporter.name}`);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: "user", content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responses = [
        `תודה על השאלה! כ${selectedReporter.name}, אני מתמחה ב${selectedReporter.specialty}. ${userInput.includes('?') ? 'זו שאלה מעניינת מאוד' : 'אני שמח/ה לעזור'}. המצב בשטח דינמי ומתפתח.`,
        `שלום! אני ${selectedReporter.name} ומדווח/ת מ${selectedReporter.specialty}. ${userInput.length > 50 ? 'זו שאלה מקיפה' : 'תודה על ההודעה'}. אני עוקב/ת אחר האירועים באופן צמוד.`,
        `היי! כ${selectedReporter.role}, אני יכול/ה להגיד לך ש${selectedReporter.specialty} הוא תחום מרתק. ${userInput.toLowerCase().includes('מתי') ? 'ההתפתחויות צפויות בקרוב' : 'המידע מתעדכן כל הזמן'}.`,
        `${selectedReporter.name} כאן! מתמחה ב${selectedReporter.specialty}. ${userInput.toLowerCase().includes('איך') ? 'זה תהליך מורכב' : 'אני כאן לעדכן אותך'}. הצוות שלנו עובד סביב השעון.`,
        `תודה שפנית אליי! אני ${selectedReporter.name}, ${selectedReporter.role}. ${userInput.length < 20 ? 'אשמח לפרטים נוספים' : 'זו נקודה חשובה'}. נמשיך לעקוב ולדווח.`
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage = {
        role: "assistant",
        content: randomResponse,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500 + Math.random() * 1000);
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
          content: `🎤 הודעה קולית (${recordingTime} שניות)`, 
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, userMessage]);
        stream.getTracks().forEach(track => track.stop());
        toast.success("הקלטה נשמרה");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.info("מקליט...");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("שגיאה בהפעלת המיקרופון");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleVideo = () => {
    setVideoEnabled(!videoEnabled);
    toast.info(videoEnabled ? "מצלמה כובתה" : "מצלמה הופעלה");
  };

  const toggleAudio = () => {
    setAudioEnabled(!audioEnabled);
    toast.info(audioEnabled ? "מיקרופון כובה" : "מיקרופון הופעל");
  };

  const endCall = () => {
    localStorage.removeItem('selectedReporter');
    setSelectedReporter(null);
    setMessages([]);
    setIsCallActive(false);
    setVideoEnabled(true);
    setAudioEnabled(true);
    toast.info("השיחה הסתיימה");
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <AnimatePresence mode="wait">
        {!selectedReporter ? (
          // Reporters Selection Screen
          <motion.div
            key="selection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <div className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#E31E24] via-purple-600 to-[#E31E24] opacity-20 animate-pulse" />
              <div className="relative p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#E31E24]" />
                </motion.div>
                <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-[#E31E24] via-purple-400 to-[#E31E24] bg-clip-text text-transparent">
                  סטודיו הכתבים
                </h1>
                <p className="text-xl text-gray-300 mb-2">Digital Dreams Reporter Studio</p>
                <p className="text-gray-400">צ'אט מתקדם • וידאו • הקלטות קוליות • שיחות ישירות</p>
              </div>
            </div>

            {/* Reporters Grid */}
            <div className="flex-1 p-4 md:p-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-[#E31E24]" />
                    <h2 className="text-2xl font-bold">בחר כתב/כתבת ({reporters.length})</h2>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span>כולם זמינים כעת</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {reporters.map((reporter, index) => (
                    <motion.div
                      key={reporter.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startChat(reporter)}
                      className="relative group cursor-pointer"
                    >
                      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 group-hover:border-[#E31E24] transition-all shadow-xl">
                        {/* Image */}
                        <div className="aspect-[3/4] relative overflow-hidden">
                          <img
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                          
                          {/* Live Badge */}
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 px-2 py-1 bg-[#E31E24] rounded-full text-xs font-bold">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                              </span>
                              LIVE
                            </div>
                          </div>

                          {/* Info Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-bold text-lg mb-1 line-clamp-1">{reporter.name}</h3>
                            <p className="text-xs text-gray-300 mb-2 line-clamp-1">{reporter.role}</p>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-[#E31E24] to-purple-500 w-3/4"></div>
                              </div>
                              <span className="text-xs text-gray-400">זמין</span>
                            </div>
                            <button className="w-full py-2 bg-[#E31E24] hover:bg-[#B91C1C] rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 group-hover:bg-gradient-to-r group-hover:from-[#E31E24] group-hover:to-purple-600">
                              <MessageCircle className="w-4 h-4" />
                              התחל לצ'וט
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Specialty Badge */}
                      <div className="absolute -top-2 left-3 px-3 py-1 bg-gradient-to-r from-purple-600 to-[#E31E24] rounded-full text-xs font-bold shadow-lg">
                        {reporter.specialty}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Chat/Video Studio
          <motion.div
            key="studio"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex flex-col lg:flex-row bg-black"
          >
            {/* Video Section */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-900 to-black">
              {/* Video Feed */}
              <div className="absolute inset-0">
                {videoEnabled ? (
                  <div className="relative w-full h-full">
                    {/* Background Image */}
                    <img
                      src={selectedReporter.image}
                      alt={selectedReporter.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Small Profile Picture - Bottom Right */}
                    <div className="absolute bottom-24 right-8">
                      <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-24 h-24 rounded-full border-4 border-[#E31E24] overflow-hidden shadow-2xl"
                      >
                        <img
                          src={selectedReporter.image}
                          alt={selectedReporter.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>

                    {/* Reporter Info - Bottom Left */}
                    <div className="absolute bottom-24 left-8">
                      <h2 className="text-2xl font-bold mb-1 drop-shadow-lg">{selectedReporter.name}</h2>
                      <p className="text-gray-300 mb-2 drop-shadow-md">{selectedReporter.role}</p>
                      <div className="flex items-center gap-2 text-green-400">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
                        <span className="font-bold drop-shadow-md">בשיחה</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="text-center">
                      <VideoOff className="w-24 h-24 mx-auto mb-4 text-gray-600" />
                      <p className="text-gray-500">המצלמה כבויה</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Bar */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E31E24]">
                      <img
                        src={selectedReporter.image}
                        alt={selectedReporter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedReporter.name}</h3>
                      <p className="text-xs text-gray-400">{selectedReporter.specialty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCallActive && (
                      <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 rounded-full">
                        <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                        <span className="text-sm font-bold text-red-500">שיחה פעילה</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleAudio}
                    className={`p-4 rounded-full transition-all ${
                      audioEnabled 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {audioEnabled ? (
                      <Mic className="w-6 h-6" />
                    ) : (
                      <MicOff className="w-6 h-6" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-all ${
                      videoEnabled 
                        ? 'bg-gray-800 hover:bg-gray-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {videoEnabled ? (
                      <Video className="w-6 h-6" />
                    ) : (
                      <VideoOff className="w-6 h-6" />
                    )}
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={endCall}
                    className="p-5 rounded-full bg-red-600 hover:bg-red-700 transition-all"
                  >
                    <Phone className="w-7 h-7 transform rotate-[135deg]" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <Settings className="w-6 h-6" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="p-4 rounded-full bg-gray-800 hover:bg-gray-700"
                  >
                    <Share2 className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Chat Sidebar */}
            <div className="w-full lg:w-[450px] bg-gray-900 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-800">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-[#E31E24]/20 to-purple-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="w-5 h-5 text-[#E31E24]" />
                    <div>
                      <h3 className="font-bold">צ'אט עם {selectedReporter.name}</h3>
                      <p className="text-xs text-gray-400">{messages.length} הודעות</p>
                    </div>
                  </div>
                  <button
                    onClick={endCall}
                    className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-900 to-black">
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] flex-shrink-0">
                        <img
                          src={selectedReporter.image}
                          alt={selectedReporter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                        message.role === "user"
                          ? "bg-gradient-to-r from-[#E31E24] to-purple-600 text-white"
                          : "bg-gray-800 text-white border border-gray-700"
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs opacity-70">
                          {moment(message.timestamp).format("HH:mm")}
                        </p>
                        {message.role === "user" && (
                          <CheckCircle className="w-3 h-3 text-white/70" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24]">
                      <img
                        src={selectedReporter.image}
                        alt={selectedReporter.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-gray-800 px-4 py-3 rounded-2xl">
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

              {/* Recording Indicator */}
              {isRecording && (
                <div className="px-4 py-2 bg-red-600/20 border-t border-red-600/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-bold text-red-500">מקליט...</span>
                    </div>
                    <span className="text-sm font-mono text-red-500">{formatTime(recordingTime)}</span>
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-full flex-shrink-0 transition-all ${
                      isRecording 
                        ? 'bg-red-600 animate-pulse' 
                        : 'bg-gradient-to-r from-[#E31E24] to-purple-600 hover:from-[#B91C1C] hover:to-purple-700'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </motion.button>
                  <Input
                    type="text"
                    placeholder="כתוב הודעה..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#E31E24] rounded-xl"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-[#E31E24] to-purple-600 hover:from-[#B91C1C] hover:to-purple-700 px-4 rounded-xl"
                  >
                    {isLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}