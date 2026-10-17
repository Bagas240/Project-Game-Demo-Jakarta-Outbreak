import React from 'react';
import { CHARACTER_PROFILES } from '../data/storyData';
import { PixelArtFactory } from '../textures/PixelArtFactory';

interface DossierModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DossierModal: React.FC<DossierModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-6 font-pixel">
      <div className="bg-[#0f0f14] border-2 border-[#52525b] max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_8px_0_rgba(0,0,0,0.9)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-[#272730] bg-[#181820]">
          <div>
            <div className="text-xs text-[#f59e0b] tracking-wider">
              [ ARSIP SURVIVOR SMA NEGERI 03 JAKARTA ]
            </div>
            <div className="text-[10px] text-[#71717a] font-sans-ui mt-0.5">
              Catatan Murid & Pahlawan Tragedi Wabah Pukul 12:00 WIB
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-2.5 py-1 bg-[#272730] border border-[#52525b] text-xs text-[#a1a1aa] hover:text-white cursor-pointer"
          >
            [X] TUTUP
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3">
          {CHARACTER_PROFILES.map(char => {
            const isDafa = char.id === 'dafa';
            const portraitUrl = PixelArtFactory.getCharacterPortrait(char.id);

            return (
              <div
                key={char.id}
                className={`p-3 border ${
                  isDafa
                    ? 'bg-[#1a0f0f] border-[#dc2626]'
                    : 'bg-[#14141a] border-[#272732]'
                } flex flex-col sm:flex-row gap-3 items-start`}
              >
                {/* Character Portrait Frame with Pixel Art */}
                <div className="w-16 h-18 shrink-0 bg-[#1c1c24] border border-[#52525b] flex flex-col items-center justify-center p-1">
                  <img
                    src={portraitUrl}
                    alt={char.name}
                    className="w-12 h-12 object-contain"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="text-[8px] text-[#a1a1aa] uppercase mt-0.5">
                    {char.id}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs text-white">
                      {char.name}
                    </span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 border ${
                        char.status === 'alive'
                          ? 'border-[#059669] text-[#34d399] bg-[#022c22]'
                          : 'border-[#dc2626] text-[#f87171] bg-[#450a0a]'
                      }`}
                    >
                      {char.status === 'alive' ? 'STATUS: SELAMAT' : 'STATUS: GUGUR (PAHLAWAN)'}
                    </span>
                  </div>

                  <div className="text-[10px] text-[#f59e0b] font-sans-ui">{char.role}</div>

                  <p className="text-xs font-sans-ui text-[#d4d4d8] leading-relaxed pt-1">
                    {char.description}
                  </p>

                  <div className="pt-1 text-[10px] text-[#71717a] font-sans-ui">
                    <span>Perlengkapan: </span>
                    <span className="text-[#a1a1aa]">{char.schoolUniform}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-[#272730] bg-[#14141a] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#272730] hover:bg-[#3f3f46] text-[#e4e4e7] text-xs border border-[#52525b] transition-colors cursor-pointer"
          >
            KEMBALI KE GAME
          </button>
        </div>
      </div>
    </div>
  );
};
