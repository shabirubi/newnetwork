import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader, User, Sparkles, Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";

export default function ReporterChat({ externalIsOpen, externalSetIsOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const openState = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setOpenState = externalSetIsOpen || setIsOpen;
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters-chat'],
    queryFn: () => base44.entities.Reporter.filter({ is_active: true }, 'name', 20),
    initialData: []
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedReporter || isLoading) return;

    const userMessage = { role: "user", content: inputValue, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const userInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        `תודה על השאלה! כ${selectedReporter.name}, אני מתמחה ב${selectedReporter.specialty}. ${userInput.includes('?') ? 'זו שאלה מעניינת מאוד' : 'אני שמח/ה לעזור'}. המצב בשטח דינמי ומתפתח.`,
        `שלום! אני ${selectedReporter.name} ומדווח/ת מ${selectedReporter.specialty}. ${userInput.length > 50 ? 'זו שאלה מקיפה' : 'תודה על ההודעה'}. אני עוקב/ת אחר האירועים באופן צמוד.`,
        `היי! כ${selectedReporter.role}, אני יכול/ה להגיד לך ש${selectedReporter.specialty} הוא תחום מרתק. ${userInput.toLowerCase().includes('מתי') ? 'ההתפתחויות צפויות בקרוב' : 'המידע מתעדכן כל הזמן'}.`,
        `${selectedReporter.name} כאן! מתמחה ב${selectedReporter.specialty}. ${userInput.toLowerCase().includes('איך') ? 'זה תהליך מורכב' : 'אני כאן לעדכן אותך'}. הצוות שלנו עובד סביב השעון.`
      ];
      
      const aiMessage = {
        role: "assistant",
        content: responses[Math.floor(Math.random() * responses.length)],
        reporter: selectedReporter.name,
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

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const voiceMessage = {
          role: "user",
          content: "🎤 הודעה קולית",
          audioUrl: audioUrl,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, voiceMessage]);
        
        // Auto-reply
        setTimeout(() => {
          const aiMessage = {
            role: "assistant",
            content: `קיבלתי את ההודעה הקולית שלך! כ${selectedReporter.name}, אני מקשיב/ה ומגיב/ה. תודה על השיתוף.`,
            reporter: selectedReporter.name,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiMessage]);
        }, 2000);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("הקלטה התחילה");
    } catch (error) {
      console.error('Recording error:', error);
      toast.error("שגיאה בהפעלת המיקרופון");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("ההקלטה הסתיימה");
    }
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      setIsVideoCall(true);
      toast.success("שיחת וידאו התחילה");

      // Simulate reporter joining
      setTimeout(() => {
        toast.success(`${selectedReporter.name} הצטרף/ה לשיחה`);
      }, 2000);
    } catch (error) {
      console.error('Video call error:', error);
      toast.error("שגיאה בהפעלת המצלמה");
    }
  };

  const endVideoCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setIsVideoCall(false);
    setIsAudioMuted(false);
    setIsVideoMuted(false);
    toast.success("שיחת הוידאו הסתיימה");
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoMuted(!videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startNewChat = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([
      {
        role: "assistant",
        content: `שלום! אני ${reporter.name}, כתב/כתבת חדשות. אני כאן לדיון עם מומחיות ב-${reporter.specialty}. מה תרצה לדעת?`,
        reporter: reporter.name,
        timestamp: new Date()
      }
    ]);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setOpenState(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 relative">
            <MessageCircle className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">צ'אט כתבים חכם</h3>
            <p className="text-indigo-100">שוחח עם כתבים מומחים</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          קבל תשובות ממחקרים אמיתיים של כתבים
        </p>
      </motion.div>

      <AnimatePresence>
        {openState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setOpenState(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  <div>
                    <h2 className="text-2xl font-bold">צ'אט כתבים</h2>
                    {selectedReporter && (
                      <p className="text-indigo-200 text-sm">עם {selectedReporter.name}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setOpenState(false);
                    setSelectedReporter(null);
                    setMessages([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex overflow-hidden">
                {!selectedReporter ? (
                  // Reporters List
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full overflow-y-auto p-6 space-y-3"
                  >
                    <h3 className="text-xl font-bold dark:text-white mb-4">בחר כתב/כתבת</h3>
                    {reporters.map((reporter) => (
                      <motion.button
                        key={reporter.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startNewChat(reporter)}
                        className="w-full text-left p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-start gap-4">
                          <img
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold dark:text-white">{reporter.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{reporter.role}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              {reporter.specialty}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-green-600 dark:text-green-400">● זמין</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  // Chat Window
                  <div className="w-full flex flex-col">
                    {/* Video Call Area */}
                    {isVideoCall && (
                      <div className="relative bg-black aspect-video">
                        {/* Remote Video (Reporter) - Simulated */}
                        <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                          <div className="text-center">
                            <img
                              src={selectedReporter.image}
                              alt={selectedReporter.name}
                              className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-green-500"
                            />
                            <p className="text-white text-xl font-bold">{selectedReporter.name}</p>
                            <p className="text-green-400 text-sm">● מחובר/ת</p>
                          </div>
                        </div>

                        {/* Local Video (User) */}
                        <div className="absolute bottom-4 right-4 w-32 h-24 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
                          <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Call Controls */}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
                          <Button
                            onClick={toggleAudio}
                            variant={isAudioMuted ? "destructive" : "secondary"}
                            size="icon"
                            className="rounded-full w-12 h-12"
                          >
                            {isAudioMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                          </Button>
                          <Button
                            onClick={toggleVideo}
                            variant={isVideoMuted ? "destructive" : "secondary"}
                            size="icon"
                            className="rounded-full w-12 h-12"
                          >
                            {isVideoMuted ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                          </Button>
                          <Button
                            onClick={endVideoCall}
                            variant="destructive"
                            size="icon"
                            className="rounded-full w-12 h-12"
                          >
                            <PhoneOff className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                      {messages.map((message, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex gap-3 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <img
                              src={selectedReporter.image}
                              alt={selectedReporter.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                              message.role === "user"
                                ? "bg-indigo-600 text-white"
                                : "bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            {message.audioUrl && (
                              <audio controls className="mt-2 w-full">
                                <source src={message.audioUrl} type="audio/webm" />
                              </audio>
                            )}
                            <p
                              className={`text-xs mt-2 ${
                                message.role === "user"
                                  ? "text-indigo-100"
                                  : "text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {moment(message.timestamp).format("HH:mm")}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <img
                            src={selectedReporter.image}
                            alt={selectedReporter.name}
                            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl">
                            <div className="flex gap-2">
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
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                      <div className="flex gap-2 mb-3">
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          variant={isRecording ? "destructive" : "outline"}
                          size="icon"
                          className={isRecording ? "animate-pulse" : ""}
                        >
                          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button
                          onClick={isVideoCall ? endVideoCall : startVideoCall}
                          variant={isVideoCall ? "destructive" : "outline"}
                          size="icon"
                        >
                          {isVideoCall ? <PhoneOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                        </Button>
                      </div>
                      <div className="flex gap-3">
                        <Input
                          type="text"
                          placeholder="שאל שאלה..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                          disabled={isLoading || isRecording}
                          className="flex-1"
                        />
                        <Button
                          onClick={sendMessage}
                          disabled={isLoading || !inputValue.trim() || isRecording}
                          className="bg-indigo-600 hover:bg-indigo-700 px-4"
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
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}