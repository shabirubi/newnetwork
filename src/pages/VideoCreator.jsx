import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Send, Video, Loader2, Sparkles, Download, Plus, Trash2, MessageSquare, Home, Play, Pause, SkipBack, SkipForward, Scissors, Copy, Volume2, Paperclip, Mic, Camera, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DIDLiveChat from "../components/avatar/DIDLiveChat";

export default function VideoCreator() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [showChat, setShowChat] = useState(true);
  const [currentScene, setCurrentScene] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const messagesEndRef = useRef(null);
  const videoRef = useRef(null);
  const [playingAllScenes, setPlayingAllScenes] = useState(false);
  const [currentPlayingScene, setCurrentPlayingScene] = useState(0);
  const [attachments, setAttachments] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoInputRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const fileInputRef = useRef(null);
  const [didChatOpen, setDidChatOpen] = useState(false);
  const [customAvatars, setCustomAvatars] = useState([]);
  const [isCreatingAvatar, setIsCreatingAvatar] = useState(false);
  const customAvatarInputRef = useRef(null);
  const [audioTrack, setAudioTrack] = useState(null);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const audioInputRef = useRef(null);
  const audioPlayerRef = useRef(null);

  // Fetch reporters
  const { data: reporters = [] } = useQuery({
    queryKey: ['reporters'],
    queryFn: () => base44.entities.Reporter.list()
  });

  // Available voices - HeyGen voices for reporters, D-ID voices for custom avatars
  const heygenVoices = [
    { id: '1bd001e7e50f421d891986aad5158bc8', name: 'יוליה (אישה)', provider: 'heygen' },
    { id: 'b5a94a36d2a6445b8a26eccf90a4aa00', name: 'דוד (גבר)', provider: 'heygen' },
    { id: '2d5b0e6cf36f44d1b6e7d1d4f5c4e3f2', name: 'שרה (אישה)', provider: 'heygen' }
  ];
  
  const didVoices = [
    { id: 'he-IL-AvriNeural', name: 'אברי (גבר)', provider: 'did' },
    { id: 'he-IL-HilaNeural', name: 'הילה (אישה)', provider: 'did' }
  ];

  // Scene management - default to first reporter
  const [scenes, setScenes] = useState([
    {
      id: 1,
      avatar: reporters[0]?.id || "",
      avatarName: reporters[0]?.name || "",
      script: "",
      videoUrl: null,
      thumbnail: reporters[0]?.image || "",
      voice: 'he-IL-AvriNeural'
    }
  ]);

  // Available avatars - reporters + custom avatars
  const avatars = [
    ...reporters.map(r => ({ 
      id: r.id, 
      name: r.name, 
      image: r.image, 
      gender: r.gender,
      specialty: r.specialty,
      type: 'reporter'
    })),
    ...customAvatars.map(a => ({
      id: a.avatar_id,
      name: a.name,
      image: a.avatar_url,
      type: 'custom'
    }))
  ];

  useEffect(() => {
    const initConversation = async () => {
      try {
        const conv = await base44.agents.createConversation({
          agent_name: "video_creator",
          metadata: { name: "צור סרטון חדש" }
        });
        setConversationId(conv.id);
      } catch (err) {
        console.error(err);
        toast.error("שגיאה ביצירת שיחה");
      }
    };
    initConversation();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversationId, (data) => {
      setMessages(data.messages || []);
      setLoading(false);
    });

    return unsubscribe;
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || !conversationId || loading) return;

    const userMessage = input.trim();
    setInput("");
    const filesToSend = [...attachments];
    setAttachments([]);
    setLoading(true);

    try {
      const conversation = await base44.agents.getConversation(conversationId);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: userMessage || "📎 קובץ מצורף",
        file_urls: filesToSend
      });
    } catch (err) {
      console.error(err);
      toast.error("שגיאה בשליחת הודעה");
      setLoading(false);
    }
  };

  const handleFileUpload = async (files) => {
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const { data } = await base44.integrations.Core.UploadFile({ file });
        uploadedUrls.push(data.file_url);
        toast.success(`קובץ הועלה: ${file.name}`);
      }
      setAttachments([...attachments, ...uploadedUrls]);
    } catch (err) {
      toast.error("שגיאה בהעלאת קובץ");
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], 'voice-message.webm', { type: 'audio/webm' });
        await handleFileUpload([file]);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Timer
      let time = 0;
      const timer = setInterval(() => {
        time++;
        setRecordingTime(time);
      }, 1000);

      recorder.addEventListener('stop', () => clearInterval(timer));
    } catch (err) {
      toast.error("שגיאה בגישה למיקרופון");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setIsCameraOpen(true);
      
      setTimeout(() => {
        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (err) {
      toast.error("שגיאה בגישה למצלמה");
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (cameraVideoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = cameraVideoRef.current.videoWidth;
      canvas.height = cameraVideoRef.current.videoHeight;
      canvas.getContext('2d').drawImage(cameraVideoRef.current, 0, 0);
      
      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
        await handleFileUpload([file]);
        closeCamera();
      }, 'image/jpeg');
    }
  };

  const addScene = () => {
    const firstReporter = reporters[0] || avatars[0];
    setScenes([...scenes, {
      id: Date.now(),
      avatar: firstReporter?.id || "",
      avatarName: firstReporter?.name || "",
      script: "",
      videoUrl: null,
      thumbnail: firstReporter?.image || "",
      voice: 'he-IL-AvriNeural'
    }]);
    setCurrentScene(scenes.length);
  };

  const deleteScene = (index) => {
    if (scenes.length === 1) {
      toast.error("חייב להישאר לפחות סצנה אחת");
      return;
    }
    const newScenes = scenes.filter((_, i) => i !== index);
    setScenes(newScenes);
    if (currentScene >= newScenes.length) {
      setCurrentScene(newScenes.length - 1);
    }
  };

  const updateScene = (index, field, value) => {
    const newScenes = [...scenes];
    newScenes[index][field] = value;
    if (field === "avatar") {
      const avatar = avatars.find(a => a.id === value);
      newScenes[index].avatarName = avatar?.name || "";
      newScenes[index].thumbnail = avatar?.image || "";
    }
    setScenes(newScenes);
  };

  const generateScene = async (index) => {
    const scene = scenes[index];
    if (!scene.script.trim()) {
      toast.error("נא להזין סקריפט לסצנה");
      return;
    }

    setGenerating(true);
    toast.loading("מייצר סרטון...", { id: 'gen-scene' });
    
    try {
      console.log('🎬 Starting video generation for scene', index);
      console.log('Scene data:', scene);
      
      // Check if using custom avatar (D-ID) or reporter (HeyGen)
      const selectedAvatar = avatars.find(a => a.id === scene.avatar);
      const isCustomAvatar = selectedAvatar?.type === 'custom';
      
      const functionName = isCustomAvatar ? "generateDIDCharacter" : "generateHeyGenCharacter";
      
      console.log('Using function:', functionName);
      console.log('Avatar type:', isCustomAvatar ? 'D-ID Custom' : 'HeyGen Reporter');
      
      const defaultVoice = isCustomAvatar ? 'he-IL-AvriNeural' : '1bd001e7e50f421d891986aad5158bc8';
      
      const result = await base44.functions.invoke(functionName, {
        script: scene.script,
        avatar_id: scene.avatar,
        voice_id: scene.voice || defaultVoice
      });

      console.log('API Response:', result);

      if (result.data?.video_url) {
        const newScenes = [...scenes];
        newScenes[index].videoUrl = result.data.video_url;
        newScenes[index].duration = result.data.duration || 10;
        setScenes(newScenes);
        toast.success("הסרטון נוצר ונוסף לציר הזמן! 🎬", { id: 'gen-scene' });
      } else if (result.data?.error) {
        console.error('Generation error:', result.data.error);
        toast.error(`שגיאה: ${result.data.error}`, { id: 'gen-scene' });
      } else {
        console.error('Unexpected response format:', result);
        toast.error("שגיאה ביצירת הסרטון - לא נתקבל קישור לסרטון", { id: 'gen-scene' });
      }
    } catch (err) {
      console.error('Generation failed:', err);
      toast.error(`שגיאה: ${err.message || 'שגיאה לא ידועה'}`, { id: 'gen-scene' });
    } finally {
      setGenerating(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const items = Array.from(scenes);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setScenes(items);
    toast.success("הסצנה הועברה");
  };

  const duplicateScene = (index) => {
    const sceneToDuplicate = scenes[index];
    const newScene = {
      ...sceneToDuplicate,
      id: Date.now(),
    };
    const newScenes = [...scenes];
    newScenes.splice(index + 1, 0, newScene);
    setScenes(newScenes);
    toast.success("הסצנה שוכפלה");
  };

  const getTotalDuration = () => {
    return scenes.reduce((total, scene) => total + (scene.duration || 0), 0);
  };

  const generateAllScenes = async () => {
    setGenerating(true);
    for (let i = 0; i < scenes.length; i++) {
      if (scenes[i].script.trim()) {
        await generateScene(i);
      }
    }
    setGenerating(false);
    toast.success("כל הסצנות נוצרו!");
  };

  const playAllScenes = () => {
    const scenesWithVideo = scenes.filter(s => s.videoUrl);
    if (scenesWithVideo.length === 0) {
      toast.error("אין סצנות עם וידאו");
      return;
    }

    setPlayingAllScenes(true);
    setCurrentPlayingScene(0);
    setCurrentScene(0);
    
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleVideoEnded = () => {
    if (playingAllScenes && currentPlayingScene < scenes.length - 1) {
      const nextScene = currentPlayingScene + 1;
      setCurrentPlayingScene(nextScene);
      setCurrentScene(nextScene);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play();
        }
      }, 100);
    } else {
      setPlayingAllScenes(false);
      setIsPlaying(false);
    }
  };

  const handleCreateCustomAvatar = async (file) => {
    if (!file) return;

    setIsCreatingAvatar(true);
    toast.loading("מעלה תמונה ויוצר אווטר מותאם אישית...", { id: 'custom-avatar' });

    try {
      // Upload image
      const { data: uploadData } = await base44.integrations.Core.UploadFile({ file });
      
      // Create D-ID instant avatar
      const result = await base44.functions.invoke('createDIDInstantAvatar', {
        imageUrl: uploadData.file_url,
        name: file.name.split('.')[0] || 'האווטר שלי'
      });

      if (result.data?.success) {
        const newAvatar = {
          avatar_id: result.data.avatar_id,
          avatar_url: result.data.avatar_url,
          name: result.data.name
        };
        
        setCustomAvatars([...customAvatars, newAvatar]);
        toast.success(`אווטר "${result.data.name}" נוצר בהצלחה! 🎭`, { id: 'custom-avatar' });
      } else {
        throw new Error(result.data?.error || 'שגיאה ביצירת אווטר');
      }
    } catch (err) {
      console.error('Create avatar error:', err);
      toast.error('שגיאה ביצירת אווטר מותאם אישית', { id: 'custom-avatar' });
    } finally {
      setIsCreatingAvatar(false);
      if (customAvatarInputRef.current) {
        customAvatarInputRef.current.value = '';
      }
    }
  };

  const handleAudioUpload = async (file) => {
    if (!file) return;

    toast.loading("מעלה קובץ אודיו...", { id: 'audio-upload' });

    try {
      const { data } = await base44.integrations.Core.UploadFile({ file });
      
      setAudioTrack({
        url: data.file_url,
        name: file.name,
        duration: 0
      });
      
      toast.success(`הקובץ "${file.name}" הועלה בהצלחה! 🎵`, { id: 'audio-upload' });
    } catch (err) {
      console.error('Audio upload error:', err);
      toast.error('שגיאה בהעלאת קובץ אודיו', { id: 'audio-upload' });
    } finally {
      if (audioInputRef.current) {
        audioInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col overflow-hidden" dir="rtl">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-[#E31E24]/30 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31E24] to-[#B91C1C] flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">מחולל סרטונים AI</h1>
            <p className="text-gray-400 text-xs">צור סרטונים מקצועיים עם אווטרים מדברים</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Home className="w-4 h-4" />
              חזרה לאתר
            </Button>
          </Link>
          <a
            href={createPageUrl("AdminPanel")}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="gap-2 bg-purple-600/20 hover:bg-purple-600/30 border-purple-500/50">
              <Shield className="w-4 h-4" />
              Admin
            </Button>
          </a>
          <Button
            onClick={() => setDidChatOpen(true)}
            variant="outline"
            size="sm"
            className="gap-2 bg-green-600/20 hover:bg-green-600/30 border-green-500/50"
          >
            <MessageSquare className="w-4 h-4" />
            צ'אט עם D-ID
          </Button>
          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            {showChat ? "הסתר עוזר" : "הצג עוזר"}
          </Button>
          <Button
            onClick={generateAllScenes}
            disabled={generating || scenes.every(s => !s.script.trim())}
            className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] gap-2"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                מייצר...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                צור את כל הסרטון
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content - 3 Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Scenes & Settings */}
        <div className="w-80 bg-black/30 border-l border-gray-800 flex flex-col overflow-hidden">
          {/* Scenes List */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-bold">סצנות</h3>
              <Button
                onClick={addScene}
                size="sm"
                variant="outline"
                className="gap-1"
              >
                <Plus className="w-4 h-4" />
                הוסף
              </Button>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {scenes.map((scene, idx) => (
                <div
                  key={scene.id}
                  onClick={() => setCurrentScene(idx)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    currentScene === idx
                      ? "bg-[#E31E24]/20 border border-[#E31E24]"
                      : "bg-gray-800/50 border border-gray-700 hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={scene.thumbnail}
                      alt={scene.avatarName}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">סצנה {idx + 1}</p>
                      <p className="text-gray-400 text-xs truncate">{scene.avatarName}</p>
                    </div>
                    {scenes.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScene(idx);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scene Editor */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-white text-sm font-medium">בחר אווטר</label>
                <div>
                  <input
                    ref={customAvatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleCreateCustomAvatar(file);
                    }}
                    className="hidden"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => customAvatarInputRef.current?.click()}
                    disabled={isCreatingAvatar}
                    className="gap-1 text-xs"
                  >
                    {isCreatingAvatar ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        יוצר...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        העלה תמונה
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {avatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    onClick={() => updateScene(currentScene, "avatar", avatar.id)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all relative ${
                      scenes[currentScene]?.avatar === avatar.id
                        ? "border-[#E31E24]"
                        : "border-gray-700 hover:border-gray-600"
                    }`}
                  >
                    <img
                      src={avatar.image}
                      alt={avatar.name}
                      className="w-full aspect-square object-cover"
                    />
                    {avatar.type === 'custom' && (
                      <div className="absolute top-1 right-1 bg-purple-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                        מותאם
                      </div>
                    )}
                    <p className="text-white text-xs text-center py-1 bg-gray-900">{avatar.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">בחר קול</label>
              <select
                value={scenes[currentScene]?.voice || '1bd001e7e50f421d891986aad5158bc8'}
                onChange={(e) => updateScene(currentScene, "voice", e.target.value)}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm"
              >
                {(() => {
                  const selectedAvatar = avatars.find(a => a.id === scenes[currentScene]?.avatar);
                  const isCustom = selectedAvatar?.type === 'custom';
                  const voiceList = isCustom ? didVoices : heygenVoices;
                  return voiceList.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.name}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <div>
              <label className="text-white text-sm font-medium mb-2 block">סקריפט</label>
              <Textarea
                value={scenes[currentScene]?.script || ""}
                onChange={(e) => updateScene(currentScene, "script", e.target.value)}
                placeholder="מה האווטר יגיד בסצנה הזו..."
                className="min-h-[150px] bg-gray-900 border-gray-700 text-white"
              />
            </div>

            <Button
              onClick={() => generateScene(currentScene)}
              disabled={generating || !scenes[currentScene]?.script.trim()}
              className="w-full bg-gradient-to-r from-[#E31E24] to-[#B91C1C]"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin ml-2" />
                  מייצר סצנה...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 ml-2" />
                  צור סצנה זו
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Center Panel - Video Preview & Timeline */}
        <div className="flex-1 bg-black/20 flex flex-col overflow-hidden">
          {/* Video Preview */}
          <div className="flex-1 flex items-center justify-center p-6">
            {scenes[currentScene]?.videoUrl ? (
              <div className="w-full max-w-4xl">
                <video
                  ref={videoRef}
                  key={scenes[currentScene].videoUrl}
                  src={scenes[currentScene].videoUrl}
                  className="w-full rounded-xl shadow-2xl bg-black"
                  onTimeUpdate={(e) => setCurrentTime(e.target.currentTime)}
                  onLoadedMetadata={(e) => setDuration(e.target.duration)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={handleVideoEnded}
                />
              </div>
            ) : (
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <Video className="w-16 h-16 text-gray-600" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">תצוגה מקדימה</h3>
                <p className="text-gray-400">הסרטון יופיע כאן לאחר היצירה</p>
              </div>
            )}
          </div>

          {/* Timeline Section */}
          <div className="border-t border-gray-800 bg-gradient-to-b from-gray-950 to-black p-4">
            {/* Main Playback Controls */}
            <div className="flex items-center gap-3 mb-4 bg-gray-900/50 rounded-xl p-3 border border-gray-800">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (currentScene > 0) setCurrentScene(currentScene - 1);
                  }}
                  disabled={currentScene === 0 || playingAllScenes}
                  className="hover:bg-gray-800"
                >
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] hover:from-[#B91C1C] hover:to-[#E31E24] w-10 h-10"
                  onClick={() => {
                    if (videoRef.current) {
                      if (isPlaying) {
                        videoRef.current.pause();
                        setPlayingAllScenes(false);
                      } else {
                        videoRef.current.play();
                      }
                    }
                  }}
                  disabled={!scenes[currentScene]?.videoUrl}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    if (currentScene < scenes.length - 1) setCurrentScene(currentScene + 1);
                  }}
                  disabled={currentScene === scenes.length - 1 || playingAllScenes}
                  className="hover:bg-gray-800"
                >
                  <SkipForward className="w-4 h-4" />
                </Button>
              </div>

              <div className="h-8 w-px bg-gray-700" />

              <Button
                size="sm"
                variant="outline"
                onClick={playAllScenes}
                disabled={scenes.filter(s => s.videoUrl).length === 0 || playingAllScenes}
                className="gap-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-500/30 hover:from-purple-600/30 hover:to-blue-600/30"
              >
                <Play className="w-4 h-4" />
                נגן הכל
              </Button>

              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400 min-w-[40px]">{Math.floor(currentTime)}s</span>
                  <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden relative">
                    <div 
                      className="h-full bg-gradient-to-r from-[#E31E24] to-pink-500 transition-all"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 min-w-[40px] text-left">{Math.floor(duration)}s</span>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg border border-gray-700">
                <Video className="w-3.5 h-3.5 text-[#E31E24]" />
                <span className="text-white text-sm font-medium">
                  {scenes.filter(s => s.videoUrl).length}/{scenes.length}
                </span>
              </div>
            </div>

            {/* Timeline Track */}
            <div className="bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800 shadow-lg overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E31E24] to-pink-600 flex items-center justify-center">
                    <Video className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-white text-sm font-bold">ציר הזמן</span>
                    <p className="text-gray-500 text-xs">גרור לסידור מחדש</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 rounded-lg">
                  <span className="text-gray-400 text-xs">משך כולל:</span>
                  <span className="text-white text-sm font-bold">{getTotalDuration().toFixed(1)}s</span>
                </div>
              </div>
              
              <div className="relative">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="timeline" direction="horizontal">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="flex gap-3 pb-2 px-1 min-h-[160px]"
                        style={{ 
                          overflowX: 'scroll',
                          overflowY: 'visible',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarWidth: 'thin',
                          scrollbarColor: '#E31E24 #1f2937',
                          cursor: 'grab'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.cursor = 'grabbing';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.cursor = 'grab';
                        }}
                      >
                      {scenes.map((scene, index) => (
                        <Draggable key={scene.id} draggableId={String(scene.id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setCurrentScene(index)}
                              className={`min-w-[140px] rounded-xl overflow-hidden cursor-pointer transition-all border-2 ${
                                currentScene === index
                                  ? "border-[#E31E24] shadow-lg shadow-[#E31E24]/50 scale-105"
                                  : "border-gray-700 hover:border-gray-600 hover:scale-[1.02]"
                              } ${snapshot.isDragging ? "opacity-50 rotate-3" : ""}`}
                            >
                              <div className="relative group">
                                {scene.videoUrl ? (
                                  <>
                                    <video
                                      src={scene.videoUrl}
                                      className="w-full h-24 object-cover bg-black"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                  </>
                                ) : (
                                  <div className="w-full h-24 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative">
                                    <img
                                      src={scene.thumbnail}
                                      alt={scene.avatarName}
                                      className="w-14 h-14 rounded-full object-cover opacity-40"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Sparkles className="w-6 h-6 text-gray-600" />
                                    </div>
                                  </div>
                                )}
                                
                                <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] text-white font-bold">
                                  #{index + 1}
                                </div>

                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      duplicateScene(index);
                                    }}
                                    className="p-1.5 bg-gray-900/90 backdrop-blur-sm rounded-lg hover:bg-blue-600 transition-colors"
                                    title="שכפל"
                                  >
                                    <Copy className="w-3 h-3 text-white" />
                                  </button>
                                  {scenes.length > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteScene(index);
                                      }}
                                      className="p-1.5 bg-gray-900/90 backdrop-blur-sm rounded-lg hover:bg-red-600 transition-colors"
                                      title="מחק"
                                    >
                                      <Trash2 className="w-3 h-3 text-white" />
                                    </button>
                                  )}
                                </div>

                                {playingAllScenes && currentPlayingScene === index && (
                                  <div className="absolute inset-0 bg-[#E31E24]/20 border-2 border-[#E31E24] flex items-center justify-center">
                                    <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center animate-pulse">
                                      <Play className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              
                              <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-3 py-2">
                                <p className="text-white text-xs font-medium truncate">{scene.avatarName}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <p className="text-gray-400 text-[10px]">
                                    {scene.duration ? `${scene.duration.toFixed(1)}s` : 'לא נוצר'}
                                  </p>
                                  {scene.videoUrl && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                <style>{`
                  .flex::-webkit-scrollbar {
                    height: 8px;
                  }
                  .flex::-webkit-scrollbar-track {
                    background: #1f2937;
                    border-radius: 4px;
                  }
                  .flex::-webkit-scrollbar-thumb {
                    background: #E31E24;
                    border-radius: 4px;
                  }
                  .flex::-webkit-scrollbar-thumb:hover {
                    background: #B91C1C;
                  }
                `}</style>
              </div>

              {/* Audio Track */}
              <div className="mt-4 bg-gradient-to-b from-gray-900 to-gray-950 rounded-xl p-4 border border-gray-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <span className="text-white text-sm font-bold">רצועת אודיו</span>
                      <p className="text-gray-500 text-xs">מוזיקת רקע או קול</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept="audio/*,.mp3,.wav,.m4a"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleAudioUpload(file);
                      }}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => audioInputRef.current?.click()}
                      className="gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      העלה אודיו
                    </Button>
                  </div>
                </div>

                {audioTrack ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                        <Volume2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{audioTrack.name}</p>
                        <p className="text-gray-400 text-xs">מוזיקת רקע</p>
                      </div>
                      <button
                        onClick={() => {
                          setAudioTrack(null);
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.pause();
                          }
                        }}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-xs">עוצמת אודיו</span>
                        <span className="text-white text-xs font-medium">{Math.round(audioVolume * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        value={audioVolume}
                        onChange={(e) => {
                          const vol = parseFloat(e.target.value);
                          setAudioVolume(vol);
                          if (audioPlayerRef.current) {
                            audioPlayerRef.current.volume = vol;
                          }
                        }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #E31E24 0%, #E31E24 ${audioVolume * 100}%, #374151 ${audioVolume * 100}%, #374151 100%)`
                        }}
                      />
                    </div>

                    <audio
                      ref={audioPlayerRef}
                      src={audioTrack.url}
                      className="w-full"
                      controls
                      onLoadedMetadata={(e) => {
                        setAudioTrack({...audioTrack, duration: e.target.duration});
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-700 rounded-lg">
                    <Volume2 className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">גרור קובץ אודיו לכאן או לחץ "העלה אודיו"</p>
                    <p className="text-gray-500 text-xs mt-1">תומך ב-MP3, WAV, M4A</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - AI Chat */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 384, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="w-96 bg-black/30 border-r border-gray-800 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-gray-800">
                <h3 className="text-white font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  עוזר AI
                </h3>
                <p className="text-gray-400 text-xs mt-1">שאל אותי כל שאלה על יצירת הסרטון</p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 text-[#E31E24] mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">שלום! איך אוכל לעזור לך לייצר את הסרטון?</p>
                  </div>
                )}

                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-xl p-3 text-sm ${
                        msg.role === "user"
                          ? "bg-gray-800 text-white"
                          : "bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] text-white rounded-xl p-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">חושב...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-gray-800">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {attachments.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-16 h-16 rounded object-cover" />
                        <button
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Recording Indicator */}
                {isRecording && (
                  <div className="flex items-center gap-2 mb-2 p-2 bg-red-500/20 rounded-lg">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-400 text-sm">מקליט... {recordingTime}s</span>
                    <Button size="sm" onClick={stopRecording} className="mr-auto bg-red-600">
                      <Mic className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files))}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-white shrink-0"
                    type="button"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={isRecording ? "text-red-400 shrink-0" : "text-gray-400 hover:text-white shrink-0"}
                    type="button"
                  >
                    <Mic className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={openCamera}
                    className="text-gray-400 hover:text-white shrink-0"
                    type="button"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>

                  <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="שאל שאלה על יצירת הסרטון..."
                    className="flex-1 px-3 py-2 rounded-md bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-[#E31E24] resize-none min-h-[40px] max-h-[120px]"
                    rows={1}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() && attachments.length === 0}
                    size="sm"
                    className="bg-gradient-to-br from-[#E31E24] to-[#B91C1C] shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

        {/* Camera Modal */}
        {isCameraOpen && (
          <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl overflow-hidden max-w-2xl w-full">
              <div className="p-4 bg-gray-800 flex items-center justify-between">
                <h3 className="text-white font-bold">צילום תמונה</h3>
                <button onClick={closeCamera} className="text-white hover:text-red-400">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <video
                ref={cameraVideoRef}
                autoPlay
                playsInline
                className="w-full"
              />
              <div className="p-4 flex gap-3 justify-center">
                <Button onClick={capturePhoto} className="bg-[#E31E24] hover:bg-[#B91C1C]">
                  <Camera className="w-5 h-5 ml-2" />
                  צלם תמונה
                </Button>
                <Button variant="outline" onClick={closeCamera}>
                  ביטול
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* D-ID Live Chat */}
        <DIDLiveChat isOpen={didChatOpen} onClose={() => setDidChatOpen(false)} />
      </div>
      );
      }