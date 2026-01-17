import React, { useEffect, useRef } from 'react';

export default function PlutoTVPlayer({ streamUrl }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!streamUrl || !videoRef.current) return;

    const video = videoRef.current;
    let hls = null;

    const loadStream = async () => {
      try {
        // Check if we can use hls.js
        const { default: HLS } = await import('hls.js');
        
        if (HLS.isSupported()) {
          hls = new HLS({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(streamUrl);
          hls.attachMedia(video);

          hls.on(HLS.Events.MANIFEST_PARSED, () => {
            video.play().catch(err => console.log('Autoplay blocked:', err));
          });

          hls.on(HLS.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Native HLS (Safari/iOS)
          video.src = streamUrl;
          video.play().catch(err => console.log('Autoplay blocked:', err));
        }
      } catch (error) {
        console.error('Failed to load stream:', error);
      }
    };

    loadStream();

    return () => {
      if (hls) hls.destroy();
    };
  }, [streamUrl]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      className="w-full h-full bg-black"
    />
  );
}