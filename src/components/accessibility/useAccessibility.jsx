import { useState, useEffect } from 'react';

export default function useAccessibility() {
  const [settings, setSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('a11y-settings');
      return saved ? JSON.parse(saved) : {
        textSize: 1,
        contrast: 'normal',
        dyslexia: false,
        boldText: false
      };
    }
    return { textSize: 1, contrast: 'normal', dyslexia: false, boldText: false };
  });

  useEffect(() => {
    localStorage.setItem('a11y-settings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    root.style.fontSize = (16 * newSettings.textSize) + 'px';

    if (newSettings.contrast === 'high') {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }

    if (newSettings.dyslexia) {
      document.documentElement.classList.add('dyslexia-font');
    } else {
      document.documentElement.classList.remove('dyslexia-font');
    }

    document.documentElement.style.fontWeight = newSettings.boldText ? '600' : 'normal';
  };

  return { settings, setSettings };
}