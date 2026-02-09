import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Wand2, Image as ImageIcon, Music, Sparkles, 
  Video, Film, Zap, Settings, HelpCircle, User,
  ChevronDown, Play, Download, Loader2, Check, Upload, X, Send, Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function ToMovieeStudio() {
  const [activeTab, setActiveTab] = useState('text-to-video');
  const [prompt, setPrompt] = useState('');
  const [selectedMovement, setSelectedMovement] = useState('duck');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [uploadedImage, setUploadedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showCreativeAssistant, setShowCreativeAssistant] = useState(false);
  const [showMyPrompts, setShowMyPrompts] = useState(false);
  const [aiMessages, setAiMessages] = useState([]);
  const [aiInput, setAiInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [savedPrompts, setSavedPrompts] = useState([]);
  const fileInputRef = useRef(null);

  const sidebarIcons = [
    { icon: Home, label: 'Home' },
    { icon: Wand2, label: 'Create' },
    { icon: ImageIcon, label: 'Images' },
    { icon: Video, label: 'Videos' },
    { icon: Film, label: 'Projects' },
    { icon: Sparkles, label: 'Effects' },
    { icon: Music, label: 'Audio' },
    { icon: Settings, label: 'Settings' }
  ];

  const cameraMovements = [
    { id: 'duck', label: 'Duck', description: 'Camera ducks down' },
    { id: 'cyclist', label: 'Cyclist', description: 'Side tracking movement' },
    { id: 'sailing', label: 'Sailing', description: 'Smooth forward motion' },
    { id: 'zoom-in', label: 'Zoom In', description: 'Zoom into subject' },
    { id: 'zoom-out', label: 'Zoom Out', description: 'Zoom out from subject' },
    { id: 'pan-left', label: 'Pan Left', description: 'Pan camera left' }
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    try {
      toast.info('Uploading image...');
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setUploadedImage(file_url);
      setImagePreview(URL.createObjectURL(file));
      toast.success('Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    }
  };

  const handleAiChat = async () => {
    if (!aiInput.trim()) return;

    const userMessage = { role: 'user', content: aiInput };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setIsAiThinking(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a creative assistant for video generation. Help the user refine their video idea: "${aiInput}". Provide a detailed, cinematic prompt for AI video generation.`,
      });

      const aiMessage = { role: 'assistant', content: response };
      setAiMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      toast.error('Failed to get AI response');
    } finally {
      setIsAiThinking(false);
    }
  };

  const handleSavePrompt = () => {
    if (!prompt.trim()) return;
    const newPrompt = {
      id: Date.now(),
      text: prompt,
      movement: selectedMovement,
      timestamp: new Date().toISOString()
    };
    setSavedPrompts(prev => [newPrompt, ...prev]);
    toast.success('Prompt saved!');
  };

  const handleLoadPrompt = (savedPrompt) => {
    setPrompt(savedPrompt.text);
    setSelectedMovement(savedPrompt.movement);
    setShowMyPrompts(false);
    toast.success('Prompt loaded!');
  };

  const handleGenerate = async () => {
    if (!prompt.trim() && !uploadedImage) {
      toast.error('Please provide a prompt or upload an image');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateToMovieeVideo', {
        prompt: prompt.trim(),
        movement: selectedMovement,
        mode: activeTab,
        image_url: uploadedImage
      });

      if (response.data.video_url) {
        setGeneratedVideo(response.data);
        toast.success('Video generated successfully! 🎬');
      } else {
        toast.error('Failed to generate video');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.error || 'Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white flex" dir="ltr">
      {/* Sidebar */}
      <aside className="w-16 bg-[#13131A] border-r border-white/5 flex flex-col items-center py-6 gap-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
          <Film className="w-6 h-6 text-white" />
        </div>

        {sidebarIcons.map((item, idx) => (
          <button
            key={idx}
            className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors group relative"
            title={item.label}
          >
            <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </button>
        ))}

        <div className="mt-auto">
          <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors">
            <HelpCircle className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-10 h-10 rounded-xl hover:bg-white/5 flex items-center justify-center transition-colors mt-2">
            <User className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Generation Controls */}
        <div className="w-[420px] bg-[#13131A] border-r border-white/5 p-6 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={LOGO_URL} alt="Logo" className="h-8 w-auto" />
              <h1 className="text-xl font-bold">ToMoviee Studio</h1>
            </div>
          </div>

          {/* Video Generation Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Video Generation</h2>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm">
                <span>ToMoviee Video 2.0</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Generation Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab('image-to-video')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'image-to-video'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Image to Video
              </button>
              <button
                onClick={() => setActiveTab('text-to-video')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'text-to-video'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Text to Video
              </button>
              <button
                onClick={() => setActiveTab('reference-to-video')}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
                  activeTab === 'reference-to-video'
                    ? 'bg-white/10 text-white'
                    : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                Reference to Video
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-gradient-to-r from-purple-600 to-pink-600 text-[10px] rounded-full font-bold">
                  NEW
                </span>
              </button>
            </div>
          </div>

          {/* Image Upload for Image to Video */}
          {activeTab === 'image-to-video' && (
            <div className="mb-6">
              <label className="text-sm font-medium mb-3 block">Upload Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-white/10">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => {
                      setUploadedImage(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black/80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-48 border-2 border-dashed border-white/20 rounded-lg hover:border-purple-500/50 transition-colors flex flex-col items-center justify-center gap-2 group"
                >
                  <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                  <span className="text-sm text-gray-400 group-hover:text-purple-400">Click to upload image</span>
                </button>
              )}
            </div>
          )}

          {/* Prompt Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Prompt</label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowCreativeAssistant(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                >
                  <Sparkles className="w-3 h-3" />
                  Creative Assistant
                </button>
                <button 
                  onClick={() => setShowMyPrompts(true)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                >
                  My Prompts
                </button>
              </div>
            </div>

            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the video you want to generate. Refine ideas with Creative Assistant"
              className="min-h-[120px] bg-black/40 border-white/10 text-white placeholder:text-gray-500 resize-none"
            />
            <button
              onClick={handleSavePrompt}
              className="mt-2 text-xs text-purple-400 hover:text-purple-300"
            >
              Save this prompt
            </button>
          </div>

          {/* Camera Movement */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-3 block">Camera Movement</label>
            <div className="grid grid-cols-3 gap-2">
              {cameraMovements.map((movement) => (
                <button
                  key={movement.id}
                  onClick={() => setSelectedMovement(movement.id)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    selectedMovement === movement.id
                      ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                      : 'bg-white/5 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  {movement.label}
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Details</label>
              <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">
                <span>20</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-sm">Off-peak Generation</span>
              </div>
              <button className="w-10 h-6 bg-purple-600 rounded-full relative">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Generate
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-3">
            Video is powered by AI with your own ToMoviee
          </p>
        </div>

        {/* Right Panel - Preview & Gallery */}
        <div className="flex-1 bg-[#0A0A0F] p-6 overflow-y-auto">
          {/* Filter Tabs */}
          <div className="flex items-center gap-4 mb-6">
            {['All', 'Video', 'Image', 'Audio', 'My Favorites', 'In progress'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Preview Area */}
          {generatedVideo ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#13131A] rounded-2xl overflow-hidden border border-white/10"
            >
              <video
                src={generatedVideo.video_url}
                controls
                autoPlay
                className="w-full aspect-video bg-black"
              />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{prompt.slice(0, 50)}...</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Generated successfully</span>
                  <span>•</span>
                  <span>Movement: {selectedMovement}</span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#13131A] rounded-2xl border border-white/10 p-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Video className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  Getting started: How to use ToMoviee Studio?
                </h3>
                <p className="text-gray-400 mb-6">
                  Generate videos easily in three steps!
                </p>
                <div className="space-y-4 text-right max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Write your prompt</h4>
                      <p className="text-sm text-gray-400">
                        Describe what you want to see in the video
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Choose camera movement</h4>
                      <p className="text-sm text-gray-400">
                        Select from 6 different camera movements
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Click Generate</h4>
                      <p className="text-sm text-gray-400">
                        Your video will be ready in minutes!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Creative Assistant Modal */}
      <AnimatePresence>
        {showCreativeAssistant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreativeAssistant(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131A] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">Creative Assistant</h2>
                    <p className="text-xs text-gray-400">Let AI help you craft the perfect prompt</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreativeAssistant(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {aiMessages.length === 0 ? (
                  <div className="text-center py-12">
                    <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Start a conversation</h3>
                    <p className="text-sm text-gray-400">
                      Tell me about your video idea and I'll help you refine it!
                    </p>
                  </div>
                ) : (
                  aiMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] p-4 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-white/5 text-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => {
                              setPrompt(msg.content);
                              setShowCreativeAssistant(false);
                              toast.success('Prompt applied!');
                            }}
                            className="mt-2 text-xs text-purple-400 hover:text-purple-300"
                          >
                            Use this prompt
                          </button>
                        )}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  ))
                )}
                {isAiThinking && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl">
                      <p className="text-sm text-gray-400">Thinking...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-white/10">
                <div className="flex gap-2">
                  <Input
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAiChat()}
                    placeholder="Describe your video idea..."
                    className="flex-1 bg-black/40 border-white/10"
                  />
                  <Button
                    onClick={handleAiChat}
                    disabled={!aiInput.trim() || isAiThinking}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* My Prompts Modal */}
      <AnimatePresence>
        {showMyPrompts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowMyPrompts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131A] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-lg font-bold">My Saved Prompts</h2>
                <button
                  onClick={() => setShowMyPrompts(false)}
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {savedPrompts.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No saved prompts yet</h3>
                    <p className="text-sm text-gray-400">
                      Save your prompts to quickly reuse them later
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {savedPrompts.map((savedPrompt) => (
                      <div
                        key={savedPrompt.id}
                        className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-colors group"
                        onClick={() => handleLoadPrompt(savedPrompt)}
                      >
                        <p className="text-sm text-gray-200 mb-2 line-clamp-2">{savedPrompt.text}</p>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Movement: {savedPrompt.movement}</span>
                          <span>{new Date(savedPrompt.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}