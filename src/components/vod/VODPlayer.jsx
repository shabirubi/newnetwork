import React from "react";
import { motion } from "framer-motion";
import { X, Share2, Bookmark, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VODPlayer({ content, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-gray-900 rounded-xl overflow-hidden border border-red-900/50 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-black to-red-950/30 border-b border-red-900/30">
          <div>
            <h2 className="text-xl font-bold text-white">{content.title}</h2>
            <p className="text-sm text-gray-400">{content.description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-red-600/20 hover:bg-red-600 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video bg-black">
          {content.stream_url?.includes('youtube.com') || content.stream_url?.includes('youtu.be') ? (
            <iframe
              src={content.stream_url.replace('watch?v=', 'embed/')}
              className="w-full h-full"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : content.stream_url?.includes('ok.ru') ? (
            <iframe
              src={`https://ok.ru/videoembed/${content.stream_url.split('/video/')[1]}`}
              className="w-full h-full"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : content.stream_url?.includes('mako.co.il') ? (
            <iframe
              src={content.stream_url}
              className="w-full h-full"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          ) : (
            <iframe
              src={content.stream_url}
              className="w-full h-full"
              allow="autoplay; fullscreen; encrypted-media"
              allowFullScreen
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 p-4 bg-black/50 border-t border-red-900/30">
          <Button variant="outline" className="flex items-center gap-2 border-red-900/50 text-white hover:bg-red-900/30">
            <Heart className="w-4 h-4" />
            אהבתי
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-red-900/50 text-white hover:bg-red-900/30">
            <Bookmark className="w-4 h-4" />
            שמור
          </Button>
          <Button variant="outline" className="flex items-center gap-2 border-red-900/50 text-white hover:bg-red-900/30">
            <Share2 className="w-4 h-4" />
            שתף
          </Button>
          <div className="flex-1" />
          <div className="text-sm text-gray-400">
            {content.genre} • {content.duration}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}