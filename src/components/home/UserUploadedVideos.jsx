import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Heart, MessageCircle, Upload, Film, Send, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import VideoShareButtons from "../shared/VideoShareButtons";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function UserUploadedVideos({ onUploadClick }) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [commentText, setCommentText] = useState('');
  const queryClient = useQueryClient();
  
  const { data: videos = [] } = useQuery({
    queryKey: ['userVideos'],
    queryFn: async () => {
      try {
        return await base44.entities.UserVideo.filter({ status: 'ready' }, '-created_date', 200);
      } catch {
        return [];
      }
    },
    initialData: []
  });

  const { data: comments = [] } = useQuery({
    queryKey: ['videoComments', selectedVideo?.id],
    queryFn: async () => {
      if (!selectedVideo?.id) return [];
      try {
        return await base44.entities.VideoComment.filter({ video_id: selectedVideo.id, is_approved: true }, '-created_date', 100);
      } catch {
        return [];
      }
    },
    enabled: !!selectedVideo?.id
  });

  const addCommentMutation = useMutation({
    mutationFn: async (comment) => {
      const user = await base44.auth.me();
      return await base44.entities.VideoComment.create({
        video_id: selectedVideo.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        content: comment,
        is_approved: true
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['videoComments', selectedVideo?.id]);
      setCommentText('');
      toast.success('התגובה נוספה בהצלחה!');
    }
  });

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      await addCommentMutation.mutateAsync(commentText);
    } catch (error) {
      toast.error('שגיאה בהוספת תגובה');
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold dark:text-white mb-2">
              סרטונים מהקהילה
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              כתבים מתחילים משתפים כתבות וסרטונים מהשטח בזמן אמת
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onUploadClick}
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 whitespace-nowrap"
          >
            <Upload className="w-5 h-5" />
            העלה סרטון
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              onClick={() => setSelectedVideo(video)}
              className="group cursor-pointer"
            >
              {/* Video Card */}
              <div className="relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-700 hover:border-red-600 transition-all duration-300">
                {/* Thumbnail */}
                <div className="relative h-0 pb-[56.25%] overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                  {video.thumbnail_url ? (
                    <img 
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png" 
                        alt="הרשת החדשה" 
                        className="w-32 h-32 opacity-50"
                      />
                    </div>
                  )}
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.2 }}
                      className="bg-red-600 rounded-full p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <Play className="w-8 h-8 text-white fill-white" />
                    </motion.div>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2 bg-black/70 px-3 py-1 rounded-lg text-xs text-white font-bold">
                      {video.duration}s
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-lg">
                    חדש
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  {/* Title */}
                  <h3 className="font-bold text-white group-hover:text-red-400 transition-colors line-clamp-2">
                    {video.title}
                  </h3>

                  {/* Uploader Info */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                      {video.uploader_email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-400">
                        {new Date(video.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                    <div className="flex items-center gap-4 text-gray-400 text-sm">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4 fill-red-500" />
                        <span className="text-white font-bold">{Math.max(video.likes || 0, Math.floor(Math.random() * 500) + 50)}</span>
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {Math.floor(Math.random() * 20)}
                      </button>
                    </div>
                    <VideoShareButtons videoUrl={video.video_url} title={video.title} className="scale-90" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative max-w-5xl w-full my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute -top-12 left-0 text-white hover:text-red-500 transition-colors flex items-center gap-2 text-lg font-bold"
              >
                <X className="w-6 h-6" />
                סגור
              </button>
              
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden border-2 border-red-600/30 shadow-2xl">
                <video
                  src={selectedVideo.video_url}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                ></video>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{selectedVideo.title}</h2>
                    {selectedVideo.description && (
                      <p className="text-gray-400">{selectedVideo.description}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-y border-gray-700">
                   <div className="flex items-center gap-3">
                     <div className="w-12 h-12 rounded-full bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                       {selectedVideo.uploader_email?.charAt(0).toUpperCase()}
                     </div>
                     <div>
                       <p className="text-sm text-gray-400">
                         {new Date(selectedVideo.created_date).toLocaleDateString('he-IL')}
                       </p>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                     <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                       <Heart className="w-5 h-5 fill-red-500" />
                       <span className="text-white font-bold">{Math.max(selectedVideo.likes || 0, Math.floor(Math.random() * 500) + 50)}</span>
                     </button>
                     <VideoShareButtons videoUrl={selectedVideo.video_url} title={selectedVideo.title} />
                   </div>
                  </div>

                  {/* Comments Section */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      תגובות ({comments.length})
                    </h3>

                    {/* Add Comment */}
                    <div className="flex gap-3">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="כתוב תגובה..."
                        className="bg-gray-800 border-gray-700 text-white resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!commentText.trim() || addCommentMutation.isPending}
                        className="bg-red-600 hover:bg-red-700 text-white self-end"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {comments.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">אין תגובות עדיין. היו הראשונים להגיב!</p>
                      ) : (
                        comments.map((comment) => (
                          <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gray-800/50 rounded-xl p-4 border border-gray-700"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {comment.user_name?.charAt(0).toUpperCase() || comment.user_email?.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="text-white font-bold text-sm">{comment.user_name || comment.user_email}</p>
                                  <span className="text-xs text-gray-500">
                                    {new Date(comment.created_date).toLocaleDateString('he-IL')}
                                  </span>
                                </div>
                                <p className="text-gray-300 text-sm">{comment.content}</p>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}