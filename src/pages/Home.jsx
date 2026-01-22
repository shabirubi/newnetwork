import React from "react";
import ReporterChatModal from "../components/apps/ReporterChatModal";



export default function Home() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <ReporterChatModal />
      </div>
    </div>
  );
}