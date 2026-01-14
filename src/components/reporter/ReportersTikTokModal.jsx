import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, MessageCircle, 
  Video, Send, Mic, Phone, PhoneOff, Volume2, VolumeX, Play
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
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [videoConnected, setVideoConnected] = useState(false);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [currentTypingMsg, setCurrentTypingMsg] = useState(null);
  const [userVideoStream, setUserVideoStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const audioRef = useRef(null);
  const recordingChunks = useRef([]);
  const containerRef = useRef(null);
  const startY = useRef(0);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: latestArticles = [] } = useQuery({
    queryKey: ['latest-articles-chat'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 5),
    initialData: []
  });

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
    mutationFn: async (data) => {
      await base44.entities.ReporterChat.create(data);
      return data;
    },
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
      setMessages([]);
      setVideoConnected(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowChat(false);
      setShowVideo(false);
      setMessages([]);
      setVideoConnected(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !currentReporter) return;

    const userMsg = {
      id: Date.now(),
      text: message,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    const currentMessage = message;
    setMessage("");
    setIsTyping(true);

    try {
      await createChatMutation.mutateAsync({
        reporter_id: currentReporter.id,
        reporter_name: currentReporter.name,
        user_email: userInfo?.email || "guest@example.com",
        user_name: userInfo?.full_name || "אורח",
        message: currentMessage,
        sender_type: "user"
      });

      // Get relevant articles for context
      const relevantArticles = latestArticles.filter(article => 
        currentReporter.categories?.includes(article.category)
      ).slice(0, 2);

      let articlesContext = '';
      if (relevantArticles.length > 0) {
        articlesContext = '\n\nכתבות אחרונות שלי:\n' + 
          relevantArticles.map(a => `- ${a.title}: ${a.subtitle || ''}`).join('\n');
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה ${currentReporter.name}, ${currentReporter.role}. 
התמחות שלך: ${currentReporter.specialty}.${articlesContext}
המשתמש שלח: "${currentMessage}"

תענה בצורה מקצועית, חמה ואינטראקטיבית כ${currentReporter.name}:
1. תגיב להודעת המשתמש בצורה אישית
2. אם רלוונטי, תקשר את זה לכתבה שלך
3. תשאל שאלה מעניינת שתמשיך את השיחה
4. השב בעברית, בקצרה (3-4 משפטים), בסגנון של כתב חדשות מנוסה שמתעניין באמת.`,
        add_context_from_internet: false
      });

      // Generate voice for the response
      let audioUrl = null;
      try {
        const voiceResult = await base44.functions.generateReporterVoice({
          text: response,
          gender: currentReporter.gender,
          reporter_name: currentReporter.name
        });
        audioUrl = voiceResult.audio_data;
      } catch (error) {
        console.error("Voice generation error:", error);
      }

      // Typewriter effect for AI response
      const aiMsgId = Date.now() + 1;
      const aiMsg = {
        id: aiMsgId,
        text: response,
        sender: "reporter",
        timestamp: new Date(),
        audioUrl: audioUrl
      };

      setCurrentTypingMsg(aiMsgId);
      setTypingText("");
      
      // Add empty message that will be filled with typewriter effect
      setMessages(prev => [...prev, { ...aiMsg, text: "" }]);
      
      // Typewriter animation
      let currentIndex = 0;
      const typeSpeed = 30;
      const typeInterval = setInterval(() => {
        if (currentIndex < response.length) {
          setTypingText(response.substring(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setMessages(prev => prev.map(m => m.id === aiMsgId ? aiMsg : m));
          setCurrentTypingMsg(null);
          setTypingText("");
          
          // Auto-play voice after typing is done
          if (audioUrl) {
            setTimeout(() => {
              const audio = new Audio(audioUrl);
              audio.play();
            }, 300);
          }
        }
      }, typeSpeed);

      await base44.entities.ReporterChat.create({
        reporter_id: currentReporter.id,
        reporter_name: currentReporter.name,
        user_email: userInfo?.email || "guest@example.com",
        user_name: userInfo?.full_name || "אורח",
        message: response,
        sender_type: "reporter",
        response_text: response
      });

    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartVideo = async () => {
    try {
      // Start user's camera
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 }, 
        audio: true 
      });
      setUserVideoStream(stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Wait a moment for camera to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Capture image from video
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas && video) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);

        // Upload image
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: imageData
        });

        // Analyze user appearance with AI
        const analysisPrompt = `אתה ${currentReporter.name}, ${currentReporter.role}.
אתה בשיחת וידאו עם צופה. תסתכל על התמונה ותנתח:
- צבע שיער (שחור, חום, בלונד, אפור, קרח וכו')
- צבע עיניים (אם ניתן לראות)
- סגנון לבוש (חולצה, חליפה, קז'ואל וכו')
- כל פרט בולט אחר

צור ברכה חמה ואישית (2-3 משפטים) שמזכירה מה אתה רואה ושואלת איך הצופה מרגיש היום.
דוגמה: "שלום! אני רואה שאתה לבוש חולצה כחולה יפה היום. איך אתה מרגיש? יש משהו ספציפי שתרצה לדבר עליו?"`;

        const greeting = await base44.integrations.Core.InvokeLLM({
          prompt: analysisPrompt,
          file_urls: [uploadResult.file_url],
          add_context_from_internet: false
        });

        // Generate voice
        let audioUrl = null;
        try {
          const voiceResult = await base44.functions.generateReporterVoice({
            text: greeting,
            gender: currentReporter.gender,
            reporter_name: currentReporter.name
          });
          audioUrl = voiceResult.audio_data;
          
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error("Voice generation error:", error);
        }

        const videoMsg = {
          id: Date.now(),
          text: greeting,
          sender: "reporter",
          timestamp: new Date(),
          audioUrl: audioUrl
        };

        setMessages(prev => [...prev, videoMsg]);
      }

      setVideoConnected(true);
    } catch (error) {
      console.error("Video start error:", error);
      if (error.name === 'NotAllowedError') {
        alert('גישה למצלמה נדחתה. אנא אפשר הרשאות מצלמה בהגדרות הדפדפן.');
      } else {
        alert('שגיאה בהפעלת המצלמה: ' + error.message);
      }
    }
  };

  const playAudio = (audioUrl, messageId) => {
    if (!audioUrl) return;
    
    if (playingAudio === messageId) {
      // Stop playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingAudio(null);
    } else {
      // Stop previous audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Play new audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      setPlayingAudio(messageId);
      
      audio.onended = () => {
        setPlayingAudio(null);
        audioRef.current = null;
      };
      
      audio.play();
    }
  };

  const startRecording = async () => {
    try {
      // Request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      recordingChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordingChunks.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const audioBlob = new Blob(recordingChunks.current, { type: mimeType });
        await handleVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      if (error.name === 'NotAllowedError') {
        alert('גישה למיקרופון נדחתה. אנא אפשר הרשאות מיקרופון בהגדרות הדפדפן.');
      } else if (error.name === 'NotFoundError') {
        alert('לא נמצא מיקרופון במכשיר.');
      } else {
        alert('שגיאה בגישה למיקרופון: ' + error.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleVoiceMessage = async (audioBlob) => {
    if (!currentReporter) return;

    setIsTyping(true);

    try {
      // Convert audio blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result;

        // Upload audio file
        const uploadResult = await base44.integrations.Core.UploadFile({
          file: base64Audio
        });

        // Transcribe audio using LLM
        const transcription = await base44.integrations.Core.InvokeLLM({
          prompt: `תמלל את ההודעה הקולית הזו לעברית. החזר רק את הטקסט המדובר, ללא הסברים נוספים.`,
          file_urls: [uploadResult.file_url]
        });

        // Add user message
        const userMsg = {
          id: Date.now(),
          text: transcription,
          sender: "user",
          timestamp: new Date(),
          isVoice: true
        };
        setMessages(prev => [...prev, userMsg]);

        // Save to database
        await createChatMutation.mutateAsync({
          reporter_id: currentReporter.id,
          reporter_name: currentReporter.name,
          user_email: userInfo?.email || "guest@example.com",
          user_name: userInfo?.full_name || "אורח",
          message: transcription,
          sender_type: "user",
          is_voice: true,
          voice_url: uploadResult.file_url
        });

        // Get AI response
        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `אתה ${currentReporter.name}, ${currentReporter.role}. 
התמחות שלך: ${currentReporter.specialty}.
המשתמש שאל בהודעה קולית: "${transcription}"

תענה בצורה מקצועית, ענייניה וידידותית כ${currentReporter.name}. 
השב בעברית, בקצרה (2-3 משפטים), ובסגנון של כתב חדשות מנוסה.`,
          add_context_from_internet: false
        });

        // Generate voice for response
        let audioUrl = null;
        try {
          const voiceResult = await base44.functions.generateReporterVoice({
            text: response,
            gender: currentReporter.gender,
            reporter_name: currentReporter.name
          });
          audioUrl = voiceResult.audio_data;

          // Auto-play the response
          if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
          }
        } catch (error) {
          console.error("Voice generation error:", error);
        }

        const aiMsg = {
          id: Date.now() + 1,
          text: response,
          sender: "reporter",
          timestamp: new Date(),
          audioUrl: audioUrl
        };

        setMessages(prev => [...prev, aiMsg]);

        // Save reporter response
        await base44.entities.ReporterChat.create({
          reporter_id: currentReporter.id,
          reporter_name: currentReporter.name,
          user_email: userInfo?.email || "guest@example.com",
          user_name: userInfo?.full_name || "אורח",
          message: response,
          sender_type: "reporter",
          response_text: response
        });

      };
    } catch (error) {
      console.error("Voice message error:", error);
      alert('שגיאה בעיבוד ההודעה הקולית. נסה שוב.');
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setCurrentIndex(0);
      setShowChat(false);
      setShowVideo(false);
      setMessages([]);
      setVideoConnected(false);
      setPlayingAudio(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      // Stop video stream
      if (userVideoStream) {
        userVideoStream.getTracks().forEach(track => track.stop());
        setUserVideoStream(null);
      }
    } else if (currentReporter) {
      const generateWelcome = async () => {
        // Get reporter's categories articles
        const relevantArticles = latestArticles.filter(article => 
          currentReporter.categories?.includes(article.category)
        ).slice(0, 3);

        let articlesContext = '';
        if (relevantArticles.length > 0) {
          articlesContext = '\n\nכתבות אחרונות שכתבתי:\n' + 
            relevantArticles.map(a => `- ${a.title}`).join('\n');
        }

        const welcomePrompt = `אתה ${currentReporter.name}, ${currentReporter.role}.
התמחות שלך: ${currentReporter.specialty}.${articlesContext}

צור ברכה חמה ואינטראקטיבית (3-4 משפטים) שכוללת:
1. הצגה קצרה שלך
2. שאלה מעניינת שמובילה את המשתמש לדבר על אחת הכתבות שלך
3. הצעה לעזרה או מידע נוסף

דוגמה: "שלום! אני ${currentReporter.name}, ${currentReporter.role}. ראיתי שכתבתי היום על [נושא]. מה דעתך על זה? יש משהו ספציפי שמעניין אותך בנושא?"`;

        const welcomeText = await base44.integrations.Core.InvokeLLM({
          prompt: welcomePrompt,
          add_context_from_internet: false
        });
        
        let audioUrl = null;
        try {
          const voiceResult = await base44.functions.generateReporterVoice({
            text: welcomeText,
            gender: currentReporter.gender,
            reporter_name: currentReporter.name
          });
          audioUrl = voiceResult.audio_data;
        } catch (error) {
          console.error("Welcome voice error:", error);
        }

        const welcomeMsg = {
          id: Date.now(),
          text: welcomeText,
          sender: "reporter",
          timestamp: new Date(),
          audioUrl: audioUrl
        };
        setMessages([welcomeMsg]);
      };
      
      generateWelcome();
    }
  }, [isOpen, currentReporter?.id]);

  // Touch scroll navigation
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    const handleTouchStart = (e) => {
      if (showChat || showVideo) return;
      startY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (showChat || showVideo) return;
      const endY = e.changedTouches[0].clientY;
      const diff = startY.current - endY;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    };

    const container = containerRef.current;
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen, currentIndex, reporters.length, showChat, showVideo]);

  // Mouse wheel navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleWheel = (e) => {
      if (showChat || showVideo) return;
      
      if (e.deltaY > 30) {
        handleNext();
      } else if (e.deltaY < -30) {
        handlePrev();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isOpen, currentIndex, reporters.length, showChat, showVideo]);

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

        {/* Reporter Card Container */}
        <div 
          ref={containerRef}
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
                      transition={{ type: "spring", damping: 30, stiffness: 300 }}
                      className="absolute inset-0 bg-white dark:bg-gray-900 z-20"
                    >
                      <div className="flex flex-col h-full">
                        {/* Chat Header - Clean & Professional */}
                        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img
                                  src={currentReporter.image}
                                  alt={currentReporter.name}
                                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white/30"
                                />
                                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white" />
                              </div>
                              <div>
                                <h3 className="text-white font-bold">{currentReporter.name}</h3>
                                <p className="text-white/80 text-xs">{currentReporter.role}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setShowVideo(true);
                                  setShowChat(false);
                                }}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                              >
                                <Video size={20} className="text-white" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowChat(false)}
                                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                              >
                                <X size={20} className="text-white" />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Chat Messages - WhatsApp Style */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h100v100H0z\' fill=\'%23f0f0f0\' fill-opacity=\'0.05\'/%3E%3C/svg%3E")' }}>
                          <div className="max-w-3xl mx-auto space-y-3">
                            {messages.map((msg, idx) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div className={`flex gap-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                  {msg.sender === 'reporter' && (
                                    <img
                                      src={currentReporter.image}
                                      alt={currentReporter.name}
                                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex flex-col gap-1">
                                    <div
                                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                                        msg.sender === 'user'
                                          ? 'bg-blue-500 text-white rounded-br-sm'
                                          : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-tl-sm'
                                      }`}
                                    >
                                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {currentTypingMsg === msg.id ? typingText : msg.text}
                                        {currentTypingMsg === msg.id && (
                                          <span className="inline-block w-0.5 h-4 bg-current ml-0.5 animate-pulse" />
                                        )}
                                      </p>
                                    </div>
                                    {msg.sender === 'reporter' && msg.audioUrl && (
                                      <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => playAudio(msg.audioUrl, msg.id)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                                          playingAudio === msg.id
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'
                                        }`}
                                      >
                                        {playingAudio === msg.id ? (
                                          <>
                                            <Volume2 className="w-3 h-3 animate-pulse" />
                                            מנגן...
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-3 h-3" />
                                            שמע בקול
                                          </>
                                        )}
                                      </motion.button>
                                    )}
                                    {msg.isVoice && msg.sender === 'user' && (
                                      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                        <Mic className="w-3 h-3" />
                                        <span>הודעה קולית</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            {isTyping && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                              >
                                <div className="flex gap-2">
                                  <img
                                    src={currentReporter.image}
                                    alt={currentReporter.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                  <div className="bg-white dark:bg-gray-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                                    <div className="flex gap-1">
                                      <motion.span
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                      />
                                      <motion.span
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                      />
                                      <motion.span
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                        className="w-2 h-2 bg-gray-400 rounded-full"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                          </div>
                        </div>

                        {/* Chat Input - Modern */}
                        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                          <div className="max-w-3xl mx-auto">
                            <div className="flex items-end gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={isRecording ? stopRecording : startRecording}
                                className={`p-3 rounded-full transition-all ${
                                  isRecording 
                                    ? 'bg-red-500 text-white animate-pulse' 
                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
                                }`}
                              >
                                <Mic size={20} />
                              </motion.button>
                              <div className="flex-1 relative">
                                <Textarea
                                  value={message}
                                  onChange={(e) => setMessage(e.target.value)}
                                  placeholder="הקלד/י הודעה..."
                                  className="w-full bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none rounded-3xl px-4 py-3 focus:ring-2 focus:ring-blue-500 transition-all"
                                  rows={1}
                                  style={{ maxHeight: '120px' }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                      e.preventDefault();
                                      handleSendMessage();
                                    }
                                  }}
                                />
                                {isRecording && (
                                  <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute top-1/2 -translate-y-1/2 left-4 flex items-center gap-2 bg-red-500 px-3 py-1 rounded-full"
                                  >
                                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    <span className="text-white text-xs font-bold">מקליט...</span>
                                  </motion.div>
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleSendMessage}
                                disabled={!message.trim()}
                                className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                              >
                                <Send size={20} />
                              </motion.button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Call Overlay - Professional */}
                <AnimatePresence>
                  {showVideo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 z-20"
                    >
                      <div className="relative w-full h-full flex flex-col">
                        {/* Video Header */}
                        <div className="relative z-10 p-4 bg-gradient-to-b from-black/60 to-transparent">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-bold">{videoConnected ? 'מחובר' : 'מתחבר...'}</p>
                                <p className="text-white/60 text-xs">שיחת וידאו</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setShowVideo(false);
                                setVideoConnected(false);
                              }}
                              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
                            >
                              <X size={20} className="text-white" />
                            </motion.button>
                          </div>
                        </div>

                        {/* Video Content */}
                        <div className="flex-1 relative flex items-center justify-center">
                          {!videoConnected ? (
                            <motion.div
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              className="text-center space-y-6"
                            >
                              <div className="relative mx-auto">
                                <img
                                  src={currentReporter.image}
                                  alt={currentReporter.name}
                                  className="w-40 h-40 rounded-full object-cover ring-4 ring-blue-500/30"
                                />
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="absolute inset-0 rounded-full bg-blue-500/20"
                                />
                              </div>
                              <div>
                                <h3 className="text-white text-2xl font-bold mb-2">{currentReporter.name}</h3>
                                <p className="text-white/60">{currentReporter.role}</p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleStartVideo}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-green-500/50 flex items-center gap-3 mx-auto"
                              >
                                <Video className="w-6 h-6" />
                                התחל שיחת וידאו
                              </motion.button>
                            </motion.div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute inset-0 grid grid-cols-2 gap-1"
                            >
                              {/* User's Video (PiP style) */}
                              <div className="col-span-2 row-span-2 relative">
                                <img
                                  src={currentReporter.image}
                                  alt={currentReporter.name}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                                
                                {/* User Camera in corner */}
                                <div className="absolute top-4 right-4 w-32 h-40 rounded-xl overflow-hidden border-2 border-white/30 shadow-xl">
                                  <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                {/* Hidden canvas for capturing */}
                                <canvas ref={canvasRef} className="hidden" />
                                
                                {/* Reporter Info Overlay */}
                                <div className="absolute bottom-24 left-0 right-0 text-center">
                                  <motion.div
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                  >
                                    <h3 className="text-white text-3xl font-bold mb-2">{currentReporter.name}</h3>
                                    <p className="text-white/80 text-lg">{currentReporter.role}</p>
                                  </motion.div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Video Controls */}
                        {videoConnected && (
                          <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="relative z-10 p-6 bg-gradient-to-t from-black/60 to-transparent"
                          >
                            <div className="flex items-center justify-center gap-4">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsMuted(!isMuted)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                                  isMuted 
                                    ? 'bg-red-500 hover:bg-red-600' 
                                    : 'bg-white/20 hover:bg-white/30 backdrop-blur-sm'
                                }`}
                              >
                                {isMuted ? <VolumeX size={24} className="text-white" /> : <Volume2 size={24} className="text-white" />}
                              </motion.button>
                              
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setShowVideo(false);
                                  setShowChat(true);
                                }}
                                className="w-14 h-14 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-lg"
                              >
                                <MessageCircle size={24} className="text-white" />
                              </motion.button>

                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setShowVideo(false);
                                  setVideoConnected(false);
                                }}
                                className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg shadow-red-500/50"
                              >
                                <PhoneOff size={28} className="text-white" />
                              </motion.button>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>


        </div>
      </motion.div>
    </AnimatePresence>
  );
}