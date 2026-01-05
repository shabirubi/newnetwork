import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Radio, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleSelect = (channelId) => {
    setSelectedChannel(channelId);
    localStorage.setItem('selectedChannel', channelId);
    setIsOpen(false);
    window.dispatchEvent(new CustomEvent('channelChange', { detail: channelId }));
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentChannel?.color || '#E31E24' }}
        >
          <Radio className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-bold dark:text-white">
          {currentChannel?.name || 'כל הערוצים'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden"
            >
              <button
                onClick={() => handleSelect('all')}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedChannel === 'all' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center">
                  <Radio className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold dark:text-white">כל הערוצים</span>
              </button>

              {channels.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleSelect(channel.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    selectedChannel === channel.id ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: channel.color || '#E31E24' }}
                  >
                    <Radio className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-right flex-1">
                    <div className="font-bold text-sm dark:text-white">{channel.name}</div>
                    {channel.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {channel.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}