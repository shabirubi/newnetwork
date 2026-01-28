import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Download, Copy, Play, Pause, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function LumaStudio() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [processingGenId, setProcessingGenId] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    category: 'breaking',
    feed: 'all'
  });

  const generateVideo = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    const userPrompt = prompt.trim();
    setPrompt('');
    
    // Add user message immediately
    const userMsgId = Date.now();
    setMessages(prev => [...prev, {
      id: userMsgId,
      type: 'user',
      text: userPrompt,
      timestamp: new Date()
    }]);

    try {
      const response = await base44.functions.invoke('createLumaVideo', {
        prompt: userPrompt
      });

      const videoData = response.data;
      
      if (videoData.still_processing) {
        // Video still processing - poll for completion
        toast.info('הסרטון מתעבד... ייקח עוד כמה דקות');
        setProcessingGenId(videoData.generation_id);
        
        // Poll every 10 seconds
        const pollInterval = setInterval(async () => {
          try {
            const checkResponse = await base44.functions.invoke('checkLumaVideo', {
              generation_id: videoData.generation_id
            });
            
            const checkData = checkResponse.data;
            
            if (checkData.status === 'completed') {
              clearInterval(pollInterval);
              setProcessingGenId(null);
              
              setMessages(prev => [...prev, {
                id: Date.now(),
                type: 'assistant',
                videoUrl: checkData.video_url,
                thumbnailUrl: checkData.thumbnail_url,
                prompt: userPrompt,
                timestamp: new Date()
              }]);
              
              setVideoUrl(checkData.video_url);
              toast.success('הסרטון מוכן!');
              setLoading(false);
            } else if (checkData.status === 'failed') {
              clearInterval(pollInterval);
              setProcessingGenId(null);
              toast.error('הסרטון נכשל: ' + checkData.error);
              setLoading(false);
            }
          } catch (err) {
            clearInterval(pollInterval);
            setProcessingGenId(null);
            toast.error('שגיאה בבדיקת סטטוס');
            setLoading(false);
          }
        }, 10000);
        
      } else if (videoData.video_url) {
        // Video ready immediately
        setMessages(prev => [...prev, {
          id: Date.now(),
          type: 'assistant',
          videoUrl: videoData.video_url,
          thumbnailUrl: videoData.thumbnail_url,
          prompt: userPrompt,
          timestamp: new Date()
        }]);

        setVideoUrl(videoData.video_url);
        toast.success('סרטון יצור בהצלחה!');
        setLoading(false);
      } else {
        toast.error('לא התקבל קישור לסרטון');
        setLoading(false);
      }
    } catch (error) {
      toast.error('שגיאה ביצירת סרטון: ' + error.message);
      setLoading(false);
    }
  };

  const downloadVideo = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `luma-video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (a.parentNode === document.body) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(blobUrl);
      }, 100);
      toast.success('הסרטון הורד!');
    } catch (error) {
      toast.error('שגיאה בהורדה');
    }
  };

  const copyPrompt = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('הטקסט הועתק!');
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const openUploadModal = (videoUrl, prompt) => {
    setSelectedVideo({ url: videoUrl, prompt: prompt });
    setUploadData({
      title: prompt.substring(0, 100),
      description: prompt,
      category: 'breaking',
      feed: 'all'
    });
    setUploadModalOpen(true);
  };

  const uploadToFeeds = async () => {
    try {
      const user = await base44.auth.me();
      
      await base44.entities.UserVideo.create({
        title: uploadData.title,
        description: uploadData.description,
        video_url: selectedVideo.url,
        category: uploadData.category,
        feed: uploadData.feed,
        status: 'ready',
        uploader_email: user.email
      });

      toast.success('הסרטון הועלה בהצלחה לפידים!');
      setUploadModalOpen(false);
      setSelectedVideo(null);
    } catch (error) {
      toast.error('שגיאה בהעלאה: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#E31E24]/20 to-black border-b border-[#E31E24]/30 p-6">
        <h1 className="text-3xl font-bold">סטודיו ייצור סרטונים</h1>
        <p className="text-gray-400 mt-2">צור סרטונים בעזרת בינה מלאכותית</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6">
        {/* Chat Messages */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 bg-black/50 rounded-2xl p-4 border border-white/10">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <p className="text-lg">כתוב בקשה לייצור סרטון</p>
                  <p className="text-sm mt-2">לדוגמה: "כלב רץ בשדה ירוק בשמש"</p>
                </div>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.type === 'user' 
                      ? 'bg-[#E31E24] text-white' 
                      : 'bg-white/10 border border-white/20'
                  }`}>
                    {msg.type === 'user' ? (
                      <p className="text-sm">{msg.text}</p>
                    ) : msg.videoUrl ? (
                     <div className="space-y-2">
                       <video
                         ref={videoRef}
                         src={msg.videoUrl}
                         className="w-full rounded-lg bg-black"
                         controls
                         poster={msg.thumbnailUrl}
                       />
                       <div className="flex gap-2 text-xs flex-wrap">
                         <button
                           onClick={() => openUploadModal(msg.videoUrl, msg.prompt)}
                           className="flex items-center gap-1 px-3 py-1 bg-green-600/20 hover:bg-green-600/40 rounded-lg transition-all border border-green-500/30"
                         >
                           <Upload size={14} /> העלה לפידים
                         </button>
                         <button
                           onClick={() => downloadVideo(msg.videoUrl)}
                           className="flex items-center gap-1 px-3 py-1 bg-[#E31E24]/20 hover:bg-[#E31E24]/40 rounded-lg transition-all"
                         >
                           <Download size={14} /> הורדה
                         </button>
                         <button
                           onClick={() => copyPrompt(msg.prompt)}
                           className="flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                         >
                           <Copy size={14} /> העתקה
                         </button>
                       </div>
                     </div>
                    ) : (
                     <div className="flex items-center gap-2">
                       <Loader2 size={16} className="animate-spin" />
                       <span className="text-sm">מעבד סרטון...</span>
                     </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={generateVideo} className="flex gap-3">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="תאר את הסרטון שאתה רוצה ליצור..."
              className="bg-white/5 border-white/20 text-white placeholder-gray-500 resize-none"
              rows={3}
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-[#E31E24] hover:bg-[#B91C1C] text-white px-6 flex items-center gap-2 self-end"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  ייצור...
                </>
              ) : (
                <>
                  <Send size={18} />
                  שלח
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Tips */}
        <div className="lg:w-80 bg-white/5 border border-white/20 rounded-2xl p-6">
          <h3 className="font-bold mb-4 text-[#E31E24]">טיפים לסרטון מוצלח</h3>
          <ul className="space-y-3 text-sm text-gray-300">
            <li>✨ תאר את הסרטון בפירוט - צבעים, תנועות, מקום</li>
            <li>🎬 השתמש בערך בתיאור של "מה קורה" לא "איך"</li>
            <li>⏱️ זכור שהסרטון הוא עד 10 שניות</li>
            <li>🎯 היה ספציפי - "כלב שחור רץ בשדה ירוק" טוב מ-"כלב רץ"</li>
            <li>📐 תמך את עצמך לזמן עיבוד - עד כמה דקות</li>
          </ul>
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setUploadModalOpen(false)}>
          <div className="bg-gradient-to-br from-gray-900 to-black border border-[#E31E24]/30 rounded-2xl p-6 max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-white mb-4">העלאה לפידים</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">כותרת</label>
                <Input
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="כותרת הסרטון"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">תיאור</label>
                <Textarea
                  value={uploadData.description}
                  onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                  className="bg-white/5 border-white/20 text-white"
                  placeholder="תיאור הסרטון"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">קטגוריה</label>
                  <Select value={uploadData.category} onValueChange={(val) => setUploadData({...uploadData, category: val})}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="breaking">חדשות חמות</SelectItem>
                      <SelectItem value="security">ביטחון</SelectItem>
                      <SelectItem value="economy">כלכלה</SelectItem>
                      <SelectItem value="politics">פוליטיקה</SelectItem>
                      <SelectItem value="technology">טכנולוגיה</SelectItem>
                      <SelectItem value="sports">ספורט</SelectItem>
                      <SelectItem value="entertainment">בידור</SelectItem>
                      <SelectItem value="world">עולם</SelectItem>
                      <SelectItem value="health">בריאות</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">פיד</label>
                  <Select value={uploadData.feed} onValueChange={(val) => setUploadData({...uploadData, feed: val})}>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">כל הפידים</SelectItem>
                      <SelectItem value="live-player">נגן חדשות ראשי</SelectItem>
                      <SelectItem value="tiktok">TikTok פיד</SelectItem>
                      <SelectItem value="user-videos">סרטוני משתמשים</SelectItem>
                      <SelectItem value="all-videos">גלריית וידאו</SelectItem>
                      <SelectItem value="reporter-responses">תגובות כתבים</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                <video src={selectedVideo?.url} className="w-full rounded-lg" controls />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setUploadModalOpen(false)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  ביטול
                </Button>
                <Button
                  onClick={uploadToFeeds}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Check size={18} />
                  העלה לפידים
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}