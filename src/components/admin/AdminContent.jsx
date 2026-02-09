import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trash2, Video, Newspaper, Users, MessageCircle, Loader2, RefreshCw, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminContent() {
  const [selectedTab, setSelectedTab] = useState('videos');
  const queryClient = useQueryClient();

  const { data: videos = [], isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ['admin-content-videos'],
    queryFn: () => base44.entities.UserVideo.list('-created_date', 500),
    enabled: selectedTab === 'videos'
  });

  const { data: articles = [], isLoading: loadingArticles, refetch: refetchArticles } = useQuery({
    queryKey: ['admin-content-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 500),
    enabled: selectedTab === 'articles'
  });

  const { data: reporters = [], isLoading: loadingReporters, refetch: refetchReporters } = useQuery({
    queryKey: ['admin-content-reporters'],
    queryFn: () => base44.entities.Reporter.list('name', 500),
    enabled: selectedTab === 'reporters'
  });

  const { data: comments = [], isLoading: loadingComments, refetch: refetchComments } = useQuery({
    queryKey: ['admin-content-comments'],
    queryFn: () => base44.entities.VideoComment.list('-created_date', 500),
    enabled: selectedTab === 'comments'
  });

  const deleteVideoMutation = useMutation({
    mutationFn: async (id) => {
      await base44.asServiceRole.entities.UserVideo.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-videos']);
      toast.success('הסרטון נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת הסרטון');
    }
  });

  const deleteArticleMutation = useMutation({
    mutationFn: async (id) => {
      await base44.asServiceRole.entities.NewsArticle.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-articles']);
      toast.success('הכתבה נמחקה בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת הכתבה');
    }
  });

  const deleteReporterMutation = useMutation({
    mutationFn: async (id) => {
      await base44.asServiceRole.entities.Reporter.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-reporters']);
      toast.success('הכתב נמחק בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת הכתב');
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (id) => {
      await base44.asServiceRole.entities.VideoComment.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-content-comments']);
      toast.success('התגובה נמחקה בהצלחה');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('שגיאה במחיקת התגובה');
    }
  });

  const handleDelete = (id, type) => {
    if (!confirm('האם אתה בטוח?')) return;
    switch(type) {
      case 'video': deleteVideoMutation.mutate(id); break;
      case 'article': deleteArticleMutation.mutate(id); break;
      case 'reporter': deleteReporterMutation.mutate(id); break;
      case 'comment': deleteCommentMutation.mutate(id); break;
    }
  };

  const tabs = [
    { id: 'videos', label: 'סרטונים', icon: Video, count: videos.length },
    { id: 'articles', label: 'חדשות', icon: Newspaper, count: articles.length },
    { id: 'reporters', label: 'כתבים', icon: Users, count: reporters.length },
    { id: 'comments', label: 'תגובות', icon: MessageCircle, count: comments.length },
  ];

  const currentData = {
    videos: { data: videos, loading: loadingVideos, type: 'video', refetch: refetchVideos },
    articles: { data: articles, loading: loadingArticles, type: 'article', refetch: refetchArticles },
    reporters: { data: reporters, loading: loadingReporters, type: 'reporter', refetch: refetchReporters },
    comments: { data: comments, loading: loadingComments, type: 'comment', refetch: refetchComments },
  }[selectedTab];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">ניהול תוכן</h2>
        <p className="text-gray-400">ניהול ומחיקת כל סוגי התוכן</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                selectedTab === tab.id
                  ? 'bg-[#E31E24] text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
              <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">{tab.count}</span>
            </button>
          );
        })}
      </div>

      <Button onClick={currentData.refetch} variant="outline" className="bg-gray-800 border-gray-700">
        <RefreshCw className="w-4 h-4 ml-2" />
        רענן
      </Button>

      {currentData.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {currentData.data.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/70 transition-all"
            >
              <div className="flex-1 min-w-0">
                {selectedTab === 'videos' && (
                  <>
                    <p className="text-white font-medium truncate">{item.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span>{item.uploader_email}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.views || 0}
                      </span>
                    </div>
                  </>
                )}
                {selectedTab === 'articles' && (
                  <>
                    <p className="text-white font-medium truncate">{item.title}</p>
                    <p className="text-gray-400 text-sm">{item.category}</p>
                  </>
                )}
                {selectedTab === 'reporters' && (
                  <>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">{item.role}</p>
                  </>
                )}
                {selectedTab === 'comments' && (
                  <>
                    <p className="text-white truncate">{item.content}</p>
                    <p className="text-gray-400 text-sm">{item.user_name || item.user_email}</p>
                  </>
                )}
              </div>
              <Button
                onClick={() => handleDelete(item.id, currentData.type)}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}