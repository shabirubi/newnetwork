import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createPageUrl } from "../../utils";

export default function AdminLoginModal({ isOpen, onClose }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password === '02486') {
      toast.success('כניסה מאושרת');
      window.location.href = createPageUrl('AdminPanel');
    } else {
      toast.error('סיסמה שגויה');
      setPassword('');
    }
    
    setLoading(false);
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
          className="bg-gradient-to-br from-gray-900 to-black rounded-2xl overflow-hidden w-full max-w-md shadow-2xl border border-[#E31E24]/50"
        >
          <div className="bg-gradient-to-r from-[#E31E24] to-[#B91C1C] p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-2xl font-bold text-white">כניסה לאדמין</h2>
                <p className="text-white/70 text-sm">נדרשת סיסמת מנהל</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="text-white text-sm mb-2 block">סיסמה</label>
              <Input
                type="password"
                placeholder="הזן סיסמת אדמין"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-800 border-gray-700 text-white text-lg text-center tracking-widest"
                autoFocus
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#E31E24] hover:bg-[#B91C1C] text-white font-bold py-3"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'כניסה'
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}