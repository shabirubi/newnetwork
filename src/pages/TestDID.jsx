import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from "lucide-react";

export default function TestDID() {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDID = async () => {
    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setLogs([]);
    
    try {
      addLog('שולח בקשה ל-D-ID...');
      
      const response = await base44.functions.invoke('testDID');
      
      addLog('קיבלנו תגובה מהשרת');
      
      if (response.data.success) {
        addLog('הווידאו נוצר בהצלחה!');
        setVideoUrl(response.data.video_url);
      } else {
        addLog('שגיאה: ' + JSON.stringify(response.data));
        setError(JSON.stringify(response.data, null, 2));
      }
    } catch (err) {
      addLog('שגיאה: ' + err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          בדיקת D-ID
        </h1>

        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <Button
            onClick={testDID}
            disabled={loading}
            className="w-full bg-[#E31E24] hover:bg-[#B91C1C] py-6 text-xl font-bold"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                יוצר וידאו...
              </>
            ) : (
              <>
                <Play className="w-6 h-6 ml-2" />
                צור דמות מדברת
              </>
            )}
          </Button>
        </div>

        {logs.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">לוגים:</h2>
            <div className="space-y-2 font-mono text-sm">
              {logs.map((log, i) => (
                <div key={i} className="text-gray-300">{log}</div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">שגיאה:</h2>
            <pre className="text-sm whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {videoUrl && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-bold mb-4 text-center">הווידאו מוכן!</h2>
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full rounded-lg"
            />
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-center text-[#E31E24] hover:underline"
            >
              פתח בטאב חדש
            </a>
          </div>
        )}
      </div>
    </div>
  );
}