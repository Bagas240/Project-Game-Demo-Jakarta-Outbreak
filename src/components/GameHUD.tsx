import React from 'react';
import { PlayerStats, GameQuest, ChapterId } from '../types/game';

interface GameHUDProps {
  stats: PlayerStats;
  quest: GameQuest | null;
  chapter: ChapterId;
  companions: { id: string; name: string; active: boolean }[];
  interactionPrompt: string | null;
  notificationMessage?: string | null;
  isMuted: boolean;
  canClaimMistar?: boolean;
  canClaimFlashlight?: boolean;
  canClaimKey?: boolean;
  canClaimMedkit?: boolean;
  onClaimItem?: (id: string) => void;
  onInteractClick: () => void;
  onAttack?: () => void;
  onToggleMute: () => void;
  onToggleFlashlight: () => void;
  onOpenDossier: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  quest,
  chapter,
  companions,
  interactionPrompt,
  notificationMessage,
  isMuted,
  canClaimMistar,
  canClaimFlashlight,
  canClaimKey,
  canClaimMedkit,
  onClaimItem,
  onInteractClick,
  onAttack,
  onToggleMute,
  onToggleFlashlight,
  onOpenDossier,
}) => {
  const totalPips = 10;
  const activePips = Math.max(0, Math.min(totalPips, Math.ceil((stats.hp / stats.maxHp) * totalPips)));
  const stPct = Math.round((stats.stamina / stats.maxStamina) * 100);

  let chapterTitle = 'Prolog: Rumah Dika';
  if (chapter === 'ch_walk') chapterTitle = 'Bab 2: Gang Menuju Sekolah';
  if (chapter === 'ch_school_gate') chapterTitle = 'Bab 3: Gerbang SMA 03';
  if (chapter === 'ch_classroom_study') chapterTitle = 'Bab 4: Belajar di Kelas XII IPA 2';
  if (chapter === 'ch_outbreak_12pm') chapterTitle = 'Bab 5: 12.00 WIB - Jeritan Lapangan!';
  if (chapter === 'ch_corridor') chapterTitle = 'Bab 6: Koridor Berdarah';
  if (chapter === 'ch_sacrifice') chapterTitle = 'Bab 7: Gerbang & Pengorbanan Dafa';
  if (chapter === 'ch_skyline') chapterTitle = 'Bab 8: Cakrawala Jakarta';

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex flex-col justify-between p-3 sm:p-5 font-pixel">
      {/* Top Bar */}
      <div className="flex justify-between items-start gap-4">
        {/* Top-Left: Player Vitals & Status */}
        <div className="pointer-events-auto bg-[#0f0f14] border-2 border-[#52525b] p-3 w-64 sm:w-72 shadow-[0_4px_0_rgba(0,0,0,0.85)]">
          <div className="flex justify-between items-center text-xs text-[#f59e0b] border-b border-[#272730] pb-1.5 mb-2">
            <span>[ DIKA PRATAMA ]</span>
            <span className="text-[10px] text-[#a1a1aa] font-mono">
              KILLS: {stats.kills}
            </span>
          </div>

          {/* Health Pips */}
          <div className="space-y-1 mb-2">
            <div className="flex justify-between text-[10px] text-[#e4e4e7]">
              <span>HP</span>
              <span className="font-mono">{Math.round(stats.hp)} / {stats.maxHp}</span>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: totalPips }).map((_, i) => (
                <div
                  key={i}
                  className={`h-3 flex-1 border border-black ${
                    i < activePips
                      ? activePips > 4
                        ? 'bg-[#ef4444]'
                        : 'bg-[#b91c1c] animate-pulse'
                      : 'bg-[#27272a]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Stamina Meter */}
          <div className="space-y-1">
            <div className="flex justify-between text-[9px] text-[#71717a]">
              <span>STAMINA</span>
              <span className="font-mono">{stPct}%</span>
            </div>
            <div className="h-1.5 bg-[#27272a] border border-black overflow-hidden">
              <div
                className="h-full bg-[#f59e0b] transition-all duration-75"
                style={{ width: `${stPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Right: Chapter & Survivors */}
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <div className="bg-[#0f0f14] border-2 border-[#52525b] px-3 py-2 text-right shadow-[0_4px_0_rgba(0,0,0,0.85)]">
            <div className="text-[10px] text-[#dc2626] tracking-wider">
              SMA NEGERI 03 JAKARTA
            </div>
            <div className="text-xs text-[#e4e4e7] font-sans-ui font-semibold mt-0.5">
              {chapterTitle}
            </div>
          </div>

          <div className="flex gap-2 text-[10px]">
            <button
              onClick={onToggleMute}
              className="px-2.5 py-1 bg-[#18181f] border border-[#3f3f4e] text-[#a1a1aa] hover:text-white cursor-pointer"
            >
              [ {isMuted ? 'MUTE' : 'AUDIO ON'} ]
            </button>
            <button
              onClick={onOpenDossier}
              className="px-2.5 py-1 bg-[#18181f] border border-[#dc2626] text-[#f43f5e] hover:text-white cursor-pointer"
            >
              [ ARSIP ]
            </button>
          </div>

          {/* Companions Tracker */}
          <div className="bg-[#0f0f14] border border-[#3f3f46] p-2 text-[10px] space-y-1 w-44">
            <div className="text-[#71717a] border-b border-[#272730] pb-1">
              SURVIVORS:
            </div>
            <div className="grid grid-cols-2 gap-1 text-[9px] font-sans-ui">
              {companions.map(c => (
                <div
                  key={c.id}
                  className={`flex items-center gap-1 ${
                    c.active ? 'text-[#a7f3d0]' : 'text-[#71717a] line-through'
                  }`}
                >
                  <span>{c.active ? '●' : '×'}</span>
                  <span>{c.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Center: Interactive prompt banner (clickable with mouse or key E) */}
      <div className="flex flex-col items-center justify-center gap-2">
        {notificationMessage && (
          <div className="bg-[#18181f] border border-[#eab308] text-[#fef08a] px-3 py-1.5 text-xs tracking-wider shadow-lg">
            ! {notificationMessage}
          </div>
        )}

        {interactionPrompt && (
          <button
            onClick={onInteractClick}
            className="pointer-events-auto bg-[#dc2626] hover:bg-[#b91c1c] text-white border-2 border-white px-5 py-2.5 text-xs tracking-wider shadow-[0_6px_0_rgba(0,0,0,0.9)] transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
          >
            [E] {interactionPrompt} (KLIK / TEKAN E)
          </button>
        )}
      </div>

      {/* Bottom Area: RETRO INVENTORY BAR & Objectives */}
      <div className="space-y-2 pointer-events-auto">
        {/* RETRO 4-SLOT SURVIVAL INVENTORY */}
        <div className="bg-[#0f0f14] border-2 border-[#52525b] p-2 max-w-xl mx-auto shadow-[0_4px_0_rgba(0,0,0,0.85)]">
          <div className="flex justify-between items-center text-[9px] text-[#a1a1aa] border-b border-[#272730] pb-1 mb-1.5">
            <span className="text-[#f59e0b]">INVENTORY DIKA</span>
            <span>SLOT BARANG [CLAIM DI KELAS/SEKOLAH]</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-[9px]">
            {/* Slot 1: Weapon */}
            <div
              className={`p-1.5 border flex flex-col justify-between h-14 ${
                stats.hasMistarBesi
                  ? 'bg-[#1e1b18] border-[#f59e0b] text-[#fef08a]'
                  : canClaimMistar
                  ? 'bg-[#3b1d06] border-[#f59e0b] animate-pulse text-white cursor-pointer'
                  : 'bg-[#141418] border-[#272730] text-[#71717a]'
              }`}
              onClick={() => {
                if (canClaimMistar && !stats.hasMistarBesi && onClaimItem) {
                  onClaimItem('mistar_besi');
                }
              }}
            >
              <div className="flex justify-between items-center text-[8px] text-[#71717a] uppercase">
                <span>SENJATA</span>
                {canClaimMistar && !stats.hasMistarBesi && (
                  <span className="text-[#f59e0b] font-bold animate-bounce">[DEKAT]</span>
                )}
              </div>
              <div className="truncate font-sans-ui text-[10px] font-bold text-white">
                {stats.hasMistarBesi ? 'Mistar Besi' : canClaimMistar ? '[KLAIM MISTAR]' : 'Tangan Kosong'}
              </div>
              <div className="text-[8px] text-[#a1a1aa]">
                {stats.hasMistarBesi ? 'DMG: 38 (Besi)' : canClaimMistar ? 'Klik / E Ambil' : 'DMG: 10'}
              </div>
            </div>

            {/* Slot 2: Flashlight */}
            <button
              onClick={() => {
                if (canClaimFlashlight && !stats.hasFlashlight && onClaimItem) {
                  onClaimItem('flashlight');
                } else {
                  onToggleFlashlight();
                }
              }}
              className={`p-1.5 border flex flex-col justify-between h-14 text-left cursor-pointer transition-colors ${
                stats.hasFlashlight
                  ? stats.flashlightOn
                    ? 'bg-[#422006] border-[#eab308] text-[#fef08a]'
                    : 'bg-[#1e1b18] border-[#78350f] text-[#d4d4d8]'
                  : canClaimFlashlight
                  ? 'bg-[#3b1d06] border-[#eab308] text-white animate-pulse'
                  : 'bg-[#141418] border-[#272730] text-[#52525b]'
              }`}
            >
              <div className="flex justify-between items-center text-[8px] text-[#71717a] uppercase">
                <span>SENTER [F]</span>
                {canClaimFlashlight && !stats.hasFlashlight && (
                  <span className="text-[#eab308] font-bold animate-bounce">[DEKAT]</span>
                )}
              </div>
              <div className="truncate font-sans-ui text-[10px] font-bold text-white">
                {stats.hasFlashlight
                  ? stats.flashlightOn
                    ? 'Senter ON'
                    : 'Senter OFF'
                  : canClaimFlashlight
                  ? '[KLAIM SENTER]'
                  : '[KOSONG]'}
              </div>
              <div className="text-[8px]">
                {stats.hasFlashlight
                  ? stats.flashlightOn
                    ? '● MENYALA'
                    : '○ MATI'
                  : canClaimFlashlight
                  ? 'Klik / E Ambil'
                  : 'Cari di kelas'}
              </div>
            </button>

            {/* Slot 3: Gate Key */}
            <div
              className={`p-1.5 border flex flex-col justify-between h-14 ${
                stats.hasKey
                  ? 'bg-[#1e1b18] border-[#f59e0b] text-[#fef08a]'
                  : canClaimKey
                  ? 'bg-[#3b1d06] border-[#f59e0b] text-white animate-pulse cursor-pointer'
                  : 'bg-[#141418] border-[#272730] text-[#52525b]'
              }`}
              onClick={() => {
                if (canClaimKey && !stats.hasKey && onClaimItem) {
                  onClaimItem('school_key');
                }
              }}
            >
              <div className="flex justify-between items-center text-[8px] text-[#71717a] uppercase">
                <span>KUNCI</span>
                {canClaimKey && !stats.hasKey && (
                  <span className="text-[#f59e0b] font-bold animate-bounce">[DEKAT]</span>
                )}
              </div>
              <div className="truncate font-sans-ui text-[10px] font-bold text-white">
                {stats.hasKey ? 'Kunci Gerbang' : canClaimKey ? '[KLAIM KUNCI]' : '[KOSONG]'}
              </div>
              <div className="text-[8px] text-[#a1a1aa]">
                {stats.hasKey ? 'Pos Satpam' : canClaimKey ? 'Klik / E Ambil' : 'Cari di Satpam'}
              </div>
            </div>

            {/* Slot 4: Medkit / PMR */}
            <div
              className={`p-1.5 border flex flex-col justify-between h-14 ${
                canClaimMedkit
                  ? 'bg-[#3b1d06] border-[#ef4444] text-white animate-pulse cursor-pointer'
                  : 'bg-[#141418] border-[#272730] text-[#71717a]'
              }`}
              onClick={() => {
                if (canClaimMedkit && onClaimItem) {
                  onClaimItem('medkit');
                }
              }}
            >
              <div className="flex justify-between items-center text-[8px] text-[#71717a] uppercase">
                <span>MEDIS</span>
                {canClaimMedkit && (
                  <span className="text-[#ef4444] font-bold animate-bounce">[DEKAT]</span>
                )}
              </div>
              <div className="truncate font-sans-ui text-[10px] font-bold text-white">
                {canClaimMedkit ? '[AMBIL P3K]' : 'P3K PMR'}
              </div>
              <div className="text-[8px] text-[#a1a1aa]">
                {canClaimMedkit ? 'Klik / E Ambil' : 'Lia PMR'}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Objective, Attack Button & Control Guide */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-xl mx-auto w-full">
          {quest && (
            <div className="bg-[#0f0f14] border-2 border-[#b45309] px-3 py-1.5 flex-1 shadow-[0_3px_0_rgba(0,0,0,0.85)] min-w-0">
              <div className="flex justify-between items-center text-[9px] text-[#f59e0b]">
                <span>TUJUAN:</span>
                <span className="font-mono">{quest.progress}/{quest.total}</span>
              </div>
              <div className="text-[11px] font-sans-ui text-[#e4e4e7] truncate">
                {quest.title}
              </div>
            </div>
          )}

          {/* Prominent Action Attack Button */}
          {onAttack && (
            <button
              onClick={onAttack}
              className="pointer-events-auto bg-[#b91c1c] hover:bg-[#dc2626] active:scale-95 text-white border-2 border-[#f87171] px-4 py-2 text-[10px] font-bold tracking-wider shadow-[0_4px_0_rgba(0,0,0,0.9)] cursor-pointer flex items-center gap-1.5 transition-transform shrink-0"
            >
              <span>⚔️</span>
              <span>SERANG [SPASI / KLIK]</span>
            </button>
          )}

          <div className="bg-[#0f0f14] border border-[#3f3f46] px-2.5 py-1 text-[9px] text-[#71717a] font-mono whitespace-nowrap shrink-0">
            WASD · Spasi/Klik Serang · E Aksi · F Senter
          </div>
        </div>
      </div>
    </div>
  );
};
