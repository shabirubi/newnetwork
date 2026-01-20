import React from "react";
import { motion } from "framer-motion";
import { Upload, Video, Radio, Film, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const features = [
  {
    id: 1,
    icon: Upload,
    title: "העלה כתבות בעצמך",
    description: "שתף סיפורים וכתבות שלך ישירות לרשת החדשה",
    color: "from-blue-500 to-cyan-500",
    action: "העלה כתבה"
  },
  {
    id: 2,
    icon: Video,
    title: "העלה את עצמך בוידאו",
    description: "צא לאתר וסרוק בוידאו מהשדה בזמן אמת",
    color: "from-purple-500 to-pink-500",
    action: "שדור וידאו"
  },
  {
    id: 3,
    icon: Radio,
    title: "שדר שידורים מהשטח",
    description: "הפוך לכתב שדה וחזר עדכונים חיים מהשטח",
    color: "from-red-500 to-orange-500",
    action: "התחל שידור"
  },
  {
    id: 4,
    icon: Film,
    title: "העלה סרטונים בעצמך",
    description: "יצור תוכן וידאו מקצועי בעזרת כלים בינתיים",
    color: "from-green-500 to-emerald-500",
    action: "ערוך סרטון"
  },
  {
    id: 5,
    icon: Zap,
    title: "ידיעות חיות",
    description: "קבל עדכונים מהחדשות שקורות עכשיו בזמן אמת",
    color: "from-yellow-500 to-amber-500",
    action: "עקוב עכשיו"
  }
];

export default function UserExperienceFeatures() {
  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center dark:text-white mb-4">
          הפוך חלק מהרשת
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
          אתה לא רק צופה - אתה יוצר. שתף תוכן, צא לשטח, וברוק חדשות במישיריות
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all duration-300"
                style={{
                  boxShadow: '0 0 15px rgba(227, 30, 36, 0.3), inset 0 0 15px rgba(227, 30, 36, 0.1)'
                }}
              >
                {/* Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#E31E24]/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                {/* Content */}
                <div className="relative p-6 flex flex-col h-full">
                  {/* Icon */}
                  <motion.div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:translate-x-1 transition-transform duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-400 mb-6 flex-grow">
                    {feature.description}
                  </p>

                  {/* Action Button */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-2 px-4 rounded-lg bg-gradient-to-r ${feature.color} text-white text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                  >
                    {feature.action}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}