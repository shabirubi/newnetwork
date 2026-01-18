import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function ReporterImagesLibrary() {
  const [copiedId, setCopiedId] = useState(null);

  const reporters = [
    {
      id: 10,
      name: "אורי כהן",
      role: "כתב פיננסים",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
    },
    {
      id: 11,
      name: "רינה לוי",
      role: "כתבת מזלות ואסטרולוגיה",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"
    },
    {
      id: 12,
      name: "גל שטרן",
      role: "כתב מוזיקה",
      image: "https://images.unsplash.com/photo-1517849845537-1d51a20414de?w=400"
    },
    {
      id: 13,
      name: "מאיה דוד",
      role: "כתבת אופנה וסגנון",
      image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400"
    },
  ];

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">ספריית תמונות כתבים</h1>
        <p className="text-gray-400 text-center mb-12">העתק את כתובת התמונה בקליק אחד</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reporters.map((reporter, idx) => (
            <motion.div
              key={reporter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-600 transition-all"
            >
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={reporter.image}
                  alt={reporter.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="absolute inset-0 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg mb-1">{reporter.name}</h3>
                <p className="text-gray-300 text-sm mb-4">{reporter.role}</p>

                {/* Copy Button */}
                <button
                  onClick={() => copyToClipboard(reporter.image, reporter.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  {copiedId === reporter.id ? (
                    <>
                      <Check size={18} />
                      הועתק!
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      העתק URL
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Preview Section */}
        <div className="mt-16 bg-gray-800/50 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">איך להשתמש:</h2>
          <ol className="text-gray-300 space-y-3">
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">1.</span>
              <span>לחץ על "העתק URL" על כרטיס כלשהו</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">2.</span>
              <span>הכתובת תועתק אוטומטית</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-600 font-bold">3.</span>
              <span>הדבק אותה בכל מקום שתרצה (תמונה, iframe, וכו')</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}