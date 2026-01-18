import React from "react";
import { Users } from "lucide-react";

export default function CurrencyStrip({ activeLive }) {
  return (
    <div className="flex items-center gap-2 text-white/80 text-sm">
      <Users size={16} />
      <span className="font-bold text-white">{activeLive?.viewer_count || 3456}</span>
    </div>
  );
}