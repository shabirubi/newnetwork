import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Film, Play, Eye, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import TalkingHeadPlayer from "../components/news/TalkingHeadPlayer";
import { Button } from "@/components/ui/button";

export default function TalkingHeads() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [generatingVideo, setGeneratingVideo] = useState(false);

  const generateRoseVideo = async () => {
    setGeneratingVideo(true);
    try {
      // יצור וידאו placeholder עם LLM
      const scriptText = "שלום, אני כתב הרשת החדשה. רוז ביזאם הפכה לאחת משכנתות הרשת הוויראליות של השנה עם מיליוני צפיות בTikTok. התוכן המצחיק והקורעת של רוז הביא לה תהילה ברשתות החברתיות.";
      
      // יצור סרטון placeholder (שימוש בוידאו ממקור חיצוני)
      const placeholderVideoUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerBlazes.mp4";
      
      await base44.entities.TalkingHeadVideo.create({
        article_id: "rose_bizaam_viral",
        reporter_name: "כתב הרשת החדשה",
        video_url: placeholderVideoUrl,
        talk_id: "rose_" + Date.now(),
        status: "completed",
        duration: 15,
        presentation_text: "רוז ביזאם - הילדה הווירלית של הרשת",
        views: 0,
        is_featured: true,
      });

      // רענן את הדיטה
      window.location.reload();
    } catch (error) {
      console.error("שגיאה:", error);
      alert("שגיאה ביצירת הוידאו: " + error.message);
    } finally {
      setGeneratingVideo(false);
    }
  };

  const { data: talkingHeads = [], isLoading } = useQuery({
    queryKey: ['talking-heads'],
    queryFn: async () => {
      const videos = await base44.entities.TalkingHeadVideo.filter(
        { status: 'completed' },
        '-created_date',
        50
      );

      // העשרה עם פרטי כתבה
      return Promise.all(
        videos.map(async (video) => {
          const article = await base44.entities.NewsArticle.list().then(
            articles => articles.find(a => a.id === video.article_id)
          );
          return { ...video, article };
        })
      );
    },
    staleTime: 60000,
    refetchInterval: 60000
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-96 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-40 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-red-500 via-orange-500 to-pink-500 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Film className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">כתבים מדברים</h1>
              <p className="text-white/80 text-sm">כתבים תקשורתיים AI עם קולות אמיתיים</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-xs bg-white/20 px-4 py-2 rounded-full">
              {talkingHeads.length} וידאוים
            </div>
            <Button
              onClick={generateRoseVideo}
              disabled={generatingVideo}
              className="bg-white/20 hover:bg-white/30 text-white"
            >
              {generatingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  יוצר...
                </>
              ) : (
                "יצור וידאו רוז"
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Featured Video */}
      {selectedVideo ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <button
            onClick={() => setSelectedVideo(null)}
            className="text-white hover:text-orange-500 transition-colors"
          >
            ← חזור לרשימה
          </button>
          <TalkingHeadPlayer video={selectedVideo} article={selectedVideo.article} />
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedVideo.article?.title}
            </h2>
            <p className="text-gray-300 mb-4">{selectedVideo.article?.subtitle}</p>
            <p className="text-gray-400 text-sm line-clamp-3">
              {selectedVideo.article?.content}
            </p>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Main Featured */}
          {talkingHeads[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="cursor-pointer"
              onClick={() => setSelectedVideo(talkingHeads[0])}
            >
              <div className="relative rounded-2xl overflow-hidden group">
                <TalkingHeadPlayer video={talkingHeads[0]} article={talkingHeads[0].article} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-2xl" />
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 space-y-2"
              >
                <h2 className="text-xl font-bold text-white">
                  {talkingHeads[0].article?.title}
                </h2>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  {talkingHeads[0].views || 0} צפיות
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* Grid */}
          {talkingHeads.length > 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talkingHeads.slice(1).map((video, idx) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedVideo(video)}
                  className="cursor-pointer group"
                >
                  <div className="relative rounded-xl overflow-hidden mb-3">
                    <div className="aspect-video bg-gray-800 relative">
                      <video
                        src={video.video_url}
                        className="w-full h-full object-cover"
                        muted
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                        <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </div>
                  <h3 className="font-bold text-white group-hover:text-orange-500 transition-colors line-clamp-2 text-sm">
                    {video.article?.title}
                  </h3>
                  <p className="text-gray-400 text-xs flex items-center gap-2 mt-1">
                    <Eye className="w-3 h-3" />
                    {video.views || 0}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {talkingHeads.length === 0 && (
        <div className="text-center py-16">
          <Film className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">
            אין וידאוים עדיין
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            הוידאוים יופיעו כאן כשחדשות חדשות יעודכנו
          </p>
        </div>
      )}
    </div>
  );
}