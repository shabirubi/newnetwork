import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function DIDLiveChat({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    // Clean up everything
    const cleanup = () => {
      document.querySelectorAll('did-agent').forEach(el => el.remove());
      document.querySelectorAll('script[src*="agent.d-id.com"]').forEach(el => el.remove());
    };
    
    cleanup();

    // Load fresh
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://agent.d-id.com/v2/index.js';
    script.setAttribute('data-mode', 'floating');
    script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMDkwNTAwMjE4NjYwMDc1ODI0OTY6MUl4RzNNdzRLZkRXVGU3TDBfN3d3');
    script.setAttribute('data-agent-id', 'v2_agt_pW1vqMCQ');
    
    document.body.appendChild(script);

    return cleanup;
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] pointer-events-none">
      <button
        onClick={onClose}
        className="fixed top-4 left-4 z-[9999] pointer-events-auto bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}