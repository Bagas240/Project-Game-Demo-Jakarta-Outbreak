import React, { useState } from 'react';
import { ChapterId } from '../types/game';
import { sound } from '../audio/SoundEngine';

interface TitleScreenProps {
  onStartGame: (chapter?: ChapterId) => void;
  onOpenDossier: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenDossier,
  isMuted,
  onToggleMute,
}) => {
  const [selectedMenu, setSelectedMenu] = useState<number>(0);
  const [showChapterSelect, setShowChapterSelect] = useState<boolean>(false);

  const menuItems = [
    { label: 'MULAI DEMO DARI AWAL', action: () => onStartGame('ch_house') },
    { label: 'PILIH BAB CERITA', action: () => setShowChapterSelect(true) },
    { label: 'ARSIP SURVIVOR & MENGENANG DAFA', action: () => onOpenDossier() },
  ];

  const chapters: { id: ChapterId; num: string; title: string }[] = [
    { id: 'ch_house', num: '01', title: 'Depan Rumah: Pamit Berangkat Sekolah' },
    { id: 'ch_walk', num: '02', title: 'Perjalanan: Menyusuri Gang Jakarta' },
    { id: 'ch_school_gate', num: '03', title: 'Gerbang Sekolah: Bertemu Teman' },
    { id: 'ch_classroom_study', num: '04', title: 'Kelas XII IPA 2: Pembelajaran Fisika' },
    { id: 'ch_outbreak_12pm', num: '05', title: 'Pukul 12:00 WIB: Jeritan & Wabah Pecah' },
    { id: 'ch_corridor', num: '06', title: 'Koridor Berdarah: Menuju Pos Satpam' },
    { id: 'ch_sacrifice', num: '07', title: 'Gerbang Utama: Pengorbanan Heroik Dafa' },
    { id: 'ch_skyline', num: '08', title: 'Ending Demo: Cakrawala Jakarta yang Hancur' },
  ];

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-between p-6 sm:p-10 select-none bg-[#0a0a0c] text-[#e2d9c8]">
      {/* Retro Arcade / Console Top Bar */}
      <div className="flex justify-between items-center border-b border-[#2d2d38] pb-3 text-[11px] font-pixel">
        <span className="text-[#a1a1aa] tracking-widest">
          SMA NEGERI 03 JAKARTA · DEMO 2.5D
        </span>
        <button
          onClick={onToggleMute}
          className="px-3 py-1 bg-[#18181f] border border-[#3f3f4e] text-[#f43f5e] hover:text-white transition-colors cursor-pointer"
        >
          [ AUDIO: {isMuted ? 'MUTE' : 'ON'} ]
        </button>
      </div>

      {/* Main Center Title Section */}
      <div className="max-w-2xl mx-auto w-full text-center space-y-6 my-auto">
        {/* Retro Game Title Logo */}
        <div className="space-y-2">
          <div className="text-[12px] font-pixel text-[#f43f5e] tracking-widest">
            SURVIVAL HORROR 2.5D PIXEL DEMO
          </div>
          <h1 className="text-4xl sm:text-6xl font-pixel tracking-widest text-white drop-shadow-[4px_4px_0px_#991b1b]">
            JAKARTA
          </h1>
          <h2 className="text-2xl sm:text-4xl font-pixel tracking-[0.25em] text-[#dc2626]">
            OUTBREAK
          </h2>
          <div className="text-[11px] font-pixel text-[#71717a] pt-1">
            EPISODE 1: TRAGEDI SMA JAKARTA 03
          </div>
        </div>

        {/* Narrative Teaser */}
        <p className="text-xs sm:text-sm font-sans-ui text-[#a1a1aa] max-w-lg mx-auto leading-relaxed border-y border-[#262630] py-3">
          Berangkat dari rumah di pagi hari Jakarta, Dika tiba di SMA 03 untuk belajar.
          Tepat pukul 12:00 siang saat bel istirahat berbunyi, wabah misterius meledak di sekolah.
          Orang-orang saling menggigit secara buas.
        </p>

        {/* Classic Console Menu List */}
        {!showChapterSelect ? (
          <div className="space-y-3 pt-2 max-w-sm mx-auto">
            {menuItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sound.playInteract();
                  item.action();
                }}
                onMouseEnter={() => setSelectedMenu(idx)}
                className={`w-full text-left px-4 py-2.5 font-pixel text-xs tracking-wider border transition-all cursor-pointer flex items-center justify-between ${
                  selectedMenu === idx
                    ? 'bg-[#1e1b1b] border-[#dc2626] text-white pl-6'
                    : 'bg-[#121216] border-[#272733] text-[#a1a1aa]'
                }`}
              >
                <span>
                  {selectedMenu === idx ? '► ' : '  '}
                  {item.label}
                </span>
                {selectedMenu === idx && <span className="text-[#dc2626]">◄</span>}
              </button>
            ))}
          </div>
        ) : (
          /* Chapter Select Modal */
          <div className="bg-[#121218] border-2 border-[#dc2626] p-4 text-left max-w-lg mx-auto space-y-2">
            <div className="flex justify-between items-center border-b border-[#2d2d3a] pb-2 mb-2 font-pixel text-xs text-[#f43f5e]">
              <span>PILIH BAB DEMO:</span>
              <button
                onClick={() => setShowChapterSelect(false)}
                className="text-[#a1a1aa] hover:text-white px-2 py-0.5 bg-[#1e1e28]"
              >
                [KEMBALI]
              </button>
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {chapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => {
                    sound.playInteract();
                    onStartGame(ch.id);
                  }}
                  className="w-full text-left px-3 py-2 bg-[#181822] hover:bg-[#272738] border border-[#2d2d3a] hover:border-[#dc2626] text-xs font-sans-ui text-[#e4e4e7] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span className="font-pixel text-[10px] text-[#f59e0b]">{ch.num}.</span>
                  <span>{ch.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Classic Retro Footer Control Guide */}
      <div className="border-t border-[#2d2d38] pt-3 text-center text-[10px] sm:text-[11px] font-pixel text-[#71717a]">
        WASD JALAN · SPASI SERANG · E AKSI · SHIFT LARI · F SENTER
      </div>
    </div>
  );
};
