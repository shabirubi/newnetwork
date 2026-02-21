import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Send, Video, Loader2, Home, Shield, Download, History, X, Play, Plus, Mic, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import TypewriterText from "../components/videoeditor/TypewriterText";

export default function VideoCreator() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatedVideos, setGeneratedVideos] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // טעינת השיחה השמורה
  useEffect(() => {
    try {
      const saved = localStorage.getItem('digitalDreamsChat');
      if (saved) {
        const { conversationId: savedConvId, messages: savedMessages } = JSON.parse(saved);
        setConversationId(savedConvId);
        setMessages(savedMessages);
      }
    } catch (e) {
      console.error('Error loading saved chat:', e);
    }
  }, []);

  // Load history from HeyGen + Database + localStorage
  useEffect(() => {
    const loadHistory = async () => {
      console.log('🚀 === LOADING VIDEO HISTORY === 🚀');
      setLoadingHistory(true);
      const allVideos = [];
      
      // 1. Load from Digital Dreams FIRST (main source)
      try {
        console.log('🔄 Step 1: Fetching ALL Digital Dreams videos...');
        toast.loading('טוען את כל הסרטונים שלך...', { id: 'loading-heygen' });
        
        const response = await base44.functions.invoke('listHeyGenVideos', {});
        console.log('📡 Digital Dreams Full Response:', response);
        console.log('📡 Response Data:', response?.data);
        console.log('📡 Total videos:', response?.data?.total);
        console.log('📡 Videos Array length:', response?.data?.videos?.length);
        
        if (response?.data?.videos && Array.isArray(response.data.videos)) {
          console.log('✅✅✅ Found', response.data.videos.length, 'videos from Digital Dreams!');
          
          const digitalDreamsVideos = response.data.videos.map(v => ({
            id: v.id,
            title: v.title || `Video ${v.id.substring(0, 8)}`,
            videoUrl: v.video_url,
            timestamp: v.created_at ? new Date(v.created_at * 1000).toISOString() : new Date().toISOString(),
            source: 'digital-dreams',
            thumbnail: v.thumbnail_url,
            duration: v.duration
          }));
          
          allVideos.push(...digitalDreamsVideos);
          console.log('✅ Digital Dreams:', digitalDreamsVideos.length, 'videos added to list');
          console.log('📋 First Digital Dreams video:', digitalDreamsVideos[0]);
          console.log('📋 Last Digital Dreams video:', digitalDreamsVideos[digitalDreamsVideos.length - 1]);
          
          toast.success(`✅ נטענו ${digitalDreamsVideos.length} סרטונים!`, { id: 'loading-heygen', duration: 5000 });
        } else {
          console.warn('⚠️ Digital Dreams: No videos in response');
          toast.error('לא נמצאו סרטונים', { id: 'loading-heygen' });
        }
      } catch (e) {
        console.error('❌ Digital Dreams ERROR:', e);
        toast.error('שגיאה בטעינת סרטונים: ' + e.message, { id: 'loading-heygen' });
      }
      
      // 2. Load from Database
      try {
        console.log('🔄 Step 2: Fetching Database...');
        const dbVideos = await base44.entities.UserVideo.filter({ feed: 'user-videos' }, '-created_date', 100);
        console.log('📡 Database Response:', dbVideos?.length || 0);
        
        if (dbVideos && dbVideos.length > 0) {
          const mapped = dbVideos
            .filter(v => v.video_url)
            .map(v => ({
              id: v.id,
              title: v.title || 'סרטון',
              videoUrl: v.video_url,
              timestamp: v.created_date,
              source: 'database',
              thumbnail: v.thumbnail_url
            }));
          allVideos.push(...mapped);
          console.log('✅ Database:', mapped.length, 'videos loaded');
        }
      } catch (e) {
        console.error('❌ Database ERROR:', e);
      }
      
      // 3. Load from localStorage (backup)
      try {
        console.log('🔄 Step 3: Checking localStorage...');
        const saved = localStorage.getItem('videoDownloadHistory');
        if (saved) {
          const localVideos = JSON.parse(saved);
          allVideos.push(...localVideos);
          console.log('✅ localStorage:', localVideos.length, 'videos loaded');
        }
      } catch (e) {
        console.error('❌ localStorage ERROR:', e);
      }
      
      // 4. Process and set videos
      console.log('🔄 Processing', allVideos.length, 'total videos from all sources...');
      
      if (allVideos.length === 0) {
        console.warn('⚠️ No videos found from any source');
        setLoadingHistory(false);
        toast.error('לא נמצאו סרטונים');
        return;
      }
      
      // Deduplicate by videoUrl - keep most recent
      const uniqueVideos = Array.from(
        new Map(allVideos.map(v => [v.videoUrl, v])).values()
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      console.log('🎯🎯🎯 Setting', uniqueVideos.length, 'unique videos to state!');
      console.log('📦 Full video list:', uniqueVideos.map(v => v.title));
      
      // Save to localStorage
      try {
        localStorage.setItem('videoDownloadHistory', JSON.stringify(uniqueVideos));
        console.log('💾 Saved', uniqueVideos.length, 'videos to localStorage');
      } catch (e) {
        console.error('❌ localStorage save error:', e);
      }
      
      // Update state - THIS WILL TRIGGER RE-RENDER
      setGeneratedVideos(uniqueVideos);
      setLoadingHistory(false);
      
      console.log('✅✅✅ History loaded successfully!', uniqueVideos.length, 'videos ready!');
      toast.success(`✅ סה"כ ${uniqueVideos.length} סרטונים בהיסטוריה`, { duration: 5000 });
    };
    
    loadHistory();
  }, []);

  // Subscribe to conversation
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      // שמירת השיחה ל-localStorage
      localStorage.setItem('digitalDreamsChat', JSON.stringify({
        conversationId,
        messages: data.messages,
        timestamp: new Date().toISOString()
      }));
      const lastMsg = data.messages[data.messages.length - 1];
      if (lastMsg?.tool_calls) {
        lastMsg.tool_calls.forEach(tc => {
          console.log('🔧 Tool call:', tc.name, 'Status:', tc.status);
          
          if (tc.status === 'completed' && tc.results) {
            try {
              const result = typeof tc.results === 'string' ? JSON.parse(tc.results) : tc.results;
              console.log('📦 Tool result:', result);
              
              // If we got video_id, start polling
              if (result.video_id && !result.video_url) {
                console.log('🎬 Got video_id:', result.video_id, 'Starting polling...');
                setLoading(true);
                toast.loading('מתחיל ליצור סרטון...', { id: 'creating' });
                const userMsg = data.messages.find(m => m.role === 'user');
                pollVideoStatus(result.video_id, userMsg?.content || 'סרטון AI');
              }
              
              // If we got video_url directly
              if (result.video_url) {
                console.log('✅ Got video_url directly:', result.video_url);
                const userMsg = data.messages.find(m => m.role === 'user');
                const title = userMsg?.content?.substring(0, 50) || "סרטון AI";
                const newVideo = {
                  id: Date.now(),
                  title,
                  videoUrl: result.video_url,
                  timestamp: new Date().toISOString()
                };
                const updated = [newVideo, ...generatedVideos].slice(0, 20);
                setGeneratedVideos(updated);
                localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                setCurrentVideo(result.video_url);
                setLoading(false);
                toast.success('✅ הסרטון מוכן!', { id: 'creating' });
              }
            } catch (e) {
              console.error('❌ Error parsing result:', e);
            }
          }
        });
      }
    });
    return () => unsubscribe();
  }, [conversationId, generatedVideos]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle paste images
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;

          setUploadingFile(true);
          toast.loading('מעלה תמונה...', { id: 'paste' });

          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });

            let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
            if (!conv) {
              conv = await base44.agents.createConversation({
                agent_name: "video_creator",
                metadata: { name: "סרטון" }
              });
              setConversationId(conv.id);
            }

            await base44.agents.addMessage(conv, {
              role: "user",
              content: input.trim() || "צור סרטון מהתמונה שהדבקתי",
              file_urls: [file_url]
            });

            setInput('');
            toast.success('תמונה הועלתה!', { id: 'paste' });
          } catch (err) {
            toast.error('שגיאה בהעלאת תמונה', { id: 'paste' });
          } finally {
            setUploadingFile(false);
          }
          break;
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [conversationId, input]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast.error('רק תמונות וקבצי PDF מותרים');
      return;
    }

    setUploadingFile(true);
    toast.loading('מעלה...', { id: 'upload' });

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "סרטון" }
        });
        setConversationId(conv.id);
      }

      await base44.agents.addMessage(conv, {
        role: "user",
        content: input.trim() || "צור סרטון מהתמונה הזו",
        file_urls: [file_url]
      });

      setInput('');
      toast.success('מעבד...', { id: 'upload' });
    } catch (err) {
      toast.error(err.message, { id: 'upload' });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success('הקלטה הופסקה, מעלה...', { id: 'voice-stop' });
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = async () => {
          setIsRecording(false);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const audioFile = new File([audioBlob], 'voice.webm', { type: 'audio/webm' });
          
          toast.loading('מעלה הקלטה...', { id: 'voice' });
          
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file: audioFile });
            
            let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
            if (!conv) {
              conv = await base44.agents.createConversation({
                agent_name: "video_creator",
                metadata: { name: "סרטון קולי" }
              });
              setConversationId(conv.id);
            }

            await base44.agents.addMessage(conv, {
              role: "user",
              content: "צור סרטון מההקלטה הקולית שלי",
              file_urls: [file_url]
            });

            toast.success('מעבד הקלטה...', { id: 'voice' });
          } catch (err) {
            toast.error('שגיאה בהעלאת הקלטה: ' + err.message, { id: 'voice' });
          } finally {
            stream.getTracks().forEach(track => track.stop());
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast.success('🎤 מקליט... לחץ שוב לעצירה', { duration: 2000 });
      } catch (err) {
        toast.error('לא ניתן לגשת למיקרופון');
        console.error(err);
      }
    }
  };

  const pollVideoStatus = async (videoId, originalMessage) => {
    let attempts = 0;
    const maxAttempts = 160;
    const totalSeconds = maxAttempts * 3;

    localStorage.setItem('pendingVideoId', videoId);
    localStorage.setItem('pendingVideoTitle', originalMessage);

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const { data } = await base44.functions.invoke('checkHeyGenVideoStatus', { video_id: videoId });

        console.log('📊 Poll #' + (attempts + 1) + ':', data.status, data.video_url ? '✅ URL exists' : '⏳ No URL yet');

        if (data.status === 'completed' && data.video_url) {
          console.log('🎉 VIDEO READY! URL:', data.video_url);
          
          const title = originalMessage.substring(0, 50) || "סרטון AI";
          const newVideo = {
            id: Date.now(),
            title,
            videoUrl: data.video_url,
            timestamp: new Date().toISOString()
          };
          
          localStorage.removeItem('pendingVideoId');
          localStorage.removeItem('pendingVideoTitle');
          
          try {
            const user = await base44.auth.me();
            await base44.entities.UserVideo.create({
              title: title,
              video_url: data.video_url,
              thumbnail_url: '',
              status: 'ready',
              uploader_email: user?.email || 'guest',
              category: 'breaking',
              feed: 'user-videos'
            });
            console.log('💾 Saved to Database');
          } catch (e) {
            console.log('⚠️ DB save skipped:', e.message);
          }
          
          const existing = JSON.parse(localStorage.getItem('videoDownloadHistory') || '[]');
          const updated = [newVideo, ...existing].slice(0, 100);
          localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
          console.log('💾 Saved to localStorage, total videos:', updated.length);
          
          setGeneratedVideos(prev => [newVideo, ...prev]);
          setCurrentVideo(data.video_url);
          setLoading(false);
          
          toast.success('✅ הסרטון מוכן והתווסף להיסטוריה!', { id: 'creating' });
          
          // הצגת הסרטון בתצוגה המקדימה
          window.dispatchEvent(new CustomEvent('digitalDreamsVideoReady', {
            detail: { videoUrl: data.video_url, title }
          }));
          
          console.log('✅ All done!');
          return;
        }

        if (data.status === 'failed' || data.error) {
          console.error('❌ Failed:', data.error);
          localStorage.removeItem('pendingVideoId');
          localStorage.removeItem('pendingVideoTitle');
          setLoading(false);
          toast.error('נכשל: ' + (data.error || 'שגיאה'), { id: 'creating' });
          return;
        }

        const progress = Math.floor((attempts / maxAttempts) * 100);
        const elapsedSeconds = attempts * 3;
        const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);
        const remainingMinutes = Math.ceil(remainingSeconds / 60);

        let stage = 'ערכת נתונים';
        if (progress > 70) stage = '🎬 גימור הסרטון';
        else if (progress > 35) stage = '⚙️ עיבוד וידאו';
        else stage = '🎨 ערכת נתונים';

        toast.loading(
          `יוצר סרטון... ${progress}%\n${stage}\n⏱️ זמן משוער: ${remainingMinutes} דקות`,
          { id: 'creating' }
        );

        attempts++;
      } catch (err) {
        console.error('❌ Polling error:', err);
        attempts++;
      }
    }

    setLoading(false);
    toast.error('הזמן תם - video_id: ' + videoId, { id: 'creating' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);
    toast.loading('מתחיל ליצור סרטון...', { id: 'creating' });

    try {
      let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "יצירת סרטון" }
        });
        setConversationId(conv.id);
      }

      await base44.agents.addMessage(conv, {
        role: "user",
        content: userMessage
      });

    } catch (err) {
      console.error('❌ Error:', err);
      toast.error('שגיאה: ' + err.message);
      setInput(userMessage);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header - Mobile Optimized */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-gray-800 px-3 sm:px-4 py-3 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <Video className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-white">Digital Dreams</h1>
            <p className="text-gray-500 text-[10px] sm:text-xs hidden sm:block">יוצר סרטונים AI</p>
          </div>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            onClick={() => setHistoryOpen(true)}
            variant="outline"
            size="sm"
            className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3"
          >
            <History className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">היסטוריה</span>
            <span className="sm:hidden">({generatedVideos.length})</span>
          </Button>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-1 px-2 sm:px-3">
              <Home className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">חזרה</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main - Mobile Optimized */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-24">
        {/* Center - Video Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto">
          {messages.length === 0 && !currentVideo && (
            <div className="text-center max-w-2xl px-4">
              <Video className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-600 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Digital Dreams - יוצר סרטונים מקצועיים</h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">ספר לי מה אתה רוצה ואני אעזור לך ליצור סרטון מקצועי</p>
            </div>
          )}

          {messages.length > 0 && !currentVideo && !loading && (
            <div className="w-full max-w-3xl space-y-4 px-4 overflow-y-auto max-h-[50vh] pb-32">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-800 text-gray-100'
                  }`}>
                    {msg.file_urls && msg.file_urls.length > 0 && (
                      <div className="mb-2 space-y-2">
                        {msg.file_urls.map((url, i) => (
                          <img 
                            key={i}
                            src={url} 
                            alt="Uploaded" 
                            className="max-w-full rounded-lg border-2 border-white/20"
                          />
                        ))}
                      </div>
                    )}
                    {msg.role === 'assistant' ? (
                      <p className="text-sm sm:text-base whitespace-pre-wrap">
                        <TypewriterText text={msg.content} speed={20} />
                      </p>
                    ) : (
                      <p className="text-sm sm:text-base whitespace-pre-wrap">{msg.content}</p>
                    )}
                    {msg.tool_calls?.map((tc, i) => (
                      <div key={i} className="mt-3">
                        {(tc.status === 'running' || tc.status === 'in_progress') && (
                          <div className="bg-black border-2 border-gray-700 rounded-xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
                              <span className="text-gray-100 font-bold text-lg">מייצר סרטון...</span>
                            </div>
                            <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden mb-3">
                              <motion.div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-gray-400 via-gray-300 to-gray-500 rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 180, ease: "linear" }}
                              />
                            </div>
                            <p className="text-sm text-gray-400 text-center">זמן משוער: 3-5 דקות</p>
                          </div>
                        )}
                        {tc.status === 'completed' && tc.results && (
                          <div className="bg-black border-2 border-green-600 rounded-lg p-4 text-green-400 text-base font-bold">
                            ✅ הסרטון מוכן!
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {(loading || messages.some(msg => msg.tool_calls?.some(tc => tc.status === 'running' || tc.status === 'in_progress'))) && !currentVideo && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-2xl px-4"
            >
              {/* Simple Black Container */}
              <div className="bg-black rounded-2xl p-8 sm:p-12 border border-gray-800">
                {/* Logo/Brand */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">Digital Dreams</h3>
                  <p className="text-gray-400 text-sm">מייצר את הסרטון שלך...</p>
                </div>

                {/* Thin Progress Bar */}
                <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden mb-6">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 90, ease: "linear" }}
                  />
                </div>

                {/* Progress Percentage */}
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.p
                    className="text-4xl sm:text-5xl font-bold text-white mb-4"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                  >
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      {Math.floor(Math.random() * 30 + 45)}%
                    </motion.span>
                  </motion.p>

                  {/* Status Steps */}
                  <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-gray-400">
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      הפקה
                    </motion.span>
                    <span>•</span>
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    >
                      עיבוד
                    </motion.span>
                    <span>•</span>
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                    >
                      גימור
                    </motion.span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {currentVideo && !loading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-4xl px-2 sm:px-0"
            >
              {/* נגן מקצועי בעיצוב קלאסי */}
              <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                {/* Video Player */}
                <div className="relative bg-black">
                  <video 
                    src={currentVideo} 
                    controls 
                    autoPlay
                    playsInline
                    className="w-full aspect-video bg-black"
                    controlsList="nodownload"
                  />
                </div>
                
                {/* Controls Bar - עיצוב מקצועי */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700">
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                        <Video className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm sm:text-base">Digital Dreams Production</h3>
                        <p className="text-gray-400 text-xs">סרטון מוכן להורדה</p>
                      </div>
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-400 text-xs font-bold">מוכן</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <a 
                        href={currentVideo} 
                        download 
                        className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all border border-gray-600 hover:border-gray-500"
                      >
                        <Download className="w-4 h-4" />
                        הורד סרטון
                      </a>
                      <Button
                        onClick={() => {
                          window.dispatchEvent(new CustomEvent('addVideoToEditor', { 
                            detail: { videoUrl: currentVideo } 
                          }));
                          toast.success('הסרטון נוסף לעורך');
                        }}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-medium text-sm transition-all"
                      >
                        הוסף לעורך
                      </Button>
                      <Button
                        onClick={() => setCurrentVideo(null)}
                        variant="outline"
                        className="bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300 px-4 py-3 rounded-lg font-medium text-sm"
                      >
                        צור חדש
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Timeline - Hidden on Mobile */}
        <div className="hidden lg:flex lg:w-80 bg-black/50 border-r border-gray-800 flex-col">
          <div className="p-4 border-b border-gray-800 sticky top-0 z-10 bg-black/90 backdrop-blur-xl">
            <h3 className="text-white font-bold text-lg">🎬 Digital Dreams</h3>
            <p className="text-purple-400 text-sm font-bold">
              {loadingHistory ? '⏳ טוען...' : `✅ ${generatedVideos.length} סרטונים זמינים`}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {loadingHistory && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                <p className="text-white text-sm font-bold">טוען סרטונים...</p>
                <p className="text-gray-500 text-xs mt-1">{generatedVideos.length} נטענו עד כה</p>
              </div>
            )}
            {!loadingHistory && generatedVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-bold">לא נמצאו סרטונים</p>
              </div>
            )}

            {!loadingHistory && generatedVideos.map((video, idx) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all"
              >
                <div 
                  className="relative aspect-video bg-black cursor-pointer"
                  onClick={() => setCurrentVideo(video.videoUrl)}
                >
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-1.5 left-1.5 bg-purple-600 px-1.5 py-0.5 rounded text-white text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-purple-600 to-pink-600 px-1.5 py-0.5 rounded text-white text-xs font-bold">
                    Digital Dreams
                  </div>
                </div>
                <div className="p-2 space-y-1">
                  <p className="text-white text-xs font-medium truncate">{video.title}</p>
                  <p className="text-gray-500 text-[10px]">{new Date(video.timestamp).toLocaleDateString('he-IL')}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('addVideoToEditor', { 
                        detail: { videoUrl: video.videoUrl } 
                      }));
                      toast.success('הסרטון נוסף לעורך!');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded text-[10px] font-bold transition-all"
                  >
                    הוסף לעורך
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Input - Fixed Position */}
      <div className="fixed bottom-4 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black via-gray-900/95 to-transparent backdrop-blur-2xl border-t border-purple-500/30 z-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="flex gap-2 sm:gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile || loading || isRecording}
                variant="ghost"
                size="sm"
                className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-xl px-3 sm:px-4"
              >
                {uploadingFile ? <Loader2 className="w-5 h-5 animate-spin text-purple-400" /> : <Plus className="w-5 h-5 text-purple-400" />}
              </Button>
              <button
                onClick={handleVoiceRecording}
                disabled={uploadingFile || loading}
                className={`${isRecording ? 'bg-red-600/50 hover:bg-red-600/70 animate-pulse' : 'bg-gray-700/50 hover:bg-gray-700'} border border-gray-600/50 rounded-xl px-3 sm:px-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center`}
              >
                {isRecording ? <Square className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-purple-400" />}
              </button>
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !loading) {
                        handleSend();
                      }
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  }}
                  enterKeyHint="send"
                  placeholder="תאר את הסרטון שאתה רוצה... 🎬"
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gray-900/60 border border-gray-700/50 text-white placeholder:text-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                  disabled={loading}
                  autoComplete="off"
                />
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (input.trim() && !loading) {
                    handleSend();
                  }
                }}
                type="button"
                disabled={!input.trim() || loading}
                className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-4 sm:px-8 py-2 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center touch-manipulation active:scale-95"
              >
                {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Send className="w-5 h-5 sm:w-6 sm:h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {historyOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setHistoryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-gray-900 rounded-2xl border border-gray-800 w-full max-w-5xl max-h-[85vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">היסטוריית סרטונים</h2>
                  <p className="text-sm text-gray-400 mt-1">סה"כ {generatedVideos.length} סרטונים</p>
                </div>
                <button
                  onClick={() => setHistoryOpen(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-100px)]">
                {loadingHistory ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                    <p className="text-gray-400 text-lg">טוען את כל הסרטונים שלך...</p>
                  </div>
                ) : generatedVideos.length === 0 ? (
                  <div className="text-center py-16">
                    <Video className="w-20 h-20 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">לא נמצאו סרטונים</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedVideos.map((video, idx) => (
                      <div key={video.id || idx} className="bg-black rounded-xl overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all">
                        <div className="relative">
                          <video 
                            src={video.videoUrl} 
                            controls 
                            className="w-full aspect-video bg-black"
                            preload="metadata"
                          />
                          <div className="absolute top-2 left-2 bg-purple-600 px-2 py-1 rounded text-white text-xs font-bold">
                            #{idx + 1}
                          </div>
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-white text-xs font-bold">
                            Digital Dreams
                          </div>
                        </div>
                        <div className="p-3 space-y-2">
                          <p className="text-white font-medium text-sm line-clamp-2">{video.title}</p>
                          <p className="text-gray-500 text-xs">{new Date(video.timestamp).toLocaleString('he-IL')}</p>
                          <div className="flex gap-2">
                            <a
                              href={video.videoUrl}
                              download
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all"
                            >
                              <Download className="w-4 h-4" />
                              הורד
                            </a>
                            <button
                              onClick={() => {
                                window.dispatchEvent(new CustomEvent('addVideoToEditor', { 
                                  detail: { videoUrl: video.videoUrl } 
                                }));
                                toast.success('הסרטון נוסף לעורך!');
                                setHistoryOpen(false);
                              }}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all"
                            >
                              לעורך
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}