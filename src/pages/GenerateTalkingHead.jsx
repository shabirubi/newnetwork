import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function GenerateTalkingHead() {
  const [text, setText] = useState("שלום, אני כתב הרשת החדשה. רוז ביזאם הפכה לאחת ממשכנתות הרשת החדשות ביותר. היא ירדה לתשומת לב בעקבות תוכן קומי משעשע שלה בTikTok. בימים אלו היא צוברת מיליוני צפיות וההשפעה שלה גדלה");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  const generateVideo = async () => {
    if (!text.trim()) {
      alert("הכנס טקסט לוידאו");
      return;
    }

    setLoading(true);
    setStatus("יוצר וידאו עם D-ID...");

    try {
      const response = await fetch("https://api.d-id.com/talks", {
        method: "POST",
        headers: {
          Authorization: "Bearer c2V5b3JsYXlsYUBnbWFpbC5jb20:lcR_jsVWiAMdctYjJVqme",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
          script: {
            type: "text",
            subtitles: false,
            provider: {
              type: "elevenlabs",
              voice_id: "JBFqnCBsd6RMkjVY3eQj",
            },
            ssml: false,
            input: text,
          },
          config: {
            fluent: true,
            pad_audio: 0.0,
          },
          session_id: `session_${Date.now()}`,
        }),
      });

      const data = await response.json();

      if (data.result_url) {
        setStatus("✅ וידאו נוצר בהצלחה!");
        setVideoUrl(data.result_url);

        // שמור ב-Database
        await base44.entities.TalkingHeadVideo.create({
          article_id: "manual_rose",
          reporter_name: "כתב הרשת החדשה",
          video_url: data.result_url,
          talk_id: data.id,
          status: "completed",
          duration: data.duration || 30,
          presentation_text: text,
          views: 0,
          is_featured: true,
        });

        setTimeout(() => {
          window.location.href = "/TalkingHeads";
        }, 2000);
      } else {
        setStatus("❌ שגיאה: " + (data.error || "לא הצליח ליצור וידאו"));
      }
    } catch (error) {
      setStatus("❌ שגיאה: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">יצירת וידאו מדבר</h1>
        <p className="text-white/80">הכנס טקסט והמערכת תיצור וידאו של דמות מדברת</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 dark:text-white">
            טקסט הוידאו
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="הכנס את הטקסט שהכתב ישדר..."
            disabled={loading}
          />
        </div>

        {status && (
          <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
            {status.includes("❌") ? (
              <AlertCircle className="w-5 h-5 text-red-500" />
            ) : status.includes("✅") ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            )}
            <span className="dark:text-white">{status}</span>
          </div>
        )}

        {videoUrl && (
          <div className="rounded-lg overflow-hidden">
            <video
              src={videoUrl}
              controls
              autoPlay
              className="w-full"
            />
          </div>
        )}

        <Button
          onClick={generateVideo}
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-6 text-lg font-bold"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              מעבד...
            </>
          ) : (
            "צור וידאו"
          )}
        </Button>
      </div>
    </div>
  );
}