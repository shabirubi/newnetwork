import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Video, Loader2, Sparkles, Home, Shield, MessageSquare, ChevronRight, Plus, Play, Download, Wand2, History, Trash2, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import DownloadHistory from "../components/home/DownloadHistory";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(null);

  const messagesEndRef = useRef(null);
  const [showChat, setShowChat] = useState(true);
  const [uploadingFile, setUploadingFile] = useState(false);
  const fileInputRef = useRef(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [lastVideo, setLastVideo] = useState(null);
  const [videoClips, setVideoClips] = useState([]);
  const [mergingVideos, setMergingVideos] = useState(false);
  const multiFileInputRef = useRef(null);
  const [editorView, setEditorView] = useState('welcome'); // 'welcome', 'library', 'timeline'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Fetch HeyGen avatars
  const { data: heygenAvatars = [] } = useQuery({
    queryKey: ['heygen-avatars'],
    queryFn: async () => {
      const result = await base44.functions.invoke('listHeyGenAvatars', {});
      return result.data?.avatars || [];
    },
    staleTime: 5 * 60 * 1000 // Cache for 5 minutes
  });

  // Available avatars - use HeyGen avatars directly
  const avatars = heygenAvatars.map(a => ({
    id: a.avatar_id,
    name: a.avatar_name,
    image: a.preview_image_url,
    gender: a.gender,
    type: 'heygen',
    videoPreview: a.preview_video_url
  }));

  // Fetch site videos - מאגר ענק!
  const { data: siteVideos = [], isLoading: loadingVideos } = useQuery({
    queryKey: ['user-videos'],
    queryFn: async () => {
      const videos = await base44.entities.UserVideo.list('-created_date', 200);
      return videos || [];
    },
    staleTime: 30000
  });

  // Filter videos
  const filteredVideos = siteVideos.filter(video => {
    const matchSearch = video.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // Categories
  const categories = [
    { id: 'all', label: 'הכל', count: siteVideos.length },
    { id: 'breaking', label: 'חדשות חמות', count: siteVideos.filter(v => v.category === 'breaking').length },
    { id: 'security', label: 'ביטחון', count: siteVideos.filter(v => v.category === 'security').length },
    { id: 'politics', label: 'פוליטיקה', count: siteVideos.filter(v => v.category === 'politics').length },
    { id: 'sports', label: 'ספורט', count: siteVideos.filter(v => v.category === 'sports').length },
    { id: 'entertainment', label: 'בידור', count: siteVideos.filter(v => v.category === 'entertainment').length },
  ];

  // Subscribe to conversation updates
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [conversationId]);



  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Select first avatar when avatars load
  useEffect(() => {
    if (avatars.length > 0 && !selectedAvatar) {
      setSelectedAvatar(avatars[0]);
    }
  }, [heygenAvatars]);

  const handleMultiVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingFile(true);
    toast.loading('מעלה סרטונים...', { id: 'upload-clips' });

    try {
      const uploadedClips = [];
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        uploadedClips.push({
          id: Math.random(),
          url: file_url,
          name: file.name,
          duration: 0
        });
      }
      setVideoClips(prev => [...prev, ...uploadedClips]);
      toast.success(`${files.length} videos uploaded`, { id: 'upload-clips' });
    } catch (err) {
      toast.error('שגיאה בהעלאת סרטונים', { id: 'upload-clips' });
    } finally {
      setUploadingFile(false);
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - support both images and videos
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const videoTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    const allValidTypes = [...imageTypes, ...videoTypes];

    if (!allValidTypes.includes(file.type)) {
      toast.error('PNG, JPG, MP4, MOV (עד 100MB)');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('מקסימום 100MB');
      return;
    }

    setUploadingFile(true);
    toast.loading('מעלה...', { id: 'upload' });

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const isVideo = videoTypes.includes(file.type);

      // Create or get conversation
      let conv = conversationId ? await base44.agents.getConversation(conversationId) : null;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "יצירת סרטון" }
        });
        setConversationId(conv.id);
        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages);
        });
      }

      // Send to agent with file
      await base44.agents.addMessage(conv, {
        role: "user",
        content: isVideo ? 
          `I uploaded a video. Analyze it and create an improved version with HeyGen. ${input.trim() || 'Make it professional and engaging'}` :
          `I uploaded an image. Create a talking avatar video from it. ${input.trim() || 'Make it speak professionally'}`,
        file_urls: [file_url]
      });

      setInput('');
      toast.success('מעבד...', { id: 'upload' });

    } catch (err) {
      console.error(err);
      toast.error(err.message, { id: 'upload' });
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setLoading(true);

    try {
      // Create conversation if doesn't exist
      if (!conversationId) {
        const conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "יצירת סרטון" }
        });
        setConversationId(conv.id);
        setMessages([]);

        // Subscribe to updates
        base44.agents.subscribeToConversation(conv.id, (data) => {
          setMessages(data.messages);
        });

        // Send first message
        await base44.agents.addMessage(conv, {
          role: "user",
          content: userMessage
        });
      } else {
        // Add to existing conversation
        const conv = await base44.agents.getConversation(conversationId);
        await base44.agents.addMessage(conv, {
          role: "user",
          content: userMessage
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(`שגיאה: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-black border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-gray-900 flex items-center justify-center border border-gray-800">
            <Video className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Video Studio</h1>
            <p className="text-gray-500 text-xs">Professional Video Editor</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setEditorView('welcome')}
              variant={editorView === 'welcome' ? 'default' : 'outline'}
              size="sm"
              className={`gap-2 ${editorView === 'welcome' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'}`}
            >
              <Home className="w-4 h-4" />
              Home
            </Button>
            <Button
              onClick={() => setEditorView('library')}
              variant="outline"
              size="sm"
              className={`gap-2 ${editorView === 'library' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'}`}
            >
              <Video className="w-4 h-4" />
              Library ({siteVideos.length})
            </Button>
            {videoClips.length > 0 && (
              <Button
                onClick={() => setEditorView('timeline')}
                variant="outline"
                size="sm"
                className={`gap-2 ${editorView === 'timeline' ? 'bg-white text-black' : 'bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800'}`}
              >
                <Play className="w-4 h-4" />
                Timeline ({videoClips.length})
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800"
            >
              <History className="w-4 h-4" />
              History
            </Button>
            <input
              ref={multiFileInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={handleMultiVideoUpload}
              className="hidden"
            />
            <Button
              onClick={() => multiFileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="gap-2 bg-gray-900 text-gray-400 border-gray-800 hover:bg-gray-800"
            >
              <Plus className="w-4 h-4" />
              Upload
            </Button>
          </div>
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה
            </Button>
          </Link>
          <a href={createPageUrl("AdminPanel")} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-2 bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 400 }}
              exit={{ width: 0 }}
              className="bg-black/30 border-l border-gray-800 flex flex-col"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  עוזר AI לבניית סצנות
                </h3>
                <p className="text-gray-400 text-xs mt-1">תאר את הסרטון והאג'נט יבנה את הסצנות</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Describe your video and AI will build it</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-gray-800 text-white"
                          : "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                      }`}
                    >
                      {msg.file_urls && msg.file_urls.length > 0 && (
                        <motion.div 
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="mb-3 space-y-2"
                        >
                          {msg.file_urls.map((url, i) => (
                            <div key={i} className="relative group">
                              <img 
                                src={url} 
                                alt="תמונה שהועלתה"
                                className="w-full rounded-lg border-2 border-purple-500/50 shadow-xl object-cover max-h-64"
                                onError={(e) => {
                                  console.error('Failed to load image:', url);
                                  e.target.style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-2">
                                <span className="text-white text-xs">Image uploaded</span>
                              </div>
                            </div>
                          ))}
                        </motion.div>
                      )}
                      {msg.video_url && (
                        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700 mb-3">
                          <video 
                            src={msg.video_url} 
                            controls 
                            className="w-full h-full"
                            playsInline
                          />
                          <a 
                            href={msg.video_url}
                            download
                            className="absolute top-2 right-2 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs font-bold transition-all"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            הורד
                          </a>
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.tool_calls?.map((toolCall, i) => {
                        console.log('Tool call:', toolCall);
                        return (
                          <motion.div 
                            key={i} 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mt-3"
                          >
                            {(toolCall.status === 'running' || toolCall.status === 'in_progress') && (
                              <div className="p-4 bg-black/50 rounded-xl border border-gray-700 space-y-3">
                                {/* Mobile Native Video Player Skeleton */}
                                <div className="w-full aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center relative">
                                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black opacity-30" />

                                  {/* Center Play Button */}
                                  <motion.div
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="relative z-10 flex items-center justify-center"
                                  >
                                    <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                                      <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                                    </div>
                                  </motion.div>

                                  {/* Loading Indicator */}
                                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                                    <div className="flex gap-0.5">
                                      {[0, 1, 2].map((i) => (
                                        <motion.div
                                          key={i}
                                          className="w-1.5 h-1.5 bg-white rounded-full"
                                          animate={{ opacity: [0.4, 1, 0.4] }}
                                          transition={{ duration: 1.2, delay: i * 0.2, repeat: Infinity }}
                                        />
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {/* Status */}
                                <div className="text-center">
                                  <p className="text-white font-semibold text-sm">מייצר סרטון...</p>
                                  <p className="text-gray-400 text-xs mt-1">עד 2 דקות</p>
                                </div>
                              </div>
                            )}
                            
                            {toolCall.status === 'completed' && toolCall.results && (() => {
                              try {
                                const result = typeof toolCall.results === 'string' ? JSON.parse(toolCall.results) : toolCall.results;
                                console.log('Result:', result);
                                if (result.video_url) {
                                  // Save to history
                                  const videoData = {
                                    title: userMessage?.content?.substring(0, 30) || "סרטון",
                                    videoUrl: result.video_url,
                                    script: userMessage?.content
                                  };

                                  // Save to localStorage
                                  setTimeout(() => {
                                    const newDownload = {
                                      id: Math.random(),
                                      title: videoData.title,
                                      videoUrl: videoData.videoUrl,
                                      timestamp: new Date().toISOString(),
                                      scriptPreview: videoData.script?.substring(0, 50) + "..."
                                    };
                                    const saved = localStorage.getItem('videoDownloadHistory') || '[]';
                                    const downloads = JSON.parse(saved);
                                    const updated = [newDownload, ...downloads].slice(0, 20);
                                    localStorage.setItem('videoDownloadHistory', JSON.stringify(updated));
                                  }, 100);

                                  return (
                                    <div className="p-4 bg-black/50 rounded-xl border border-green-500/50 space-y-3">
                                      {/* Video Container */}
                                      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
                                        <video 
                                          src={result.video_url} 
                                          controls 
                                          className="w-full h-full"
                                          playsInline
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex gap-2">
                                        <a 
                                          href={result.video_url} 
                                          download 
                                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                        >
                                          <Download className="w-3 h-3" />
                                          הורד
                                        </a>
                                        <button
                                          onClick={() => {
                                            setInput(userMessage?.content || "");
                                            setMessages(prev => prev.slice(0, -1));
                                          }}
                                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                                        >
                                          <Wand2 className="w-3 h-3" />
                                          שנה
                                        </button>
                                      </div>

                                      {/* Success Message */}
                                      <p className="text-center text-green-300 text-xs font-semibold">Saved to history</p>
                                    </div>
                                  );
                                }
                              } catch (e) {
                                console.error('Parse error:', e);
                                return null;
                              }
                              return null;
                            })()}

                            {toolCall.status === 'failed' && (
                              <div className="p-4 bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-500/30">
                                <div className="text-red-300 font-bold mb-1">Error creating video</div>
                                <div className="text-red-200/70 text-xs">נסה שוב או שנה את התסריט</div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">בונה סצנות...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-800">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="תאר את הסרטון שאתה רוצה (הכל אוטומטי)..."
                      className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none min-h-[80px]"
                      rows={3}
                    />
                    <div className="flex flex-col gap-2 shrink-0">
                      <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingFile || loading}
                        size="sm"
                        variant="outline"
                        className="h-[38px] w-[38px] p-0"
                      >
                        {uploadingFile ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        onClick={handleSend}
                        disabled={!input.trim() || loading || uploadingFile}
                        size="sm"
                        className="bg-gradient-to-br from-purple-600 to-pink-600 h-[38px] w-[38px] p-0"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center: Main Display */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Welcome View */}
          {editorView === 'welcome' && (
            <div className="flex-1 bg-black flex items-center justify-center p-6">
              <div className="text-center max-w-2xl">
                <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-lg mx-auto mb-6 flex items-center justify-center">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">Video Studio</h2>
                <p className="text-gray-500 text-lg mb-8">
                  Professional video editor with {siteVideos.length} clips library
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setEditorView('library')}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:bg-gray-800 transition-colors text-left"
                  >
                    <Video className="w-8 h-8 text-gray-400 mb-4" />
                    <h3 className="text-white font-bold mb-2">Video Library</h3>
                    <p className="text-gray-500 text-sm">{siteVideos.length} clips available</p>
                  </button>
                  <button
                    onClick={() => {
                      setShowChat(true);
                      setEditorView('library');
                    }}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:bg-gray-800 transition-colors text-left"
                  >
                    <Sparkles className="w-8 h-8 text-gray-400 mb-4" />
                    <h3 className="text-white font-bold mb-2">AI Creator</h3>
                    <p className="text-gray-500 text-sm">Generate videos with AI</p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Library View */}
          {editorView === 'library' && (
            <div className="flex-1 bg-black flex flex-col overflow-hidden">
              {/* Search & Filters */}
              <div className="p-4 border-b border-gray-800">
                <div className="max-w-7xl mx-auto space-y-4">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded text-white placeholder-gray-600 focus:outline-none focus:border-gray-700"
                  />
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded font-medium text-sm whitespace-nowrap transition-all ${
                          selectedCategory === cat.id
                            ? 'bg-white text-black'
                            : 'bg-gray-900 text-gray-400 border border-gray-800 hover:bg-gray-800'
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Videos Grid */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-7xl mx-auto">
                  {loadingVideos ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-12 h-12 text-gray-600 mx-auto mb-3 animate-spin" />
                      <p className="text-gray-500">Loading library...</p>
                    </div>
                  ) : filteredVideos.length === 0 ? (
                    <div className="text-center py-12">
                      <Video className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                      <p className="text-gray-500">No videos found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {filteredVideos.map((video) => {
                        const isInEditor = videoClips.find(c => c.url === video.video_url);
                        return (
                          <motion.div
                            key={video.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-950 rounded border border-gray-800 hover:border-gray-700 transition-all overflow-hidden group cursor-pointer"
                            onClick={() => {
                              if (!isInEditor) {
                                setVideoClips(prev => [...prev, {
                                  id: Math.random(),
                                  url: video.video_url,
                                  name: video.title,
                                  duration: video.duration || 0
                                }]);
                                toast.success(`Added to timeline`);
                                setEditorView('timeline');
                              }
                            }}
                          >
                            <div className="relative aspect-video bg-black">
                              <video 
                                src={video.video_url} 
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="bg-white text-black px-3 py-1.5 rounded text-sm font-medium">
                                  {isInEditor ? 'Added' : 'Add to timeline'}
                                </div>
                              </div>
                              {isInEditor && (
                                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                                  <span className="text-black text-xs">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="p-2.5">
                              <h3 className="text-white text-sm truncate font-medium">{video.title}</h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span>{video.views || 0} views</span>
                                {video.duration && <span>{video.duration}s</span>}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Editor View - Professional */}
          {editorView === 'timeline' && videoClips.length > 0 && (
            <div className="flex-1 bg-black flex flex-col overflow-hidden">
              {/* Preview Monitor */}
              <div className="h-[45%] bg-gradient-to-br from-gray-950 to-black border-b border-gray-800 flex">
                <div className="flex-1 flex items-center justify-center p-6">
                  <div className="w-full max-w-4xl aspect-video bg-black rounded-lg border border-gray-800 overflow-hidden relative">
                    {videoClips.length > 0 ? (
                      <video 
                        src={videoClips[0].url} 
                        controls
                        className="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-600">
                        <Video className="w-16 h-16" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-lg text-white text-sm font-bold">
                      תצוגה מקדימה
                    </div>
                  </div>
                </div>
                
                {/* Side Panel */}
                <div className="w-80 bg-gray-950 border-l border-gray-800 p-4 overflow-y-auto">
                  <h3 className="text-white font-medium mb-4 text-sm">Export Settings</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-black rounded p-4 border border-gray-800">
                      <h4 className="text-white font-medium text-sm mb-3">Project Info</h4>
                      <div className="space-y-2 text-xs text-gray-500">
                        <div className="flex justify-between">
                          <span>Clips</span>
                          <span className="text-white font-medium">{videoClips.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Duration</span>
                          <span className="text-white font-medium">~{videoClips.length * 10}s</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={async () => {
                        if (videoClips.length < 2) {
                          toast.error('צריך לפחות 2 קליפים');
                          return;
                        }
                        setMergingVideos(true);
                        toast.loading('מחבר סרטונים...', { id: 'merge' });
                        try {
                          const result = await base44.functions.invoke('mergeVideos', {
                            video_urls: videoClips.map(c => c.url)
                          });

                          if (result.data?.video_url) {
                            toast.success('הסרטון מוכן!', { id: 'merge' });
                            const a = document.createElement('a');
                            a.href = result.data.video_url;
                            a.download = `merged-${Date.now()}.mp4`;
                            a.click();
                          } else {
                            toast.error('שגיאה בחיבור', { id: 'merge' });
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error(err.message || 'שגיאה', { id: 'merge' });
                        } finally {
                          setMergingVideos(false);
                        }
                      }}
                      disabled={mergingVideos || videoClips.length < 2}
                      className="w-full bg-white text-black hover:bg-gray-200"
                    >
                      {mergingVideos ? (
                        <>
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                          מחבר...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 ml-2" />
                          Export Video
                        </>
                      )}
                    </Button>

                    <Button
                      onClick={() => setEditorView('library')}
                      variant="outline"
                      className="w-full bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800"
                    >
                      <Plus className="w-4 h-4 ml-2" />
                      Add Clips
                    </Button>

                    <Button
                      onClick={() => {
                        setVideoClips([]);
                        setEditorView('library');
                      }}
                      variant="outline"
                      className="w-full bg-gray-900 border-gray-800 text-gray-400 hover:bg-gray-800"
                    >
                      <Trash2 className="w-4 h-4 ml-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </div>

              {/* Timeline Area */}
              <div className="flex-1 bg-gray-950 flex flex-col">
                <div className="p-3 border-b border-gray-800 flex items-center justify-between">
                  <h3 className="text-white font-medium text-sm flex items-center gap-2">
                    <Play className="w-4 h-4" />
                    Timeline
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>0:00</span>
                    <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-white"></div>
                    </div>
                    <span>{videoClips.length * 10}s</span>
                  </div>
                </div>

                <div className="flex-1 overflow-x-auto p-4">
                  <div className="flex gap-2 min-w-max">
                    {videoClips.map((clip, index) => (
                      <motion.div
                        key={clip.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="relative group"
                        style={{ width: '180px' }}
                      >
                        <div className="bg-gray-900 rounded border border-gray-800 hover:border-gray-700 transition-all overflow-hidden cursor-pointer">
                          <div className="relative aspect-video bg-black">
                            <video 
                              src={clip.url} 
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                              {index + 1}
                            </div>
                          </div>
                          <div className="p-2 bg-gray-900">
                            <p className="text-white text-xs truncate">{clip.name}</p>
                            <p className="text-gray-600 text-[10px]">~10s</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setVideoClips(prev => prev.filter(c => c.id !== clip.id))}
                          className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-white hover:bg-gray-200 text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                    
                    <button
                      onClick={() => setEditorView('library')}
                      className="w-44 h-full min-h-[110px] border-2 border-dashed border-gray-800 hover:border-gray-700 rounded flex items-center justify-center text-gray-600 hover:text-gray-400 transition-all"
                    >
                      <div className="text-center">
                        <Plus className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-xs">Add clip</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Download History Modal */}
      <DownloadHistory isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
    </div>
  );
}