import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function RightSidebarUpdates() {
  const { data: updates = [] } = useQuery({
    queryKey: ['sidebar-updates'],
    queryFn: () => base44.entities.NewsArticle.filter(
      { is_breaking: true },
      '-created_date',
      12
    ),
    initialData: [],
    refetchInterval: 60000
  });

  if (updates.length === 0) return null;

  const displayUpdates = Array.from({ length: 3 }, () => updates).flat();

  return (
    <div className="hidden xl:flex w-24 bg-black/60 backdrop-blur-xl border-r border-[#E31E24]/30 overflow-hidden sticky top-0 h-screen">
      <div className="flex items-center justify-center w-full relative">
        <div className="flex flex-col gap-6 absolute">
          <motion.div
            animate={{ y: `-${(updates.length * 120)}px` }}
            transition={{ duration: updates.length * 4, repeat: Infinity, ease: "linear" }}
            className="flex flex-col gap-6"
          >
            {displayUpdates.map((update, idx) => (
              <Link
                key={`${update.id}-${idx}`}
                to={createPageUrl(`Article?id=${update.id}`)}
                className="flex flex-col items-center gap-2 px-2 py-3 group cursor-pointer"
                title={update.title}
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-black/40 border border-[#E31E24]/40 flex items-center justify-center group-hover:border-[#E31E24]/80 transition-all">
                  {update.image_url ? (
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Flame className="w-6 h-6 text-[#E31E24] animate-pulse" />
                  )}
                </div>
                <span className="text-[11px] text-[#E31E24] text-center line-clamp-2 leading-tight font-bold">
                  {update.title.substring(0, 30)}
                </span>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}