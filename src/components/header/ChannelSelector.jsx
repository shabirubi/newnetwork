import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const countryLabels = {
  israel: { name: "ישראל", flag: "🇮🇱", color: "#0038b8" },
  russia: { name: "רוסיה", flag: "🇷🇺", color: "#d52b1e" },
  usa: { name: "ארה\"ב", flag: "🇺🇸", color: "#3c3b6e" },
  uk: { name: "בריטניה", flag: "🇬🇧", color: "#012169" },
  france: { name: "צרפת", flag: "🇫🇷", color: "#002395" },
  other: { name: "אחר", flag: "🌍", color: "#6b7280" }
};

export default function ChannelSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
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
    setSelectedCountry(null);
    
    // If 'all' is selected, pick the first channel for streaming
    const streamChannelId = channelId === 'all' && channels.length > 0 ? channels[0].id : channelId;
    window.dispatchEvent(new CustomEvent('channelChange', { detail: streamChannelId }));
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(selectedCountry === country ? null : country);
  };

  const handleBack = () => {
    setSelectedCountry(null);
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
          {currentChannel?.name || 'ערוצים בעולם'}
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[10000] overflow-hidden"
              style={{ width: selectedCountry ? '280px' : '340px' }}
            >
              {!selectedCountry ? (
                <>
                  {/* All Channels Button */}
                  <button
                    onClick={() => handleSelect('all')}
                    className={`w-full flex items-center gap-3 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                      selectedChannel === 'all' ? 'bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center shadow-md">
                      <Radio className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-base dark:text-white">ערוצים בעולם</span>
                  </button>

                  {/* Country Grid */}
                  <div className="p-4">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-1">בחר מדינה</div>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(channelsByCountry).map(([country, countryChannels]) => {
                        const countryInfo = countryLabels[country] || { name: country, flag: "🌍", color: "#6b7280" };
                        return (
                          <motion.button
                            key={country}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleCountryClick(country)}
                            className="relative overflow-hidden rounded-xl p-3 text-center active:opacity-90 transition-all shadow-md hover:shadow-lg bg-white dark:bg-gray-700"
                            style={{ 
                              borderWidth: '2px',
                              borderStyle: 'solid',
                              borderColor: countryInfo.color
                            }}
                          >
                            <div className="text-5xl mb-1.5 drop-shadow-lg">{countryInfo.flag}</div>
                            <div className="font-bold text-sm dark:text-white mb-0.5">{countryInfo.name}</div>
                            <div className="text-xs font-semibold" style={{ color: countryInfo.color }}>
                              {countryChannels.length} ערוצים
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Back Button & Country Header */}
                  <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-10">
                    <button
                      onClick={handleBack}
                      className="w-full flex items-center gap-2 px-4 py-3 active:bg-gray-50 dark:active:bg-gray-700 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90 dark:text-white" />
                      <span className="text-2xl">{countryLabels[selectedCountry]?.flag}</span>
                      <span className="font-bold dark:text-white">{countryLabels[selectedCountry]?.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-auto">
                        ({channelsByCountry[selectedCountry]?.length})
                      </span>
                    </button>
                  </div>

                  {/* Channels List */}
                  <div className="max-h-[60vh] overflow-y-auto">
                    {channelsByCountry[selectedCountry]?.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleSelect(channel.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 active:bg-gray-100 dark:active:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
                          selectedChannel === channel.id ? 'bg-red-50 dark:bg-red-900/20' : ''
                        }`}
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: channel.color || '#E31E24' }}
                        >
                          <Radio className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <div className="font-bold text-sm dark:text-white truncate">{channel.name}</div>
                          {channel.description && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                              {channel.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}