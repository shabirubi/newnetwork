import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
        AlertTriangle, Shield, Radio, Bell, 
        Volume2, VolumeX, RefreshCw, Zap, Play, Pause, Loader2, Film, X
      } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";



export default function WarRoom() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [playingArticleId, setPlayingArticleId] = useState(null);
  const [loadingArticleId, setLoadingArticleId] = useState(null);
  const [watchedCount, setWatchedCount] = useState(() => {
    const saved = localStorage.getItem('warroom_watched_count');
    return saved ? parseInt(saved) : 0;
  });
  const [userHasSubscription, setUserHasSubscription] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [selectedArticleForVideo, setSelectedArticleForVideo] = useState(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const audioRef = useRef(null);

  // Fetch real-time alerts from all sources
  const { data: articles = [], refetch: refetchNews, isLoading: newsLoading } = useQuery({
    queryKey: ['warroom-realtime-alerts'],
    queryFn: async () => {
      try {
        // קבל חדשות ביטחוניות וחדשות חמות
        const allArticles = await base44.entities.NewsArticle.filter(
          { category: 'security' },
          '-created_date',
          50
        );
        
        // סנן לדיווחים בזמן אמת
        const keywordPatterns = [
          /ישראל|israel/i,
          /איראן|iran/i,
          /אמריקה|ארצות הברית|usa|united states|american/i,
          /צהל|idf|israel defense|חיל|צה"ל/i,
          /עזה|gaza|תל אביב|אשדוד|ירושלים|חיפה/i,
          /חדשות חם|דיווח בזמן אמת|דיווח חי/i
        ];
        
        const filteredArticles = (allArticles || []).filter(article => {
          const text = `${article.title} ${article.subtitle} ${article.content}`.toLowerCase();
          return keywordPatterns.some(pattern => pattern.test(text));
        });
        
        // מיין לפי עדיפות - חדשות חם ראשון
        const sorted = filteredArticles.sort((a, b) => {
          if (a.is_breaking && !b.is_breaking) return -1;
          if (!a.is_breaking && b.is_breaking) return 1;
          return new Date(b.created_date) - new Date(a.created_date);
        });
        
        return sorted.slice(0, 30);
      } catch (error) {
        console.error('Error fetching alerts:', error);
        return [];
      }
    },
    staleTime: 15000,
    refetchInterval: 15000
  });

  // בדיקת מנוי
  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me().catch(() => null);
        if (user) {
          const subs = await base44.entities.Subscription.filter(
            { user_email: user.email },
            '-created_date',
            5
          ).catch(() => []);
          const activeSub = subs?.find(s => s.status === 'active' && (!s.end_date || new Date(s.end_date) > new Date()));
          setUserHasSubscription(!!activeSub);
        }
      } catch (err) {
        console.error('Subscription check:', err);
      }
    };
    checkSubscription();
  }, []);

  useEffect(() => {
    refetchNews();
  }, [refetchNews]);

  const handlePlayArticle = async (article) => {
    if (playingArticleId === article.id) {
      setPlayingArticleId(null);
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    // בדיקה: אם ללא מנוי והגיע ל-3 כתבות
    if (!userHasSubscription && watchedCount >= 3) {
      toast.error('צפית ב-3 כתבות בחינם. עבור למנוי כדי לצפות בעוד כתבות');
      setTimeout(() => {
        window.location.href = '/Subscription';
      }, 1500);
      return;
    }

    setLoadingArticleId(article.id);
    try {
      const { data } = await base44.functions.invoke('generateElevenLabsSpeech', {
        text: article.content || article.subtitle,
        voice_id: 'onwK4ZeVeZw25vXSwVNc'
      });

      if (data?.audio_url) {
        if (audioRef.current) {
          audioRef.current.src = data.audio_url;
          audioRef.current.play();
          setPlayingArticleId(article.id);
          
          // הוסף לספירת צפיות
          const newCount = watchedCount + 1;
          setWatchedCount(newCount);
          localStorage.setItem('warroom_watched_count', newCount.toString());
        }
      } else {
        toast.error('שגיאה בהפעלת הקול');
      }
    } catch (error) {
      toast.error('שגיאה בהפעלת הקול: ' + error.message);
    } finally {
      setLoadingArticleId(null);
    }
  };

  const handleGenerateVideo = async (article) => {
    // בדיקה: אם ללא מנוי והגיע ל-3 כתבות
    if (!userHasSubscription && watchedCount >= 3) {
      toast.error('צפית ב-3 כתבות בחינם. עבור למנוי כדי לצפות בעוד כתבות');
      setTimeout(() => {
        window.location.href = '/Subscription';
      }, 1500);
      return;
    }

    setGeneratingVideo(true);
    setVideoUrl(null);
    try {
      const { data } = await base44.functions.invoke('createLumaVideo', {
        prompt: `${article.title}. ${article.content || article.subtitle}`,
        imageUrl: article.image_url,
        voice_script: article.content || article.subtitle,
        voice_id: 'Rachel'
      });

      if (data?.video_url) {
        setVideoUrl(data.video_url);
        
        // שמור הוידאו למערכת כדי שיופיע בכל הפידים
        try {
          const user = await base44.auth.me().catch(() => null);
          await base44.entities.UserVideo.create({
            title: article.title,
            video_url: data.video_url,
            thumbnail_url: data.thumbnail_url || article.image_url,
            description: article.subtitle,
            uploader_email: user?.email || 'anonymous',
            category: 'breaking',
            feed: 'all-videos',
            status: 'ready'
          });
        } catch (err) {
          console.error('Error saving video to feed:', err);
        }
        
        toast.success('וידאו נוצר וחולק בפידים!');
        
        const newCount = watchedCount + 1;
        setWatchedCount(newCount);
        localStorage.setItem('warroom_watched_count', newCount.toString());
      } else if (data?.still_processing) {
        toast.info('הוידאו עדיין בעיבוד, אנא חכה...');
      } else {
        toast.error('שגיאה ביצירת הוידאו: ' + (data?.error || 'שגיאה לא ידועה'));
        console.error('Video response:', data);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      toast.error('שגיאה ביצירת הוידאו: ' + error.message);
    } finally {
      setGeneratingVideo(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-gray-900 to-red-900 dark:from-black dark:to-red-950 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 animate-pulse">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">חדר מלחמה</h1>
              <p className="text-red-200">מרכז התראות ואזעקות בזמן אמת</p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="border-white/30 text-white hover:bg-white/10"
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="p-4 text-center">
            <Radio className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {newsLoading ? <Loader2 className="w-8 h-8 animate-spin mx-auto" /> : articles.length}
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300">כתבות משודכנות</p>
          </CardContent>
        </Card>
      </motion.div>



      {/* News Updates from Sources */}
      <Card className="border-blue-300 dark:border-blue-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Radio className="w-5 h-5 animate-pulse" />
              עדכוני חדשות עם קול
            </CardTitle>
            <Button
              size="sm"
              onClick={refetchNews}
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw size={16} className="ml-1" />
              רענן
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <AnimatePresence>
            {articles.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Loader2 size={32} className="mx-auto mb-2 animate-spin" />
                <p>טוען עדכוני חדשות...</p>
              </div>
            ) : (
              articles.map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b dark:border-gray-700 last:border-0 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      {article.image_url && (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white leading-tight flex-1">
                          {article.title}
                        </h3>
                        {article.is_breaking && (
                          <Badge className="bg-red-600 text-white animate-pulse flex-shrink-0">חדשות חם</Badge>
                        )}
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {article.subtitle || article.content}
                      </p>

                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span>{new Date(article.created_date).toLocaleTimeString('he-IL')}</span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePlayArticle(article)}
                          disabled={loadingArticleId === article.id || (!userHasSubscription && watchedCount >= 3)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          {loadingArticleId === article.id ? (
                            <><Loader2 size={16} className="animate-spin" />טוען...</>
                          ) : playingArticleId === article.id ? (
                            <><Pause size={16} />הפסק קול</>
                          ) : (
                            <><Play size={16} />הפעל קול</>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedArticleForVideo(article);
                            setVideoModalOpen(true);
                          }}
                          disabled={!userHasSubscription && watchedCount >= 3}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm font-semibold"
                        >
                          <Film size={16} />
                          וידאו מדובב
                        </button>

                        {!userHasSubscription && (
                          <span className="text-xs text-gray-500">{watchedCount}/3</span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Safety Instructions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              הנחיות לאזרחים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <Zap className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <p className="font-bold text-yellow-800 dark:text-yellow-300">אזעקת רקטות</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">היכנסו למרחב מוגן תוך 15-90 שניות לפי אזור</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800 dark:text-orange-300">חשד לחדירה</p>
                <p className="text-sm text-orange-700 dark:text-orange-400">הישארו בבתים, נעלו דלתות וחלונות</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Radio className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="font-bold text-blue-800 dark:text-blue-300">הישארו מעודכנים</p>
                <p className="text-sm text-blue-700 dark:text-blue-400">עקבו אחרי עדכונים בערוץ והקשיבו להנחיות פיקוד העורף</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 dark:text-white">
              <Bell className="w-5 h-5 text-[#E31E24]" />
              קווים חמים
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <span className="font-bold text-red-800 dark:text-red-300">מוקד חירום</span>
              <span className="text-2xl font-bold text-red-600 dark:text-red-400">100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <span className="font-bold text-orange-800 dark:text-orange-300">פיקוד העורף</span>
              <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">104</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <span className="font-bold text-blue-800 dark:text-blue-300">משטרה</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">100</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <span className="font-bold text-green-800 dark:text-green-300">מד"א</span>
              <span className="text-2xl font-bold text-green-600 dark:text-green-400">101</span>
            </div>
          </CardContent>
          </Card>
          </div>

          {/* Video Modal */}
          <AnimatePresence>
            {videoModalOpen && selectedArticleForVideo && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-gray-900 dark:bg-gray-800 rounded-2xl p-6 max-w-3xl w-full my-8"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">וידאו מדובב</h2>
                    <button
                      onClick={() => {
                        setVideoModalOpen(false);
                        setVideoUrl(null);
                        setSelectedArticleForVideo(null);
                      }}
                      className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <X size={24} className="text-white" />
                    </button>
                  </div>

                  {!videoUrl ? (
                    <div className="aspect-video bg-black rounded-xl flex items-center justify-center mb-4">
                      {generatingVideo ? (
                        <div className="text-center">
                          <Loader2 size={48} className="animate-spin text-purple-400 mx-auto mb-3" />
                          <p className="text-white">יוצר וידאו מדובב...</p>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleGenerateVideo(selectedArticleForVideo)}
                          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg"
                        >
                          <Film size={24} className="ml-2" />
                          צור וידאו
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-black rounded-xl mb-4 overflow-hidden">
                      <video 
                        src={videoUrl}
                        controls
                        autoPlay
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Article Details */}
                  <div className="bg-gradient-to-br from-red-900/30 to-gray-800/50 rounded-xl p-4 mb-4 border border-red-600/30">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-red-600/30">
                      <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded">הרשת החדשה</span>
                      <span className="text-xs text-gray-400">{selectedArticleForVideo.source}</span>
                      <span className="text-xs text-gray-500">{new Date(selectedArticleForVideo.created_date).toLocaleString('he-IL')}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{selectedArticleForVideo.title}</h3>
                    <p className="text-gray-300 text-sm mb-3">{selectedArticleForVideo.subtitle}</p>
                    <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedArticleForVideo.content}
                    </p>
                  </div>

                  {/* Share Buttons */}
                  <div className="flex gap-2 flex-wrap mb-4">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${selectedArticleForVideo.title}\n\n${selectedArticleForVideo.subtitle}\n\nצפה בוידאו מדובב בחדר המלחמה`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>💬 וואצאפ</span>
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(selectedArticleForVideo.title)}&url=`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>𝕏 טוויטר</span>
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(selectedArticleForVideo.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-900 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>f פייסבוק</span>
                    </a>
                    <button
                      onClick={() => {
                        const text = `${selectedArticleForVideo.title}\n\n${selectedArticleForVideo.subtitle}\n\n${selectedArticleForVideo.content}`;
                        navigator.clipboard.writeText(text);
                        toast.success('הכתבה הועתקה');
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
                    >
                      <span>📋 העתק</span>
                    </button>
                  </div>

                  <Button
                    onClick={() => {
                      setVideoModalOpen(false);
                      setVideoUrl(null);
                      setSelectedArticleForVideo(null);
                    }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    סגור
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Audio element */}
          <audio 
            ref={audioRef} 
            onEnded={() => setPlayingArticleId(null)}
            className="hidden"
          />
          </div>
          );
          }