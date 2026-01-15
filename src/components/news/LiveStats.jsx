import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Users, Eye, Radio, Zap } from "lucide-react";

export default function LiveStats() {
  const [viewers, setViewers] = useState(3456);
  const [articles, setArticles] = useState(247);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(prev => prev + Math.floor(Math.random() * 20) - 5);
      setArticles(prev => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    {
      icon: Radio,
      label: "בשידור חי",
      value: "24/7",
      color: "from-red-500 to-red-600",
      pulse: true
    },
    {
      icon: Users,
      label: "צופים כעת",
      value: viewers.toLocaleString(),
      color: "from-blue-500 to-blue-600",
      animate: true
    },
    {
      icon: Eye,
      label: "כתבות היום",
      value: articles.toLocaleString(),
      color: "from-green-500 to-green-600",
      animate: true
    },
    {
      icon: Zap,
      label: "עדכונים",
      value: "בזמן אמת",
      color: "from-yellow-500 to-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-black p-4 shadow-2xl border border-gray-800 hover:border-gray-700 hover:scale-105 transition-all"
        >
          {/* Background Gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                {stat.pulse && (
                  <motion.div
                    className="absolute w-10 h-10 rounded-full bg-red-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <stat.icon className="w-5 h-5 text-white relative z-10" />
              </div>
              <div className="text-xs text-gray-400 font-medium">
                {stat.label}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={stat.value}
                initial={stat.animate ? { opacity: 0, y: -10 } : {}}
                animate={{ opacity: 1, y: 0 }}
                exit={stat.animate ? { opacity: 0, y: 10 } : {}}
                className="text-2xl font-bold text-white"
              >
                {stat.value}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}