import React, { useEffect, useRef } from 'react';
import HLS from 'hls.js';

export default function PlutoTVPlayer({ streamUrl }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;

    if (HLS.isSupported()) {
      const hls = new HLS({
        debug: false,
        enableWorker: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(HLS.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => {
          // Autoplay might be blocked by browser
        });
      });

      hls.on(HLS.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error('HLS fatal error:', data);
        }
      });

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = streamUrl;
      video.play().catch(() => {
        // Autoplay might be blocked by browser
      });
    }
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      controls
      className="w-full h-full"
      style={{ backgroundColor: '#000' }}
    />
  );
}