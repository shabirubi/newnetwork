import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Send, Mic, Video, VideoOff, MicOff, Phone, Loader, 
  Sparkles, Camera, MessageCircle, Users, Radio, Play, 
  Pause, Volume2, VolumeX, Settings, Share2, Download,
  User, Clock, AlertCircle, CheckCircle, Heart, Smile, ThumbsUp, Zap
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
  const [isTyping, setIsTyping] = useState(false);
  const [reporterStatus, setReporterStatus] = useState('online'); // online, typing, away
  const [callDuration, setCallDuration] = useState(0);
  const [messageReactions, setMessageReactions] = useState({});
  const [quickReplies, setQuickReplies] = useState([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pollAnswers, setPollAnswers] = useState({});
  const messagesEndRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingIntervalRef = useRef(null);
  const callTimerRef = useRef(null);

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

  // Call timer
  useEffect(() => {
    if (isCallActive) {
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    }
    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isCallActive]);

  const formatCallTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addReaction = (messageId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []), emoji]
    }));
  };

  const startChat = (reporter) => {
    setSelectedReporter(reporter);
    setMessages([]);
    setIsCallActive(true);
    setCallDuration(0);
    setReporterStatus('typing');
    
    // Generate quick replies based on specialty
    const replies = generateQuickReplies(reporter);
    setQuickReplies(replies);
    setShowQuickReplies(true);
    
    // Simulate connection
    toast.loading('מתחבר...', { id: 'connecting' });
    
    setTimeout(() => {
      toast.success(`התחברת ל${reporter.name}`, { id: 'connecting' });
      setReporterStatus('online');
      
      // Welcome message with typing effect
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages([
            {
              role: "system",
              content: `🎥 שיחת וידאו התחילה עם ${reporter.name}`,
              timestamp: new Date()
            },
            {
              role: "assistant",
              content: `שלום! אני ${reporter.name}, ${reporter.role}. אני כרגע ${reporter.specialty} ואני שמח/ה לעזור לך! מה מעניין אותך?`,
              timestamp: new Date(),
              location: `📍 ${reporter.specialty}`
            }
          ]);
        }, 1500);
      }, 500);
    }, 1000);
  };

  const generateQuickReplies = (reporter) => {
    const specialty = reporter.specialty.toLowerCase();
    const baseReplies = [
      { text: '📰 מה החדשות האחרונות?', icon: '📰' },
      { text: '🔥 יש משהו חם?', icon: '🔥' },
      { text: '💭 מה דעתך?', icon: '💭' }
    ];

    if (specialty.includes('ביטחון') || specialty.includes('צבא')) {
      return [
        ...baseReplies,
        { text: '🛡️ מה המצב הביטחוני?', icon: '🛡️' },
        { text: '📡 יש עדכונים מהשטח?', icon: '📡' }
      ];
    } else if (specialty.includes('כלכלה') || specialty.includes('עסקים')) {
      return [
        ...baseReplies,
        { text: '💰 מה קורה בשווקים?', icon: '💰' },
        { text: '📈 מה התחזיות?', icon: '📈' }
      ];
    } else if (specialty.includes('פוליטי') || specialty.includes('כנסת')) {
      return [
        ...baseReplies,
        { text: '🗳️ מה קורה בכנסת?', icon: '🗳️' },
        { text: '⚖️ מה עם החוק?', icon: '⚖️' }
      ];
    } else if (specialty.includes('ספורט')) {
      return [
        ...baseReplies,
        { text: '⚽ מה התוצאות?', icon: '⚽' },
        { text: '🏆 מי מוביל?', icon: '🏆' }
      ];
    }
    
    return baseReplies;
  };

  const generateSmartResponse = (userInput) => {
    const input = userInput.toLowerCase();
    const name = selectedReporter.name;
    const specialty = selectedReporter.specialty;
    const role = selectedReporter.role;
    
    // Contextual responses based on keywords
    if (input.includes('מה קורה') || input.includes('עדכון') || input.includes('מצב')) {
      return `היי! ${name} כאן מהשטח. כרגע אני ב${specialty} והמצב די דינמי. יש הרבה התפתחויות ואני עוקב/ת מקרוב. מה ספציפית מעניין אותך?`;
    }
    
    if (input.includes('מתי') || input.includes('זמן')) {
      return `שאלה מצוינת! כ${role} שעוקב/ת אחרי ${specialty}, אני יכול/ה לספר לך שההתפתחויות האחרונות מרתקות. הזמנים משתנים מהר, אבל אני כאן כדי לעדכן אותך בזמן אמת! 📡`;
    }
    
    if (input.includes('איך') || input.includes('למה')) {
      return `אהה, זו שאלה מורכבת! בתור ${role}, אני רואה את התמונה המלאה. ${specialty} זה תחום שדורש הבנה עמוקה, ואני אסביר לך בפירוט. יש לי מקורות בשטח שמספקים לי מידע עדכני! 🎯`;
    }
    
    if (input.includes('תודה') || input.includes('יפה')) {
      return `תמיד לשירותך! 😊 כ${name} אני כאן בשבילך. אם יש עוד שאלות על ${specialty} או כל נושא אחר - פשוט תשאל/י!`;
    }
    
    if (input.includes('חדשות') || input.includes('דיווח')) {
      return `בדיוק מה שאני עושה הכי טוב! 📰 אני ${name}, מומחה/ית ב${specialty}. יש לי דיווחים חמים מהשטח. תגיד/י לי, איזה היבט מעניין אותך?`;
    }
    
    if (input.includes('דעה') || input.includes('חושב')) {
      return `כ${role} עם ניסיון רב ב${specialty}, אני חושב/ת ש... למעשה, בואו אדבר מהשטח - המציאות מורכבת יותר ממה שנראה. יש לי זווית ייחודית על העניין! 💭`;
    }
    
    if (input.length < 10) {
      return `היי! ${name} פה 👋 מה שלומך? יש משהו ספציפי שאתה רוצה לשאול אותי על ${specialty}?`;
    }
    
    if (input.length > 100) {
      return `וואו, זו שאלה מקיפה! 📝 אני ${name} ואני מעריך/ה את העניין. בואו נפרק את זה: ${specialty} הוא תחום מורכב, ויש כאן כמה נקודות מעניינות שכדאי לדבר עליהן. מה הכי חשוב לך לדעת?`;
    }
    
    // Default varied responses
    const defaultResponses = [
      `${name} כאן מהשטח! 🎤 כ${role} אני עוקב/ת אחרי ${specialty} מקרוב. "${userInput}" - זו נקודה מעניינת מאוד! תן/תני לי להסביר את התמונה המלאה.`,
      `שלום! אני ${name}, מתמחה/ת ב${specialty}. שאלתך על "${userInput}" היא בדיוק מה שאני חוקר/ת השבוע. יש כאן הרבה שכבות! 🔍`,
      `היי! ${role} ${name} בשידור חי 📡 המידע שלי על ${specialty} מתעדכן כל הזמן. לגבי "${userInput}" - יש לי כמה תובנות חדשות מהשטח!`,
      `מה קורה! ${name} פה, דיווח/ת מ${specialty}. "${userInput}" זה בדיוק הנושא שהכי חם עכשיו! תיכף אני מסביר/ה לך מה קורה בפועל. 🔥`,
      `שלום שלום! כ${role}, אני ${name} ואני כאן כדי לתת לך את ההקשר המלא על ${specialty}. "${userInput}" - שאלה מצוינת! 💡`
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const sendMessage = async (text = null) => {
    const messageText = text || inputValue;
    if (!messageText.trim() || isLoading) return;

    const userMessage = { 
      role: "user", 
      content: messageText, 
      timestamp: new Date(),
      id: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);
    const userInput = messageText;
    setInputValue("");
    setShowQuickReplies(false);
    setIsLoading(true);
    setReporterStatus('typing');
    
    // Show typing indicator
    setIsTyping(true);

    // Variable delay for realism
    const delay = 800 + Math.random() * 1500 + (userInput.length * 20);
    
    setTimeout(() => {
      setIsTyping(false);
      const smartResponse = generateSmartResponse(userInput);
      
      // Decide if to add media/poll
      const rand = Math.random();
      const aiMessage = {
        role: "assistant",
        content: smartResponse,
        timestamp: new Date(),
        id: Date.now()
      };

      // Add image/video sometimes
      if (rand > 0.7) {
        aiMessage.media = {
          type: 'image',
          url: selectedReporter.image,
          caption: '📸 מהשטח עכשיו'
        };
      }

      // Add location update
      if (rand > 0.6 && rand <= 0.7) {
        aiMessage.location = `📍 ${selectedReporter.specialty}`;
      }
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setReporterStatus('online');
      
      // Sometimes send a poll
      if (Math.random() > 0.85) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const pollId = `poll-${Date.now()}`;
            setMessages(prev => [...prev, {
              role: "assistant",
              content: 'שאלה מהירה:',
              timestamp: new Date(),
              id: Date.now(),
              poll: {
                id: pollId,
                question: 'מה דעתך על ההתפתחויות האחרונות?',
                options: ['👍 חיובי', '👎 שלילי', '🤷 לא בטוח/ה']
              }
            }]);
          }, 1000);
        }, 2000);
      }
      
      // Random chance for follow-up
      else if (Math.random() > 0.7) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const followUps = [
              'יש לך עוד שאלות?',
              'רוצה שאני אפרט יותר?',
              'יש משהו ספציפי שמעניין אותך?',
              'אני כאן אם צריך הבהרות נוספות!'
            ];
            setMessages(prev => [...prev, {
              role: "assistant",
              content: followUps[Math.floor(Math.random() * followUps.length)],
              timestamp: new Date(),
              id: Date.now()
            }]);
          }, 800);
        }, 2000);
      }
    }, delay);
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const handlePollVote = (pollId, option) => {
    setPollAnswers(prev => ({ ...prev, [pollId]: option }));
    toast.success('תשובתך נרשמה!');
    
    // Reporter acknowledges
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `תודה על התשובה! ${option === '👍 חיובי' ? 'שמח לשמוע!' : option === '👎 שלילי' ? 'אני מבין את דעתך.' : 'כן, זה מורכב.'}`,
          timestamp: new Date(),
          id: Date.now()
        }]);
      }, 800);
    }, 500);
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
      isVoice: true,
      id: Date.now()
      };
      setMessages(prev => [...prev, userMessage]);
      stream.getTracks().forEach(track => track.stop());
      toast.success("הקלטה נשמרה");

      // AI responds to voice
      setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
      role: "assistant",
      content: `קיבלתי את ההודעה הקולית! ${selectedReporter.name} כאן - תודה על השיתוף. אשמח לענות לך! 🎧`,
      timestamp: new Date(),
      id: Date.now()
      }]);
      }, 1200);
      }, 500);
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
                    <div className="relative">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#E31E24]">
                        <img
                          src={selectedReporter.image}
                          alt={selectedReporter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black ${
                          reporterStatus === 'online' ? 'bg-green-500' : 
                          reporterStatus === 'typing' ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold">{selectedReporter.name}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-400">{selectedReporter.specialty}</p>
                        {reporterStatus === 'typing' && (
                          <span className="text-xs text-yellow-400 animate-pulse">מקליד/ה...</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCallActive && (
                      <>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-600/20 rounded-full">
                          <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                          <span className="text-sm font-bold text-red-500">{formatCallTime(callDuration)}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-600/20 rounded-full">
                          <div className="flex gap-0.5">
                            <motion.div 
                              animate={{ scaleY: [1, 1.5, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                              className="w-0.5 h-2 bg-green-500 rounded-full"
                            />
                            <motion.div 
                              animate={{ scaleY: [1, 1.8, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
                              className="w-0.5 h-2 bg-green-500 rounded-full"
                            />
                            <motion.div 
                              animate={{ scaleY: [1, 1.3, 1] }}
                              transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
                              className="w-0.5 h-2 bg-green-500 rounded-full"
                            />
                          </div>
                        </div>
                      </>
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
                    key={message.id || idx}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className={`flex gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <motion.div 
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 0.5 }}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] flex-shrink-0"
                      >
                        <img
                          src={selectedReporter.image}
                          alt={selectedReporter.name}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    )}
                    {message.role === "system" && (
                      <div className="w-full flex justify-center">
                        <div className="px-4 py-2 bg-gray-800/50 rounded-full text-xs text-gray-400 border border-gray-700">
                          {message.content}
                        </div>
                      </div>
                    )}
                    {message.role !== "system" && (
                      <div className="flex-1">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className={`max-w-[75%] px-4 py-3 rounded-2xl ${
                            message.role === "user"
                              ? "bg-gradient-to-r from-[#E31E24] to-purple-600 text-white ml-auto"
                              : "bg-gray-800 text-white border border-gray-700"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>

                          {/* Media Attachment */}
                          {message.media && (
                           <div className="mt-3 rounded-lg overflow-hidden border-2 border-gray-700">
                             <img 
                               src={message.media.url} 
                               alt={message.media.caption}
                               className="w-full h-48 object-cover"
                             />
                             <div className="bg-gray-900/50 px-3 py-2">
                               <p className="text-xs text-gray-300">{message.media.caption}</p>
                             </div>
                           </div>
                          )}

                          {/* Location */}
                          {message.location && (
                           <div className="mt-2 flex items-center gap-2 text-xs text-gray-300 bg-gray-900/50 rounded-lg px-3 py-2">
                             <span>{message.location}</span>
                           </div>
                          )}

                          {/* Poll */}
                          {message.poll && (
                           <div className="mt-3 space-y-2">
                             <p className="text-sm font-bold">{message.poll.question}</p>
                             <div className="space-y-1">
                               {message.poll.options.map((option, i) => (
                                 <button
                                   key={i}
                                   onClick={() => handlePollVote(message.poll.id, option)}
                                   disabled={!!pollAnswers[message.poll.id]}
                                   className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                     pollAnswers[message.poll.id] === option
                                       ? 'bg-[#E31E24] text-white'
                                       : pollAnswers[message.poll.id]
                                       ? 'bg-gray-700 text-gray-400'
                                       : 'bg-gray-700 hover:bg-gray-600 text-white'
                                   }`}
                                 >
                                   {option}
                                 </button>
                               ))}
                             </div>
                           </div>
                          )}

                          <div className="flex items-center justify-between mt-2 gap-2">
                           <p className="text-xs opacity-70">
                             {moment(message.timestamp).format("HH:mm")}
                           </p>
                           <div className="flex items-center gap-2">
                             {message.role === "user" && (
                               <CheckCircle className="w-3 h-3 text-white/70" />
                             )}
                             {message.role === "assistant" && (
                               <div className="flex gap-1">
                                 {['👍', '❤️', '😊', '🔥'].map(emoji => (
                                   <button
                                     key={emoji}
                                     onClick={() => addReaction(message.id, emoji)}
                                     className="text-xs hover:scale-125 transition-transform opacity-0 group-hover:opacity-100"
                                   >
                                     {emoji}
                                   </button>
                                 ))}
                               </div>
                             )}
                           </div>
                          </div>
                          {messageReactions[message.id] && messageReactions[message.id].length > 0 && (
                           <div className="flex gap-1 mt-2">
                             {messageReactions[message.id].map((emoji, i) => (
                               <span key={i} className="text-xs">{emoji}</span>
                             ))}
                           </div>
                          )}
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                ))}
                
                {/* Typing Indicator */}
                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex gap-3"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24]">
                        <img
                          src={selectedReporter.image}
                          alt={selectedReporter.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="bg-gray-800 px-4 py-3 rounded-2xl border border-gray-700">
                        <div className="flex gap-1">
                          <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity }}
                            className="w-2 h-2 bg-[#E31E24] rounded-full"
                          />
                          <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                            className="w-2 h-2 bg-purple-500 rounded-full"
                          />
                          <motion.div 
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                            className="w-2 h-2 bg-[#E31E24] rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

              {/* Quick Replies */}
              {showQuickReplies && quickReplies.length > 0 && (
                <div className="px-4 pb-3 border-t border-gray-800 bg-gray-900">
                  <div className="flex items-center gap-2 mb-2 pt-3">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-gray-400">שאלות מוצעות:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply, idx) => (
                      <motion.button
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleQuickReply(reply.text)}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-[#E31E24] rounded-full text-xs transition-all"
                      >
                        {reply.text}
                      </motion.button>
                    ))}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    disabled={isLoading || isRecording}
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-[#E31E24] rounded-xl"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputValue.trim() || isRecording}
                    className="bg-gradient-to-r from-[#E31E24] to-purple-600 hover:from-[#B91C1C] hover:to-purple-700 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
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