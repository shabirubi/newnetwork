import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Loader2, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ReporterImageUpload() {
  const [uploadingId, setUploadingId] = useState(null);
  const [error, setError] = useState(null);
  const queryClient = useQueryClient();

  const { data: reporters = [], isLoading } = useQuery({
    queryKey: ["reporters"],
    queryFn: () => base44.entities.Reporter.list(),
    initialData: [],
  });

  const updateReporterImage = useMutation({
    mutationFn: async ({ reporterId, imageUrl }) => {
      return base44.entities.Reporter.update(reporterId, { image: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reporters"] });
      setUploadingId(null);
    },
  });

  const handleImageUpload = async (e, reporterId) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(reporterId);
    setError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await updateReporterImage.mutateAsync({
        reporterId,
        imageUrl: file_url,
      });
    } catch (err) {
      setError(`שגיאה בהעלאת התמונה: ${err.message}`);
      setUploadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">
          ניהול תמונות כתבים
        </h1>
        <p className="text-gray-400 text-center mb-12">
          העלה תמונות עדכניות של כל כתב וכתבת
        </p>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reporters.map((reporter, idx) => (
              <motion.div
                key={reporter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl overflow-hidden border border-gray-700 hover:border-red-600 transition-all"
              >
                {/* Image Preview */}
                <div className="relative aspect-square bg-gray-700 overflow-hidden">
                  {reporter.image ? (
                    <img
                      src={reporter.image}
                      alt={reporter.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                        <p className="text-gray-400 text-sm">אין תמונה עדיין</p>
                      </div>
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <div className="text-center">
                      {uploadingId === reporter.id ? (
                        <>
                          <Loader2 className="w-8 h-8 text-white mx-auto mb-2 animate-spin" />
                          <p className="text-white text-sm font-bold">מעלה...</p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-white mx-auto mb-2" />
                          <p className="text-white text-sm font-bold">בחר תמונה</p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, reporter.id)}
                      disabled={uploadingId !== null}
                      className="hidden"
                    />
                  </label>

                  {/* Success Badge */}
                  {reporter.image && uploadingId !== reporter.id && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-2">
                      <Check size={16} />
                    </div>
                  )}
                </div>

                {/* Reporter Info */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-lg">{reporter.name}</h3>
                  <p className="text-gray-400 text-sm mb-2">{reporter.role}</p>
                  {reporter.specialty && (
                    <p className="text-gray-500 text-xs">{reporter.specialty}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}