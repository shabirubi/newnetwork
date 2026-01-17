import { useState, useEffect } from 'react';

export function useHapticFeedback() {
  const [isEnabled, setIsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hapticFeedback') !== 'false';
    }
    return true;
  });

  useEffect(() => {
    localStorage.setItem('hapticFeedback', isEnabled);
  }, [isEnabled]);

  const vibrate = (pattern = 10) => {
    if (!isEnabled || !navigator.vibrate) return;
    navigator.vibrate(pattern);
  };

  const playSound = (frequency = 800, duration = 100) => {
    if (!isEnabled) return;
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (e) {
      // Audio context not available
    }
  };

  const tap = () => {
    vibrate(10);
    playSound(800, 80);
  };

  const success = () => {
    vibrate([10, 20, 10]);
    playSound(1000, 100);
  };

  const error = () => {
    vibrate([30, 20, 30]);
    playSound(400, 150);
  };

  const warning = () => {
    vibrate([20, 10, 20, 10, 20]);
    playSound(600, 120);
  };

  return {
    vibrate,
    playSound,
    tap,
    success,
    error,
    warning,
    isEnabled,
    setIsEnabled
  };
}