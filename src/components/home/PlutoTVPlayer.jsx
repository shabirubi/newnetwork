import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function PlutoTVPlayer({ streamUrl }) {
  // Pluto TV requires special handling with Shaka Player for DRM protection
  // The best way is to use a proxy service or direct embed
  
  return (
    <div className="w-full h-full bg-black flex flex-col items-center justify-center text-white p-6">
      <AlertCircle className="w-12 h-12 mb-4 text-yellow-500" />
      <p className="text-center mb-4">
        הערוץ זמין ב-Pluto TV ישירות
      </p>
      <a
        href={`https://www.pluto.tv/`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-bold transition-colors"
      >
        פתח ב-Pluto TV
      </a>
      <p className="text-gray-400 text-sm mt-4 max-w-md text-center">
        Pluto TV שומר על זכויות הטלוויזיה שלו ודורש נגן מיוחד. בקרו ישירות ב-Pluto TV כדי לצפות בערוצים.
      </p>
    </div>
  );
}