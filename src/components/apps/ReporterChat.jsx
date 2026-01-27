import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader, User, Sparkles, Mic, MicOff, Video, VideoOff, Phone, PhoneOff, MessageSquare, Settings, BarChart3, Clock, Archive } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import moment from "moment";
import VideoShareButtons from "@/components/shared/VideoShareButtons";

export default function ReporterChat({ externalIsOpen, externalSetIsOpen, preSelectedReporter }) {
  const [isOpen, setIsOpen] = useState(false);
  const openState = externalIsOpen !== undefined ? externalIsOpen : isOpen;
  const setOpenState = externalSetIsOpen || setIsOpen;
  const [selectedReporter, setSelectedReporter] = useState(preSelectedReporter || null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
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
  const [latestNews, setLatestNews] = useState([]);
  const [fullscreenVideo, setFullscreenVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recordingIntervalRef = useRef(null);

  // טעינת חדשות אחרונות
  const { data: newsArticles = [] } = useQuery({
    queryKey: ['breaking-news-ticker'],
    queryFn: async () => {
      try {
        return await base44.entities.NewsArticle.filter({ is_breaking: true }, '-created_date', 20);
      } catch {
        return [];
      }
    },
    refetchInterval: 120000,
    initialData: []
  });

  useEffect(() => {
    // סינון רק כתבות מה-48 שעות האחרונות
    const twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);
    
    const recentNews = newsArticles.filter(article => {
      const articleDate = new Date(article.created_date);
      return articleDate > twoDaysAgo;
    }).slice(0, 5);
    
    setLatestNews(recentNews);
  }, [newsArticles]);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const { data: reporters = [] } = useQuery({
   queryKey: ['reporters-chat'],
   queryFn: async () => {
     try {
       return await base44.asServiceRole.entities.Reporter.filter({ is_active: true }, 'name', 20);
     } catch {
       return [];
     }
   },
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

    try {
      // קריאה ל-AI אמיתי
      const response = await base44.functions.invoke('reporterAIChat', {
        message: messageText,
        reporterName: selectedReporter.name,
        reporterRole: selectedReporter.role,
        reporterSpecialty: selectedReporter.specialty,
        reporterBio: selectedReporter.bio,
        userProfile: userProfile
      });

      setIsTyping(false);
      
      // הצג תשובה מיד
      const messageId = `msg-${Date.now()}`;
      const aiMessage = {
        id: messageId,
        role: "assistant",
        content: response.data.response,
        reporter: selectedReporter.name,
        timestamp: new Date(),
        isGeneratingVideo: true
      };
      
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
      setReporterStatus('online');
      
      // Clean text
      const cleanText = response.data.response
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .replace(/\.{2,}/g, '.')
        .replace(/\s+/g, ' ')
        .trim();

      // יצירת וידאו ברקע (לא חוסם)
      const reporterGender = selectedReporter.gender || 'male';
      const studioBackground = 'https://images.unsplash.com/photo-1598550487956-4238a7359cd5?w=1920&h=1080&fit=crop';
      
      base44.functions.invoke('generateTalkingVideo', {
        text: cleanText,
        avatarUrl: selectedReporter.image,
        gender: reporterGender,
        voiceProvider: 'microsoft',
        voiceId: reporterGender === 'male' ? 'he-IL-AvriNeural' : 'he-IL-HilaNeural',
        backgroundUrl: studioBackground
      }).then(videoResponse => {
        setMessages(prev => {
          const updated = [...prev];
          const msgIndex = updated.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            updated[msgIndex].videoUrl = videoResponse.data?.video_url;
            updated[msgIndex].voice_url = videoResponse.data?.video_url;
            updated[msgIndex].isGeneratingVideo = false;
          }
          return updated;
        });
        
        // Update the database with the video URL
        if (videoResponse.data?.video_url) {
          base44.entities.ReporterChat.filter({
            reporter_id: selectedReporter.id,
            reporter_name: selectedReporter.name,
            message: response.data.response,
            sender_type: 'reporter'
          }).then(records => {
            if (records && records.length > 0) {
              base44.entities.ReporterChat.update(records[0].id, {
                voice_url: videoResponse.data?.video_url
              });
            }
          });
          toast.success('🎥 הווידאו מוכן!');
        }
      }).catch(err => {
        console.error('Video generation failed:', err);
        setMessages(prev => {
          const updated = [...prev];
          const msgIndex = updated.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            updated[msgIndex].isGeneratingVideo = false;
          }
          return updated;
        });
      })
      
      // שמירת הודעות במסד נתונים ברקע
      try {
        const currentUser = await base44.auth.me().catch(() => null);
        await base44.entities.ReporterChat.create({
          reporter_id: selectedReporter.id,
          reporter_name: selectedReporter.name,
          user_email: currentUser?.email || 'anonymous',
          user_name: currentUser?.full_name || 'משתמש',
          message: messageText,
          sender_type: 'user'
        });
        
        await base44.entities.ReporterChat.create({
          reporter_id: selectedReporter.id,
          reporter_name: selectedReporter.name,
          user_email: currentUser?.email || 'anonymous',
          user_name: currentUser?.full_name || 'משתמש',
          message: response.data.response,
          sender_type: 'reporter',
          response_text: response.data.response
        });
      } catch (err) {
        console.error('Failed to save chat:', err);
      }

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
    } catch (error) {
      console.error('Chat error:', error);
      setIsTyping(false);
      setIsLoading(false);
      setReporterStatus('online');
      toast.error('שגיאה בשליחת ההודעה');
    }
  };
  
  // סיום הפונקציה sendMessage - הוספת סוגריים סגורים שחסרים
  
  // שאר הקוד ממשיך כרגיל למטה
  const oldSendMessageEnd = () => {
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

  useEffect(() => {
    if (preSelectedReporter && openState) {
      startNewChat(preSelectedReporter);
    }
  }, [preSelectedReporter, openState]);

  const loadChatHistory = async (reporter) => {
    try {
      // Load all reporter responses - accessible to everyone
      const history = await base44.entities.ReporterChat.filter({
        reporter_id: reporter.id
      }, '-created_date', 50);
      
      if (history && history.length > 0) {
        const formattedMessages = history.reverse().map(msg => {
          return {
            role: msg.sender_type === 'user' ? 'user' : 'assistant',
            content: msg.message,
            reporter: reporter.name,
            timestamp: new Date(msg.created_date),
            videoUrl: msg.voice_url || null,
            voice_url: msg.voice_url || null
          };
        });
        setMessages(formattedMessages);
      } else {
        // אין היסטוריה - הודעת ברוכים הבאים
        startWelcomeMessage(reporter);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
      startWelcomeMessage(reporter);
    }
  };

  const startWelcomeMessage = (reporter) => {
    let welcomeMsg = `שלום! אני ${reporter.name}, כתב/כתבת חדשות. אני כאן לדיון עם מומחיות ב-${reporter.specialty}.`;
    
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

  const startNewChat = async (reporter) => {
    setSelectedReporter(reporter);
    const replies = generateQuickReplies(reporter);
    setQuickReplies(replies);
    setShowQuickReplies(true);
    
    // טעינת היסטוריית צ'אט
    await loadChatHistory(reporter);
  };

  return (
    <>
      <AnimatePresence>
        {openState && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center p-4 z-[99999]"
            onClick={() => setOpenState(false)}
            >
            <motion.div
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             exit={{ scale: 0.9, opacity: 0 }}
             className="bg-gradient-to-br from-black via-gray-900 to-black border border-[#E31E24]/30 rounded-2xl w-[95vw] max-w-6xl h-[90vh] max-h-[900px] flex flex-col overflow-hidden"
             onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-[#E31E24]/30 via-red-900/20 to-black text-white p-6 flex items-center justify-between border-b border-[#E31E24]/30">
                <div className="flex items-center gap-3">
                  {selectedReporter ? (
                  <div className="relative">
                    <img
                      src={selectedReporter.image}
                      alt={selectedReporter.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#E31E24]"
                    />
                      <motion.div
                        animate={{ scale: reporterStatus === 'typing' ? [1, 1.2, 1] : 1 }}
                        transition={{ duration: 1.5, repeat: reporterStatus === 'typing' ? Infinity : 0 }}
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#E31E24] ${
                          reporterStatus === 'online' ? 'bg-green-500' : 
                          reporterStatus === 'typing' ? 'bg-[#E31E24]' : 'bg-white/40'
                        }`}
                      />
                    </div>
                  ) : (
                    <Sparkles className="w-6 h-6" />
                  )}
                  <div>
                    <h2 className="text-2xl font-bold text-white">צ'אט כתבים</h2>
                    {selectedReporter && (
                      <div className="flex items-center gap-2">
                        <p className="text-white/80 text-sm">{selectedReporter.name}</p>
                        {reporterStatus === 'typing' && (
                          <span className="text-xs text-[#E31E24] animate-pulse flex items-center gap-1"><Clock className="w-2 h-2" /> מקליד/ה...</span>
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
                    <h3 className="text-xl font-bold text-white mb-4">בחר כתב/כתבת</h3>
                      {reporters.map((reporter) => (
                        <motion.button
                          key={reporter.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => startNewChat(reporter)}
                          className="w-full text-left p-4 bg-black/40 rounded-2xl hover:bg-black/60 transition-colors border border-[#E31E24]/30 hover:border-[#E31E24]/50"
                        >
                        <div className="flex items-start gap-4">
                          <img
                            src={reporter.image}
                            alt={reporter.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#E31E24]/50"
                          />
                          <div className="flex-1">
                            <h4 className="font-bold text-white">{reporter.name}</h4>
                            <p className="text-sm text-white/70">{reporter.role}</p>
                            <p className="text-xs text-white/50 mt-1">
                              {reporter.specialty}
                            </p>
                          </div>
                          <div className="text-right text-xs">
                            <p className="text-green-400 flex items-center gap-1">● זמין</p>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </motion.div>
                ) : (
                  // Chat Window with Reporter Profile Side by Side
                  <div className="w-full flex h-full gap-0">
                    {/* Reporter Profile Card - Left Side (Fixed) */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="hidden md:flex flex-col items-center gap-4 p-6 w-72 bg-gradient-to-b from-black/60 via-red-900/20 to-black border-l border-[#E31E24]/30 flex-shrink-0 overflow-y-auto"
                    >
                      <div className="relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24] to-red-900 rounded-full blur-2xl opacity-60" />
                         <img
                           src={selectedReporter.image}
                           alt={selectedReporter.name}
                           className="relative w-48 h-48 rounded-full object-cover border-4 border-[#E31E24] shadow-2xl"
                         />
                       </div>
                      <div className="text-center w-full">
                         <h3 className="text-2xl font-bold text-white mb-2">{selectedReporter.name}</h3>
                         <p className="text-sm text-white/80 font-semibold mb-1">{selectedReporter.role}</p>
                         <p className="text-xs text-white/60 mb-4">{selectedReporter.specialty}</p>
                         <div className="flex items-center justify-center gap-1 bg-[#E31E24]/20 rounded-full px-3 py-1 border border-[#E31E24]/50 mx-auto w-fit">
                           <span className="w-2 h-2 bg-[#E31E24] rounded-full animate-pulse" />
                           <span className="text-xs text-[#E31E24] font-bold">זמין</span>
                         </div>
                       </div>
                      {selectedReporter.bio && (
                        <p className="text-sm text-white/70 text-center leading-relaxed">{selectedReporter.bio}</p>
                      )}
                      <div className="w-full space-y-2">
                        <motion.button
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setSelectedReporter(null)}
                           className="w-full px-4 py-2 bg-[#E31E24]/20 hover:bg-[#E31E24]/30 border border-[#E31E24]/30 text-white rounded-xl font-semibold transition-all text-sm flex items-center justify-center gap-2"
                         >
                           <X className="w-4 h-4" /> חזור
                         </motion.button>
                      </div>
                    </motion.div>

                    {/* Chat Area - Right Side */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-gray-900/40 to-black/40">
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
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                                  ? "bg-[#E31E24] text-white"
                                  : "bg-black/40 text-white border border-[#E31E24]/30"
                              }`}
                            >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            
                            {message.isGeneratingVideo && (
                              <div className="mt-3 p-3 bg-[#E31E24]/10 rounded-lg border border-[#E31E24]/30">
                                <div className="flex items-center gap-2 text-sm text-[#E31E24] mb-2">
                                  <Loader className="w-4 h-4 animate-spin" />
                                  <span className="font-semibold">מכין וידאו מקצועי...</span>
                                </div>
                                <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                  <motion.div
                                    className="h-full bg-gradient-to-r from-[#E31E24] to-red-700"
                                    animate={{ width: ["0%", "100%"] }}
                                    transition={{ duration: 30, ease: "linear" }}
                                  />
                                </div>
                                <p className="text-xs text-white/60 mt-2">⏱️ זה לוקח כ-30 שניות</p>
                              </div>
                            )}
                            
                            {message.role === "assistant" && (message.videoUrl || message.voice_url) && (
                              <div className="mt-3 space-y-2">
                                <div className="w-full rounded-lg overflow-hidden border-2 border-[#E31E24]/50 relative group">
                                  <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 relative">
                                    <video
                                      src={message.videoUrl || message.voice_url}
                                      className="w-full h-full object-cover"
                                      controls
                                      playsInline
                                      preload="metadata"
                                    />
                                  </div>
                                </div>
                                <VideoShareButtons videoUrl={message.videoUrl || message.voice_url} />
                              </div>
                            )}
                            
                            {message.media && (
                               <div className="mt-3 rounded-lg overflow-hidden border-2 border-[#E31E24]/30">
                                 <img src={message.media.url} alt={message.media.caption} className="w-full h-32 object-cover" />
                                 <div className="bg-black/60 px-2 py-1 border-t border-[#E31E24]/20">
                                   <p className="text-xs text-white/70">{message.media.caption}</p>
                                 </div>
                               </div>
                             )}

                            {message.location && (
                               <div className="mt-2 text-xs text-white/70 bg-black/60 rounded px-2 py-1 border border-[#E31E24]/20">
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
                                          ? 'bg-[#E31E24] text-white'
                                          : pollAnswers[message.poll.id]
                                          ? 'bg-black/40 text-white/50 border border-[#E31E24]/20'
                                          : 'bg-black/40 hover:bg-black/60 text-white border border-[#E31E24]/30'
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
                              <p className={`text-xs ${message.role === "user" ? "text-white/70" : "text-white/50"}`}>
                                {moment(message.timestamp).format("HH:mm")}
                              </p>
                              {message.role === "user" && message.status && (
                                <span className="text-xs text-white/70">
                                  {message.status === 'sent' && '✓'}
                                  {message.status === 'read' && '✓✓'}
                                </span>
                              )}
                            </div>
                            </motion.div>
                            {message.role === "assistant" && (
                               <div className="flex gap-1 mt-1 mr-2">
                                 {[
                                   { icon: '❤️', label: 'אהבתי' },
                                   { icon: '👍', label: 'מעניין' },
                                   { icon: '😊', label: 'הסכמה' },
                                   { icon: '💡', label: 'דעה' }
                                 ].map(item => (
                                   <button
                                     key={item.icon}
                                     onClick={() => addReaction(idx, item.icon)}
                                     className="text-xs hover:scale-125 transition-transform opacity-60 hover:opacity-100"
                                     title={item.label}
                                   >
                                     {item.icon}
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
                            <div className="bg-black/40 px-4 py-3 rounded-2xl border border-[#E31E24]/30">
                               <div className="flex gap-1">
                                 <motion.div 
                                   animate={{ y: [0, -8, 0] }}
                                   transition={{ duration: 0.6, repeat: Infinity }}
                                   className="w-2 h-2 bg-[#E31E24] rounded-full"
                                 />
                                 <motion.div 
                                   animate={{ y: [0, -8, 0] }}
                                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                                   className="w-2 h-2 bg-red-700 rounded-full"
                                 />
                                 <motion.div 
                                   animate={{ y: [0, -8, 0] }}
                                   transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
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
                      <div className="px-4 py-2 bg-[#E31E24]/20 border-t border-[#E31E24]/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#E31E24] rounded-full animate-pulse" />
                            <span className="text-sm font-bold text-[#E31E24] flex items-center gap-1">
                              <Mic className="w-3 h-3" /> מקליט...
                            </span>
                          </div>
                          <span className="text-sm font-mono text-[#E31E24]">{formatRecordingTime(recordingTime)}</span>
                        </div>
                      </div>
                    )}

                    {/* Quick Replies */}
                    {showQuickReplies && quickReplies.length > 0 && (
                      <div className="px-4 pb-3 border-t border-[#E31E24]/30 bg-gradient-to-r from-black/40 to-red-900/20">
                        <div className="flex items-center gap-2 mb-2 pt-3">
                          <MessageSquare className="w-3 h-3 text-[#E31E24]" />
                          <span className="text-xs text-white/70">שאלות מוצעות:</span>
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
                              className="px-3 py-1.5 bg-[#E31E24]/10 hover:bg-[#E31E24]/20 border border-[#E31E24]/30 rounded-full text-xs text-white transition-all"
                            >
                              {reply.text}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 border-t border-[#E31E24]/30 bg-gradient-to-r from-black/60 to-red-900/20">
                      <div className="flex gap-2 mb-3">
                        <Button
                          onClick={isRecording ? stopRecording : startRecording}
                          variant={isRecording ? "destructive" : "outline"}
                          size="icon"
                          className={`${isRecording ? "animate-pulse bg-[#E31E24]" : "border-[#E31E24]/30 hover:bg-[#E31E24]/20"}`}
                          title="הקלטה קולית"
                        >
                          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </Button>
                        <Button
                          onClick={isVideoCall ? endVideoCall : startVideoCall}
                          variant={isVideoCall ? "destructive" : "outline"}
                          size="icon"
                          className={isVideoCall ? "bg-[#E31E24]" : "border-[#E31E24]/30 hover:bg-[#E31E24]/20"}
                          title="שיחת וידאו"
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
                          className="flex-1 bg-black/40 border-[#E31E24]/30 text-white placeholder-white/50"
                        />
                        <Button
                          onClick={() => sendMessage()}
                          disabled={isLoading || !inputValue.trim() || isRecording}
                          className="bg-[#E31E24] hover:bg-red-700 px-4"
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
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Video Modal */}
      <AnimatePresence>
        {fullscreenVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex flex-col"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(15,23,42,0.95) 0%, rgba(0,0,0,0.98) 100%)',
            }}
          >
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <div className="absolute inset-0" style={{
                backgroundImage: `
                  linear-gradient(rgba(226,30,36,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(226,30,36,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
                animation: 'gridPulse 3s ease-in-out infinite'
              }} />
            </div>

            <style>{`
              @keyframes gridPulse {
                0%, 100% { opacity: 0.2; }
                50% { opacity: 0.4; }
              }
              @keyframes scanline {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100vh); }
              }
            `}</style>

            {/* Header Info Bar - Futuristic */}
            <div className="relative bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-[#E31E24]/20">
              <div className="flex items-center gap-3">
                {selectedReporter && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 bg-[#E31E24] rounded-full blur-lg opacity-50 animate-pulse" />
                      <img
                        src={selectedReporter.image}
                        alt={selectedReporter.name}
                        className="relative w-10 h-10 rounded-full border-2 border-[#E31E24] shadow-lg"
                      />
                    </div>
                    <div>
                      <p className="text-white text-sm font-bold tracking-wide">{selectedReporter.name}</p>
                      <p className="text-[#E31E24] text-xs font-semibold">{selectedReporter.role}</p>
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setFullscreenVideo(null)}
                className="w-10 h-10 rounded-full bg-[#E31E24]/20 backdrop-blur-md border border-[#E31E24]/40 flex items-center justify-center hover:bg-[#E31E24]/40 transition-all active:scale-95 shadow-lg"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Video Area with Futuristic Frame */}
            <div className="flex-1 relative flex items-center justify-center p-4">
              {/* Scanline Effect */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E31E24]/50 to-transparent" 
                     style={{ animation: 'scanline 4s linear infinite' }} />
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-6 left-6 w-12 h-12 border-t-2 border-l-2 border-[#E31E24]/60" />
              <div className="absolute top-6 right-6 w-12 h-12 border-t-2 border-r-2 border-[#E31E24]/60" />
              <div className="absolute bottom-24 left-6 w-12 h-12 border-b-2 border-l-2 border-[#E31E24]/60" />
              <div className="absolute bottom-24 right-6 w-12 h-12 border-b-2 border-r-2 border-[#E31E24]/60" />

              {/* Video Container */}
              <div className="relative w-full max-w-5xl">
                <div className="relative overflow-hidden" style={{
                  boxShadow: '0 0 60px rgba(226,30,36,0.4)'
                }}>
                  <video
                    ref={videoRef}
                    key={fullscreenVideo}
                    src={fullscreenVideo}
                    autoPlay
                    playsInline
                    muted={isMuted}
                    onEnded={() => setFullscreenVideo(null)}
                    onTimeUpdate={(e) => {
                      setVideoProgress((e.target.currentTime / e.target.duration) * 100);
                    }}
                    onLoadedMetadata={(e) => {
                      setVideoDuration(e.target.duration);
                    }}
                    className="w-full aspect-video bg-black"
                    style={{
                      filter: 'contrast(1.05) brightness(1.02)'
                    }}
                  />

                  {/* Custom Futuristic Controls Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent backdrop-blur-sm p-4">
                    {/* Progress Bar */}
                    <div className="mb-3 group cursor-pointer" onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = (x / rect.width) * 100;
                      if (videoRef.current) {
                        videoRef.current.currentTime = (percentage / 100) * videoDuration;
                      }
                    }}>
                      <div className="relative h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E31E24] to-red-600 transition-all"
                          style={{ width: `${videoProgress}%` }}
                        >
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Play/Pause */}
                        <button
                          onClick={() => {
                            if (videoRef.current) {
                              if (isPlaying) {
                                videoRef.current.pause();
                              } else {
                                videoRef.current.play();
                              }
                              setIsPlaying(!isPlaying);
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 backdrop-blur-md border border-[#E31E24]/40 flex items-center justify-center transition-all"
                        >
                          {isPlaying ? (
                            <div className="flex gap-0.5">
                              <div className="w-1 h-4 bg-white rounded-full" />
                              <div className="w-1 h-4 bg-white rounded-full" />
                            </div>
                          ) : (
                            <div className="w-0 h-0 border-t-4 border-t-transparent border-l-6 border-l-white border-b-4 border-b-transparent ml-0.5" />
                          )}
                        </button>

                        {/* Mute */}
                        <button
                          onClick={() => {
                            setIsMuted(!isMuted);
                          }}
                          className="w-10 h-10 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 backdrop-blur-md border border-[#E31E24]/40 flex items-center justify-center transition-all"
                        >
                          {isMuted ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" />
                            </svg>
                          )}
                        </button>

                        {/* Time */}
                        <div className="text-white text-sm font-mono">
                          {Math.floor((videoProgress / 100) * videoDuration / 60)}:{String(Math.floor((videoProgress / 100) * videoDuration % 60)).padStart(2, '0')} / {Math.floor(videoDuration / 60)}:{String(Math.floor(videoDuration % 60)).padStart(2, '0')}
                        </div>
                      </div>

                      {/* Fullscreen Exit */}
                      <button
                        onClick={() => setFullscreenVideo(null)}
                        className="px-4 py-2 rounded-full bg-[#E31E24]/20 hover:bg-[#E31E24]/40 backdrop-blur-md border border-[#E31E24]/40 text-white text-sm font-semibold transition-all flex items-center gap-2"
                      >
                        סגור
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              </div>

            {/* Chat Input & Share - Futuristic */}
            <div className="bg-gradient-to-t from-black/80 via-black/60 to-transparent backdrop-blur-xl px-3 sm:px-4 py-3 sm:py-4 border-t border-[#E31E24]/20 safe-area-inset-bottom">
              <div className="max-w-3xl mx-auto space-y-3">
                {/* Share Buttons */}
                <div className="flex justify-center">
                  <VideoShareButtons videoUrl={fullscreenVideo} />
                </div>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="המשך את השיחה..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                    className="flex-1 bg-black/40 border-[#E31E24]/30 text-white placeholder-white/50 backdrop-blur-sm h-12 px-4 text-base rounded-lg"
                  />
                  <Button
                    onClick={() => sendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-[#E31E24] to-red-700 hover:from-red-700 hover:to-[#E31E24] h-12 w-12 sm:w-auto sm:px-6 flex-shrink-0 rounded-lg shadow-lg"
                  >
                    {isLoading ? (
                      <Loader className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>

                {/* Quick Actions - Futuristic */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  <button
                    onClick={() => setInputValue('ספר לי עוד')}
                    className="px-3 py-1.5 bg-[#E31E24]/20 hover:bg-[#E31E24]/40 border border-[#E31E24]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                  >
                    📖 ספר עוד
                  </button>
                  <button
                    onClick={() => setInputValue('מה עוד חדש?')}
                    className="px-3 py-1.5 bg-[#E31E24]/20 hover:bg-[#E31E24]/40 border border-[#E31E24]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                  >
                    🔥 מה חדש?
                  </button>
                  <button
                    onClick={() => setInputValue('תודה!')}
                    className="px-3 py-1.5 bg-[#E31E24]/20 hover:bg-[#E31E24]/40 border border-[#E31E24]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                  >
                    👍 תודה
                  </button>
                </div>
              </div>
            </div>
            </motion.div>
            )}
            </AnimatePresence>
    </>
  );
}