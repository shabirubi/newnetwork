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
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [connectionState, setConnectionState] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const videoRef = useRef(null);
  const agentManagerRef = useRef(null);
  const srcObjectRef = useRef(null);

  useEffect(() => {
    return () => {
      if (agentManagerRef.current) {
        agentManagerRef.current.disconnect();
      }
    };
  }, []);

  const handleConnect = async () => {
    if (!agentId || !clientKey) {
      toast.error('נא להזין Agent ID ו-Client Key');
      return;
    }

    try {
      setIsConnecting(true);

      const auth = { 
        type: 'key', 
        clientKey: clientKey 
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

      const agentManager = await sdk.createAgentManager(agentId, { 
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
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-5xl shadow-2xl border border-purple-500/30"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">D-ID Live Chat</h2>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                    <p className="text-purple-100 text-sm">
                      {connectionState || 'לא מחובר'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isConfigured && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:bg-white/20"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                )}
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-black">
              {/* Video Section */}
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                {isSpeaking && (
                  <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-white" />
                    מדבר
                  </div>
                )}
                {!isConfigured && (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center p-8">
                      <Video className="w-16 h-16 text-white/60 mx-auto mb-4" />
                      <p className="text-white/80 text-lg">התחבר כדי להתחיל</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Section */}
              <div className="flex flex-col h-[500px]">
                {/* Settings Panel */}
                {(!isConfigured || showSettings) && (
                  <div className="bg-gray-900 rounded-xl p-4 mb-4 border border-purple-500/30">
                    <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      הגדרות חיבור
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Agent ID</label>
                        <Input
                          value={agentId}
                          onChange={(e) => setAgentId(e.target.value)}
                          placeholder="agt_xxxxx"
                          className="bg-black/50 border-purple-500/30 text-white"
                          disabled={isConnected}
                        />
                      </div>
                      <div>
                        <label className="text-gray-400 text-sm mb-1 block">Client Key</label>
                        <Input
                          value={clientKey}
                          onChange={(e) => setClientKey(e.target.value)}
                          placeholder="Your client key"
                          type="password"
                          className="bg-black/50 border-purple-500/30 text-white"
                          disabled={isConnected}
                        />
                      </div>
                      <div className="flex gap-2">
                        {!isConnected ? (
                          <Button
                            onClick={handleConnect}
                            disabled={isConnecting || !agentId || !clientKey}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            {isConnecting ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                מתחבר...
                              </>
                            ) : (
                              'התחבר'
                            )}
                          </Button>
                        ) : (
                          <Button
                            onClick={handleDisconnect}
                            variant="destructive"
                            className="flex-1"
                          >
                            התנתק
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 bg-gray-900 rounded-xl p-4 overflow-y-auto space-y-3 mb-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <div className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>התחל שיחה עם האוואטר</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                              : 'bg-gray-800 text-white border border-purple-500/30'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={isConnected ? 'הקלד הודעה...' : 'התחבר כדי לשלוח הודעות'}
                    disabled={!isConnected}
                    className="flex-1 bg-gray-900 border-purple-500/30 text-white"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!isConnected || !message.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="bg-gradient-to-r from-gray-900 to-black p-4 border-t border-purple-500/20">
              <p className="text-gray-400 text-sm text-center">
                צור Agent ב-<a href="https://studio.d-id.com/agents" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">D-ID Studio</a> וקבל Agent ID + Client Key
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}