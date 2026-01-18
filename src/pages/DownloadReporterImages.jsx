import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DownloadReporterImages() {
  const [downloading, setDownloading] = useState(false);

  const { data: reporters = [], isLoading } = useQuery({
    queryKey: ["reporters"],
    queryFn: () => base44.entities.Reporter.list(),
    initialData: [],
  });

  const downloadImage = (imageUrl, reporterName) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${reporterName}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllAsZip = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const zip = new JSZip();
      const reportersWithImages = reporters.filter((r) => r.image);

      for (const reporter of reportersWithImages) {
        const response = await fetch(reporter.image);
        const blob = await response.blob();
        zip.file(`${reporter.name}.jpg`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "תמונות_כתבים.zip");
    } catch (error) {
      console.error("שגיאה בהורדת הקובץ:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          הורדת תמונות כתבים
        </h1>
        <p className="text-gray-400 text-center mb-12">
          הורד את תמונות הכתבים בקלות
        </p>

        {!isLoading && reporters.filter((r) => r.image).length > 0 && (
          <div className="mb-6 flex gap-4 justify-center">
            <button
              onClick={downloadAllAsZip}
              disabled={downloading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-all"
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  מעדכן...
                </>
              ) : (
                <>
                  <Package className="w-5 h-5" />
                  הורד הכל ב-ZIP
                </>
              )}
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reporters.map((reporter, idx) => (
              <motion.div
                key={reporter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-600 transition-all"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-700 overflow-hidden">
                  {reporter.image ? (
                    <>
                      <img
                        src={reporter.image}
                        alt={reporter.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      />
                      <button
                        onClick={() =>
                          downloadImage(reporter.image, reporter.name)
                        }
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="הורד תמונה"
                      >
                        <Download className="w-8 h-8 text-white" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-gray-400 text-sm">אין תמונה</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">{reporter.name}</h3>
                  <p className="text-gray-400 text-sm">{reporter.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}