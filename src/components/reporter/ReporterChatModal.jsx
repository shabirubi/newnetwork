import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import {
  X, Send, Mic, MicOff, Volume2, VolumeX, Loader2, User, Radio, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ReporterChatModal({ reporter, article, onClose, isOpen = true }) {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const chatEndRef = useRef(null);
  const queryClient = useQueryClient();

  const [currentUser, setCurrentUser] = useState(null);

  if (!isOpen) return null;

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (err) {
        setCurrentUser({ email: "guest@example.com", full_name: "אורח" });
      }
    };
    getUser();
  }, []);

  // Create conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      if (!currentUser) return;

      try {
        const conv = await base44.agents.createConversation({
          agent_name: "general_reporter",
          metadata: {
            name: `שיחה עם ${reporter.name}`,
            reporter_id: reporter.id,
            reporter_name: reporter.name,
            reporter_role: reporter.role,
            reporter_specialty: reporter.specialty,
            reporter_gender: reporter.gender,
            article_id: article?.id || null,
            article_title: article?.title || null,
            user_email: currentUser.email
          }
        });
        setConversation(conv);

        // Send initial context message
        const contextMessage = article 
          ? `היי! אני ${reporter.name}, ${reporter.role}. אני מתמחה ב${reporter.specialty}. אני כאן כדי לדבר איתך על הכתבה "${article.title}". ${article.subtitle || ''}\n\nמה תרצה לדעת?`
          : `שלום! אני ${reporter.name}, ${reporter.role}. אני מתמחה ב${reporter.specialty}. במה אוכל לעזור לך היום?`;

        await base44.agents.addMessage(conv, {
          role: "assistant",
          content: contextMessage
        });

      } catch (err) {
        console.error("Error creating conversation:", err);
        toast.error("שגיאה ביצירת השיחה");
      }
    };

    initConversation();
  }, [currentUser, reporter, article]);

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });

    return () => unsubscribe();
  }, [conversation]);



  const handleSendMessage = async () => {
    if (!message.trim() || !conversation || isProcessing) return;

    const userMessage = message.trim();
    setMessage("");
    setIsProcessing(true);

    try {
      // Add context about the article if exists
      let fullMessage = userMessage;
      if (article) {
        fullMessage = `[הקשר: הכתבה "${article.title}" - ${article.category}]\n\nשאלת המשתמש: ${userMessage}`;
      }

      await base44.agents.addMessage(conversation, {
        role: "user",
        content: fullMessage
      });

    } catch (err) {
      console.error("Error sending message:", err);
      toast.error("שגיאה בשליחת ההודעה");
    } finally {
      setIsProcessing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100
        } 
      });
      
      // Try to use audio/webm or fallback to available formats
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }
      
      const options = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Send the audio message
        await sendAudioMessage(audioBlob);
      };

      mediaRecorder.start(100); // Record in 100ms chunks
      setIsRecording(true);
      toast.success("🎙️ מקליט... לחץ שוב לעצור");
    } catch (err) {
      console.error("Error starting recording:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        toast.error("נא לאפשר גישה למיקרופון בדפדפן");
      } else if (err.name === 'NotFoundError') {
        toast.error("לא נמצא מיקרופון במכשיר");
      } else {
        toast.error("שגיאה בגישה למיקרופון");
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.info("⏸️ עוצר הקלטה...");
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    if (!conversation || isProcessing) return;
    
    setIsProcessing(true);

    try {
      // Upload audio file
      const file = new File([audioBlob], "voice-question.webm", { type: "audio/webm" });
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Send message with audio
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: "שאלה קולית",
        file_urls: [file_url]
      });

      toast.success("השאלה נשלחה!");
    } catch (err) {
      console.error("Error sending audio message:", err);
      toast.error("שגיאה בשליחת ההקלטה");
    } finally {
      setIsProcessing(false);
      setAudioBlob(null);
    }
  };



  const playVoiceResponse = async (text, messageId) => {
    if (playingMessageId === messageId) {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach(audio => audio.pause());
      setPlayingMessageId(null);
      return;
    }

    setPlayingMessageId(messageId);
    toast.info("מייצר קול מקצועי...");
    
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `המר את הטקסט הבא לדיבור בעברית עם קול ${reporter.gender === 'female' ? 'נקבה טבעי' : 'זכר טבעי'}.
        
טקסט: ${text}

החזר JSON עם:
- voice_type: "female" או "male" בהתאם למגדר הכתב
- text: הטקסט המקורי`,
        response_json_schema: {
          type: "object",
          properties: {
            voice_type: { type: "string" },
            text: { type: "string" }
          }
        }
      });

      // Use browser's Speech Synthesis with improved settings
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'he-IL';
      utterance.volume = 1.0;
      
      // Wait for voices to load
      await new Promise(resolve => {
        if (window.speechSynthesis.getVoices().length > 0) {
          resolve();
        } else {
          window.speechSynthesis.onvoiceschanged = () => resolve();
        }
      });
      
      const voices = window.speechSynthesis.getVoices();
      console.log('Available voices:', voices.map(v => ({name: v.name, lang: v.lang, gender: v.name})));
      
      if (reporter.gender === 'female') {
        // Find actual female Hebrew voices
        const femaleVoices = voices.filter(v => 
          (v.lang.includes('he') || v.lang.includes('iw') || v.lang.includes('IL')) &&
          (v.name.toLowerCase().includes('female') || 
           v.name.toLowerCase().includes('woman') ||
           v.name.toLowerCase().includes('zehira') ||
           v.name.toLowerCase().includes('carmit'))
        );
        
        if (femaleVoices.length > 0) {
          utterance.voice = femaleVoices[0];
          utterance.pitch = 1.3;
          utterance.rate = 1.0;
          console.log('✅ Using female voice:', utterance.voice.name);
        } else {
          utterance.pitch = 1.8;
          utterance.rate = 1.05;
        }
      } else {
        // Find actual male Hebrew voices
        const maleVoices = voices.filter(v => 
          (v.lang.includes('he') || v.lang.includes('iw') || v.lang.includes('IL')) &&
          (v.name.toLowerCase().includes('male') || 
           v.name.toLowerCase().includes('man') ||
           v.name.toLowerCase().includes('asaf') ||
           v.name.toLowerCase().includes('david'))
        );
        
        if (maleVoices.length > 0) {
          utterance.voice = maleVoices[0];
          utterance.pitch = 0.85;
          utterance.rate = 0.95;
          console.log('✅ Using male voice:', utterance.voice.name);
        } else {
          utterance.pitch = 0.7;
          utterance.rate = 0.9;
        }
      }

      utterance.onend = () => setPlayingMessageId(null);
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        setPlayingMessageId(null);
        toast.error('שגיאה בהשמעת קול');
      };
      
      window.speechSynthesis.speak(utterance);
      
    } catch (err) {
      console.error('Voice generation error:', err);
      toast.error('שגיאה בהשמעת קול');
      setPlayingMessageId(null);
    }
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[80vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{reporter.name}</h3>
                <p className="text-sm text-white/90">{reporter.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          {article && (
            <div className="bg-white/10 rounded-lg p-2 text-xs">
              <p className="line-clamp-1">{article.title}</p>
            </div>
          )}
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {!conversation && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3 text-gray-500">
                <Sparkles className="w-8 h-8 animate-pulse text-[#E31E24]" />
                <p className="text-sm">מאתחל שיחה חכמה עם הכתב...</p>
              </div>
            </div>
          )}

          {conversation && messages.length === 0 && !isProcessing && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 text-[#E31E24]" />
                <p className="text-sm">שאל את {reporter.name} שאלה...</p>
              </div>
            </div>
          )}

          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isAssistant = msg.role === 'assistant';
              
              // Skip system messages
              if (msg.role === 'system') return null;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {isAssistant && (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24] shrink-0">
                      <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] ${isUser ? 'bg-[#E31E24] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'} rounded-2xl p-3 shadow-md`}>
                    {isUser ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.content.replace(/\[הקשר:.*?\]\n\n/g, '').replace('שאלת המשתמש: ', '')}
                      </p>
                    ) : (
                      <ReactMarkdown 
                        className="text-sm prose prose-sm prose-slate dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
                        components={{
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                          strong: ({ children }) => <strong className="font-bold text-[#E31E24]">{children}</strong>,
                          ul: ({ children }) => <ul className="list-disc mr-4 mb-2">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal mr-4 mb-2">{children}</ol>,
                          li: ({ children }) => <li className="mb-1">{children}</li>,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                    
                    {isAssistant && (
                      <button
                        onClick={() => playVoiceResponse(msg.content, idx)}
                        className="mt-2 flex items-center gap-1 text-xs text-[#E31E24] hover:text-[#B91C1C] transition-colors"
                      >
                        {playingMessageId === idx ? (
                          <>
                            <VolumeX className="w-3 h-3" />
                            עצור
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            שמע תשובה
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {isProcessing && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#E31E24]">
                <img src={reporter.image} alt={reporter.name} className="w-full h-full object-cover" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-md">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#E31E24]" />
                  <span className="text-xs text-gray-500">{reporter.name} חושב...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-[#E31E24]" />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              צ'אט מופעל ע"י AI מתקדם - תשובות מקצועיות ומעמיקות
            </p>
          </div>
          
          <div className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isProcessing && handleSendMessage()}
              placeholder={`שאל את ${reporter.name} שאלה...`}
              disabled={isProcessing || !conversation || isRecording}
              className="flex-1 dark:bg-gray-700 dark:border-gray-600"
            />
            
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing || !conversation}
              className={`shrink-0 ${isRecording ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </Button>
            
            <Button
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing || !conversation || isRecording}
              className="bg-[#E31E24] hover:bg-[#B91C1C] shrink-0"
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-2">
            <span>{reporter.name} מומחה ב{reporter.specialty}</span>
            <span className="text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Mic className="w-3 h-3" />
              לחץ על המיקרופון לשאלה קולית
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}