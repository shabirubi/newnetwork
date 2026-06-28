import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Trash2, Video, Newspaper, Users, MessageCircle, Loader2, RefreshCw, Eye, Search, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function AdminContent() {
  const [selectedTab, setSelectedTab] = useState('videos');
  const [searchQuery, setSearchQuery] = useState('');
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

  const { data: customCategories = [], isLoading: loadingCategories, refetch: refetchCategories } = useQuery({
    queryKey: ['admin-custom-categories'],
    queryFn: () => base44.entities.CustomCategory.list('-created_date', 100),
    enabled: selectedTab === 'categories'
  });

  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatColor, setNewCatColor] = useState('#6366F1');

  const addCategoryMutation = useMutation({
    mutationFn: async ({ label, color }) => {
      return await base44.entities.CustomCategory.create({ label, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-custom-categories']);
      queryClient.invalidateQueries(['custom-categories-db']);
      setNewCatLabel('');
      toast.success('קטגוריה נוספה בהצלחה');
    },
    onError: () => toast.error('שגיאה בהוספת קטגוריה')
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

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.CustomCategory.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-custom-categories']);
      queryClient.invalidateQueries(['custom-categories-db']);
      toast.success('קטגוריה נמחקה');
    },
    onError: () => toast.error('שגיאה במחיקת קטגוריה')
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
    { id: 'categories', label: 'קטגוריות', icon: Tag, count: customCategories.length },
  ];

  const currentData = {
    videos: { data: videos, loading: loadingVideos, type: 'video', refetch: refetchVideos },
    articles: { data: articles, loading: loadingArticles, type: 'article', refetch: refetchArticles },
    reporters: { data: reporters, loading: loadingReporters, type: 'reporter', refetch: refetchReporters },
    comments: { data: comments, loading: loadingComments, type: 'comment', refetch: refetchComments },
    categories: { data: customCategories, loading: loadingCategories, type: 'category', refetch: refetchCategories },
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

      <div className="flex gap-3 items-center">
        <div className="flex-1 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder={`חפש ${
              selectedTab === 'videos' ? 'סרטונים' : 
              selectedTab === 'articles' ? 'כתבות' : 
              selectedTab === 'reporters' ? 'כתבים' : 'תגובות'
            }...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white pr-10"
          />
        </div>
        <Button onClick={currentData.refetch} variant="outline" className="bg-gray-800 border-gray-700">
          <RefreshCw className="w-4 h-4 ml-2" />
          רענן
        </Button>
      </div>

      {/* Categories manager — special UI */}
      {selectedTab === 'categories' && (
        <div className="space-y-4">
          {/* Add new */}
          <div className="bg-gray-800/50 rounded-xl p-4 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-gray-400 text-xs mb-1 block">שם קטגוריה</label>
              <Input
                placeholder="לדוגמה: כלכלה, בריאות..."
                value={newCatLabel}
                onChange={e => setNewCatLabel(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                onKeyDown={e => e.key === 'Enter' && newCatLabel.trim() && addCategoryMutation.mutate({ label: newCatLabel.trim(), color: newCatColor })}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs mb-1 block">צבע</label>
              <input type="color" value={newCatColor} onChange={e => setNewCatColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0" />
            </div>
            <Button
              onClick={() => newCatLabel.trim() && addCategoryMutation.mutate({ label: newCatLabel.trim(), color: newCatColor })}
              disabled={!newCatLabel.trim() || addCategoryMutation.isPending}
              className="bg-[#E31E24] hover:bg-red-700 text-white"
            >
              {addCategoryMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              הוסף
            </Button>
          </div>

          {loadingCategories ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-[#E31E24] animate-spin" /></div>
          ) : customCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">אין קטגוריות מותאמות אישית עדיין</p>
          ) : (
            <div className="space-y-2">
              {customCategories.map(cat => (
                <motion.div key={cat.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-gray-800/50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color || '#6366F1' }} />
                    <span className="text-white font-medium">{cat.label}</span>
                  </div>
                  <Button onClick={() => deleteCategoryMutation.mutate(cat.id)} variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedTab !== 'categories' && currentData.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#E31E24] animate-spin" />
        </div>
      ) : selectedTab !== 'categories' && (
        <div className="space-y-2">
          {currentData.data
            .filter(item => {
              if (!searchQuery) return true;
              const query = searchQuery.toLowerCase();
              
              if (selectedTab === 'videos') {
                return item.title?.toLowerCase().includes(query) || 
                       item.uploader_email?.toLowerCase().includes(query);
              }
              if (selectedTab === 'articles') {
                return item.title?.toLowerCase().includes(query) || 
                       item.category?.toLowerCase().includes(query);
              }
              if (selectedTab === 'reporters') {
                return item.name?.toLowerCase().includes(query) || 
                       item.role?.toLowerCase().includes(query);
              }
              if (selectedTab === 'comments') {
                return item.content?.toLowerCase().includes(query) || 
                       item.user_name?.toLowerCase().includes(query);
              }
              return true;
            })
            .map((item) => (
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