import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, ChevronDown, Globe, Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const countryLabels = {
  israel: { name: "ישראל", flagCode: "il", color: "#0038b8" },
  russia: { name: "רוסיה", flagCode: "ru", color: "#d52b1e" },
  usa: { name: "ארה\"ב", flagCode: "us", color: "#3c3b6e" },
  uk: { name: "בריטניה", flagCode: "gb", color: "#012169" },
  france: { name: "צרפת", flagCode: "fr", color: "#002395" },
  other: { name: "אחר", flagCode: null, color: "#6b7280" }
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
    setSelectedCountry(country);
  };

  const handleBack = () => {
    setSelectedCountry(null);
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg shadow-sm active:shadow-md active:scale-95 transition-all border border-white/20 text-white touch-manipulation relative z-[9999]"
      >
        <Globe className="w-4 h-4 text-white" />
        <span className="text-xs font-bold text-white hidden sm:inline">
          {currentChannel?.name || 'ערוצי עולם'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-white" />
      </button>

      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] touch-manipulation"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setSelectedCountry(null);
            }}
          >
            <div className="absolute inset-0 bg-black/30" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute left-4 top-20 w-[350px] max-h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden touch-manipulation"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              <div className="overflow-y-auto max-h-[calc(100vh-120px)]">
                {!selectedCountry ? (
                  <>
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 px-4 py-3 z-10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Globe className="w-4 h-4 text-white" />
                          </div>
                          <h3 className="text-base font-bold text-white">ערוצי עולם</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={createPageUrl("ChannelsManager")}
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all"
                          >
                            <Settings className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Load Channels Button */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <Link
                        to={createPageUrl("ChannelsManager")}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 transition-all shadow-lg mb-3"
                      >
                        <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right flex-1">
                          <div className="font-bold text-sm text-white">טען ערוצים חדשים</div>
                          <div className="text-[11px] text-white/70">הוסף 30 ערוצים מכל העולם</div>
                        </div>
                      </Link>

                      <button
                        onClick={() => handleSelect('all')}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:scale-95 transition-all ${
                          selectedChannel === 'all' ? 'bg-red-50 dark:bg-red-900/20 shadow-sm' : 'bg-gray-50 dark:bg-gray-700/50'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center">
                          <Radio className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-sm dark:text-white">כל הערוצים</span>
                      </button>
                    </div>

                    {/* Countries */}
                    <div className="p-3">
                      <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-2 px-2">בחר לפי מדינה</div>
                      <div className="space-y-1.5">
                        {Object.entries(channelsByCountry).map(([country, countryChannels]) => {
                          const countryInfo = countryLabels[country] || { name: country, flag: "🌍", color: "#6b7280" };
                          return (
                            <button
                              key={country}
                              onClick={() => handleCountryClick(country)}
                              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:scale-95 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                            >
                              <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                {countryInfo.flagCode ? (
                                  <img 
                                    src={`https://flagcdn.com/h40/${countryInfo.flagCode}.png`}
                                    alt={countryInfo.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="text-xl">🌍</div>
                                )}
                              </div>
                              <div className="flex-1 text-right">
                                <div className="font-bold text-sm dark:text-white">{countryInfo.name}</div>
                                <div className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {countryChannels.length} ערוצים
                                </div>
                              </div>
                              <ChevronDown className="w-4 h-4 -rotate-90 text-gray-400" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Country Header */}
                    <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 px-4 py-3 z-10">
                      <button
                        onClick={handleBack}
                        className="w-full flex items-center gap-2.5 active:scale-95 transition-transform"
                      >
                        <div className="p-1.5 rounded-lg bg-white/10">
                          <ChevronDown className="w-3.5 h-3.5 rotate-90 text-white" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center overflow-hidden">
                          {countryLabels[selectedCountry]?.flagCode ? (
                            <img 
                              src={`https://flagcdn.com/h40/${countryLabels[selectedCountry].flagCode}.png`}
                              alt={countryLabels[selectedCountry].name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-lg">🌍</span>
                          )}
                        </div>
                        <div className="text-right flex-1">
                          <span className="font-bold text-base text-white block">{countryLabels[selectedCountry]?.name}</span>
                          <span className="text-[11px] text-white/60">
                            {channelsByCountry[selectedCountry]?.length} ערוצים
                          </span>
                        </div>
                      </button>
                    </div>

                    {/* Channels */}
                    <div className="p-3 space-y-1.5">
                      {channelsByCountry[selectedCountry]?.map((channel) => (
                        <button
                          key={channel.id}
                          onClick={() => handleSelect(channel.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl active:scale-95 transition-all ${
                            selectedChannel === channel.id 
                              ? 'bg-red-50 dark:bg-red-900/20 shadow-sm border-2 border-[#E31E24]' 
                              : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                          }`}
                        >
                          <div 
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: channel.color || '#E31E24' }}
                          >
                            <Radio className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-right flex-1 min-w-0">
                            <div className="font-bold text-sm dark:text-white truncate">{channel.name}</div>
                            {channel.description && (
                              <div className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                {channel.description}
                              </div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}