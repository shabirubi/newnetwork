import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Video, Newspaper, Users, Film, MessageCircle, Calendar, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [selectedTab, setSelectedTab] = useState('videos');
  const queryClient = useQueryClient();

  // Fetch data
  const { data: videos = [], isLoading: loadingVideos, refetch: refetchVideos } = useQuery({
    queryKey: ['admin-videos'],
    queryFn: () => base44.entities.UserVideo.list('-created_date', 500),
    enabled: selectedTab === 'videos'
  });

  const { data: articles = [], isLoading: loadingArticles, refetch: refetchArticles } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 500),
    enabled: selectedTab === 'articles'
  });

  const { data: reporters = [], isLoading: loadingReporters, refetch: refetchReporters } = useQuery({
    queryKey: ['admin-reporters'],
    queryFn: () => base44.entities.Reporter.list('name', 500),
    enabled: selectedTab === 'reporters'
  });

  const { data: comments = [], isLoading: loadingComments, refetch: refetchComments } = useQuery({
    queryKey: ['admin-comments'],
    queryFn: () => base44.entities.VideoComment.list('-created_date', 500),
    enabled: selectedTab === 'comments'
  });

  const { data: subscriptions = [], isLoading: loadingSubscriptions, refetch: refetchSubscriptions } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: () => base44.entities.Subscription.list('-created_date', 500),
    enabled: selectedTab === 'subscriptions'
  });

  // Delete mutations
  const deleteVideoMutation = useMutation({
    mutationFn: (id) => base44.entities.UserVideo.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-videos']);
      toast.success('הסרטון נמחק בהצלחה');
    },
    onError: () => toast.error('שגיאה במחיקת הסרטון')
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsArticle.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-articles']);
      toast.success('הכתבה נמחקה בהצלחה');
    },
    onError: () => toast.error('שגיאה במחיקת הכתבה')
  });

  const deleteReporterMutation = useMutation({
    mutationFn: (id) => base44.entities.Reporter.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reporters']);
      toast.success('הכתב נמחק בהצלחה');
    },
    onError: () => toast.error('שגיאה במחיקת הכתב')
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (id) => base44.entities.VideoComment.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-comments']);
      toast.success('התגובה נמחקה בהצלחה');
    },
    onError: () => toast.error('שגיאה במחיקת התגובה')
  });

  const deleteSubscriptionMutation = useMutation({
    mutationFn: (id) => base44.entities.Subscription.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-subscriptions']);
      toast.success('המנוי נמחק בהצלחה');
    },
    onError: () => toast.error('שגיאה במחיקת המנוי')
  });

  const handleDelete = (id, type) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פריט זה?')) return;

    switch(type) {
      case 'video':
        deleteVideoMutation.mutate(id);
        break;
      case 'article':
        deleteArticleMutation.mutate(id);
        break;
      case 'reporter':
        deleteReporterMutation.mutate(id);
        break;
      case 'comment':
        deleteCommentMutation.mutate(id);
        break;
      case 'subscription':
        deleteSubscriptionMutation.mutate(id);
        break;
    }
  };

  const tabs = [
    { id: 'videos', label: 'סרטונים', icon: Video, count: videos.length },
    { id: 'articles', label: 'חדשות', icon: Newspaper, count: articles.length },
    { id: 'reporters', label: 'כתבים', icon: Users, count: reporters.length },
    { id: 'comments', label: 'תגובות', icon: MessageCircle, count: comments.length },
    { id: 'subscriptions', label: 'מנויים', icon: Calendar, count: subscriptions.length },
  ];

  const currentData = {
    videos: { data: videos, loading: loadingVideos, type: 'video', refetch: refetchVideos },
    articles: { data: articles, loading: loadingArticles, type: 'article', refetch: refetchArticles },
    reporters: { data: reporters, loading: loadingReporters, type: 'reporter', refetch: refetchReporters },
    comments: { data: comments, loading: loadingComments, type: 'comment', refetch: refetchComments },
    subscriptions: { data: subscriptions, loading: loadingSubscriptions, type: 'subscription', refetch: refetchSubscriptions },
  }[selectedTab];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">פאנל ניהול</h1>
          <p className="text-gray-400">ניהול ומחיקת תוכן</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
                  selectedTab === tab.id
                    ? 'bg-[#E31E24] text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span className="bg-black/30 px-2 py-0.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Refresh Button */}
        <div className="mb-4">
          <Button
            onClick={() => currentData.refetch()}
            variant="outline"
            className="bg-gray-800 border-gray-700 hover:bg-gray-700"
          >
            <RefreshCw className="w-4 h-4 ml-2" />
            רענן
          </Button>
        </div>

        {/* Content */}
        {currentData.loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
          </div>
        ) : currentData.data.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">אין פריטים להצגה</p>
          </div>
        ) : (
          <div className="space-y-2">
            {currentData.data.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between hover:bg-gray-800/70 transition-all"
              >
                <div className="flex-1 min-w-0">
                  {selectedTab === 'videos' && (
                    <>
                      <h3 className="text-white font-medium truncate">{item.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {item.uploader_email} • {new Date(item.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </>
                  )}
                  {selectedTab === 'articles' && (
                    <>
                      <h3 className="text-white font-medium truncate">{item.title}</h3>
                      <p className="text-gray-400 text-sm">
                        {item.category} • {new Date(item.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </>
                  )}
                  {selectedTab === 'reporters' && (
                    <>
                      <h3 className="text-white font-medium">{item.name}</h3>
                      <p className="text-gray-400 text-sm">{item.role} • {item.specialty}</p>
                    </>
                  )}
                  {selectedTab === 'comments' && (
                    <>
                      <p className="text-white truncate">{item.content}</p>
                      <p className="text-gray-400 text-sm">
                        {item.user_name || item.user_email} • {new Date(item.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </>
                  )}
                  {selectedTab === 'subscriptions' && (
                    <>
                      <h3 className="text-white font-medium">{item.user_email}</h3>
                      <p className="text-gray-400 text-sm">
                        {item.plan_type} • {item.status} • {new Date(item.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </>
                  )}
                </div>

                <Button
                  onClick={() => handleDelete(item.id, currentData.type)}
                  variant="destructive"
                  size="icon"
                  className="shrink-0 mr-4"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}