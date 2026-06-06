import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, Eye, EyeOff } from "lucide-react";
import { createPageUrl } from "@/utils";

const ADMIN_PASSWORD = "2486";

export default function AdminPasswordModal({ isOpen, onClose }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setPassword("");
      setError("");
      onClose();
      window.open(createPageUrl("AdminPanel") + "?tab=content", "_blank");
    } else {
      setError("סיסמא שגויה");
      setPassword("");
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-gray-900 border border-orange-500/30 rounded-2xl p-6 w-full max-w-sm shadow-2xl shadow-orange-500/20"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <button onClick={handleClose} className="absolute top-3 left-3 p-1.5 rounded-full bg-white/10 text-white">
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center mb-6">
              <div className="w-14 h-14 rounded-full bg-orange-600/20 border-2 border-orange-500 flex items-center justify-center mb-3">
                <Lock className="w-7 h-7 text-orange-400" />
              </div>
              <h2 className="text-white font-bold text-lg">ניהול תוכן</h2>
              <p className="text-gray-400 text-sm mt-1">הזן סיסמת מנהל להמשך</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="סיסמא"
                  className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 text-center text-xl tracking-widest"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
              >
                כניסה לניהול
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}