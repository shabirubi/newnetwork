import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, Shield, Radio, Bell, 
  Volume2, VolumeX, RefreshCw, Zap, Play, Pause, Loader2
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
  const audioRef = useRef(null);

  // Fetch ONLY real security and politics news
  const { data: articles = [], refetch: refetchNews, isLoading: newsLoading } = useQuery({
    queryKey: ['news-articles-real'],
    queryFn: async () => {
      try {
        const articles = await base44.entities.NewsArticle.filter(
          { category: { $in: ['security', 'politics'] } },
          '-created_date',
          30
        );
        return articles || [];
      } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
      }
    },
    staleTime: 30000,
    refetchInterval: 30000
  });

  useEffect(() => {
    refetchNews();
  }, [refetchNews]);

  const handlePlayArticle = async (article) => {
    if (playingArticleId === article.id) {
      setPlayingArticleId(null);
      if (audioRef.current) audioRef.current.pause();
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

      {/* Active Alerts */}
      <Card className="border-red-300 dark:border-red-800 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 dark:from-red-800 dark:to-red-900 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Siren className="w-5 h-5 animate-pulse" />
              התראות בזמן אמת
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-red-100">
              <Clock size={14} />
              עודכן: {lastUpdate.toLocaleTimeString('he-IL')}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingAlerts ? (
            <div className="p-6 text-center text-gray-500">
              <Loader2 size={32} className="mx-auto mb-2 animate-spin" />
              <p>טוען התראות בזמן אמת...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Shield size={32} className="mx-auto mb-2 opacity-30" />
              <p>אין התראות פעילות כעת</p>
            </div>
          ) : (
           <AnimatePresence>
             {alerts.map((alert, index) => {
               const alertType = alertTypes[alert.type] || alertTypes.rocket;
               const AlertIcon = alertType.icon;

               return (
                 <motion.div
                   key={alert.id}
                   initial={{ opacity: 0, x: -50 }}
                   animate={{ opacity: 1, x: 0 }}
                   exit={{ opacity: 0, x: 50 }}
                   transition={{ delay: index * 0.1 }}
                   className={`flex items-center gap-4 p-4 border-b dark:border-gray-700 last:border-0 ${
                     alert.status === "active" ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800"
                   }`}
                 >
                   <div className={`w-12 h-12 rounded-full ${alertType.color} flex items-center justify-center ${
                     alert.status === "active" ? "animate-pulse" : "opacity-60"
                   }`}>
                     <AlertIcon className="w-6 h-6 text-white" />
                   </div>

                   <div className="flex-1">
                     <div className="flex items-center gap-2 mb-1">
                       <span className="font-bold text-gray-900 dark:text-white">{alertType.label}</span>
                       <Badge className={severityColors[alert.severity]}>
                         {alert.severity === "critical" ? "קריטי" : 
                          alert.severity === "high" ? "גבוה" :
                          alert.severity === "medium" ? "בינוני" : "נמוך"}
                       </Badge>
                       {alert.status === "active" && (
                         <Badge className="bg-red-600 text-white animate-pulse">פעיל</Badge>
                       )}
                     </div>
                     <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                       <span className="flex items-center gap-1">
                         <MapPin size={14} />
                         {alert.location}
                       </span>
                       <span className="flex items-center gap-1">
                         <Clock size={14} />
                         {alert.time}
                       </span>
                     </div>
                   </div>

                   <ChevronRight className="w-5 h-5 text-gray-400" />
                 </motion.div>
               );
             })}
           </AnimatePresence>
          )}
        </CardContent>
      </Card>

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

                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayArticle(article)}
                        disabled={loadingArticleId === article.id}
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

          {/* Audio element */}
          <audio 
          ref={audioRef} 
          onEnded={() => setPlayingArticleId(null)}
          className="hidden"
          />
          </div>
          );
          }