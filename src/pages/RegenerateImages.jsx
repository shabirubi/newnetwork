import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, CheckCircle, AlertCircle, Image } from "lucide-react";
import { motion } from "framer-motion";

export default function RegenerateImages() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleRegenerate = async () => {
    if (!confirm('זה יחליף את כל התמונות הקיימות. להמשיך?')) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await base44.functions.invoke('regenerateAllImages');
      setResult(response.data);
    } catch (error) {
      setResult({ 
        success: false, 
        error: error.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-[#E31E24] flex items-center justify-center">
              <Image className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold dark:text-white">עדכון תמונות</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            החלף את כל התמונות הקיימות בתמונות חדשות עם כיתובים באנגלית
          </p>
        </motion.div>

        <Card className="shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span>עדכון המוני של תמונות</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg ${
                  result.success 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400'
                }`}
              >
                {result.success ? (
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-bold mb-2">העדכון הושלם בהצלחה!</p>
                      <div className="text-sm space-y-1">
                        <p>סך הכל מאמרים: {result.total}</p>
                        <p>עודכנו בהצלחה: {result.updated}</p>
                        <p>נכשלו: {result.failed}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5" />
                    <span>שגיאה: {result.error}</span>
                  </div>
                )}
              </motion.div>
            )}

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 dark:text-blue-400 mb-2">מה יקרה?</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• המערכת תעבור על כל המאמרים</li>
                <li>• תייצר תמונה חדשה לכל מאמר עם פרומפט באנגלית</li>
                <li>• הכיתובים בתמונות יהיו באנגלית</li>
                <li>• התהליך עשוי לקחת מספר דקות</li>
              </ul>
            </div>

            <Button
              onClick={handleRegenerate}
              disabled={loading}
              className="w-full bg-[#E31E24] hover:bg-[#B91C1C] text-white py-6 text-lg font-bold"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 ml-2 animate-spin" />
                  מעדכן תמונות... אנא המתן
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 ml-2" />
                  החלף את כל התמונות
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {result?.results && (
          <Card>
            <CardHeader>
              <CardTitle>תוצאות מפורטות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {result.results.slice(0, 50).map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm flex items-center justify-between ${
                      item.status === 'success'
                        ? 'bg-green-50 dark:bg-green-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}
                  >
                    <span className="truncate flex-1 dark:text-white">{item.title}</span>
                    {item.status === 'success' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}