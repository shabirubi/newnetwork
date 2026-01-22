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
  const [quickReplies, setQuickReplies] = useState([]);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pollAnswers, setPollAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [reporterStatus, setReporterStatus] = useState('online');
  const [messageReactions, setMessageReactions] = useState({});
  const [recordingTime, setRecordingTime] = useState(0);
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('userChatProfile');
    return saved ? JSON.parse(saved) : {
      preferredTopics: {},
      depthLevel: 'medium',
      tonePreference: 'balanced',
      interactionCount: 0,
      avgMessageLength: 0,
      questionFrequency: 0,
      lastInteraction: null
    };
  });
  const messagesEndRef = useRef(null);
  const recordingIntervalRef = useRef(null);
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

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    };
  }, [isRecording]);

  const generateQuickReplies = (reporter) => {
    const specialty = reporter.specialty?.toLowerCase() || '';
    const baseReplies = [
      { text: '📰 מה החדשות האחרונות?' },
      { text: '🔥 יש משהו חם?' },
      { text: '💭 מה דעתך?' }
    ];

    if (specialty.includes('ביטחון') || specialty.includes('צבא')) {
      return [...baseReplies, { text: '🛡️ מה המצב הביטחוני?' }, { text: '📡 עדכונים מהשטח?' }];
    } else if (specialty.includes('כלכלה') || specialty.includes('עסקים')) {
      return [...baseReplies, { text: '💰 מה קורה בשווקים?' }, { text: '📈 מה התחזיות?' }];
    } else if (specialty.includes('ספורט')) {
      return [...baseReplies, { text: '⚽ מה התוצאות?' }, { text: '🏆 מי מוביל?' }];
    }
    return baseReplies;
  };

  const handleQuickReply = (text) => {
    sendMessage(text);
  };

  const addReaction = (messageIdx, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageIdx]: [...(prev[messageIdx] || []), emoji]
    }));
  };

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const updateUserProfile = (userMessage) => {
    const newProfile = { ...userProfile };
    
    // עדכון מספר אינטראקציות
    newProfile.interactionCount += 1;
    newProfile.lastInteraction = new Date().toISOString();
    
    // חישוב אורך ממוצע של הודעות
    const currentAvg = newProfile.avgMessageLength;
    newProfile.avgMessageLength = (currentAvg * (newProfile.interactionCount - 1) + userMessage.length) / newProfile.interactionCount;
    
    // זיהוי רמת עומק
    if (newProfile.avgMessageLength > 80) {
      newProfile.depthLevel = 'deep';
    } else if (newProfile.avgMessageLength > 40) {
      newProfile.depthLevel = 'medium';
    } else {
      newProfile.depthLevel = 'casual';
    }
    
    // זיהוי שאלות
    if (userMessage.includes('?') || userMessage.includes('מה') || userMessage.includes('איך') || userMessage.includes('למה')) {
      newProfile.questionFrequency += 1;
    }
    
    // זיהוי טון
    const informalWords = ['מה קורה', 'וואו', 'אחלה', 'יאללה', 'בטוח', 'סבבה'];
    const formalWords = ['בבקשה', 'האם', 'נראה לי', 'אני סבור', 'תודה רבה'];
    const informal = informalWords.some(w => userMessage.toLowerCase().includes(w));
    const formal = formalWords.some(w => userMessage.toLowerCase().includes(w));
    
    if (informal && !formal) newProfile.tonePreference = 'casual';
    else if (formal && !informal) newProfile.tonePreference = 'formal';
    else newProfile.tonePreference = 'balanced';
    
    // זיהוי נושאים מועדפים
    const topics = {
      'ביטחון': ['ביטחון', 'צבא', 'מלחמה', 'טרור', 'צה"ל'],
      'כלכלה': ['כלכלה', 'שוק', 'מניות', 'דולר', 'כסף', 'משכורת'],
      'פוליטיקה': ['ממשלה', 'כנסת', 'בחירות', 'שר', 'ראש ממשלה'],
      'טכנולוגיה': ['טכנולוגיה', 'סטארטאפ', 'הייטק', 'בינה מלאכותית', 'AI'],
      'ספורט': ['ספורט', 'כדורגל', 'ליגה', 'מכבי', 'הפועל']
    };
    
    Object.keys(topics).forEach(topic => {
      const keywords = topics[topic];
      if (keywords.some(k => userMessage.toLowerCase().includes(k))) {
        newProfile.preferredTopics[topic] = (newProfile.preferredTopics[topic] || 0) + 1;
      }
    });
    
    setUserProfile(newProfile);
    localStorage.setItem('userChatProfile', JSON.stringify(newProfile));
  };

  const getPersonalizedIntro = () => {
    if (userProfile.interactionCount < 3) return '';
    
    const topTopic = Object.keys(userProfile.preferredTopics).reduce((a, b) => 
      userProfile.preferredTopics[a] > userProfile.preferredTopics[b] ? a : b, 
      Object.keys(userProfile.preferredTopics)[0]
    );
    
    if (topTopic && userProfile.preferredTopics[topTopic] >= 2) {
      const intros = [
        `בהתאם למה שאני מכיר אותך, `,
        `אני רואה שמעניין אותך ${topTopic}, אז `,
        `אני יודע ש${topTopic} חשוב לך, לכן `
      ];
      return intros[Math.floor(Math.random() * intros.length)];
    }
    return '';
  };

  const adaptResponseStyle = (baseResponse) => {
    let adapted = baseResponse;
    
    // התאמה לטון
    if (userProfile.tonePreference === 'casual') {
      adapted = adapted.replace('שלום!', 'מה קורה!');
      adapted = adapted.replace('תודה רבה', 'תודה!');
      adapted = adapted.replace('אני מעריך', 'זה אחלה');
    } else if (userProfile.tonePreference === 'formal') {
      adapted = adapted.replace('היי!', 'שלום,');
      adapted = adapted.replace('מה קורה', 'מה המצב');
      adapted = adapted.replace('וואו', 'מרשים');
    }
    
    // התאמה לרמת עומק
    if (userProfile.depthLevel === 'deep' && Math.random() > 0.5) {
      const deepAdditions = [
        ' יש כאן הרבה היבטים שכדאי לדבר עליהם.',
        ' בואו נעמיק בנושא הזה.',
        ' זה מעלה שאלות מעניינות על התמונה הגדולה יותר.'
      ];
      adapted += deepAdditions[Math.floor(Math.random() * deepAdditions.length)];
    }
    
    return adapted;
  };

  const handlePollVote = (pollId, option) => {
    setPollAnswers(prev => ({ ...prev, [pollId]: option }));
    toast.success('תשובתך נרשמה!');
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `תודה! ${option === '👍 חיובי' ? 'שמח לשמוע!' : option === '👎 שלילי' ? 'מבין.' : 'כן, מורכב.'}`,
        reporter: selectedReporter.name,
        timestamp: new Date()
      }]);
    }, 800);
  };

  const generateCounterQuestion = (userInput) => {
    const input = userInput.toLowerCase();
    const specialty = selectedReporter.specialty;
    const name = selectedReporter.name;

    // שאלות אתגר לפי תוכן
    if (input.includes('בטוח') || input.includes('חושב')) {
      return [
        `רגע, אבל למה אתה כל כך בטוח בזה? יש לך מקורות?`,
        `מעניין. מה גרם לך לחשוב ככה? ראית משהו ספציפי?`,
        `אוקיי, אבל האם שקלת את האפשרות ההפוכה?`
      ][Math.floor(Math.random() * 3)];
    }

    if (input.includes('תמיד') || input.includes('אף פעם') || input.includes('כולם')) {
      return [
        `תמיד? זה טיעון די חזק. אתה יכול לתת דוגמה קונקרטית?`,
        `"כולם"? באמת כולם? או שזו הכללה?`,
        `רגע, אף פעם? תן לי לבחון את זה - באמת אף פעם?`
      ][Math.floor(Math.random() * 3)];
    }

    if (input.includes('נכון') || input.includes('נראה לי')) {
      return [
        `למה זה נכון? מה התשתית העובדתית לטענה הזו?`,
        `מעניין, אבל בוא נבדוק - על סמך מה?`,
        `נשמע מעניין, אבל האם יש לך ראיות לכך?`
      ][Math.floor(Math.random() * 3)];
    }

    // שאלות הבהרה
    const clarifyQuestions = [
      `רגע, תסביר לי משהו - בדיוק למה התכוונת כשאמרת "${userInput.slice(0, 30)}..."?`,
      `מעניין מה שאמרת. אבל תגיד לי, מה הייתה המניע שלך לחשוב ככה?`,
      `אוקיי, שמעתי אותך. אבל אני צריך הבהרה - מאיפה המידע הזה?`,
      `כעיתונאי ב${specialty}, אני צריך לשאול - יש לך מקור לזה?`
    ];

    // שאלות עומק
    const deepQuestions = [
      `נניח שאתה צודק, מה זה אומר על התמונה הגדולה יותר?`,
      `בסדר, אבל תגיד לי - מה הקשר בין זה לבין ${specialty}?`,
      `שאלה מעניינת. אבל האם חשבת על ההשלכות ארוכות הטווח?`,
      `רגע, בוא נחפור עמוק יותר - מה באמת מעניין אותך פה?`
    ];

    // שאלות אלטרנטיבה
    const alternativeQuestions = [
      `האם שקלת זווית אחרת? כי יש פה עוד איזו נקודת מבט...`,
      `מה אם אני אגיד לך שיש גרסה אחרת לסיפור הזה?`,
      `רגע רגע, אבל מה עם הצד השני של המטבע?`
    ];

    const allQuestions = [...clarifyQuestions, ...deepQuestions, ...alternativeQuestions];
    return allQuestions[Math.floor(Math.random() * allQuestions.length)];
  };

  const sendMessage = async (text = null) => {
    const messageText = text || inputValue;
    if (!messageText.trim() || !selectedReporter || isLoading) return;

    // עדכון פרופיל משתמש
    updateUserProfile(messageText);

    const userMessage = { role: "user", content: messageText, timestamp: new Date(), status: 'sent' };
    setMessages(prev => [...prev, userMessage]);
    const userInput = messageText;
    setInputValue("");
    setShowQuickReplies(false);
    setIsLoading(true);
    setReporterStatus('typing');
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => 
        prev.map((msg, idx) => 
          idx === prev.length - 1 && msg.role === 'user' ? {...msg, status: 'read'} : msg
        )
      );
    }, 500);

    const delay = 800 + Math.random() * 1500 + (userInput.length * 20);
    setTimeout(() => {
      setIsTyping(false);
      
      const rand = Math.random();
      let content;
      
      // 60% סיכוי לשאלה נגדית!
      if (rand > 0.4) {
        const counterQuestion = generateCounterQuestion(userInput);
        const personalIntro = getPersonalizedIntro();
        const intros = [
          `רגע רגע, ${selectedReporter.name} כאן. ${personalIntro}`,
          `סליחה שאני קוטע, אבל ${personalIntro}`,
          `תשמע/י, לפני שאני עונה - ${personalIntro}`,
          `${selectedReporter.name} כאן מ${selectedReporter.specialty}. ${personalIntro}`,
          `אוקיי, אבל ${personalIntro}`
        ];
        content = intros[Math.floor(Math.random() * intros.length)] + counterQuestion;
        content = adaptResponseStyle(content);
      } else {
        // תשובה רגילה עם התאמה אישית
        const personalIntro = getPersonalizedIntro();
        const responses = [
          `${personalIntro}תודה על השאלה! כ${selectedReporter.name}, אני מתמחה ב${selectedReporter.specialty}. ${userInput.includes('?') ? 'זו שאלה מעניינת מאוד' : 'אני שמח/ה לעזור'}. המצב בשטח דינמי ומתפתח.`,
          `שלום! ${personalIntro}אני ${selectedReporter.name} ומדווח/ת מ${selectedReporter.specialty}. ${userInput.length > 50 ? 'זו שאלה מקיפה' : 'תודה על ההודעה'}. אני עוקב/ת אחר האירועים באופן צמוד.`,
          `היי! ${personalIntro}כ${selectedReporter.role}, אני יכול/ה להגיד לך ש${selectedReporter.specialty} הוא תחום מרתק. ${userInput.toLowerCase().includes('מתי') ? 'ההתפתחויות צפויות בקרוב' : 'המידע מתעדכן כל הזמן'}.`,
          `${selectedReporter.name} כאן! ${personalIntro}מתמחה ב${selectedReporter.specialty}. ${userInput.toLowerCase().includes('איך') ? 'זה תהליך מורכב' : 'אני כאן לעדכן אותך'}. הצוות שלנו עובד סביב השעון.`
        ];
        content = adaptResponseStyle(responses[Math.floor(Math.random() * responses.length)]);
      }
      
      const aiMessage = {
        role: "assistant",
        content: content,
        reporter: selectedReporter.name,
        timestamp: new Date()
      };

      if (rand > 0.7) {
        aiMessage.media = { type: 'image', url: selectedReporter.image, caption: '📸 מהשטח עכשיו' };
      }
      if (rand > 0.6 && rand <= 0.7) {
        aiMessage.location = `📍 ${selectedReporter.specialty}`;
      }

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setReporterStatus('online');

      if (Math.random() > 0.8) {
        setTimeout(() => {
          setIsTyping(true);
          setTimeout(() => {
            setIsTyping(false);
            const followUps = [
              'יש לך עוד שאלות?',
              'רוצה שאני אפרט יותר?',
              'משהו ספציפי שמעניין אותך?'
            ];
            setMessages(prev => [...prev, {
              role: "assistant",
              content: followUps[Math.floor(Math.random() * followUps.length)],
              reporter: selectedReporter.name,
              timestamp: new Date()
            }]);
          }, 1000);
        }, 2000);
      }

      if (Math.random() > 0.85) {
        setTimeout(() => {
          const pollId = `poll-${Date.now()}`;
          setMessages(prev => [...prev, {
            role: "assistant",
            content: 'שאלה מהירה:',
            reporter: selectedReporter.name,
            timestamp: new Date(),
            poll: {
              id: pollId,
              question: 'מה דעתך על ההתפתחויות?',
              options: ['👍 חיובי', '👎 שלילי', '🤷 לא בטוח/ה']
            }
          }]);
        }, 2000);
      }
    }, delay);
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
    const handleOpenChat = () => {
      setOpenState(true);
    };
    
    window.addEventListener('openReporterChat', handleOpenChat);
    
    return () => {
      window.removeEventListener('openReporterChat', handleOpenChat);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [setOpenState]);

  const startNewChat = (reporter) => {
    setSelectedReporter(reporter);
    const replies = generateQuickReplies(reporter);
    setQuickReplies(replies);
    setShowQuickReplies(true);
    
    let welcomeMsg = `שלום! אני ${reporter.name}, כתב/כתבת חדשות. אני כאן לדיון עם מומחיות ב-${reporter.specialty}.`;
    
    // הודעת ברוכים השבים למשתמשים חוזרים
    if (userProfile.interactionCount >= 5) {
      const topTopic = Object.keys(userProfile.preferredTopics).reduce((a, b) => 
        userProfile.preferredTopics[a] > userProfile.preferredTopics[b] ? a : b, 
        Object.keys(userProfile.preferredTopics)[0]
      );
      
      if (topTopic) {
        welcomeMsg = `שמח/ה לראות אותך שוב! אני ${reporter.name}. אני זוכר/ת שמעניין אותך ${topTopic} - יש לי כמה עדכונים חמים בנושא. מה תרצה לדעת?`;
      }
    } else {
      welcomeMsg += ' מה תרצה לדעת?';
    }
    
    setMessages([
      {
        role: "assistant",
        content: adaptResponseStyle(welcomeMsg),
        reporter: reporter.name,
        timestamp: new Date(),
        location: `📍 ${reporter.specialty}`
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
                  {selectedReporter ? (
                    <div className="relative">
                      <img
                        src={selectedReporter.image}
                        alt={selectedReporter.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white"
                      />
                      <motion.div
                        animate={{ scale: reporterStatus === 'typing' ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: reporterStatus === 'typing' ? Infinity : 0 }}
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                          reporterStatus === 'online' ? 'bg-green-500' : 
                          reporterStatus === 'typing' ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                      />
                    </div>
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">צ'אט כתבים</h2>
                    {selectedReporter && (
                      <div className="flex items-center gap-2">
                        <p className="text-indigo-200 text-sm">{selectedReporter.name}</p>
                        {reporterStatus === 'typing' && (
                          <span className="text-xs text-yellow-300 animate-pulse">מקליד/ה...</span>
                        )}
                      </div>
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
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                          className={`flex gap-3 ${
                            message.role === "user" ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.role === "assistant" && (
                            <motion.img
                              animate={{ rotate: [0, 5, -5, 0] }}
                              transition={{ duration: 0.5 }}
                              src={selectedReporter.image}
                              alt={selectedReporter.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          )}
                          <div className="flex flex-col">
                            <motion.div
                              whileHover={{ scale: 1.02 }}
                              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                                message.role === "user"
                                  ? "bg-indigo-600 text-white"
                                  : "bg-white dark:bg-gray-700 dark:text-white border border-gray-200 dark:border-gray-600"
                              }`}
                            >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            
                            {message.media && (
                              <div className="mt-3 rounded-lg overflow-hidden border-2 border-gray-700">
                                <img src={message.media.url} alt={message.media.caption} className="w-full h-32 object-cover" />
                                <div className="bg-gray-900/50 px-2 py-1">
                                  <p className="text-xs text-gray-300">{message.media.caption}</p>
                                </div>
                              </div>
                            )}

                            {message.location && (
                              <div className="mt-2 text-xs text-gray-300 bg-gray-900/30 rounded px-2 py-1">
                                {message.location}
                              </div>
                            )}

                            {message.poll && (
                              <div className="mt-3 space-y-2">
                                <p className="text-sm font-bold">{message.poll.question}</p>
                                <div className="space-y-1">
                                  {message.poll.options.map((option, i) => (
                                    <button
                                      key={i}
                                      onClick={() => handlePollVote(message.poll.id, option)}
                                      disabled={!!pollAnswers[message.poll.id]}
                                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-all ${
                                        pollAnswers[message.poll.id] === option
                                          ? 'bg-indigo-600 text-white'
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

                            {message.audioUrl && (
                              <audio controls className="mt-2 w-full">
                                <source src={message.audioUrl} type="audio/webm" />
                              </audio>
                            )}
                            <div className="flex items-center justify-between mt-2">
                              <p className={`text-xs ${message.role === "user" ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"}`}>
                                {moment(message.timestamp).format("HH:mm")}
                              </p>
                              {message.role === "user" && message.status && (
                                <span className="text-xs text-indigo-200">
                                  {message.status === 'sent' && '✓'}
                                  {message.status === 'read' && '✓✓'}
                                </span>
                              )}
                            </div>
                            </motion.div>
                            {message.role === "assistant" && (
                              <div className="flex gap-1 mt-1 mr-2">
                                {['❤️', '👍', '😊', '🔥'].map(emoji => (
                                  <button
                                    key={emoji}
                                    onClick={() => addReaction(idx, emoji)}
                                    className="text-xs hover:scale-125 transition-transform opacity-60 hover:opacity-100"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            )}
                            {messageReactions[idx] && messageReactions[idx].length > 0 && (
                              <div className="flex gap-1 mt-1 mr-2">
                                {messageReactions[idx].map((emoji, i) => (
                                  <span key={i} className="text-xs">{emoji}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                      <AnimatePresence>
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex gap-3"
                          >
                            <img
                              src={selectedReporter.image}
                              alt={selectedReporter.name}
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                            <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-600">
                              <div className="flex gap-1">
                                <motion.div 
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity }}
                                  className="w-2 h-2 bg-indigo-500 rounded-full"
                                />
                                <motion.div 
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                  className="w-2 h-2 bg-purple-500 rounded-full"
                                />
                                <motion.div 
                                  animate={{ y: [0, -8, 0] }}
                                  transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                                  className="w-2 h-2 bg-indigo-500 rounded-full"
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
                      <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">מקליט...</span>
                          </div>
                          <span className="text-sm font-mono text-red-600 dark:text-red-400">{formatRecordingTime(recordingTime)}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Replies */}
                    {showQuickReplies && quickReplies.length > 0 && (
                      <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                        <div className="flex items-center gap-2 mb-2 pt-3">
                          <Sparkles className="w-3 h-3 text-indigo-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">שאלות מוצעות:</span>
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
                              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-xs transition-all"
                            >
                              {reply.text}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

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
                          onClick={() => sendMessage()}
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