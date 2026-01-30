import React from 'react';
import { Zap, Sparkles, Rocket, Wand2 } from 'lucide-react';

export default function ModelSelector({ selectedModel, onModelChange }) {
  const models = [
    {
      id: 'flux-pro',
      name: 'Flux Pro',
      icon: Sparkles,
      desc: 'הכי איכותי - תוצאות מדהימות',
      speed: 'איטי',
      color: 'from-purple-600 to-pink-600'
    },
    {
      id: 'flux-dev',
      name: 'Flux Dev',
      icon: Wand2,
      desc: 'איזון מושלם בין איכות למהירות',
      speed: 'בינוני',
      color: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'flux-schnell',
      name: 'Flux Schnell',
      icon: Zap,
      desc: 'סופר מהיר - 4 שניות',
      speed: 'מהיר מאוד',
      color: 'from-yellow-600 to-orange-600'
    },
    {
      id: 'sdxl',
      name: 'SDXL',
      icon: Rocket,
      desc: 'Stable Diffusion XL - גמיש מאוד',
      speed: 'בינוני',
      color: 'from-green-600 to-emerald-600'
    }
  ];

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-white">
        🤖 בחר מנוע AI
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {models.map((model) => {
          const Icon = model.icon;
          return (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedModel === model.id
                  ? `border-purple-500 bg-gradient-to-br ${model.color} bg-opacity-20`
                  : 'border-purple-500/30 bg-black/40 hover:border-purple-500/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${selectedModel === model.id ? 'text-white' : 'text-gray-400'}`} />
                <div className="flex-1 text-right">
                  <div className={`font-bold text-sm ${selectedModel === model.id ? 'text-white' : 'text-gray-300'}`}>
                    {model.name}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{model.desc}</div>
                  <div className="text-xs text-purple-400 mt-1">⚡ {model.speed}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}