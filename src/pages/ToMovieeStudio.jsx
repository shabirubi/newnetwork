import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Wand2, Image as ImageIcon, Music, Sparkles, 
  Video, Film, Zap, Settings, HelpCircle, User,
  ChevronDown, Play, Download, Loader2, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('אנא הזן תיאור לסרטון');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke('generateToMovieeVideo', {
        prompt: prompt.trim(),
        movement: selectedMovement,
        mode: activeTab
      });

      if (response.data.video_url) {
        setGeneratedVideo(response.data);
        toast.success('הסרטון נוצר בהצלחה! 🎬');
      } else {
        toast.error('שגיאה ביצירת הסרטון');
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error.response?.data?.error || 'שגיאה ביצירת הסרטון');
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

          {/* Prompt Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium">Prompt</label>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">
                  <Sparkles className="w-3 h-3" />
                  Creative Assistant
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs">
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
    </div>
  );
}