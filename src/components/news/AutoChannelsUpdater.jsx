import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Radio, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export default function AutoChannelsUpdater() {
  const [showNotification, setShowNotification] = useState(false);
  const queryClient = useQueryClient();

  const loadChannelsFromIPTV = async () => {
    try {
      // Check if we have recent channels
      const existingChannels = await base44.entities.NewsChannel.list();
      
      // Only update if we have less than 20 channels or it's been more than 24h
      const lastUpdate = localStorage.getItem('lastChannelsUpdate');
      const now = Date.now();
      
      if (existingChannels.length >= 20 && lastUpdate && (now - parseInt(lastUpdate)) < UPDATE_INTERVAL) {
        console.log('Channels are up to date');
        return;
      }

      console.log('Updating channels from IPTV sources...');
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `חפש ברשת את ספריית GitHub iptv-org/iptv ותן לי רשימה של 50 ערוצי טלוויזיה חיים מעודכנים.

חשוב מאוד:
1. השתמש בקישורי .m3u8 אמיתיים מהספרייה iptv-org/iptv
2. ערוצי חדשות, ספורט, בידור ממדינות שונות
3. ודא שהקישורים מהמאגר המעודכן ביותר

עבור כל ערוץ:
- name: שם הערוץ בעברית
- description: תיאור קצר בעברית  
- stream_url: קישור .m3u8 ישיר מהמאגר
- country: israel, russia, usa, uk, france, או other

דוגמאות לערוצים:
- חדשות בינלאומיות: CNN, BBC, France 24, Al Jazeera, RT
- ספורט: ESPN, beIN Sports, Sky Sports
- בידור: MTV, Comedy Central
- ישראל: כאן 11, ערוץ 12, ערוץ 13`,
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
      
      if (channels.length > 0) {
        // Clear old channels
        const oldChannels = await base44.entities.NewsChannel.list();
        for (const old of oldChannels) {
          await base44.entities.NewsChannel.delete(old.id);
        }

        // Add new channels
        for (const ch of channels) {
          await base44.entities.NewsChannel.create({
            name: ch.name,
            description: ch.description,
            stream_url: ch.stream_url,
            country: ch.country || "other",
            rss_sources: [],
            color: "#E31E24",
            is_active: true
          });
        }

        localStorage.setItem('lastChannelsUpdate', now.toString());
        
        // Invalidate cache
        queryClient.invalidateQueries({ queryKey: ['channels'] });
        
        // Show notification on mobile
        if (window.innerWidth < 1024) {
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 4000);
        }

        console.log(`Updated ${channels.length} channels`);
      }
    } catch (err) {
      console.error('Failed to update channels:', err);
    }
  };

  useEffect(() => {
    // Initial load after 10 seconds
    const initialTimeout = setTimeout(() => {
      loadChannelsFromIPTV();
    }, 10000);

    // Set up interval for daily updates
    const interval = setInterval(() => {
      loadChannelsFromIPTV();
    }, UPDATE_INTERVAL);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] lg:hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span className="font-bold text-sm">ערוצים חדשים עודכנו!</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}