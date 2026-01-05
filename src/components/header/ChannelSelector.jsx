import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const countryLabels = {
  israel: "ישראל 🇮🇱",
  russia: "רוסיה 🇷🇺",
  usa: "ארה\"ב 🇺🇸",
  uk: "בריטניה 🇬🇧",
  france: "צרפת 🇫🇷",
  other: "אחר 🌍"
};

export default function ChannelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('selectedChannel') || 'all';
    }
    return 'all';
  });

  const { data: channels = [] } = useQuery({
    queryKey: ['channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, '-created_date'),
    initialData: []
  });

  // Group channels by country
  const channelsByCountry = channels.reduce((acc, channel) => {
    const country = channel.country || 'other';
    if (!acc[country]) acc[country] = [];
    acc[country].push(channel);
    return acc;
  }, {});

  const handleSelect = (channelId) => {
    setSelectedChannel(channelId);
    localStorage.setItem('selectedChannel', channelId);
    setIsOpen(false);
    
    // If 'all' is selected, pick the first channel for streaming
    const streamChannelId = channelId === 'all' && channels.length > 0 ? channels[0].id : channelId;
    window.dispatchEvent(new CustomEvent('channelChange', { detail: streamChannelId }));
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm active:shadow-md active:scale-95 transition-all border border-gray-200 dark:border-gray-700 text-gray-900"
      >
        <div 
          className="w-4 h-4 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentChannel?.color || '#E31E24' }}
        >
          <Radio className="w-2.5 h-2.5 text-white" />
        </div>
        <span className="text-xs font-bold dark:text-white truncate max-w-[80px] sm:max-w-none">
          {currentChannel?.name || 'כל הערוצים'}
        </span>
        <ChevronDown className={`w-3 h-3 dark:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-[9999]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-[10000] overflow-hidden max-h-[70vh] overflow-y-auto"
            >
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 active:bg-gray-100 dark:active:bg-gray-700 transition-colors ${
                  selectedChannel === 'all' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-[#E31E24] flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-sm dark:text-white">כל הערוצים</span>
              </button>

              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>

              {Object.entries(channelsByCountry).map(([country, countryChannels]) => (
                <div key={country}>
                  <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        {countryLabels[country] || country}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">
                        ({countryChannels.length})
                      </span>
                    </div>
                  </div>
                  {countryChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => handleSelect(channel.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 active:bg-gray-100 dark:active:bg-gray-700 transition-colors ${
                        selectedChannel === channel.id ? 'bg-red-50 dark:bg-red-900/20' : ''
                      }`}
                    >
                      <div 
                        className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: channel.color || '#E31E24' }}
                      >
                        <Radio className="w-3.5 h-3.5 text-white" />
                      </div>
                      <div className="text-right flex-1 min-w-0">
                        <div className="font-bold text-sm dark:text-white truncate">{channel.name}</div>
                        {channel.description && (
                          <div className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {channel.description}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}