import React, { useState, useEffect, useRef } from 'react';
import { sound } from '../audio/SoundEngine';
import { CinematicSceneArt } from '../textures/CinematicSceneArt';
import { ChevronRight, Volume2, VolumeX } from 'lucide-react';

interface CinematicSequenceProps {
  onComplete: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

interface TransitionScene {
  id: string;
  artId: string;
  timeTag: string;
  location: string;
  title: string;
  speaker: string;
  narration: string;
}

const TRANSITION_SCENES: TransitionScene[] = [
  {
    id: 'scene_1',
    artId: 'sma03_gate',
    timeTag: '12:45 WIB',
    location: 'SMA NEGERI 03 JAKARTA · KORIDOR UTAMA',
    title: 'GERBANG BESI SEKOLAH & PENGORBANAN HEROIK',
    speaker: 'Catatan Perjalanan Dika',
    narration:
      'Koridor sekolah yang biasanya ramai canda tawa siswa berubah jadi kuburan berdarah. Dafa Arya mengunci pintu besi lorong dengan tubuhnya sendiri agar kami berempat bisa membuka gerbang keluar...',
  },
  {
    id: 'scene_2',
    artId: 'bundaran_hi',
    timeTag: '14:15 WIB',
    location: 'BUNDARAN HI & JALAN PROTOKOL THAMRIN',
    title: 'KORIDOR BUSWAY LUMPUH & KEPANIKAN MASSAL',
    speaker: 'Siaran Radio RRI Darurat (Frekuensi 98.8 FM)',
    narration:
      '(Suara statis radio) Peringatan darurat tingkat merah! Hindari jalan protokol Sudirman-Thamrin! Kerumunan warga yang histeris dan menyerang secara brutal telah menembus jalur evakuasi busway...',
  },
  {
    id: 'scene_3',
    artId: 'manggarai_station',
    timeTag: '15:30 WIB',
    location: 'STASIUN TRANSIT MANGGARAI · JALUR ELEKTRIK',
    title: 'GERBONG KRL ANJLOK & JERITAN PERON BAWAH',
    speaker: 'Pengeras Suara Stasiun Manggarai',
    narration:
      '(Sirine mendengung) Seluruh perjalanan KRL Commuter Line dibatalkan sepihak! Petugas keamanan kewalahan menahan serbuan infeksi di peron... Jangan turun ke peron bawah!! Lari ke atas...!',
  },
  {
    id: 'scene_4',
    artId: 'monas_siege',
    timeTag: '17:00 WIB',
    location: 'MONUMEN NASIONAL (MONAS) & RING SATU',
    title: 'BARIKADE MILITER JEBOL DIBAWAH KABUT HITAM',
    speaker: 'Komando Evakuasi Darurat Udara',
    narration:
      'Semua unit evakuasi helikopter segera putar balik ke landasan aman. Barikade pertahanan di lingkar Monas telah runtuh... Asap hitam pekat membubung dari pusat kota. Jakarta telah jatuh...',
  },
  {
    id: 'scene_5',
    artId: 'flyover_survivors',
    timeTag: '17:45 WIB',
    location: 'JALAN LAYANG FLYOVER UTARA · BATAS KOTA',
    title: 'EMPAT SURVIVOR & SENJA MERAH IBUKOTA',
    speaker: 'Dika (Monolog Batin)',
    narration:
      'Kami berdiri tertegun di tepi jalan layang, menatap ibukota yang kini lenyap dalam lautan kobaran api dan kabut asap pekat. Dafa sudah tiada... tapi kami bersumpah akan terus bertahan hidup.',
  },
];

export const CinematicSequence: React.FC<CinematicSequenceProps> = ({
  onComplete,
  isMuted = false,
  onToggleMute,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sceneImages, setSceneImages] = useState<Record<string, string>>({});
  const [isBlackout, setIsBlackout] = useState(false);
  const [autoProgress, setAutoProgress] = useState(0);
  const autoTimerRef = useRef<number | null>(null);

  // Pre-generate all handcrafted pixel art scene slides
  useEffect(() => {
    const images: Record<string, string> = {};
    TRANSITION_SCENES.forEach(scene => {
      images[scene.artId] = CinematicSceneArt.getSlide(scene.artId);
    });
    setSceneImages(images);
  }, []);

  // Slide advancement timer and audio cue triggers
  useEffect(() => {
    if (isBlackout) return;

    sound.playPhotoSlide();
    if (currentIndex === 1 || currentIndex === 3) {
      sound.playRadioStatic();
    }
    setAutoProgress(0);

    const stepMs = 50;
    const totalMs = 7000;
    let elapsed = 0;

    autoTimerRef.current = window.setInterval(() => {
      elapsed += stepMs;
      setAutoProgress(Math.min(100, (elapsed / totalMs) * 100));

      if (elapsed >= totalMs) {
        if (autoTimerRef.current) clearInterval(autoTimerRef.current);
        advanceScene();
      }
    }, stepMs);

    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [currentIndex, isBlackout]);

  const advanceScene = () => {
    if (autoTimerRef.current) clearInterval(autoTimerRef.current);

    if (currentIndex < TRANSITION_SCENES.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Trigger cinematic fade to black before completing
      setIsBlackout(true);
      sound.playDeepBoom();

      // Blackout pause for 2.2 seconds before finishing
      setTimeout(() => {
        onComplete();
      }, 2200);
    }
  };

  // Keyboard support for space bar / enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        advanceScene();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isBlackout]);

  const currentScene = TRANSITION_SCENES[currentIndex];

  if (isBlackout) {
    return (
      <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center select-none font-pixel animate-fade-in transition-opacity duration-1000">
        <div className="text-center space-y-3">
          <div className="w-3 h-3 bg-[#dc2626] rounded-full mx-auto animate-ping" />
          <p className="text-xs text-[#71717a] font-mono tracking-widest uppercase">
            Jakarta Outbreak · Transisi Penutup Episode
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-40 bg-black flex flex-col justify-between p-3 sm:p-6 select-none font-pixel overflow-hidden">
      {/* 1. Top Metadata Bar */}
      <div className="flex justify-between items-center z-20 pb-2 border-b border-[#272730]">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-0.5 bg-[#dc2626] text-white text-[10px] tracking-widest font-mono">
            {currentScene.timeTag}
          </span>
          <span className="text-xs text-[#e4e4e7] tracking-wider uppercase hidden sm:inline">
            {currentScene.location}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-[#a1a1aa] font-mono">
            ARSIP KOTA {currentIndex + 1}/{TRANSITION_SCENES.length}
          </span>
          {onToggleMute && (
            <button
              onClick={onToggleMute}
              className="px-2.5 py-1 bg-[#18181f] border border-[#3f3f4e] text-[10px] text-[#a1a1aa] hover:text-white cursor-pointer flex items-center gap-1"
            >
              {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-emerald-400" />}
              <span>{isMuted ? 'MUTE' : 'ON'}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Center Cinematic Image with Ken Burns drift motion & Photo Frame */}
      <div className="relative flex-1 my-2 overflow-hidden border-2 border-[#3f3f46] bg-[#09090b] shadow-[0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center">
        {sceneImages[currentScene.artId] && (
          <img
            src={sceneImages[currentScene.artId]}
            alt={currentScene.title}
            className="w-full h-full object-cover pixel-canvas transform scale-105 transition-transform duration-[7000ms] ease-out hover:scale-110"
            style={{
              imageRendering: 'pixelated',
            }}
          />
        )}

        {/* Retro photographic vignette and scanlines */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/80 via-transparent to-black/40" />
        <div className="crt-overlay absolute inset-0 pointer-events-none opacity-40" />

        {/* Photo Title Overlay */}
        <div className="absolute top-4 left-4 z-10 bg-[#09090b]/85 border-l-4 border-[#dc2626] px-3 py-1.5 backdrop-blur-sm">
          <span className="text-[10px] text-[#f87171] tracking-widest block font-mono">DOKUMENTASI OUTBREAK</span>
          <h3 className="text-sm sm:text-base text-white tracking-wider">{currentScene.title}</h3>
        </div>

        {/* Slide Progress bar inside photo */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/60">
          <div
            className="h-full bg-[#dc2626] transition-all ease-linear"
            style={{ width: `${autoProgress}%` }}
          />
        </div>
      </div>

      {/* 3. Bottom Cutscene Dialogue Box */}
      <div className="z-20 bg-[#0f0f14] border-2 border-[#52525b] p-4 shadow-[0_6px_0_rgba(0,0,0,0.9)]">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-[#f59e0b] tracking-wider font-bold">
            {currentScene.speaker}
          </span>
          <span className="text-[10px] text-[#71717a] font-mono">
            [SPASI / KLIK LANJUT]
          </span>
        </div>

        <p className="text-xs sm:text-sm text-[#e4e4e7] font-sans-ui leading-relaxed min-h-[40px]">
          {currentScene.narration}
        </p>

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#272730]">
          <div className="flex gap-1">
            {TRANSITION_SCENES.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-6 rounded-none transition-colors ${
                  idx === currentIndex
                    ? 'bg-[#dc2626]'
                    : idx < currentIndex
                    ? 'bg-[#4b5563]'
                    : 'bg-[#1f2937]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={advanceScene}
            className="px-4 py-1.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs border border-white flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
          >
            <span>{currentIndex === TRANSITION_SCENES.length - 1 ? 'SELESAIKAN CUTSCENE' : 'LANJUT'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
