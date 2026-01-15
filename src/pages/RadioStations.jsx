import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Radio, Play, Pause, Volume2, VolumeX, X, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function RadioStations() {
  const [selectedStation, setSelectedStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const { data: channels = [] } = useQuery({
    queryKey: ['radio-channels'],
    queryFn: () => base44.entities.NewsChannel.filter({ is_active: true }, 'name'),
    initialData: []
  });

  const radioStations = channels.filter(ch => 
    ch.stream_url?.includes('.mp3') || 
    ch.stream_url?.includes('.aac') || 
    ch.stream_url?.includes('icecast.audio')
  );

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const handleStationClick = (station) => {
    if (selectedStation?.id === station.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setSelectedStation(station);
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = station.stream_url;
        audioRef.current.play().catch(err => console.log('Play error:', err));
      }
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const closePlayer = () => {
    audioRef.current?.pause();
    setSelectedStation(null);
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">
      <audio ref={audioRef} />
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Radio className="w-10 h-10 text-[#E31E24]" />
          תחנות רדיו
        </h1>
        <p className="text-gray-600 dark:text-gray-400">לחצו על הלוגו של התחנה להאזנה</p>
      </motion.div>

      {/* Stations Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-32">
        {radioStations.map((station, index) => (
          <motion.div
            key={station.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleStationClick(station)}
            className={`relative cursor-pointer group ${
              selectedStation?.id === station.id && isPlaying
                ? 'ring-4 ring-[#E31E24] shadow-2xl shadow-[#E31E24]/50'
                : ''
            }`}
          >
            <div 
              className="aspect-square rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-all duration-300 relative overflow-hidden"
              style={{ backgroundColor: station.color || '#E31E24' }}
            >
              {/* Animated Background */}
              {selectedStation?.id === station.id && isPlaying && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
              
              {/* Station Name */}
              <span className="relative z-10 text-center px-2">{station.name}</span>
              
              {/* Play Indicator */}
              {selectedStation?.id === station.id && isPlaying && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/30 flex items-center justify-center backdrop-blur-sm"
                >
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1 bg-white rounded-full"
                        animate={{
                          height: ["8px", "16px", "8px"]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.2
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Player */}
      <AnimatePresence>
        {selectedStation && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div className="bg-gradient-to-r from-gray-900 to-black dark:from-black dark:to-gray-900 text-white shadow-2xl border-t border-white/10">
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Station Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center font-bold shadow-lg"
                      style={{ backgroundColor: selectedStation.color || '#E31E24' }}
                    >
                      <Radio className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{selectedStation.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{selectedStation.description || 'מתנגן כעת...'}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={togglePlayPause}
                      className="text-white hover:bg-white/20 h-12 w-12"
                    >
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-white hover:bg-white/20 h-10 w-10"
                    >
                      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </Button>

                    <div className="w-24 hidden md:block">
                      <Slider
                        value={[isMuted ? 0 : volume]}
                        max={100}
                        step={1}
                        onValueChange={([val]) => {
                          setVolume(val);
                          setIsMuted(val === 0);
                        }}
                        className="cursor-pointer"
                      />
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={closePlayer}
                      className="text-white hover:bg-white/20 h-10 w-10"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}