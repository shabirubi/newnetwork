import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Crown, Check, Loader2, Star, Play, Tv } from "lucide-react";
import { base44 } from "@/api/base44Client";

const FEATURES = [
    "צפייה בכל הסרטונים ללא הגבלה",
    "תוכן VOD בלעדי ואיכותי",
    "ללא פרסומות",
    "גישה לארכיון מלא",
    "שידורים חיים בלעדיים",
    "עדיפות בגישה לתוכן חדש",
];

export default function VODSubscriptionModal({ isOpen, onClose, onSubscribed }) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState("info"); // "info" | "loading"

    const handleSubscribe = async () => {
        // Check if running in iframe
        if (window.self !== window.top) {
            alert("התשלום זמין רק מהאפליקציה המפורסמת, לא מתוך iframe.");
            return;
        }

        setLoading(true);
        setStep("loading");
        try {
            const res = await base44.functions.invoke("createVODCheckoutSession", {});
            if (res?.data?.url) {
                window.location.href = res.data.url;
            } else {
                throw new Error("No checkout URL");
            }
        } catch (err) {
            console.error("Checkout error:", err);
            alert("שגיאה ביצירת תהליך התשלום. נסה שוב.");
            setStep("info");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setStep("info");
            setLoading(false);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />

                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ type: "spring", damping: 22, stiffness: 250 }}
                        className="relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                        onClick={e => e.stopPropagation()}
                        style={{ background: "linear-gradient(160deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a0a 100%)" }}
                        dir="rtl"
                    >
                        {/* Header glow */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500" />

                        {/* Close */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 left-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Crown Icon */}
                        <div className="pt-8 pb-4 px-6 text-center">
                            <motion.div
                                animate={{ rotate: [-5, 5, -5] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-3"
                                style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24, #f59e0b)" }}
                            >
                                <Crown className="w-8 h-8 text-white" />
                            </motion.div>
                            <h2 className="text-2xl font-black text-white mb-1">מנוי פרמיום VOD</h2>
                            <p className="text-gray-400 text-sm">גישה בלתי מוגבלת לכל התוכן</p>
                        </div>

                        {/* Price */}
                        <div className="mx-6 mb-4 rounded-2xl p-4 text-center"
                            style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))", border: "1px solid rgba(245,158,11,0.4)" }}>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-4xl font-black text-yellow-400">29.90</span>
                                <span className="text-yellow-300 text-lg font-bold">₪</span>
                                <span className="text-gray-400 text-sm">/חודש</span>
                            </div>
                            <p className="text-yellow-300/70 text-xs mt-1">ניתן לביטול בכל עת</p>
                        </div>

                        {/* Features */}
                        <div className="px-6 mb-6 space-y-2">
                            {FEATURES.map((f, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.07 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-green-400" />
                                    </div>
                                    <span className="text-gray-200 text-sm">{f}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <div className="px-6 pb-8">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="w-full py-4 rounded-2xl font-black text-white text-lg flex items-center justify-center gap-2 transition-all"
                                style={{
                                    background: loading
                                        ? "rgba(245,158,11,0.4)"
                                        : "linear-gradient(135deg, #f59e0b, #d97706)",
                                    boxShadow: loading ? "none" : "0 0 30px rgba(245,158,11,0.5)"
                                }}
                            >
                                {loading ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> מעביר לתשלום...</>
                                ) : (
                                    <><Crown className="w-5 h-5" /> הירשם עכשיו</>
                                )}
                            </motion.button>
                            <p className="text-center text-gray-500 text-xs mt-3">תשלום מאובטח · SSL · 256-bit</p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}