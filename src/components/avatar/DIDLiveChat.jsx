import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Video, Mic, MicOff, VideoIcon, VideoOff, Loader2, MessageCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function DIDLiveChat({ isOpen, onClose }) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [messages, setMessages] = useState([]);
  const avatarVideoRef = useRef(null);
  const userVideoRef = useRef(null);
  const roomRef = useRef(null);
  const sessionRef = useRef(null);

  useEffect(() => {
    if (isOpen && !isConnected) {
      connectToAvatar();
    }
    return () => {
      if (roomRef.current) {
        disconnectFromAvatar();
      }
    };
  }, [isOpen]);

  const connectToAvatar = async () => {
    setIsConnecting(true);
    toast.loading('מתחבר לאווטאר...', { id: 'avatar-connect' });

    try {
      // Create session
      const response = await base44.functions.invoke('createLiveAvatarSession', {});
      const { livekit_url, livekit_client_token } = response.data;

      // Import LiveKit SDK dynamically
      const { Room, RoomEvent, Track } = await import('npm:livekit-client@2.0.0');

      // Create room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 }
        }
      });

      roomRef.current = room;

      // Setup event listeners
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (track.kind === Track.Kind.Video) {
          if (avatarVideoRef.current) {
            track.attach(avatarVideoRef.current);
          }
        }
      });

      room.on(RoomEvent.Connected, () => {
        setIsConnected(true);
        setIsConnecting(false);
        toast.success('מחובר! תתחיל לדבר', { id: 'avatar-connect' });
        
        // Enable user camera and mic
        enableLocalMedia();
      });

      room.on(RoomEvent.Disconnected, () => {
        setIsConnected(false);
        toast.info('ההתחברות הסתיימה');
      });

      // Connect to room
      await room.connect(livekit_url, livekit_client_token);

    } catch (error) {
      console.error('Connection error:', error);
      toast.error('שגיאה בהתחברות: ' + error.message, { id: 'avatar-connect' });
      setIsConnecting(false);
    }
  };

  const enableLocalMedia = async () => {
    try {
      const room = roomRef.current;
      if (!room) return;

      // Enable camera
      await room.localParticipant.setCameraEnabled(true);
      
      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);

      // Attach user video
      const videoTrack = room.localParticipant.videoTrackPublications.values().next().value?.videoTrack;
      if (videoTrack && userVideoRef.current) {
        videoTrack.attach(userVideoRef.current);
      }

    } catch (error) {
      console.error('Media error:', error);
      toast.error('לא ניתן להפעיל מצלמה/מיקרופון');
    }
  };

  const toggleMute = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
      toast.success(isMuted ? 'מיקרופון הופעל' : 'מיקרופון הושתק');
    } catch (error) {
      toast.error('שגיאה בשינוי מיקרופון');
    }
  };

  const toggleVideo = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.localParticipant.setCameraEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
      toast.success(isVideoOff ? 'מצלמה הופעלה' : 'מצלמה כובתה');
    } catch (error) {
      toast.error('שגיאה בשינוי מצלמה');
    }
  };

  const disconnectFromAvatar = async () => {
    const room = roomRef.current;
    if (!room) return;

    try {
      await room.disconnect();
      roomRef.current = null;
      setIsConnected(false);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border border-purple-500/50 h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                <Video className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">שיחת וידאו חיה עם AI</h2>
                <p className="text-purple-100 text-sm">
                  {isConnecting ? 'מתחבר...' : isConnected ? '🟢 מחובר - תתחיל לדבר!' : 'LiveAvatar'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Video Area */}
          <div className="flex-1 bg-black relative overflow-hidden grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
            {/* Avatar Video */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-purple-500/30">
              <video
                ref={avatarVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-bold">🤖 AI Avatar</span>
              </div>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  {isConnecting ? (
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-2" />
                      <p className="text-white">מתחבר לאווטאר...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Video className="w-16 h-16 text-purple-400 mx-auto mb-2" />
                      <p className="text-white">לוחץ להתחברות</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Video */}
            <div className="relative bg-gray-900 rounded-xl overflow-hidden border-2 border-blue-500/30">
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm font-bold">👤 אתה</span>
              </div>
              {!isConnected && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center">
                    <VideoIcon className="w-16 h-16 text-blue-400 mx-auto mb-2" />
                    <p className="text-white text-sm">המצלמה שלך תופעל אוטומטית</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gradient-to-br from-gray-900 to-black p-4 border-t border-purple-500/30">
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={toggleMute}
                disabled={!isConnected}
                variant={isMuted ? "destructive" : "default"}
                className="w-12 h-12 rounded-full"
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleVideo}
                disabled={!isConnected}
                variant={isVideoOff ? "destructive" : "default"}
                className="w-12 h-12 rounded-full"
              >
                {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
              </Button>

              {!isConnected && !isConnecting && (
                <Button
                  onClick={connectToAvatar}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8"
                >
                  <Video className="w-5 h-5 ml-2" />
                  התחבר לשיחה
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}