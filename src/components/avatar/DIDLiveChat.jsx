import React, { useEffect } from 'react';

export default function DIDLiveChat({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Remove any existing widget
    const existingWidget = document.querySelector('did-agent');
    if (existingWidget) {
      existingWidget.remove();
    }

    // Remove any existing script
    const existingScript = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and load the D-ID script
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    script.setAttribute('data-mode', 'floating');
    script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDkwNTAwMjE4NjYwMDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3d3');
    script.setAttribute('data-agent-id', 'v2_agt_pW1vqMCQ');
    script.setAttribute('data-name', 'did-agent');
    
    document.head.appendChild(script);

    // Close the modal after loading
    setTimeout(() => {
      onClose();
    }, 1000);

    return () => {
      // Cleanup on unmount
      const scriptEl = document.querySelector('script[src="https://agent.d-id.com/v2/index.js"]');
      if (scriptEl) {
        scriptEl.remove();
      }
      const widgetEl = document.querySelector('did-agent');
      if (widgetEl) {
        widgetEl.remove();
      }
    };
  }, [isOpen]);

  return null;
}