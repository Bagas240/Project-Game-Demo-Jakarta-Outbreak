import React, { useEffect, useState } from 'react';
import { DialogueLine } from '../types/game';
import { sound } from '../audio/SoundEngine';
import { PixelArtFactory } from '../textures/PixelArtFactory';

interface DialogueBoxProps {
  dialogue: DialogueLine[];
  onFinish: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ dialogue, onFinish }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const currentLine = dialogue[currentIndex];

  useEffect(() => {
    if (!currentLine) {
      onFinish();
      return;
    }

    setDisplayedText('');
    setIsTyping(true);

    let charIdx = 0;
    const text = currentLine.text;
    const timer = setInterval(() => {
      charIdx++;
      setDisplayedText(text.slice(0, charIdx));
      if (charIdx % 3 === 0) {
        sound.playSpeechBlip(currentLine.voicePitch || 1.0);
      }
      if (charIdx >= text.length) {
        setIsTyping(false);
        clearInterval(timer);
      }
    }, 20);

    return () => clearInterval(timer);
  }, [currentIndex, currentLine, onFinish]);

  const handleNext = () => {
    if (isTyping && currentLine) {
      setDisplayedText(currentLine.text);
      setIsTyping(false);
    } else {
      if (currentIndex + 1 < dialogue.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        onFinish();
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isTyping, currentIndex, dialogue]);

  if (!currentLine) return null;

  // Render authentic 48x48 pixel art portrait data URL (NO EMOJIS!)
  const portraitUrl = PixelArtFactory.getCharacterPortrait(currentLine.portrait);

  return (
    <div
      onClick={handleNext}
      className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-50 cursor-pointer select-none font-pixel"
    >
      {/* Retro RPG Dialogue Box: Solid Dark Matte with 2px Bone Border */}
      <div className="bg-[#0f0f14] border-2 border-[#d4d4d8] shadow-[0_8px_0_rgba(0,0,0,0.85)] p-3 sm:p-4 relative flex gap-3 sm:gap-4 items-start">
        {/* Authentic Pixel Art Character Portrait Frame */}
        <div className="w-16 h-18 sm:w-20 sm:h-22 shrink-0 bg-[#181820] border-2 border-[#52525b] flex flex-col items-center justify-center p-1 relative overflow-hidden">
          <img
            src={portraitUrl}
            alt={currentLine.speaker}
            className="w-12 h-12 sm:w-14 sm:h-14 pixelated object-contain"
            style={{ imageRendering: 'pixelated' }}
          />
          <span className="text-[9px] sm:text-[10px] text-[#e4e4e7] uppercase mt-1 truncate max-w-full text-center">
            {currentLine.speaker}
          </span>
          {currentLine.emotion === 'shock' && (
            <span className="absolute top-1 right-1 text-[10px] text-yellow-400 bg-black/80 px-1 border border-yellow-500">
              !
            </span>
          )}
          {currentLine.emotion === 'heroic' && (
            <span className="absolute top-1 right-1 text-[10px] text-red-500 bg-black/80 px-1 border border-red-500">
              *
            </span>
          )}
        </div>

        {/* Dialogue Text Content */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Speaker Name Tag */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#f59e0b] tracking-wider">
              [ {currentLine.speaker.toUpperCase()} ]
            </span>
          </div>

          {/* Dialogue Prose */}
          <p className="text-xs sm:text-sm font-sans-ui text-[#f4f4f5] leading-relaxed min-h-[3rem]">
            {displayedText}
            {isTyping && <span className="inline-block w-2 h-3.5 ml-1 bg-[#f59e0b] animate-pulse" />}
          </p>

          {/* Blinking Cursor Hint */}
          <div className="flex justify-end pt-1 text-[9px] text-[#71717a]">
            <span className="animate-pulse">▼ KLIK / SPASI UNTUK LANJUT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
