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
    <div className="hidden lg:flex w-16 bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-red-900/20 overflow-hidden sticky top-0 h-screen">
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
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-red-500/20 border border-red-500/40 flex items-center justify-center group-hover:border-red-500/80 transition-all">
                  {update.image_url ? (
                    <img
                      src={update.image_url}
                      alt={update.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Flame className="w-5 h-5 text-red-400 animate-pulse" />
                  )}
                </div>
                <span className="text-[10px] text-red-400 text-center line-clamp-2 leading-tight">
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