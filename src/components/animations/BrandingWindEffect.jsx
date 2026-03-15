import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LOGO_URL = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/695b39080025f4d38a586978/c3131992b_image.png";

export default function BrandingWindEffect() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide after 4 seconds on first load
    const hideTimer = setTimeout(() => setIsVisible(false), 4000);

    // Show effect every 30 seconds after that
    const interval = setInterval(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 4000);
    }, 30000);

    return () => {
      clearTimeout(hideTimer);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <motion.div
        initial={{ x: "-100%", opacity: 0 }}
        animate={{ x: "120vw", opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 4,
          ease: "easeInOut",
          times: [0, 0.1, 0.9, 1]
        }}
        className="absolute top-1/3 flex items-center gap-8"
      >
        {/* Multiple logos with staggered movement */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -15, 0],
              rotateZ: [0, 15, 0],
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: 4,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
            className="flex-shrink-0"
          >
            <img
              src={LOGO_URL}
              alt="הרשת החדשה"
              className="w-24 h-24 opacity-70 drop-shadow-2xl"
            />
          </motion.div>
        ))}

        {/* Wind particles effect */}
        <motion.div
          animate={{
            opacity: [0, 0.5, 0],
            blur: [0, 10, 20]
          }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/30 to-transparent blur-3xl"
        />
      </motion.div>
    </div>
  );
}