import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Clock, X, Flame, ChevronRight } from "lucide-react";

const episodes = [
  { id: 1, title: "1897 - הרצל מייסד את ההסתדרות הציונית", duration: "51:12", thumbnail: "https://www.kan.org.il/media/cubbv0mu/amud_1.jpeg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-1/" },
  { id: 2, title: "הערבים מתעוררים - 1918-1920", duration: "49:43", thumbnail: "https://www.kan.org.il/media/0mnjajyc/amud_2.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-2/" },
  { id: 3, title: "עם ישראל אייכה? - שנות ה-20", duration: "", thumbnail: "https://www.kan.org.il/media/5ncp2lry/amud_3.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-3/" },
  { id: 4, title: "העמק הוא חלום - שנות ה-20", duration: "50:35", thumbnail: "https://www.kan.org.il/media/g1zjd4y1/amud_4.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-4/" },
  { id: 5, title: "המקום השקט ביותר במזרח התיכון - 1924", duration: "49:06", thumbnail: "https://www.kan.org.il/media/5eidmwh5/amud_5.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-5/" },
  { id: 6, title: "פרשת הדרכים - 1929-1933", duration: "49:07", thumbnail: "https://www.kan.org.il/media/hl1nvuw5/amud_6.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-6/" },
  { id: 7, title: "חשרת הסופה - 1933-1935", duration: "44:04", thumbnail: "https://www.kan.org.il/media/rwaoqatm/amud_7.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-7/" },
  { id: 8, title: "מאורעות ומרד - 1936", duration: "45:56", thumbnail: "https://www.kan.org.il/media/d0cdqadr/amud_8.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-8/" },
  { id: 9, title: "מי מפחד ממדינה יהודית - 1937-1938", duration: "52:03", thumbnail: "https://www.kan.org.il/media/bw2dwytx/amud_9.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-9/" },
  { id: 10, title: "מלכודת - 1938-1939", duration: "45:16", thumbnail: "https://www.kan.org.il/media/xvih2hnh/amud_10.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-10/" },
  { id: 11, title: "חיילים ללא דגל - 1939-1941", duration: "53:12", thumbnail: "https://www.kan.org.il/media/2mxf3ypq/amud_11.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-11/" },
  { id: 12, title: "הפתרון הסופי - 1941-1942", duration: "60:09", thumbnail: "https://www.kan.org.il/media/enznlyws/amud_12.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-12/" },
  { id: 13, title: "שואה וגבורה - 1942-1943", duration: "57:26", thumbnail: "https://www.kan.org.il/media/gpsb5xlt/ep-13.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-13/" },
  { id: 14, title: "בעל הברית הנשכח - 1943-1945", duration: "50:07", thumbnail: "https://www.kan.org.il/media/ejnj20vq/ep-14.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-14/" },
  { id: 15, title: "המאה אלף - 1945-1946", duration: "51:59", thumbnail: "https://www.kan.org.il/media/prrnn4nn/ep-15.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-15/" },
  { id: 16, title: "המאבק - 1946-1947", duration: "57:56", thumbnail: "https://www.kan.org.il/media/xmtjk525/ep-16.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-16/" },
  { id: 17, title: "משפט האומות - 1947", duration: "55:25", thumbnail: "https://www.kan.org.il/media/4f4lcj2k/ep-17.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-17/" },
  { id: 18, title: "מגש הכסף - 1947-1948", duration: "50:11", thumbnail: "https://www.kan.org.il/media/tj1dcwtm/ep-18.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-18/" },
  { id: 19, title: "הקמת מדינה יהודית", duration: "53:57", thumbnail: "https://www.kan.org.il/media/f5lhsnd2/ep-19.jpg", url: "https://www.kan.org.il/content/archive1/vod/p-671195/s1/fire-pillar-19/" },
];

export default function KanArchiveContainer() {
  const [selectedEpisode, setSelectedEpisode] = useState(null);

  return (
    <section className="px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <Flame className="w-8 h-8 text-[#E31E24]" />
            <h2 className="text-4xl font-bold text-white">עמוד האש</h2>
          </div>
          <p className="text-gray-400 text-lg">
            סדרה תיעודית על ציוני הדרך החשובים ביותר של עם היהודי והקמת המדינה | כאן
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-[#E31E24]/20 text-[#E31E24] rounded-full text-sm font-bold border border-[#E31E24]/30">
              ארכיון
            </span>
            <span className="px-3 py-1 bg-[#E31E24]/20 text-[#E31E24] rounded-full text-sm font-bold border border-[#E31E24]/30">
              היסטוריה
            </span>
            <span className="px-3 py-1 bg-[#E31E24]/20 text-[#E31E24] rounded-full text-sm font-bold border border-[#E31E24]/30">
              תעודה
            </span>
          </div>
        </motion.div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {episodes.map((episode, idx) => (
            <motion.div
              key={episode.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedEpisode(episode)}
              className="group cursor-pointer bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80 backdrop-blur-sm rounded-xl overflow-hidden border-2 border-[#E31E24]/40 hover:border-[#E31E24]/80 transition-all"
              style={{
                boxShadow: '0 0 20px rgba(227, 30, 36, 0.3), inset 0 0 20px rgba(227, 30, 36, 0.1)'
              }}
            >
              {/* Thumbnail */}
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={episode.thumbnail}
                  alt={episode.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-16 h-16 rounded-full bg-[#E31E24] flex items-center justify-center">
                    <Play className="w-8 h-8 text-white mr-1" fill="white" />
                  </div>
                </div>

                {/* Episode Number */}
                <div className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded-lg text-sm font-bold">
                  פרק {episode.id}
                </div>

                {/* Duration */}
                {episode.duration && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {episode.duration}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm line-clamp-2 group-hover:text-[#E31E24] transition-colors leading-relaxed">
                  {episode.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Watch More Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <a
            href="https://www.kan.org.il/content/archive1/vod/p-671195/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white rounded-full font-bold hover:scale-105 transition-transform"
          >
            צפה בכל הסדרה באתר כאן
            <ChevronRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>

      {/* Episode Modal */}
      <AnimatePresence>
        {selectedEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedEpisode(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative bg-black rounded-2xl overflow-hidden max-w-5xl w-full border-2 border-[#E31E24]/40"
              style={{
                boxShadow: '0 0 60px rgba(227, 30, 36, 0.5)'
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedEpisode(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 backdrop-blur-sm text-white p-2 rounded-full hover:bg-[#E31E24] transition-all border-2 border-[#E31E24]/40"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Episode Info */}
              <div className="p-6 bg-gradient-to-br from-black/80 via-[#E31E24]/20 to-black/80">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-[#E31E24] text-white rounded-lg text-sm font-bold">
                    פרק {selectedEpisode.id}
                  </span>
                  {selectedEpisode.duration && (
                    <span className="flex items-center gap-1 text-gray-400 text-sm">
                      <Clock className="w-4 h-4" />
                      {selectedEpisode.duration}
                    </span>
                  )}
                </div>
                <h2 className="text-white text-2xl font-bold mb-4">{selectedEpisode.title}</h2>

                <a
                  href={selectedEpisode.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#E31E24] to-[#B91C1C] text-white rounded-full font-bold hover:scale-105 transition-transform"
                >
                  <Play className="w-5 h-5" fill="white" />
                  צפה בפרק באתר כאן
                </a>
              </div>

              {/* Thumbnail */}
              <div className="relative aspect-video">
                <img
                  src={selectedEpisode.thumbnail}
                  alt={selectedEpisode.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}