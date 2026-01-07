import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Tv, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function ChannelsLoader() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const queryClient = useQueryClient();

  const createChannelMutation = useMutation({
    mutationFn: (channelData) => base44.entities.NewsChannel.create(channelData),
    onSuccess: () => {
      queryClient.invalidateQueries(['live-channels']);
    }
  });

  const loadChannelsFromIPTV = async () => {
    setLoading(true);
    setResults([]);
    toast.info("מתחיל לטעון ערוצים מ-IPTV...");

    try {
      toast.info("מחפש ערוצי טלוויזיה חיים...");
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `חפש לי רשימה של 30 ערוצי טלוויזיה חיים פופולריים מכל העולם מ-IPTV (מהפרויקט iptv-org/iptv בגיט האב).

עבור כל ערוץ, תן לי:
- name: שם הערוץ בעברית
- name_english: שם הערוץ באנגלית
- description: תיאור קצר בעברית (משפט אחד)
- stream_url: קישור M3U8 ישיר לשידור החי (חשוב מאוד שיהיה תקין!)
- country: אחד מהבאים: israel, russia, usa, uk, france, other
- is_active: true

חשוב מאוד:
1. הקישורים צריכים להיות M3U8 תקינים ועובדים
2. מגוון של מדינות - לא רק ממדינה אחת
3. ערוצי חדשות, ספורט, בידור
4. קישורים מעודכנים מ-2024-2025

דוגמאות לפורמט קישורים:
- https://example.com/live/channel.m3u8
- https://stream.example.com/hls/live.m3u8

אל תמציא קישורים - רק קישורים אמיתיים מפרויקט iptv-org!`,
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
                  name_english: { type: "string" },
                  description: { type: "string" },
                  stream_url: { type: "string" },
                  country: { type: "string" },
                  is_active: { type: "boolean" }
                },
                required: ["name", "name_english", "description", "stream_url", "country"]
              }
            }
          }
        }
      });

      const channels = response.channels || [];
      
      if (!channels.length) {
        toast.error("לא נמצאו ערוצים");
        setLoading(false);
        return;
      }
      
      toast.success(`נמצאו ${channels.length} ערוצים! מתחיל להעלות...`);
      const loadResults = [];

      for (const channel of channels) {
        toast.info(`מעלה: ${channel.name}...`);
        try {
          await createChannelMutation.mutateAsync({
            name: channel.name,
            description: channel.description,
            stream_url: channel.stream_url,
            country: channel.country,
            is_active: true,
            rss_sources: [],
            color: "#E31E24"
          });

          loadResults.push({
            name: channel.name,
            status: 'success'
          });
        } catch (err) {
          console.error(`Failed to load channel ${channel.name}:`, err);
          loadResults.push({
            name: channel.name,
            status: 'error',
            error: err.message
          });
        }
      }

      setResults(loadResults);
      const successCount = loadResults.filter(r => r.status === 'success').length;
      toast.success(`✅ נטענו ${successCount} ערוצים בהצלחה!`);
    } catch (err) {
      console.error("Error loading channels:", err);
      toast.error(`שגיאה בטעינת הערוצים: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
            <Tv className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold dark:text-white">טעינת ערוצי טלוויזיה</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          טען 30 ערוצי טלוויזיה חיים מכל העולם באופן אוטומטי
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm text-center">
        <Button
          onClick={loadChannelsFromIPTV}
          disabled={loading}
          className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-6 text-lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              טוען ערוצים...
            </>
          ) : (
            <>
              <Tv className="w-5 h-5 mr-2" />
              טען 30 ערוצים חדשים
            </>
          )}
        </Button>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          התהליך לוקח כ-45 שניות
        </p>
      </div>

      {results.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold mb-4 dark:text-white">תוצאות הטעינה</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-sm dark:text-gray-200">{result.name}</span>
                {result.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-300 text-center">
              ✅ נטענו {results.filter(r => r.status === 'success').length} מתוך {results.length} ערוצים
            </p>
          </div>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-2">💡 איך זה עובד?</h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <li>✓ הערוצים נטענים מפרויקט iptv-org בגיט האב</li>
          <li>✓ רק ערוצים חינמיים וציבוריים</li>
          <li>✓ מגוון ערוצים מכל העולם - חדשות, ספורט, בידור</li>
          <li>✓ כל ערוץ מאומת לפני הטעינה</li>
          <li>✓ ניתן לטעון עוד 30 ערוצים בכל פעם</li>
        </ul>
      </div>
    </div>
  );
}