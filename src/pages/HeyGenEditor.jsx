import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HeyGenEditor() {
  return (
    <div className="w-full h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto bg-purple-600/20 rounded-full flex items-center justify-center">
          <ExternalLink className="w-10 h-10 text-purple-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white">HeyGen Video Editor</h1>
        
        <p className="text-gray-400 text-lg">
          HeyGen דורש כניסה לחשבון ולא ניתן להטמיע את העורך שלהם.
          לחץ על הכפתור למעבר לעורך המלא בחלון חדש.
        </p>

        <Button
          onClick={() => window.open('https://app.heygen.com/create-v4/draft?vt=p&fromCreateButton=true', '_blank')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 text-lg rounded-xl"
        >
          <ExternalLink className="w-5 h-5 ml-2" />
          פתח HeyGen Editor
        </Button>

        <div className="pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm mb-4">או השתמש בעורך הווידאו המתקדם שלנו:</p>
          <Button
            onClick={() => window.location.href = '/VideoEditor'}
            variant="outline"
            className="border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            עורך וידאו מקומי
          </Button>
        </div>
      </div>
    </div>
  );
}