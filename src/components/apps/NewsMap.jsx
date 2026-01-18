import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X, Navigation } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import moment from "moment";

const israelCities = [
  { name: "תל אביב", keywords: ["תל אביב", "גוש דן"] },
  { name: "ירושלים", keywords: ["ירושלים", "בירה"] },
  { name: "חיפה", keywords: ["חיפה", "צפון"] },
  { name: "באר שבע", keywords: ["באר שבע", "נגב", "דרום"] },
  { name: "עוטף עזה", keywords: ["עזה", "עוטף עזה", "דרום"] },
  { name: "גבול לבנון", keywords: ["לבנון", "גבול צפון", "גליל"] }
];

export default function NewsMap() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);

  const { data: articles = [] } = useQuery({
    queryKey: ['map-articles'],
    queryFn: () => base44.entities.NewsArticle.list('-created_date', 100),
    initialData: []
  });

  const getCityNews = (city) => {
    return articles.filter(article => 
      city.keywords.some(keyword => 
        article.title?.toLowerCase().includes(keyword.toLowerCase()) ||
        article.content?.toLowerCase().includes(keyword.toLowerCase())
      )
    ).slice(0, 5);
  };

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl p-8 cursor-pointer shadow-2xl"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">מפת חדשות</h3>
            <p className="text-teal-100">חדשות לפי אזורים בארץ</p>
          </div>
        </div>
        <p className="text-white/90 text-sm">
          מציג חדשות מכל רחבי הארץ במפה אינטראקטיבית
        </p>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="w-8 h-8 text-teal-600" />
                  <h2 className="text-3xl font-bold dark:text-white">מפת חדשות ישראל</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 dark:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Map Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold dark:text-white">בחר אזור</h3>
                  <div className="space-y-2">
                    {israelCities.map(city => {
                      const newsCount = getCityNews(city).length;
                      return (
                        <button
                          key={city.name}
                          onClick={() => setSelectedCity(city)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl transition-all ${
                            selectedCity?.name === city.name
                              ? 'bg-teal-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Navigation className="w-5 h-5" />
                            <span className="font-medium">{city.name}</span>
                          </div>
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            selectedCity?.name === city.name
                              ? 'bg-white/20'
                              : 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200'
                          }`}>
                            {newsCount} חדשות
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* News List Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold dark:text-white">
                    {selectedCity ? `חדשות ${selectedCity.name}` : 'בחר אזור כדי לראות חדשות'}
                  </h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {selectedCity ? (
                      getCityNews(selectedCity).length > 0 ? (
                        getCityNews(selectedCity).map(article => (
                          <Link
                            key={article.id}
                            to={createPageUrl(`Article?id=${article.id}`)}
                            className="block bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <h4 className="font-bold dark:text-white mb-2 line-clamp-2">{article.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {moment(article.created_date).fromNow()}
                            </p>
                          </Link>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                          אין חדשות מאזור זה כרגע
                        </p>
                      )
                    ) : (
                      <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                        👈 בחר אזור במפה
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}