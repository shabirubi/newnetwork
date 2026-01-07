import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Trash2, Edit2, Save, X, Radio, Link2, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ChannelsManager() {
  const [editingChannel, setEditingChannel] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    stream_url: "",
    rss_sources: "",
    country: "other",
    color: "#E31E24",
    is_active: true
  });
  const [loadingChannels, setLoadingChannels] = useState(false);

  const queryClient = useQueryClient();

  const { data: channels = [], isLoading } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.list('-created_date'),
    initialData: []
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.NewsChannel.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.NewsChannel.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.NewsChannel.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      stream_url: "",
      rss_sources: "",
      country: "other",
      color: "#E31E24",
      is_active: true
    });
    setEditingChannel(null);
    setShowForm(false);
  };

  const loadIPTVChannels = async () => {
    setLoadingChannels(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אני צריך רשימה של 50 ערוצי טלוויזיה חיים ואמיתיים מכל העולם.

חפש ברשת את המקורות הבאים:
1. ספריית GitHub: iptv-org/iptv (יש שם אלפי ערוצים מעודכנים)
2. רשימות M3U מעודכנות מ-2026
3. ערוצי YouTube Live שמשדרים 24/7
4. ערוצים מ-IPTV providers

עבור כל ערוץ תן לי:
- name: שם הערוץ (בעברית אם אפשר)
- description: תיאור קצר
- stream_url: קישור ישיר לשידור (m3u8, mpd, או YouTube/Twitch)
- country: israel, russia, usa, uk, france, או other

חשוב מאוד:
- השתמש בקישורי .m3u8 או .mpd אמיתיים מהספרייה iptv-org
- ערוצי חדשות, ספורט, בידור ממדינות שונות
- ודא שהקישורים עובדים (מהמאגר המעודכן)

דוגמאות:
- ערוצים מישראל: כאן 11, ערוץ 12, ערוץ 13
- ערוצים בינלאומיים: CNN, BBC, France 24, RT, Al Jazeera
- מספריית iptv-org שים לב לערוצים הפופולריים ביותר`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            channels: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  stream_url: { type: "string" },
                  country: { type: "string" }
                }
              }
            }
          }
        }
      });

      const channels = response.channels || [];
      for (const ch of channels) {
        await createMutation.mutateAsync({
          name: ch.name,
          description: ch.description,
          stream_url: ch.stream_url,
          country: ch.country,
          rss_sources: [],
          color: "#E31E24",
          is_active: true
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChannels(false);
    }
  };

  const handleEdit = (channel) => {
    setEditingChannel(channel);
    setFormData({
      name: channel.name,
      description: channel.description || "",
      stream_url: channel.stream_url || "",
      rss_sources: channel.rss_sources?.join('\n') || "",
      country: channel.country || "other",
      color: channel.color || "#E31E24",
      is_active: channel.is_active
    });
    setShowForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      rss_sources: formData.rss_sources.split('\n').filter(s => s.trim()),
      stream_url: formData.stream_url.trim() || undefined,
      country: formData.country
    };

    if (editingChannel) {
      updateMutation.mutate({ id: editingChannel.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold dark:text-white">ניהול ערוצי חדשות</h1>
            <p className="text-gray-600 dark:text-gray-400">נהל ערוצים ומקורות RSS</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={loadIPTVChannels}
            disabled={loadingChannels}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {loadingChannels ? <Loader2 className="w-5 h-5 ml-2 animate-spin" /> : <Globe className="w-5 h-5 ml-2" />}
            {loadingChannels ? 'טוען...' : 'טען 50 ערוצים חיים'}
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-[#E31E24] hover:bg-[#B91C1C]"
          >
            {showForm ? <X className="w-5 h-5 ml-2" /> : <Plus className="w-5 h-5 ml-2" />}
            {showForm ? 'ביטול' : 'ערוץ ידני'}
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle>{editingChannel ? 'עריכת ערוץ' : 'ערוץ חדש'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">שם הערוץ</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="לדוגמה: חדשות כלכלה"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">תיאור</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="תיאור קצר של הערוץ"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">קישור שידור חי (אופציונלי)</label>
                  <Input
                    value={formData.stream_url}
                    onChange={(e) => setFormData({ ...formData, stream_url: e.target.value })}
                    placeholder="https://youtube.com/watch?v=... או https://example.com/live"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">מדינה</label>
                  <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="israel">🇮🇱 ישראל</SelectItem>
                      <SelectItem value="russia">🇷🇺 רוסיה</SelectItem>
                      <SelectItem value="usa">🇺🇸 ארצות הברית</SelectItem>
                      <SelectItem value="uk">🇬🇧 בריטניה</SelectItem>
                      <SelectItem value="france">🇫🇷 צרפת</SelectItem>
                      <SelectItem value="other">🌍 אחר</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">
                    מקורות RSS (כל מקור בשורה נפרדת)
                  </label>
                  <Textarea
                    value={formData.rss_sources}
                    onChange={(e) => setFormData({ ...formData, rss_sources: e.target.value })}
                    placeholder="https://example.com/rss&#10;https://another.com/feed"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-white">צבע הערוץ</label>
                  <Input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="h-12"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label className="text-sm dark:text-white">ערוץ פעיל</label>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-[#E31E24] hover:bg-[#B91C1C]">
                    <Save className="w-4 h-4 ml-2" />
                    שמירה
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    ביטול
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Channels List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel, index) => (
          <motion.div
            key={channel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-white dark:bg-gray-800 hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: channel.color || '#E31E24' }}
                    >
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg dark:text-white">{channel.name}</CardTitle>
                      {!channel.is_active && (
                        <span className="text-xs text-gray-500">לא פעיל</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(channel)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(channel.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {channel.description || 'אין תיאור'}
                </p>
                <div className="space-y-2">
                  {channel.stream_url && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <Radio className="w-4 h-4" />
                      <span>שידור חי זמין</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Link2 className="w-4 h-4" />
                    <span>{channel.rss_sources?.length || 0} מקורות RSS</span>
                  </div>
                  {channel.country && (
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {channel.country === 'israel' && '🇮🇱 ישראל'}
                      {channel.country === 'russia' && '🇷🇺 רוסיה'}
                      {channel.country === 'usa' && '🇺🇸 ארה"ב'}
                      {channel.country === 'uk' && '🇬🇧 בריטניה'}
                      {channel.country === 'france' && '🇫🇷 צרפת'}
                      {channel.country === 'other' && '🌍 אחר'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {channels.length === 0 && !isLoading && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl">
          <Radio className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-2">אין ערוצים</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">התחל ביצירת ערוץ חדשות ראשון</p>
          <Button onClick={() => setShowForm(true)} className="bg-[#E31E24] hover:bg-[#B91C1C]">
            <Plus className="w-5 h-5 ml-2" />
            צור ערוץ
          </Button>
        </div>
      )}
    </div>
  );
}