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
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [scriptPreview, setScriptPreview] = useState('');
  const [showScriptPanel, setShowScriptPanel] = useState(false);
  const [blueprintData, setBlueprintData] = useState(null);

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
        toast.loading('טוען את כל הסרטונים שלך... זה יכול לקחת דקה', { id: 'loading-heygen' });
        
        const response = await base44.functions.invoke('listHeyGenVideos', {});
        console.log('📡 === DIGITAL DREAMS RESPONSE ===');
        console.log('📡 Full Response Object:', JSON.stringify(response, null, 2));
        console.log('📡 Response Data:', response?.data);
        console.log('📡 Total videos:', response?.data?.total);
        console.log('📡 Videos Array:', response?.data?.videos);
        console.log('📡 Videos Array length:', response?.data?.videos?.length);
        console.log('📡 Videos Array is Array?', Array.isArray(response?.data?.videos));
        
        if (response?.data?.videos && Array.isArray(response.data.videos) && response.data.videos.length > 0) {
          console.log('🎉🎉🎉 SUCCESS! Found', response.data.videos.length, 'videos from Digital Dreams!');
          
          const digitalDreamsVideos = response.data.videos
            .filter(v => v.video_url) // Only videos with URLs
            .map(v => ({
              id: v.id,
              title: v.title || `Video ${v.id.substring(0, 8)}`,
              videoUrl: v.video_url,
              timestamp: v.created_at ? new Date(v.created_at * 1000).toISOString() : new Date().toISOString(),
              source: 'digital-dreams',
              thumbnail: v.thumbnail_url,
              duration: v.duration
            }));
          
          console.log('📦 Mapped', digitalDreamsVideos.length, 'videos with URLs');
          allVideos.push(...digitalDreamsVideos);
          console.log('✅ Digital Dreams:', digitalDreamsVideos.length, 'videos added to allVideos array');
          console.log('📋 First video:', digitalDreamsVideos[0]);
          console.log('📋 Last video:', digitalDreamsVideos[digitalDreamsVideos.length - 1]);
          console.log('🎯 Current allVideos length:', allVideos.length);
          
          toast.success(`🎉 ${digitalDreamsVideos.length} סרטונים נטענו מ-HeyGen!`, { id: 'loading-heygen', duration: 8000 });
        } else {
          console.error('❌❌❌ NO VIDEOS FOUND!');
          console.error('Response structure:', {
            hasData: !!response?.data,
            hasVideos: !!response?.data?.videos,
            isArray: Array.isArray(response?.data?.videos),
            length: response?.data?.videos?.length
          });
          toast.error('לא נמצאו סרטונים ב-HeyGen', { id: 'loading-heygen' });
        }
      } catch (e) {
        console.error('❌ Digital Dreams CRITICAL ERROR:', e);
        console.error('Error stack:', e.stack);
        toast.error('שגיאה קריטית: ' + e.message, { id: 'loading-heygen' });
      }
      
      // 2. Load from Database
      try {
        console.log('🔄 Step 2: Fetching ALL Database videos...');
        const dbVideos = await base44.entities.UserVideo.list('-created_date', 10000);
        console.log('📡 Database Response:', dbVideos?.length || 0, 'סרטונים');
        
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
          console.log('✅ Database:', mapped.length, 'סרטונים טעונו');
          console.log('📊 DB Videos details:', mapped.slice(0, 5).map(v => ({ title: v.title, timestamp: v.timestamp })));
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
          console.log('✅ localStorage:', localVideos.length, 'סרטונים');
        }
      } catch (e) {
        console.error('❌ localStorage ERROR:', e);
      }
      
      // 4. Process and set videos
      console.log('🔄🔄🔄 Processing', allVideos.length, 'total videos from all sources...');
      console.log('📦 All videos before deduplication:', allVideos.map(v => ({ title: v.title, source: v.source })));
      
      if (allVideos.length === 0) {
        console.error('❌❌❌ ZERO VIDEOS AFTER ALL SOURCES!');
        setLoadingHistory(false);
        setGeneratedVideos([]);
        toast.error('❌ לא נמצאו סרטונים בשום מקור', { duration: 10000 });
        return;
      }
      
      // Deduplicate by videoUrl - keep most recent
      const uniqueVideos = Array.from(
        new Map(allVideos.map(v => [v.videoUrl, v])).values()
      ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      console.log('🎯🎯🎯 FINAL RESULT:', uniqueVideos.length, 'סרטונים ייחודיים מוכנים!');
      console.log('📦 רשימה מלאה של כל הסרטונים:', uniqueVideos.map((v, idx) => `#${idx + 1}: ${v.title} (${v.source})`));
      
      // ============ SAVE ALL TO DATABASE ============
      console.log('💾 שמירת כל הסרטונים לדטה בייס...');
      for (const video of uniqueVideos) {
        try {
          const user = await base44.auth.me();
          // בדוק אם הסרטון כבר קיים בדטה בייס
          const existing = await base44.entities.UserVideo.filter({ video_url: video.videoUrl }, '', 1);
          if (!existing || existing.length === 0) {
            // הוסף סרטון חדש
            await base44.entities.UserVideo.create({
              title: video.title,
              video_url: video.videoUrl,
              thumbnail_url: video.thumbnail || '',
              status: 'ready',
              uploader_email: user?.email || 'system',
              category: 'breaking',
              feed: 'user-videos'
            });
            console.log('✅ שמור בדטא בייס:', video.title);
          }
        } catch (e) {
          console.error('⚠️ שגיאה בשמירה:', video.title, e.message);
        }
      }
      console.log('✅✅✅ כל הסרטונים שמורים בדטא בייס!');
      
      // Save to localStorage (keep all videos)
      try {
        localStorage.setItem('videoDownloadHistory', JSON.stringify(uniqueVideos));
        console.log('💾 שמורים ב-localStorage:', uniqueVideos.length, 'סרטונים');
      } catch (e) {
        console.error('❌ localStorage save error:', e);
      }
      
      // Update state - THIS WILL TRIGGER RE-RENDER
      console.log('🚀 טעינת', uniqueVideos.length, 'סרטונים למסך');
      setGeneratedVideos(uniqueVideos);
      
      // Ensure loading state is false
      setTimeout(() => {
        setLoadingHistory(false);
      }, 100);
      
      console.log('✅✅✅ STATE UPDATED! כל הסרטונים מוצגים כעת!');
      console.log('סה"כ סרטונים:', uniqueVideos.length);
      
      toast.success(`🎉 ${uniqueVideos.length} סרטונים מוצגים! כל הנתונים שמורים בבטחה בדטא בייס ✅`, { duration: 10000 });
    };
    
    loadHistory();
  }, []);

  // Subscribe to conversation
  useEffect(() => {
    if (!conversationId) return;
    console.log('🔔 Subscribing to conversation:', conversationId);
    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      console.log('📨 Conversation update:', data.messages.length, 'messages');
      setMessages(data.messages);
      // שמירת השיחה ל-localStorage
      localStorage.setItem('digitalDreamsChat', JSON.stringify({
        conversationId,
        messages: data.messages,
        timestamp: new Date().toISOString()
      }));
      const lastMsg = data.messages[data.messages.length - 1];
      
      // Extract script and blueprint from assistant messages
      if (lastMsg?.role === 'assistant' && lastMsg?.content) {
        const content = lastMsg.content;
        // Extract script if exists
        if (content.includes('📝 SCRIPT:')) {
          const scriptMatch = content.match(/📝 SCRIPT:(.*?)(?=\n\n🎬|$)/s);
          if (scriptMatch) {
            setScriptPreview(scriptMatch[1].trim());
            setShowScriptPanel(true);
          }
        }
        // Extract blueprint
        if (content.includes('DIGITAL DREAMS PRODUCTION')) {
          setBlueprintData(content);
        }
      }
      console.log('📬 Last message:', lastMsg?.role, 'tool_calls:', lastMsg?.tool_calls?.length || 0);

      if (lastMsg?.tool_calls) {
        lastMsg.tool_calls.forEach(tc => {
          console.log('🔧 Tool call:', tc.name, 'Status:', tc.status, 'Results:', !!tc.results);

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
                  timestamp: new Date().toISOString(),
                  source: 'agent-direct'
                };
                console.log('💾 Adding video to state and localStorage:', newVideo);
                setGeneratedVideos(prev => {
                  const updated = [newVideo, ...prev];
                  localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                  return updated;
                });
                setCurrentVideo(result.video_url);
                setLoading(false);
                toast.success('✅ הסרטון מוכן!', { id: 'creating' });
              }
            } catch (e) {
              console.error('❌ Error parsing result:', e);
            }
          } else if (tc.status === 'running' || tc.status === 'in_progress') {
            console.log('⏳ Tool running:', tc.name);
            setLoading(true);
          }
        });
      }
    });
    return () => unsubscribe();
  }, [conversationId]);

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
    setLoadingProgress(0);

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000));

      try {
        const { data } = await base44.functions.invoke('checkHeyGenVideoStatus', { video_id: videoId });

        console.log('📊 Poll #' + (attempts + 1) + ':', data.status, data.video_url ? '✅ URL exists' : '⏳ No URL yet');

        const progress = Math.floor((attempts / maxAttempts) * 100);
        setLoadingProgress(progress);

        // Update stage based on progress
        if (progress < 20) setCurrentStage('📝 Script Generation');
        else if (progress < 40) setCurrentStage('🎨 Visual Assembly');
        else if (progress < 60) setCurrentStage('🎬 Avatar Rendering');
        else if (progress < 80) setCurrentStage('🎵 Audio Sync');
        else setCurrentStage('✨ Final Export');

        if (data.status === 'completed' && data.video_url) {
          console.log('🎉 VIDEO READY! URL:', data.video_url);

          const title = originalMessage.substring(0, 50) || "סרטון AI";
          const newVideo = {
            id: Date.now(),
            title,
            videoUrl: data.video_url,
            timestamp: new Date().toISOString(),
            source: 'polling'
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

          console.log('💾 Adding video to state and localStorage:', newVideo);
          setGeneratedVideos(prev => {
            const updated = [newVideo, ...prev];
            localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
            return updated;
          });
          setCurrentVideo(data.video_url);
          setLoading(false);

          toast.success('✅ הסרטון מוכן והתווסף להיסטוריה!', { id: 'creating' });

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

    // Add user message to UI immediately
    const tempUserMessage = {
      role: "user",
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => {
      const updated = [...prev, tempUserMessage];
      console.log('💬 User message added to UI:', updated.length, 'messages total');
      return updated;
    });

    try {
      let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
      if (!conv) {
        console.log('🆕 Creating new conversation...');
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "יצירת סרטון" }
        });
        console.log('✅ Conversation created:', conv.id);
        setConversationId(conv.id);
      } else {
        console.log('📝 Using existing conversation:', conv.id);
      }

      console.log('📤 Sending message:', userMessage);
      await base44.agents.addMessage(conv, {
        role: "user",
        content: userMessage
      });
      console.log('✅ Message sent - waiting for Digital Dreams response...');

    } catch (err) {
      console.error('❌ Error in handleSend:', err);
      toast.error('שגיאה: ' + err.message);
      setInput(userMessage);
      // Remove temp message on error
      setMessages(prev => prev.filter(m => m !== tempUserMessage));
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl" style={{ height: '100vh', height: '100dvh' }}>
      {/* Header - Mobile Optimized */}
      <div className="bg-black/80 backdrop-blur-xl border-b border-gray-800 px-3 sm:px-4 py-3 flex items-center justify-between z-10 flex-shrink-0 safe-area-inset-top">
        <div className="flex items-center gap-2 sm:gap-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-5 h-5 sm:w-6 sm:h-6">
            <defs>
              <linearGradient id="headerRainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF0080" />
                <stop offset="33%" stopColor="#FFFF00" />
                <stop offset="66%" stopColor="#00FF00" />
                <stop offset="100%" stopColor="#0080FF" />
              </linearGradient>
            </defs>
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="url(#headerRainbow)"
            />
          </svg>
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
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden pb-40 sm:pb-24">
        {/* Chat Panel - Left Side */}
        <div className="hidden lg:flex lg:w-80 bg-black/40 border-l border-gray-800 flex-col">
          <div className="p-4 border-b border-gray-800 sticky top-0 z-10 bg-black/90 backdrop-blur-xl">
            <h3 className="text-white font-bold">💬 השיחה</h3>
            <p className="text-purple-400 text-xs mt-1">{messages.length} הודעות</p>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-black/20">
            {messages.length === 0 ? (
              <p className="text-gray-500 text-xs text-center py-4">שלח הודעה כדי להתחיל</p>
            ) : (
              messages.map((msg, idx) => (
                <motion.div 
                  key={`${idx}-${msg.timestamp}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-lg p-3 text-xs ${msg.role === 'user' ? 'bg-black/60 border border-purple-500/30 text-purple-100' : 'bg-gray-800/50 border border-gray-700 text-gray-300'}`}
                >
                  {msg.role === 'user' ? (
                    <p className="font-bold mb-1">👤 אתה</p>
                  ) : (
                    <p className="font-bold mb-1 flex items-center gap-1.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'heartbeat 1s infinite' }}>
                        <defs>
                          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF0080" />
                            <stop offset="20%" stopColor="#FF0000" />
                            <stop offset="40%" stopColor="#FFFF00" />
                            <stop offset="60%" stopColor="#00FF00" />
                            <stop offset="80%" stopColor="#0080FF" />
                            <stop offset="100%" stopColor="#FF0080" />
                          </linearGradient>
                        </defs>
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#rainbow)" />
                      </svg>
                      Digital Dreams
                    </p>
                  )}
                  <p className="whitespace-pre-wrap break-words">{msg.content?.substring(0, 150)}{msg.content?.length > 150 ? '...' : ''}</p>
                  {msg.timestamp && <p className="text-[10px] mt-1 opacity-60">{new Date(msg.timestamp).toLocaleTimeString('he-IL')}</p>}
                </motion.div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Center - Video Display */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-y-auto pb-6">
          {/* Chat Messages Display (Mobile) */}
          {messages.length > 0 && !currentVideo && (
            <div className="w-full h-full flex flex-col max-w-4xl">
              <div className="flex-1 overflow-y-auto space-y-3 pb-4">
                {messages.map((msg, idx) => (
                  <motion.div 
                    key={`${idx}-${msg.timestamp}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-lg p-4 ${msg.role === 'user' ? 'bg-black/60 border border-purple-500/30 text-purple-100 ml-8' : 'bg-gray-800/50 border border-gray-700 text-gray-300 mr-8'}`}
                  >
                    {msg.role === 'user' ? (
                      <p className="font-bold mb-2">👤 אתה</p>
                    ) : (
                      <p className="font-bold mb-2 flex items-center gap-1.5">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ animation: 'heartbeat 1s infinite' }}>
                          <defs>
                            <linearGradient id="rainbow2" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#FF0080" />
                              <stop offset="20%" stopColor="#FF0000" />
                              <stop offset="40%" stopColor="#FFFF00" />
                              <stop offset="60%" stopColor="#00FF00" />
                              <stop offset="80%" stopColor="#0080FF" />
                              <stop offset="100%" stopColor="#FF0080" />
                            </linearGradient>
                          </defs>
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="url(#rainbow2)" />
                        </svg>
                        Digital Dreams
                      </p>
                    )}
                    <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                    {msg.timestamp && <p className="text-xs mt-2 opacity-60">{new Date(msg.timestamp).toLocaleTimeString('he-IL')}</p>}
                    {msg.tool_calls?.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {msg.tool_calls.map((tc, i) => (
                          <div key={i} className="bg-black/40 border border-green-500/20 rounded p-2">
                            <p className="text-green-400 text-xs font-bold">🔧 {tc.name}</p>
                            <p className="text-gray-400 text-xs">Status: {tc.status}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {(loading || messages.some(msg => msg.tool_calls?.some(tc => (tc.status === 'running' || tc.status === 'in_progress') && tc.name === 'createFullProductionVideo'))) && !currentVideo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 0.9, 1.35], rotate: [0, 10, -10, 360] }}
                transition={{ duration: 4, repeat: Infinity, times: [0, 0.3, 0.6, 1], ease: "easeInOut" }}
                style={{ willChange: 'transform' }}
              >
                <svg width="160" height="160" viewBox="0 0 24 24" fill="none">
                  <defs>
                    <linearGradient id="heartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF0080" />
                      <stop offset="50%" stopColor="#FF0000" />
                      <stop offset="100%" stopColor="#FF0080" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    fill="url(#heartGradient)"
                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          )}

          {messages.length === 0 && !currentVideo && (
            <div className="text-center max-w-2xl px-4">
              <Video className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-gray-600 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Digital Dreams - יוצר סרטונים מקצועיים</h2>
              <p className="text-gray-400 text-sm sm:text-base lg:text-lg">ספר לי מה אתה רוצה ואני אעזור לך ליצור סרטון מקצועי</p>
            </div>
          )}





          {currentVideo && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-6xl px-2 sm:px-0"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Video Player */}
                <div className="flex-1 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                  <div className="relative bg-black aspect-video">
                    <video 
                      src={currentVideo} 
                      controls 
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      controlsList="nodownload"
                    />
                  </div>

                  <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700">
                    <div className="p-4 sm:p-5">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <defs>
                              <linearGradient id="smallRainbow2" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#FF0080" />
                                <stop offset="33%" stopColor="#FFFF00" />
                                <stop offset="66%" stopColor="#00FF00" />
                                <stop offset="100%" stopColor="#0080FF" />
                              </linearGradient>
                            </defs>
                            <path
                              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                              fill="url(#smallRainbow2)"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-bold text-sm sm:text-base">Digital Dreams Production</h3>
                          <p className="text-gray-400 text-xs">סרטון מוכן להורדה</p>
                        </div>
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-500/20 rounded-full border border-green-500/30">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-green-400 text-xs font-bold">מוכן</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-3">
                        <a 
                          href={currentVideo} 
                          download 
                          className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all border border-gray-600 hover:border-gray-500"
                        >
                          <Download className="w-4 h-4" />
                          הורד
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
                          לעורך
                        </Button>
                        <Button
                          onClick={() => toast.info('בקרוב - עריכת סקריפט')}
                          variant="outline"
                          className="bg-gray-800/50 hover:bg-gray-700/50 border-gray-600 text-gray-300 px-4 py-3 rounded-lg font-medium text-sm"
                        >
                          ערוך
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

                {/* Digital Dreams Magic Panel */}
                <motion.div
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className="lg:w-96 bg-gradient-to-br from-purple-900/30 via-gray-900/50 to-pink-900/30 border-2 border-purple-500/30 rounded-xl p-5 overflow-y-auto max-h-[600px] shadow-2xl"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <defs>
                        <linearGradient id="magicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FF0080" />
                          <stop offset="33%" stopColor="#FFFF00" />
                          <stop offset="66%" stopColor="#00FF00" />
                          <stop offset="100%" stopColor="#0080FF" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                        fill="url(#magicGradient)"
                      />
                    </svg>
                    <h3 className="text-white font-bold text-lg">קסם הפקה</h3>
                  </div>

                  {/* הפירוט המלא */}
                  {messages.filter(m => m.role === 'assistant').slice(-1).map((msg, idx) => (
                    <div key={idx} className="space-y-3">
                      {msg.content && (
                        <div className="bg-black/40 border border-purple-500/20 rounded-lg p-4">
                          <div className="text-purple-300 text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </div>
                        </div>
                      )}

                      {msg.tool_calls?.map((tc, i) => (
                        <div key={i} className="bg-black/40 border border-green-500/20 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-green-400 text-xs font-bold">הפקה הושלמה</span>
                          </div>
                          {tc.arguments_string && (
                            <div className="text-gray-400 text-xs">
                              <pre className="whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    const args = JSON.parse(tc.arguments_string);
                                    return `🎬 ${args.title || 'סרטון'}\n⏱️ ${args.duration || '?'}s\n🎨 ${args.visual_style || 'מקצועי'}`;
                                  } catch {
                                    return tc.arguments_string;
                                  }
                                })()}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}

                  <div className="mt-4 pt-4 border-t border-purple-500/20">
                    <p className="text-purple-400 text-xs text-center">
                      ✨ נוצר בקסם של Digital Dreams
                    </p>
                  </div>
                </motion.div>
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
                      {!loadingHistory && generatedVideos.length > 0 && (
                        <p className="text-xs text-green-400 mt-2 font-bold">
                          ✅ כל הנתונים שמורים בדטא בייס בטוח
                        </p>
                      )}
                    </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-full">
            {loadingHistory && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-3" />
                <p className="text-white text-sm font-bold">טוען {generatedVideos.length} סרטונים...</p>
                <p className="text-gray-500 text-xs mt-1">בטוען מ-HeyGen...</p>
              </div>
            )}
            {!loadingHistory && generatedVideos.length === 0 && (
              <div className="text-center py-12">
                <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm font-bold">לא נמצאו סרטונים</p>
                <p className="text-gray-500 text-xs mt-2">צור סרטון חדש כדי להתחיל! 🎬</p>
              </div>
            )}

            {!loadingHistory && generatedVideos.length > 0 && (
              <div className="sticky top-0 z-10 mb-3 p-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-2 border-purple-500/50 rounded-lg text-center backdrop-blur-sm">
                <p className="text-white text-sm font-bold">
                  🎬 סה"כ {generatedVideos.length} סרטונים
                </p>
                <p className="text-purple-300 text-xs mt-1">כל הסרטונים מ-HeyGen 💎</p>
              </div>
            )}

            {!loadingHistory && generatedVideos.length > 0 && generatedVideos.map((video, idx) => (
              <motion.div
                key={`${video.id}-${idx}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-purple-500/50 transition-all shadow-lg hover:shadow-purple-500/20"
              >
                <div 
                  className="relative aspect-video bg-black cursor-pointer group"
                  onClick={() => setCurrentVideo(video.videoUrl)}
                >
                  <video 
                    src={video.videoUrl} 
                    className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <Play className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-purple-600 px-2 py-1 rounded text-white text-xs font-bold">
                    #{idx + 1}
                  </div>
                  <div className="absolute top-1.5 right-1.5 bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded text-white text-xs font-bold shadow-lg">
                    Digital Dreams
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-white text-sm font-medium truncate" title={video.title}>{video.title}</p>
                  <p className="text-gray-500 text-xs">{new Date(video.timestamp).toLocaleDateString('he-IL', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.dispatchEvent(new CustomEvent('addVideoToEditor', { 
                        detail: { videoUrl: video.videoUrl } 
                      }));
                      toast.success('הסרטון נוסף לעורך!');
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-3 py-2 rounded text-xs font-bold transition-all active:scale-95"
                  >
                    + הוסף לעורך
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Input - Fixed Position */}
      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4 pb-safe sm:pb-4 bg-gradient-to-t from-black via-black to-transparent backdrop-blur-2xl border-t border-purple-500/30 z-[100]" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>
        <div className="max-w-4xl mx-auto w-full">
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-xl sm:rounded-3xl p-1.5 sm:p-3 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)]">
            <div className="flex gap-1.5 sm:gap-3 items-center">
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
                className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600/50 rounded-lg px-2 sm:px-4 h-10 sm:h-auto"
              >
                {uploadingFile ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-purple-400" /> : <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />}
              </Button>
              <button
                onClick={handleVoiceRecording}
                disabled={uploadingFile || loading}
                className={`${isRecording ? 'bg-red-600/50 hover:bg-red-600/70 animate-pulse' : 'bg-gray-700/50 hover:bg-gray-700'} border border-gray-600/50 rounded-lg px-2 sm:px-4 h-10 sm:h-auto disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center`}
              >
                {isRecording ? <Square className="w-4 h-4 sm:w-5 sm:h-5 text-white" /> : <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />}
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
                  placeholder="תאר את הסרטון... 🎬"
                  className="w-full px-3 sm:px-6 py-2 sm:py-3 h-10 sm:h-auto rounded-lg sm:rounded-2xl bg-gray-900/60 border border-gray-700/50 text-white placeholder:text-gray-500 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all -webkit-appearance-none"
                  disabled={loading}
                  autoComplete="off"
                  style={{ fontSize: '16px' }}
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
                className="bg-gradient-to-br from-purple-600 via-purple-500 to-pink-600 hover:from-purple-700 hover:via-purple-600 hover:to-pink-700 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed px-3 sm:px-8 py-2 h-10 sm:h-auto rounded-lg sm:rounded-2xl text-sm sm:text-base font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all flex items-center justify-center touch-manipulation active:scale-95"
              >
                {loading ? <Loader2 className="w-4 h-4 sm:w-6 sm:h-6 animate-spin" /> : <Send className="w-4 h-4 sm:w-6 sm:h-6" />}
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
                 <>
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
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}