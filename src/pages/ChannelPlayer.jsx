import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tv, ArrowRight, Globe, Radio } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LivePlayer from "../components/news/LivePlayer";

const countryLabels = {
  israel: "ישראל",
  russia: "רוסיה",
  usa: "ארצות הברית",
  uk: "בריטניה",
  france: "צרפת",
  other: "אחר"
};

const countryFlags = {
  israel: "🇮🇱",
  russia: "🇷🇺",
  usa: "🇺🇸",
  uk: "🇬🇧",
  france: "🇫🇷",
  other: "🌍"
};

export default function ChannelPlayer() {
  const urlParams = new URLSearchParams(window.location.search);
  const channelId = urlParams.get('id');

  const { data: channel, isLoading } = useQuery({
    queryKey: ['channel', channelId],
    queryFn: async () => {
      const channels = await base44.entities.NewsChannel.filter({ id: channelId });
      return channels[0];
    },
    enabled: !!channelId
  });

  const { data: relatedChannels = [] } = useQuery({
    queryKey: ['related-channels', channel?.country],
    queryFn: () => {
      if (!channel?.country) return [];
      return base44.entities.NewsChannel.filter({ country: channel.country, is_active: true }, '-created_date', 6);
    },
    enabled: !!channel?.country,
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="w-full aspect-video" />
        <Skeleton className="w-full h-32" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-20">
        <Tv className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-400 mb-2">ערוץ לא נמצא</h3>
        <Link to={createPageUrl("Channels")}>
          <Button variant="outline">חזרה לספריית הערוצים</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to={createPageUrl("Channels")}>
        <Button variant="ghost" className="gap-2">
          <ArrowRight className="w-4 h-4" />
          חזרה לספריית הערוצים
        </Button>
      </Link>

      {/* Player */}
      <div className="bg-black rounded-xl overflow-hidden shadow-2xl">
        <LivePlayer
          title={channel.name}
          streamUrl={channel.stream_url}
          isLive={true}
          viewerCount={Math.floor(Math.random() * 5000) + 1000}
        />
      </div>

      {/* Channel Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-6xl">
            {countryFlags[channel.country || 'other']}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 dark:text-white">{channel.name}</h1>
            
            <div className="flex flex-wrap items-center gap-3 mb-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                {countryLabels[channel.country || 'other']}
              </div>
              <div className="flex items-center gap-1 text-[#E31E24]">
                <Radio className="w-4 h-4" />
                שידור חי
              </div>
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-medium">
                פעיל
              </div>
            </div>

            {channel.description && (
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {channel.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 ערוץ זה משודר ישירות מרשת IPTV הציבורית העולמית - ללא עלות וללא צורך ברישום
          </p>
        </div>
      </div>

      {/* Related Channels */}
      {relatedChannels.length > 1 && (
        <div>
          <h2 className="text-2xl font-bold mb-6 dark:text-white">ערוצים דומים</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedChannels.filter(c => c.id !== channel.id).slice(0, 5).map((relChannel) => (
              <Link key={relChannel.id} to={createPageUrl(`ChannelPlayer?id=${relChannel.id}`)}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-1">
                        {countryFlags[relChannel.country || 'other']}
                      </div>
                      <Tv className="w-8 h-8 text-gray-600 mx-auto" />
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-sm line-clamp-2 dark:text-white">{relChannel.name}</h3>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}