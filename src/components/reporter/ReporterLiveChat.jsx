import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, Mic, MicOff, Video as VideoIcon, VideoOff, Radio } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ReporterLiveChat({ isOpen, onClose, reporter }) {
  const [isLoading, setIsLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const videoRef = useRef(null);
  const peerConnectionRef = useRef(null);

  // Initialize D-ID stream when modal opens
  useEffect(() => {
    if (isOpen && reporter) {
      initializeDIDStream();
    }
    
    return () => {
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [isOpen, reporter]);

  const initializeDIDStream = async () => {
    try {
      setIsLoading(true);
      console.log('🎬 Starting D-ID stream for reporter:', reporter.name);
      
      // Create D-ID streaming session with reporter's image
      const response = await base44.functions.invoke('createDIDStream', {
        source_url: reporter.image,
        driver_url: 'bank://lively'
      });

      console.log('📡 D-ID response:', response.data);

      if (response.data?.id && response.data?.session_id && response.data?.offer) {
        const streamId = response.data.id;
        const sessionIdValue = response.data.session_id;
        
        setStreamUrl(streamId);
        setSessionId(sessionIdValue);
        
        console.log('✅ Stream created:', { streamId, sessionIdValue });
        
        // Setup WebRTC connection
        const peerConnection = new RTCPeerConnection({
          iceServers: response.data.ice_servers || [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        
        peerConnectionRef.current = peerConnection;

        // Handle ICE candidates
        peerConnection.onicecandidate = async (event) => {
          if (event.candidate) {
            console.log('🧊 ICE candidate:', event.candidate);
            try {
              await base44.functions.invoke('sendDIDMessage', {
                stream_id: streamId,
                session_id: sessionIdValue,
                type: 'ice',
                sdp: event.candidate
              });
            } catch (err) {
              console.error('Failed to send ICE candidate:', err);
            }
          }
        };

        // Handle incoming stream
        peerConnection.ontrack = (event) => {
          console.log('🎥 Received video track');
          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            videoRef.current.play().catch(e => console.error('Video play error:', e));
            setIsLoading(false);
            toast.success('🎬 האווטאר מוכן!');
          }
        };

        // Handle connection state
        peerConnection.onconnectionstatechange = () => {
          console.log('🔌 Connection state:', peerConnection.connectionState);
          if (peerConnection.connectionState === 'failed') {
            toast.error('החיבור נכשל');
            setIsLoading(false);
          }
        };

        // Set remote description
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(response.data.offer)
        );

        console.log('📝 Remote description set');

        // Create answer
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        console.log('💬 Sending answer to D-ID');

        // Send answer back to D-ID
        await base44.functions.invoke('sendDIDMessage', {
          stream_id: streamId,
          session_id: sessionIdValue,
          type: 'answer',
          sdp: answer.sdp
        });

        console.log('✅ WebRTC setup complete');

        // Send welcome message after connection is established
        setTimeout(() => {
          const voiceId = reporter.gender === 'female' ? 'he-IL-HilaNeural' : 'he-IL-AvriNeural';
          sendMessageToAvatar(`שלום! אני ${reporter.name}, ${reporter.role}. ${reporter.specialty}. במה אוכל לעזור?`, voiceId);
        }, 3000);
      } else {
        throw new Error('Invalid D-ID response structure');
      }
    } catch (error) {
      console.error('❌ Failed to initialize D-ID stream:', error);
      toast.error('שגיאה בטעינת האווטאר: ' + error.message);
      setIsLoading(false);
    }
  };

  const sendMessageToAvatar = async (text, voiceId = null) => {
    if (!sessionId || !streamUrl) {
      console.error('Cannot send message: missing session or stream');
      return;
    }

    try {
      console.log('🗣️ Sending text to avatar:', text.substring(0, 50) + '...');
      
      const voice = voiceId || (reporter.gender === 'female' ? 'he-IL-HilaNeural' : 'he-IL-AvriNeural');
      
      await base44.functions.invoke('sendDIDMessage', {
        stream_id: streamUrl,
        session_id: sessionId,
        type: 'talk',
        text: text,
        voice_id: voice
      });
      
      console.log('✅ Message sent to avatar');
    } catch (error) {
      console.error('❌ Failed to send message to avatar:', error);
      toast.error('שגיאה בשליחת הודעה לאווטאר');
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = inputValue.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInputValue('');
    setIsSending(true);

    try {
      // Get AI response from reporter
      const response = await base44.functions.invoke('reporterAIChat', {
        message: userMessage,
        reporterName: reporter.name,
        reporterRole: reporter.role,
        reporterSpecialty: reporter.specialty,
        reporterBio: reporter.bio
      });

      const aiResponse = response.data.response;
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);

      // Make avatar speak the response
      const voiceId = reporter.gender === 'female' ? 'he-IL-HilaNeural' : 'he-IL-AvriNeural';
      await sendMessageToAvatar(aiResponse, voiceId);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('שגיאה בשליחת ההודעה');
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !reporter) return null;

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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-6xl shadow-2xl border-2 border-[#0080FF]/50 h-[90vh] flex flex-col"
          style={{
            boxShadow: '0 0 60px rgba(0, 128, 255, 0.5)'
          }}
        >
          {/* Branded Header with Logo */}
          <div className="bg-black p-4 flex items-center justify-between shrink-0 border-b-2 border-[#0080FF]/50"
            style={{
              boxShadow: '0 4px 30px rgba(0, 128, 255, 0.4)'
            }}
          >
            <motion.img 
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="h-16 w-auto drop-shadow-2xl"
              animate={{ 
                scale: [1, 1.05, 1],
                filter: ['brightness(1)', 'brightness(1.2)', 'brightness(1)']
              }}
              transition={{ 
                duration: 3, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <div className="text-right flex-1 px-4">
              <div className="text-white font-bold text-xl drop-shadow-lg">{reporter.name}</div>
              <div className="text-[#0080FF] font-bold text-sm flex items-center justify-end gap-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0080FF]"></span>
                </span>
                {isLoading ? 'מכין אווטר חי...' : 'צ\'אט חי עם אווטר AI'}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-[#0080FF]/20 hover:bg-[#0080FF]/40 flex items-center justify-center transition-colors border-2 border-[#0080FF]/50"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Video Avatar Area */}
          <div className="flex-1 bg-black relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black z-10">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-16 h-16 text-[#0080FF] mx-auto mb-4" />
                  </motion.div>
                  <p className="text-white text-xl font-bold mb-2">מכין אווטאר חי...</p>
                  <p className="text-gray-400 text-sm">ממתין לחיבור עם {reporter.name}</p>
                </div>
              </div>
            )}
            
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              style={{
                transform: 'scaleX(-1)' // Mirror effect
              }}
            />

            {/* Live Indicator */}
            {!isLoading && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-[#0080FF] to-[#0066FF] text-white px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#0080FF]/50 border-2 border-[#0080FF]/50">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                שידור חי
              </div>
            )}

            {/* Reporter Info Card */}
            {!isLoading && (
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-xl rounded-xl p-4 border-2 border-[#0080FF]/50 shadow-lg shadow-[#0080FF]/30">
                <div className="flex items-center gap-3">
                  <img 
                    src={reporter.image}
                    alt={reporter.name}
                    className="w-12 h-12 rounded-full border-2 border-[#0080FF]"
                  />
                  <div>
                    <p className="text-white font-bold">{reporter.name}</p>
                    <p className="text-[#0080FF] text-xs">{reporter.specialty}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages Overlay */}
          <div className="absolute bottom-24 left-0 right-0 px-4 max-h-64 overflow-y-auto pointer-events-none">
            <div className="space-y-2">
              {messages.slice(-5).map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`px-4 py-2 rounded-2xl max-w-md ${
                    msg.role === 'user' 
                      ? 'bg-[#0080FF]/90 text-white' 
                      : 'bg-black/80 text-white border-2 border-[#0080FF]/50'
                  } backdrop-blur-xl shadow-lg`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Branded Footer with Live Indicator */}
          <div className="bg-black p-4 border-t-2 border-[#0080FF]/50 flex items-center justify-center"
            style={{
              boxShadow: '0 -4px 30px rgba(0, 128, 255, 0.4)'
            }}
          >
            <div className="flex items-center gap-2 bg-[#0080FF]/20 backdrop-blur-sm px-4 py-2 rounded-full border-2 border-[#0080FF]/50">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0080FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0080FF]"></span>
              </span>
              <span className="text-white font-bold">שיחה חיה עם {reporter.name}</span>
            </div>
          </div>

          {/* Chat Input */}
          <div className="bg-black p-4 border-t border-[#0080FF]/30 safe-area-inset-bottom"
            style={{
              boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.8)'
            }}
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  type="text"
                  placeholder={`שאל את ${reporter.name}...`}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={isSending || isLoading}
                  className="flex-1 bg-black/60 border-[#0080FF]/50 text-white placeholder-white/50 h-12 px-4 text-base rounded-xl"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isSending || !inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-[#0080FF] to-[#0066FF] hover:from-[#0066FF] hover:to-[#0080FF] h-12 px-6 rounded-xl shadow-lg shadow-[#0080FF]/50 border-2 border-[#0080FF]/50"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>

              {/* Quick Replies */}
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                <button
                  onClick={() => setInputValue('מה החדשות האחרונות?')}
                  className="px-3 py-1.5 bg-[#0080FF]/20 hover:bg-[#0080FF]/40 border border-[#0080FF]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                >
                  📰 מה חדש?
                </button>
                <button
                  onClick={() => setInputValue('ספר לי עוד על זה')}
                  className="px-3 py-1.5 bg-[#0080FF]/20 hover:bg-[#0080FF]/40 border border-[#0080FF]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                >
                  📖 ספר עוד
                </button>
                <button
                  onClick={() => setInputValue('מה דעתך על זה?')}
                  className="px-3 py-1.5 bg-[#0080FF]/20 hover:bg-[#0080FF]/40 border border-[#0080FF]/40 rounded-full text-xs text-white whitespace-nowrap backdrop-blur-sm transition-all"
                >
                  💭 מה דעתך?
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}