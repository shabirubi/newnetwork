import React from "react";
import AIReporterIntroChat from "../components/apps/AIReporterIntroChat";



export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <AIReporterIntroChat />
      </div>
    </div>
  );
}