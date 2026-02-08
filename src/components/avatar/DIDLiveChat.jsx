import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Settings, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import * as sdk from '@d-id/client-sdk';

export default function DIDLiveChat({ isOpen, onClose }) {
  const [agentId, setAgentId] = useState('');
  const [clientKey, setClientKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const agentManagerRef = useRef(null);
  const srcObjectRef = useRef(null);

  // Load D-ID configuration from backend
  useEffect(() => {
    if (isOpen) {
      loadDIDConfig();
    }
  }, [isOpen]);

  const loadDIDConfig = async () => {
    try {
      setLoadingConfig(true);
      const { data } = await base44.functions.invoke('getDIDConfig');
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setAgentId(data.agentId);
      setClientKey(data.clientKey);
      
      // Auto-connect
      await handleConnectWithConfig(data.agentId, data.clientKey);
    } catch (error) {
      console.error('Failed to load D-ID config:', error);
      toast.error('שגיאה בטעינת הגדרות D-ID');
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    return () => {
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect();
      }
    };
  }, []);

  const handleConnectWithConfig = async (aid, ckey) => {
    try {
      setIsConnecting(true);

      const auth = { 
        type: 'key', 
        clientKey: ckey 
      };

      const callbacks = {
        onSrcObjectReady: (value) => {
          if (videoRef.current) {
            videoRef.current.srcObject = value;
            srcObjectRef.current = value;
          }
        },
        onVideoStateChange: (state) => {
          console.log('Video state:', state);
          if (state === 'STOP') {
            setIsSpeaking(false);
            if (videoRef.current && agentManagerRef.current?.agent?.presenter?.idle_video) {
              videoRef.current.srcObject = undefined;
              videoRef.current.src = agentManagerRef.current.agent.presenter.idle_video;
            }
          } else if (state === 'PLAY') {
            setIsSpeaking(true);
            if (videoRef.current) {
              videoRef.current.src = '';
              videoRef.current.srcObject = srcObjectRef.current;
            }
          }
        },
        onConnectionStateChange: (state) => {
          console.log('Connection state:', state);
          setConnectionState(state);
          if (state === 'connected') {
            setIsConnected(true);
            toast.success('התחברת בהצלחה!');
          } else if (state === 'disconnected' || state === 'closed') {
            setIsConnected(false);
          }
        },
        onNewMessage: (msgs, type) => {
          console.log('New messages:', msgs, type);
          if (type === 'answer') {
            setMessages(msgs);
          }
        }
      };

      const streamOptions = { 
        compatibilityMode: 'auto', 
        streamWarmup: true 
      };

      const agentManager = await sdk.createAgentManager(aid, { 
        auth, 
        callbacks, 
        streamOptions 
      });

      agentManagerRef.current = agentManager;

      await agentManager.connect();

      setIsConfigured(true);
      setShowSettings(false);

      // Load idle video
      if (videoRef.current && agentManager.agent?.presenter?.idle_video) {
        videoRef.current.src = agentManager.agent.presenter.idle_video;
      }

    } catch (error) {
      console.error('Connection error:', error);
      toast.error('שגיאה בהתחברות: ' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleConnect = async () => {
    if (!agentId || !clientKey) {
      toast.error('נא להזין Agent ID ו-Client Key');
      return;
    }

    await handleConnectWithConfig(agentId, clientKey);
  };



  const handleSendMessage = async () => {
    if (!message.trim() || !agentManagerRef.current || !isConnected) return;

    try {
      const userMessage = message.trim();
      setMessage('');

      // Add user message to chat
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      }]);

      // Send to agent
      await agentManagerRef.current.chat(userMessage);

    } catch (error) {
      console.error('Send message error:', error);
      toast.error('שגיאה בשליחת הודעה');
    }
  };

  const handleDisconnect = () => {
    if (agentManagerRef.current) {
      agentManagerRef.current.disconnect();
      agentManagerRef.current = null;
    }
    setIsConnected(false);
    setIsConfigured(false);
    setMessages([]);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl border border-purple-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">צ'אט חי עם דמות AI</h2>
                  <p className="text-purple-100 text-sm">הווידג'ט ייטען בעוד רגע...</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content - Widget will appear here */}
            <div className="p-4 bg-black min-h-[500px] flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Video className="w-16 h-16 mx-auto mb-4 opacity-50 animate-pulse" />
                <p>טוען ווידג'ט צ'אט...</p>
                <p className="text-xs mt-2">הווידג'ט של D-ID יופיע כאן</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}