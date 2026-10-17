import React from 'react';
import { PlayerStats } from '../types/game';
import { RotateCcw, BookOpen, Volume2, VolumeX } from 'lucide-react';

interface CinematicEndingProps {
  stats: PlayerStats;
  onRestart: () => void;
  onOpenDossier: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const CinematicEnding: React.FC<CinematicEndingProps> = ({
  stats,
  onRestart,
  onOpenDossier,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none font-pixel animate-fade-in">
      <div className="max-w-xl w-full bg-[#0f0f14] border-2 border-[#dc2626] p-5 sm:p-7 shadow-[0_10px_0_rgba(0,0,0,0.9)] space-y-4">
        {/* Header Tag */}
        <div className="flex justify-between items-center border-b border-[#272730] pb-3">
          <span className="px-3 py-1 bg-[#1c1917] border border-[#dc2626] text-[#dc2626] text-[10px] tracking-widest">
            DEMO EPISODE 1 TUNTAS
          </span>
          <button
            onClick={onToggleMute}
            className="px-2.5 py-1 bg-[#18181f] border border-[#3f3f4e] text-[10px] text-[#a1a1aa] hover:text-white cursor-pointer flex items-center gap-1.5"
          >
            {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
            <span>[ AUDIO: {isMuted ? 'MUTE' : 'ON'} ]</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl sm:text-3xl font-pixel text-white tracking-widest">
            JAKARTA OUTBREAK
          </h1>
          <p className="text-xs text-[#f59e0b] font-mono">
            EPISODE 1: HARI PERTAMA WABAH DI JAKARTA PUSAT
          </p>
        </div>

        {/* Story Recap */}
        <p className="text-xs sm:text-sm text-[#d4d4d8] font-sans-ui leading-relaxed text-center">
          Dika bersama 3 temannya yang berhasil selamat — <strong className="text-white">Lia</strong>, <strong className="text-white">Rafli</strong>, dan <strong className="text-white">Farel</strong> — berhasil lolos keluar dari kepungan zombie di SMA Negeri 03 Jakarta. Namun kelegaan mereka pupus saat menyaksikan seluruh ibukota kini luluh lantak terbakar...
        </p>

        {/* Tribute to Dafa Arya */}
        <div className="bg-[#18181b] border-2 border-[#b91c1c] p-3 text-left flex items-start gap-3 shadow-[0_2px_0_rgba(0,0,0,0.5)]">
          <div className="text-2xl p-1 bg-[#27272a] border border-[#52525b]">🕯️</div>
          <div className="text-xs font-sans-ui text-[#e4e4e7] space-y-1">
            <span className="font-pixel text-[10px] text-[#ef4444] block tracking-wider font-bold">
              MENGHORMATI PENGORBANAN HEROIK DAFA ARYA
            </span>
            <p className="text-[#a1a1aa] italic text-[11px] leading-relaxed">
              "Bawa Lia, Rafli, sama Farel pergi sekarang!! Jangan nengok ke belakang... Tolong jaga mereka buat gue ya, Dik..."
            </p>
          </div>
        </div>

        {/* Survival & Mission Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
          <div className="p-2 bg-[#18181f] border border-[#272730] text-center">
            <span className="text-[#71717a] block text-[9px]">SURVIVORS</span>
            <span className="text-emerald-400 font-bold">4 SELAMAT</span>
          </div>
          <div className="p-2 bg-[#18181f] border border-[#272730] text-center">
            <span className="text-[#71717a] block text-[9px]">KORBAN</span>
            <span className="text-red-400 font-bold">1 (DAFA)</span>
          </div>
          <div className="p-2 bg-[#18181f] border border-[#272730] text-center">
            <span className="text-[#71717a] block text-[9px]">ZOMBIE KILLS</span>
            <span className="text-amber-400 font-bold">{stats.kills} ELIMINASI</span>
          </div>
          <div className="p-2 bg-[#18181f] border border-[#272730] text-center">
            <span className="text-[#71717a] block text-[9px]">SENJATA</span>
            <span className="text-white font-bold">{stats.hasMistarBesi ? 'MISTAR BESI' : 'TANGAN'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#272730] flex flex-wrap justify-center gap-3">
          <button
            onClick={onRestart}
            className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs border border-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MAINKAN LAGI DARI AWAL</span>
          </button>

          <button
            onClick={onOpenDossier}
            className="px-5 py-2.5 bg-[#18181f] hover:bg-[#272738] text-[#e4e4e7] text-xs border border-[#3f3f4e] transition-colors cursor-pointer flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>LIHAT ARSIP SURVIVOR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
