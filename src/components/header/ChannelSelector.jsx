import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, ChevronDown, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        className="flex items-center gap-1.5 px-3 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg shadow-sm active:shadow-md active:scale-95 transition-all border border-white/20 text-white touch-manipulation relative z-[70]"
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[99999]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
              setSelectedCountry(null);
            }}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 bottom-0 w-[85vw] max-w-sm bg-white dark:bg-gray-800 shadow-2xl overflow-y-auto"
            >
              {!selectedCountry ? (
                <>
                  {/* Drawer Header */}
                  <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-4 shadow-lg z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Globe className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">ערוצי עולם</h2>
                          <p className="text-white/60 text-xs">בחר ערוץ חדשות</p>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          setSelectedCountry(null);
                        }}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all"
                      >
                        <ChevronDown className="w-5 h-5 rotate-90" />
                      </button>
                    </div>
                  </div>

                  {/* All Channels Button */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleSelect('all')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl active:scale-95 transition-all ${
                        selectedChannel === 'all' ? 'bg-red-50 dark:bg-red-900/20 shadow-md' : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E31E24] to-red-600 flex items-center justify-center shadow-md">
                        <Radio className="w-6 h-6 text-white" />
                      </div>
                      <span className="font-bold text-base dark:text-white">כל הערוצים</span>
                    </button>
                  </div>

                  {/* Country List */}
                  <div className="p-4">
                   <div className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-3 px-2">בחר לפי מדינה</div>
                   <div className="space-y-2">
                     {Object.entries(channelsByCountry).map(([country, countryChannels]) => {
                       const countryInfo = countryLabels[country] || { name: country, flag: "🌍", color: "#6b7280" };
                       return (
                         <button
                           key={country}
                           onClick={() => handleCountryClick(country)}
                           className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-95 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-sm"
                         >
                           <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm overflow-hidden">
                             {countryInfo.flagCode ? (
                               <img 
                                 src={`https://flagcdn.com/h40/${countryInfo.flagCode}.png`}
                                 alt={countryInfo.name}
                                 className="w-full h-full object-cover"
                               />
                             ) : (
                               <div className="text-2xl">🌍</div>
                             )}
                           </div>
                           <div className="flex-1 text-right">
                             <div className="font-bold text-base dark:text-white">{countryInfo.name}</div>
                             <div className="text-xs text-gray-500 dark:text-gray-400">
                               {countryChannels.length} ערוצים
                             </div>
                           </div>
                           <ChevronDown className="w-5 h-5 -rotate-90 text-gray-400" />
                         </button>
                       );
                     })}
                   </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Back Button & Country Header */}
                  <div className="sticky top-0 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 p-4 shadow-lg z-10">
                    <button
                      onClick={handleBack}
                      className="w-full flex items-center gap-3 active:scale-95 transition-transform"
                    >
                      <div className="p-2 rounded-full bg-white/10">
                        <ChevronDown className="w-4 h-4 rotate-90 text-white" />
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                        {countryLabels[selectedCountry]?.flagCode ? (
                          <img 
                            src={`https://flagcdn.com/h40/${countryLabels[selectedCountry].flagCode}.png`}
                            alt={countryLabels[selectedCountry].name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl">🌍</span>
                        )}
                      </div>
                      <div className="text-right flex-1">
                        <span className="font-bold text-lg text-white block">{countryLabels[selectedCountry]?.name}</span>
                        <span className="text-xs text-white/60">
                          {channelsByCountry[selectedCountry]?.length} ערוצים
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* Channels List */}
                  <div className="p-4 space-y-2">
                    {channelsByCountry[selectedCountry]?.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => handleSelect(channel.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl active:scale-95 transition-all ${
                          selectedChannel === channel.id 
                            ? 'bg-red-50 dark:bg-red-900/20 shadow-md border-2 border-[#E31E24]' 
                            : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                          style={{ backgroundColor: channel.color || '#E31E24' }}
                        >
                          <Radio className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-right flex-1 min-w-0">
                          <div className="font-bold text-base dark:text-white truncate">{channel.name}</div>
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
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}