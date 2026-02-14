import React from 'react';

export default function HeyGenEditor() {
  return (
    <div className="w-full h-screen bg-black">
      <iframe
        src="https://app.heygen.com/create-v4/draft?vt=p&fromCreateButton=true"
        className="w-full h-full border-0"
        allow="camera; microphone; autoplay; clipboard-write"
        title="HeyGen Video Editor"
      />
    </div>
  );
}