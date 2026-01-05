import React, { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Play, Star, Clock, Eye, Calendar, User, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import VODCard from "../components/vod/VODCard";

// Load HLS.js from CDN
const loadHls = () => {
  return new Promise((resolve, reject) => {
    if (window.Hls) {
      resolve(window.Hls);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@latest';
    script.onload = () => resolve(window.Hls);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

const categoryLabels = {
  action: "אקשן",
  drama: "דרמה",
  comedy: "קומדיה",
  thriller: "מתח",
  documentary: "דוקומנטרי",
  sports: "ספורט",
  kids: "ילדים",
  romance: "רומנטי",
  horror: "אימה",
  scifi: "מדע בדיוני"
};

export default function VODPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const contentId = urlParams.get('id');
  const queryClient = useQueryClient();
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  const { data: content, isLoading } = useQuery({
    queryKey: ['vod-content', contentId],
    queryFn: async () => {
      const results = await base44.entities.VODContent.filter({ id: contentId });
      return results[0];
    },
    enabled: !!contentId
  });

  const { data: relatedContent = [] } = useQuery({
    queryKey: ['vod-related', content?.category],
    queryFn: () => base44.entities.VODContent.filter({ category: content.category }, '-views', 6),
    enabled: !!content?.category,
    initialData: []
  });

  const incrementViewsMutation = useMutation({
    mutationFn: () => base44.entities.VODContent.update(contentId, { views: (content.views || 0) + 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vod-content', contentId] });
    }
  });

  useEffect(() => {
    if (content && contentId) {
      incrementViewsMutation.mutate();
    }
  }, [contentId]);

  // Setup HLS player for .m3u8 streams
  useEffect(() => {
    if (!content?.video_url || !content.video_url.includes('.m3u8') || !videoRef.current) return;

    const video = videoRef.current;
    
    // Cleanup previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if browser natively supports HLS (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = content.video_url;
      video.play().catch(() => {});
    } else {
      // Use HLS.js for other browsers
      loadHls().then((Hls) => {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,
          });
          hlsRef.current = hls;
          hls.loadSource(content.video_url);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => {});
          });
        }
      }).catch(() => {
        video.src = content.video_url;
        video.play().catch(() => {});
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [content?.video_url]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full aspect-video rounded-2xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">תוכן לא נמצא</h2>
        <Link to={createPageUrl("VOD")}>
          <Button>חזרה לספרייה</Button>
        </Link>
      </div>
    );
  }

  const related = relatedContent.filter(c => c.id !== content.id).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to={createPageUrl("VOD")}>
        <Button variant="ghost" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה לספרייה
        </Button>
      </Link>

      {/* Video Player */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative bg-black rounded-2xl overflow-hidden shadow-2xl"
      >
        <div className="w-full aspect-video">
          {content.video_url && content.video_url.includes('.m3u8') ? (
            <video
              ref={videoRef}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
            />
          ) : content.video_url ? (
            <iframe
              key={content.video_url}
              src={content.video_url}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
              <div className="text-center text-white">
                <Play className="w-24 h-24 mx-auto mb-4 text-gray-600" />
                <p className="text-xl">הווידאו יהיה זמין בקרוב</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Content Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">{content.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
              {content.category && (
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                  {categoryLabels[content.category]}
                </span>
              )}
              {content.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {content.year}
                </div>
              )}
              {content.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {content.duration}
                </div>
              )}
              {content.views > 0 && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {content.views} צפיות
                </div>
              )}
            </div>
          </div>
          {content.rating && (
            <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 px-4 py-2 rounded-lg">
              <Star className="w-5 h-5 text-yellow-600" fill="currentColor" />
              <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{content.rating}</span>
            </div>
          )}
        </div>

        {content.description && (
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
            {content.description}
          </p>
        )}

        {(content.director || content.cast?.length > 0) && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
            {content.director && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-bold text-gray-700 dark:text-gray-300">במאי:</span>
                <span className="text-gray-600 dark:text-gray-400">{content.director}</span>
              </div>
            )}
            {content.cast?.length > 0 && (
              <div className="flex items-start gap-2 text-sm">
                <User className="w-4 h-4 text-gray-400 mt-0.5" />
                <span className="font-bold text-gray-700 dark:text-gray-300">שחקנים:</span>
                <span className="text-gray-600 dark:text-gray-400">{content.cast.join(", ")}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Content */}
      {related.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-4 dark:text-white">תוכן דומה</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.map((item, index) => (
              <VODCard key={item.id} content={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}