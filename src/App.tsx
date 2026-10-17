import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { GameWorld } from './game/GameWorld';
import { sound } from './audio/SoundEngine';
import {
  GameState,
  ChapterId,
  PlayerStats,
  GameQuest,
  ZombieEntity,
  DialogueLine,
} from './types/game';
import { CHAPTER_DIALOGUES } from './data/storyData';
import { TitleScreen } from './components/TitleScreen';
import { GameHUD } from './components/GameHUD';
import { DialogueBox } from './components/DialogueBox';
import { CinematicEnding } from './components/CinematicEnding';
import { CinematicSequence } from './components/CinematicSequence';
import { DossierModal } from './components/DossierModal';
import { Skull, RotateCcw } from 'lucide-react';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const worldRef = useRef<GameWorld | null>(null);

  // High-level App State
  const [gameState, setGameState] = useState<GameState>('title');
  const [chapter, setChapter] = useState<ChapterId>('ch_house');
  const [isMuted, setIsMuted] = useState(false);
  const [dossierOpen, setDossierOpen] = useState(false);

  // Ending flow: cinematic sequence after final dialogue, followed by demo completed popup
  const [showCinematicSequence, setShowCinematicSequence] = useState(false);
  const [showDemoCompletePopup, setShowDemoCompletePopup] = useState(false);

  // Active Dialogue State
  const [activeDialogue, setActiveDialogue] = useState<DialogueLine[] | null>(null);
  const dialogueCallbackRef = useRef<(() => void) | null>(null);

  // In-Game State (Initially NO flashlight, NO mistar besi, empty inventory)
  const [stats, setStats] = useState<PlayerStats>({
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    isSprinting: false,
    flashlightOn: false,
    hasFlashlight: false,
    hasMistarBesi: false,
    kills: 0,
    hasKey: false,
    barricadeCount: 0,
    activeWeapon: {
      id: 'bare_hands',
      name: 'Tangan Kosong',
      damage: 10,
      range: 1.5,
      cooldown: 0.35,
      description: 'Pukulan tangan kosong tanpa senjata.',
    },
    inventory: [],
  });

  const [quest, setQuest] = useState<GameQuest | null>(null);
  const [interactionPrompt, setInteractionPrompt] = useState<string | null>(null);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);
  const notificationTimerRef = useRef<number | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotificationMessage(msg);
    if (notificationTimerRef.current) clearTimeout(notificationTimerRef.current);
    notificationTimerRef.current = window.setTimeout(() => {
      setNotificationMessage(null);
    }, 3200);
  }, []);

  // Proximity item claiming states
  const [canClaimMistar, setCanClaimMistar] = useState(false);
  const [canClaimFlashlight, setCanClaimFlashlight] = useState(false);
  const [canClaimKey, setCanClaimKey] = useState(false);
  const [canClaimMedkit, setCanClaimMedkit] = useState(false);

  // Companions active list for UI (not re-rendered 60fps)
  const [companionsUI, setCompanionsUI] = useState<
    { id: string; name: string; active: boolean }[]
  >([
    { id: 'lia', name: 'Lia', active: false },
    { id: 'rafli', name: 'Rafli', active: false },
    { id: 'farel', name: 'Farel', active: false },
    { id: 'dafa', name: 'Dafa', active: false },
  ]);

  // Mutable refs for physics/positions to avoid React re-render thrashing
  const companionsRef = useRef<
    { id: string; name: string; x: number; z: number; active: boolean }[]
  >([
    { id: 'lia', name: 'Lia', x: -1.2, z: -1.5, active: false },
    { id: 'rafli', name: 'Rafli', x: 2.0, z: -1.2, active: false },
    { id: 'farel', name: 'Farel', x: -2.0, z: -1.2, active: false },
    { id: 'dafa', name: 'Dafa', x: 1.0, z: -1.5, active: false },
  ]);

  const playerPosRef = useRef({ x: 0, z: 0 });
  const moveDirRef = useRef({ x: 0, z: 0 });
  const keysHeld = useRef<Record<string, boolean>>({});
  const attackCooldownRef = useRef(0);
  const hitstopTimerRef = useRef(0);
  const zombiesRef = useRef<ZombieEntity[]>([]);

  // Ref to always hold the latest handleInteract to avoid stale closures in event listeners
  const handleInteractRef = useRef<() => void>(() => {});

  // Initialize Three.js Game World once
  useEffect(() => {
    if (!mountRef.current) return;
    const world = new GameWorld(mountRef.current);
    worldRef.current = world;

    return () => {
      world.dispose();
      worldRef.current = null;
    };
  }, []);

  // Keyboard Listeners (using handleInteractRef to completely prevent stale closure bugs)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysHeld.current[e.code] = true;

      // Space / Enter on Title starts game
      if ((e.code === 'Space' || e.code === 'Enter') && gameState === 'title') {
        startGame('ch_house');
      }

      // Flashlight toggle
      if (e.code === 'KeyF' && gameState === 'playing') {
        toggleFlashlight();
      }

      // Interact trigger (always calls current handleInteractRef)
      if (e.code === 'KeyE' && gameState === 'playing') {
        handleInteractRef.current();
      }

      // Melee Attack trigger
      if (e.code === 'Space' && gameState === 'playing' && !activeDialogue) {
        triggerMeleeAttack();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysHeld.current[e.code] = false;
    };

    const handleBlur = () => {
      keysHeld.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameState, activeDialogue]);

  // Dialogue Trigger Helper
  const triggerDialogue = useCallback((lines: DialogueLine[], onComplete?: () => void) => {
    setActiveDialogue(lines);
    dialogueCallbackRef.current = onComplete || null;
  }, []);

  const handleDialogueFinish = useCallback(() => {
    setActiveDialogue(null);
    if (dialogueCallbackRef.current) {
      const cb = dialogueCallbackRef.current;
      dialogueCallbackRef.current = null;
      cb();
    }
  }, []);

  // Chapter Loader
  const loadChapter = useCallback((targetChapter: ChapterId) => {
    setChapter(targetChapter);
    const world = worldRef.current;
    if (!world) return;

    world.loadChapterEnvironment(targetChapter);

    // 1. SCENE: DEPAN RUMAH DIKA
    if (targetChapter === 'ch_house') {
      playerPosRef.current = { x: 0, z: 1.5 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: 0, z: 0, active: false },
        { id: 'rafli', name: 'Rafli', x: 0, z: 0, active: false },
        { id: 'farel', name: 'Farel', x: 0, z: 0, active: false },
        { id: 'dafa', name: 'Dafa', x: 0, z: 0, active: false },
      ];
      setCompanionsUI([
        { id: 'lia', name: 'Lia', active: false },
        { id: 'rafli', name: 'Rafli', active: false },
        { id: 'farel', name: 'Farel', active: false },
        { id: 'dafa', name: 'Dafa', active: false },
      ]);
      setQuest({
        title: 'Pamit pada Ibu di pintu rumah [E] sebelum berangkat sekolah',
        description: 'Dekati pintu depan rumah Dika dan tekan tombol [E].',
        progress: 0,
        total: 1,
        isDone: false,
      });
      sound.setBGM('peaceful');
    }

    // 2. SCENE: JALAN DI GANG JAKARTA MENUJU SEKOLAH
    else if (targetChapter === 'ch_walk') {
      playerPosRef.current = { x: 0, z: 12 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      setQuest({
        title: 'Jalan menyusuri gang menuju SMA Negeri 03 Jakarta',
        description: 'Gunakan tombol [W] untuk berjalan maju menuju gedung sekolah.',
        progress: 0,
        total: 1,
        isDone: false,
      });
      sound.setBGM('peaceful');
      setTimeout(() => {
        triggerDialogue(CHAPTER_DIALOGUES.ch_walk);
      }, 500);
    }

    // 3. SCENE: GERBANG SMA 03 (Arrival at school gate)
    else if (targetChapter === 'ch_school_gate') {
      playerPosRef.current = { x: 0, z: 3.5 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      // Companions stand in front of gate waiting for Dika
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -1.2, z: -1.5, active: true },
        { id: 'rafli', name: 'Rafli', x: 2.2, z: -1.2, active: true },
        { id: 'farel', name: 'Farel', x: -2.2, z: -1.2, active: true },
        { id: 'dafa', name: 'Dafa', x: 1.0, z: -1.5, active: true },
      ];
      setCompanionsUI([
        { id: 'lia', name: 'Lia', active: true },
        { id: 'rafli', name: 'Rafli', active: true },
        { id: 'farel', name: 'Farel', active: true },
        { id: 'dafa', name: 'Dafa', active: true },
      ]);
      setQuest({
        title: 'Bicara dengan kawan-kawan di depan gerbang SMA 03 [E]',
        description: 'Dekati Dafa, Lia, Rafli, dan Farel lalu tekan [E].',
        progress: 0,
        total: 1,
        isDone: false,
      });
      sound.setBGM('peaceful');
    }

    // 4. SCENE: PEMBELAJARAN FISIKA DI KELAS XII IPA 2
    else if (targetChapter === 'ch_classroom_study') {
      playerPosRef.current = { x: 0, z: 3 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -2.8, z: 1.5, active: true },
        { id: 'rafli', name: 'Rafli', x: 2.8, z: 1.5, active: true },
        { id: 'farel', name: 'Farel', x: -2.8, z: 4.5, active: true },
        { id: 'dafa', name: 'Dafa', x: 2.8, z: 4.5, active: true },
      ];
      setQuest({
        title: 'Ikuti pembelajaran Fisika Pak Budi di depan kelas',
        description: 'Dengarkan penjelasan materi gerak lurus di papan tulis.',
        progress: 0,
        total: 1,
        isDone: false,
      });
      sound.setBGM('peaceful');
      setTimeout(() => {
        triggerDialogue(CHAPTER_DIALOGUES.ch_classroom_study, () => {
          loadChapter('ch_outbreak_12pm');
        });
      }, 500);
    }

    // 5. SCENE: JAM 12.00 SIANG - WABAH PECAH & JERITAN LAPANGAN!
    else if (targetChapter === 'ch_outbreak_12pm') {
      playerPosRef.current = { x: 0, z: 2 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -2.5, z: 0, active: true },
        { id: 'rafli', name: 'Rafli', x: -6.0, z: 6.5, active: true },
        { id: 'farel', name: 'Farel', x: 2.5, z: 0, active: true },
        { id: 'dafa', name: 'Dafa', x: -7.0, z: 7.0, active: true },
      ];
      setQuest({
        title: 'Barikade pintu kelas dengan meja siswa (Tekan [E] dekat pintu)',
        description: 'Tahan gedoran zombie dari luar dengan meja kelas!',
        progress: 0,
        total: 3,
        isDone: false,
      });

      sound.playSchoolBell();
      setTimeout(() => {
        sound.setBGM('horror');
        sound.playZombieGroan(0.85);
        world.addScreenShake(0.5);
        triggerDialogue(CHAPTER_DIALOGUES.ch_outbreak_12pm);
      }, 2000);
    }

    // 6. SCENE: KORIDOR BERDARAH
    else if (targetChapter === 'ch_corridor') {
      playerPosRef.current = { x: 0, z: -18 };
      moveDirRef.current = { x: 0, z: 0 };
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -0.8, z: -19.5, active: true },
        { id: 'rafli', name: 'Rafli', x: 0.8, z: -20, active: true },
        { id: 'farel', name: 'Farel', x: -0.5, z: -21, active: true },
        { id: 'dafa', name: 'Dafa', x: 0.5, z: -17, active: true },
      ];

      zombiesRef.current = [
        {
          id: 1,
          type: 'student',
          x: -1.2,
          z: -8,
          hp: 70,
          maxHp: 70,
          speed: 1.8,
          damage: 15,
          state: 'idle',
          facingAngle: Math.PI,
          animTimer: 0,
          hitFlashTimer: 0,
        },
        {
          id: 2,
          type: 'student',
          x: 1.5,
          z: 2,
          hp: 70,
          maxHp: 70,
          speed: 1.9,
          damage: 15,
          state: 'idle',
          facingAngle: Math.PI,
          animTimer: 0,
          hitFlashTimer: 0,
        },
        {
          id: 3,
          type: 'satpam',
          x: 0,
          z: 14,
          hp: 140,
          maxHp: 140,
          speed: 1.4,
          damage: 25,
          state: 'idle',
          facingAngle: Math.PI,
          animTimer: 0,
          hitFlashTimer: 0,
        },
      ];

      setQuest({
        title: 'Cari Kunci Gerbang Utama di Pos Satpam ujung lorong',
        description: 'Gunakan [F] untuk senter dan [Spasi] untuk menghantam zombie.',
        progress: 0,
        total: 1,
        isDone: false,
      });

      sound.setBGM('action');
      triggerDialogue(CHAPTER_DIALOGUES.ch_corridor);
    }

    // 7. SCENE: GERBANG UTAMA & PENGORBANAN HEROIK DAFA
    else if (targetChapter === 'ch_sacrifice') {
      playerPosRef.current = { x: 0, z: 2 };
      moveDirRef.current = { x: 0, z: 0 };
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -1.5, z: 8, active: true },
        { id: 'rafli', name: 'Rafli', x: 1.5, z: 9, active: true },
        { id: 'farel', name: 'Farel', x: -1.0, z: 10, active: true },
        { id: 'dafa', name: 'Dafa', x: 0, z: -2, active: true },
      ];

      zombiesRef.current = [
        {
          id: 10,
          type: 'runner',
          x: -2.5,
          z: -7,
          hp: 60,
          maxHp: 60,
          speed: 2.8,
          damage: 20,
          state: 'chase',
          facingAngle: 0,
          animTimer: 0,
          hitFlashTimer: 0,
        },
        {
          id: 11,
          type: 'runner',
          x: 2.5,
          z: -9,
          hp: 60,
          maxHp: 60,
          speed: 2.7,
          damage: 20,
          state: 'chase',
          facingAngle: 0,
          animTimer: 0,
          hitFlashTimer: 0,
        },
      ];

      setQuest({
        title: 'Buka gembok Gerbang Utama [E] bersama Rafli!',
        description: 'Dekati gerbang besi sementara Dafa menahan pintu lorong.',
        progress: 0,
        total: 1,
        isDone: false,
      });

      sound.setBGM('action');
      triggerDialogue(CHAPTER_DIALOGUES.ch_sacrifice_intro);
    }

    // 8. SCENE: CAKRAWALA JAKARTA YANG HANCUR
    else if (targetChapter === 'ch_skyline') {
      playerPosRef.current = { x: 0, z: -2 };
      moveDirRef.current = { x: 0, z: 0 };
      zombiesRef.current = [];
      companionsRef.current = [
        { id: 'lia', name: 'Lia', x: -1.8, z: -2.8, active: true },
        { id: 'rafli', name: 'Rafli', x: 1.8, z: -2.6, active: true },
        { id: 'farel', name: 'Farel', x: 0.2, z: -3.8, active: true },
        { id: 'dafa', name: 'Dafa', x: 999, z: 999, active: false },
      ];
      setCompanionsUI([
        { id: 'lia', name: 'Lia', active: true },
        { id: 'rafli', name: 'Rafli', active: true },
        { id: 'farel', name: 'Farel', active: true },
        { id: 'dafa', name: 'Dafa', active: false },
      ]);

      setQuest(null);
      setGameState('cinematic_skyline');
      setShowCinematicSequence(false);
      setShowDemoCompletePopup(false);
      sound.setBGM('skyline');

      setTimeout(() => {
        triggerDialogue(CHAPTER_DIALOGUES.ch_skyline, () => {
          // When final dialogue finishes, launch post-apocalyptic Jakarta transition sequence!
          setShowCinematicSequence(true);
        });
      }, 1500);
    }
  }, [triggerDialogue]);

  const startGame = useCallback((startChapter: ChapterId = 'ch_house') => {
    setGameState('playing');
    setShowCinematicSequence(false);
    setShowDemoCompletePopup(false);
    setStats({
      hp: 100,
      maxHp: 100,
      stamina: 100,
      maxStamina: 100,
      isSprinting: false,
      flashlightOn: false,
      hasFlashlight: false,
      hasMistarBesi: false,
      kills: 0,
      hasKey: false,
      barricadeCount: 0,
      activeWeapon: {
        id: 'bare_hands',
        name: 'Tangan Kosong',
        damage: 10,
        range: 1.5,
        cooldown: 0.35,
        description: 'Pukulan tangan kosong tanpa senjata.',
      },
      inventory: [],
    });

    const world = worldRef.current;
    if (world) {
      world.setFlashlight(false);
      world.setHasWeapon(false);
    }

    loadChapter(startChapter);
  }, [loadChapter]);

  // Flashlight toggle (only works if player has claimed flashlight in classroom!)
  const toggleFlashlight = useCallback(() => {
    if (!stats.hasFlashlight) {
      showNotification('Kamu belum memiliki senter! Cari senter di kelas saat wabah.');
      sound.playInteract();
      return;
    }
    setStats(prev => {
      const next = !prev.flashlightOn;
      const world = worldRef.current;
      if (world) {
        world.setFlashlight(next);
      }
      sound.playInteract();
      return { ...prev, flashlightOn: next };
    });
  }, [stats.hasFlashlight, showNotification]);

  // Audio mute toggle
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Melee attack logic (Space key, Left mouse click, or UI attack button)
  const triggerMeleeAttack = useCallback(() => {
    if (attackCooldownRef.current > 0) return;
    attackCooldownRef.current = stats.activeWeapon.cooldown;

    sound.playSwing();
    worldRef.current?.triggerPlayerAttack();

    const px = playerPosRef.current.x;
    const pz = playerPosRef.current.z;
    const range = stats.hasMistarBesi ? 3.0 : 2.5;

    let hitAny = false;
    zombiesRef.current.forEach(z => {
      if (z.state === 'dead') return;
      const dx = z.x - px;
      const dz = z.z - pz;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (dist <= range) {
        hitAny = true;
        const dmg = stats.hasMistarBesi ? 38 : 22;
        z.hp = Math.max(0, z.hp - dmg);
        z.hitFlashTimer = 0.22;

        // Knockback pushes zombie directly away from Dika
        const pushDist = 0.95;
        if (dist > 0.05) {
          z.x += (dx / dist) * pushDist;
          z.z += (dz / dist) * pushDist;
        } else {
          z.z += pushDist;
        }

        hitstopTimerRef.current = 0.06;
        worldRef.current?.addScreenShake(0.35);
        worldRef.current?.spawnBloodParticles(z.x, 1.2, z.z, 16);
        sound.playHit();

        if (z.hp <= 0) {
          z.state = 'dead';
          setStats(prev => ({ ...prev, kills: prev.kills + 1 }));
          sound.playZombieGroan(1.4);
        }
      }
    });

    if (!hitAny) {
      worldRef.current?.addScreenShake(0.06);
    }
  }, [stats.hasMistarBesi, stats.activeWeapon]);

  // Claim ground items into player inventory
  const claimItem = useCallback((itemId: string) => {
    const world = worldRef.current;

    if (itemId === 'mistar_besi') {
      world?.removeItemPickup('mistar_besi');
      world?.setHasWeapon(true);
      setStats(prev => ({
        ...prev,
        hasMistarBesi: true,
        activeWeapon: {
          id: 'mistar_besi',
          name: 'Mistar Besi Penggaris SMA',
          damage: 38,
          range: 2.2,
          cooldown: 0.28,
          description: 'Penggaris besi guru fisika yang kokoh untuk menangkis zombie.',
        },
        inventory: [
          ...prev.inventory.filter(i => i.id !== 'mistar_besi'),
          {
            id: 'mistar_besi',
            name: 'Mistar Besi Fisika',
            category: 'weapon',
            icon: 'ruler',
            description: 'Penggaris besi guru fisika SMA 03 untuk menangkis zombie.',
          },
        ],
      }));
      sound.playPickup();
      showNotification('Mistar Besi guru berhasil diambil! Serangan melee meningkat (+38 DMG).');
    } else if (itemId === 'flashlight') {
      world?.removeItemPickup('flashlight');
      world?.setFlashlight(true);
      setStats(prev => ({
        ...prev,
        hasFlashlight: true,
        flashlightOn: true,
        inventory: [
          ...prev.inventory.filter(i => i.id !== 'flashlight'),
          {
            id: 'flashlight',
            name: 'Senter Sekolah',
            category: 'tool',
            icon: 'flashlight',
            description: 'Senter darurat sekolah. Tekan [F] untuk penerangan.',
          },
        ],
      }));
      sound.playPickup();
      showNotification('Senter sekolah berhasil diambil! Tekan [F] untuk hidupkan/matikan.');
    } else if (itemId === 'school_key') {
      world?.removeItemPickup('school_key');
      setStats(prev => ({
        ...prev,
        hasKey: true,
        inventory: [
          ...prev.inventory.filter(i => i.id !== 'school_key'),
          {
            id: 'school_key',
            name: 'Kunci Gerbang Utama',
            category: 'key',
            icon: 'key',
            description: 'Kunci gembok gerbang keluar SMA 03 dari Pos Satpam.',
          },
        ],
      }));
      sound.playPickup();
      showNotification('Kunci Gerbang Utama ditemukan di Pos Satpam!');
    } else if (itemId === 'medkit') {
      world?.removeItemPickup('medkit');
      setStats(prev => ({
        ...prev,
        hp: prev.maxHp,
        inventory: [
          ...prev.inventory.filter(i => i.id !== 'medkit'),
          {
            id: 'medkit',
            name: 'Kotak P3K PMR',
            category: 'heal',
            icon: 'medkit',
            description: 'Kotak obat P3K perban medis dari UKS/PMR.',
          },
        ],
      }));
      sound.playPickup();
      showNotification('Kotak P3K digunakan! HP Dika pulih maksimal (100/100).');
    }
  }, [showNotification]);

  // Reliable Interaction Handler [E]
  const handleInteract = useCallback(() => {
    if (activeDialogue) return;
    const px = playerPosRef.current.x;
    const pz = playerPosRef.current.z;

    // 1. Depan Rumah Dika
    if (chapter === 'ch_house') {
      sound.playInteract();
      triggerDialogue(CHAPTER_DIALOGUES.ch_house, () => {
        loadChapter('ch_walk');
      });
    }

    // 2. Gerbang SMA 03: Bicara dengan Kawan-kawan (FIXED: Rock-solid trigger!)
    else if (chapter === 'ch_school_gate') {
      sound.playInteract();
      triggerDialogue(CHAPTER_DIALOGUES.ch_school_gate, () => {
        loadChapter('ch_classroom_study');
      });
    }

    // 3. Jam 12.00 Di Kelas (Claim Mistar / Senter / Barikade Meja)
    else if (chapter === 'ch_outbreak_12pm') {
      const nearMistar = !stats.hasMistarBesi && Math.hypot(px - 0, pz - (-6.0)) < 2.8;
      const nearFlashlight = !stats.hasFlashlight && Math.hypot(px - 6.0, pz - 2.0) < 2.8;

      if (nearMistar) {
        claimItem('mistar_besi');
        return;
      }
      if (nearFlashlight) {
        claimItem('flashlight');
        return;
      }

      // Barricade door
      if (stats.barricadeCount < 3) {
        const nextCount = stats.barricadeCount + 1;
        setStats(prev => ({ ...prev, barricadeCount: nextCount }));
        setQuest(prev => (prev ? { ...prev, progress: nextCount } : null));
        sound.playBarricade();
        worldRef.current?.addScreenShake(0.25);

        if (nextCount >= 3) {
          setTimeout(() => {
            loadChapter('ch_corridor');
          }, 1200);
        }
      }
    }

    // 4. Pos Satpam di Koridor & Medkit
    else if (chapter === 'ch_corridor') {
      const distToSatpam = Math.hypot(px - 0, pz - 14.5);
      const distToMedkit = Math.hypot(px - (-2.2), pz - 2.0);

      if (distToSatpam < 3.5 && !stats.hasKey) {
        claimItem('school_key');
        setQuest({
          title: 'Kunci Gerbang didapat! Berjalan ke pintu keluar sekolah',
          description: 'Lanjutkan ke pintu keluar di ujung koridor.',
          progress: 1,
          total: 1,
          isDone: true,
        });

        setTimeout(() => {
          loadChapter('ch_sacrifice');
        }, 1200);
        return;
      }

      if (distToMedkit < 2.8) {
        claimItem('medkit');
        return;
      }
    }

    // 5. Gerbang Sekolah & Pengorbanan Heroik Dafa
    else if (chapter === 'ch_sacrifice') {
      if (pz > 6.5) {
        sound.playInteract();
        sound.setBGM('tragedy');
        triggerDialogue(CHAPTER_DIALOGUES.ch_sacrifice_climax, () => {
          loadChapter('ch_skyline');
        });
      }
    }
  }, [chapter, activeDialogue, stats.barricadeCount, stats.hasMistarBesi, stats.hasFlashlight, stats.hasKey, claimItem, triggerDialogue, loadChapter]);

  // Keep handleInteractRef continuously up to date
  useEffect(() => {
    handleInteractRef.current = handleInteract;
  });

  // Main 60fps Game Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      animId = requestAnimationFrame(loop);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);

      const world = worldRef.current;
      if (!world) return;

      if (hitstopTimerRef.current > 0) {
        hitstopTimerRef.current -= dt;
        return;
      }

      if (attackCooldownRef.current > 0) {
        attackCooldownRef.current -= dt;
      }

      // 4-Directional Player Movement
      let isMoving = false;
      let moveX = 0;
      let moveZ = 0;

      if (gameState === 'playing' && !activeDialogue) {
        if (keysHeld.current['KeyW'] || keysHeld.current['ArrowUp']) moveZ -= 1;
        if (keysHeld.current['KeyS'] || keysHeld.current['ArrowDown']) moveZ += 1;
        if (keysHeld.current['KeyA'] || keysHeld.current['ArrowLeft']) moveX -= 1;
        if (keysHeld.current['KeyD'] || keysHeld.current['ArrowRight']) moveX += 1;

        if (moveX !== 0 || moveZ !== 0) {
          isMoving = true;
          const mag = Math.sqrt(moveX * moveX + moveZ * moveZ);
          moveX /= mag;
          moveZ /= mag;
          moveDirRef.current = { x: moveX, z: moveZ };

          const isSprinting = !!keysHeld.current['ShiftLeft'] && stats.stamina > 5;
          const speed = isSprinting ? 7.2 : 4.4;

          playerPosRef.current.x += moveX * speed * dt;
          playerPosRef.current.z += moveZ * speed * dt;

          if (Math.random() < 0.12) {
            sound.playFootstep();
          }

          if (isSprinting) {
            setStats(prev => ({
              ...prev,
              stamina: Math.max(0, prev.stamina - dt * 25),
              isSprinting: true,
            }));
          }
        } else {
          setStats(prev => ({
            ...prev,
            stamina: Math.min(prev.maxStamina, prev.stamina + dt * 20),
            isSprinting: false,
          }));
        }

        // Automatic street walk trigger towards school building
        if (chapter === 'ch_walk' && playerPosRef.current.z < -8) {
          loadChapter('ch_school_gate');
        }

        // Scene Boundaries
        if (chapter === 'ch_house') {
          playerPosRef.current.x = Math.max(-5, Math.min(5, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-1, Math.min(6, playerPosRef.current.z));
        } else if (chapter === 'ch_walk') {
          playerPosRef.current.x = Math.max(-3.5, Math.min(3.5, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-10, Math.min(14, playerPosRef.current.z));
        } else if (chapter === 'ch_school_gate') {
          playerPosRef.current.x = Math.max(-7, Math.min(7, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-2, Math.min(6, playerPosRef.current.z));
        } else if (chapter === 'ch_outbreak_12pm' || chapter === 'ch_classroom_study') {
          playerPosRef.current.x = Math.max(-9, Math.min(9, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-6, Math.min(7.5, playerPosRef.current.z));
        } else if (chapter === 'ch_corridor') {
          playerPosRef.current.x = Math.max(-3.0, Math.min(3.0, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-20, Math.min(18, playerPosRef.current.z));
        } else if (chapter === 'ch_sacrifice') {
          playerPosRef.current.x = Math.max(-8, Math.min(8, playerPosRef.current.x));
          playerPosRef.current.z = Math.max(-10, Math.min(11, playerPosRef.current.z));
        }
      }

      // Companion Follow AI
      const px = playerPosRef.current.x;
      const pz = playerPosRef.current.z;

      if (chapter !== 'ch_school_gate' && chapter !== 'ch_classroom_study') {
        companionsRef.current.forEach((c, i) => {
          if (!c.active) return;
          const angle = (i / 4) * Math.PI * 1.5 + Math.PI * 0.7;
          const targetX = px + Math.sin(angle) * 1.6;
          const targetZ = pz + Math.cos(angle) * 1.6;

          const dx = targetX - c.x;
          const dz = targetZ - c.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist > 0.4) {
            const step = Math.min(dist, 4.0 * dt);
            c.x += (dx / dist) * step;
            c.z += (dz / dist) * step;
          }
        });
      }

      // Zombie AI (Paused and set to 'idle' during active cutscene dialogue or non-playing states)
      const zombies = zombiesRef.current;
      if (activeDialogue || gameState !== 'playing') {
        // Explicitly set zombie states to 'idle' and pause logic updates while cutscene dialogue is active
        zombies.forEach(z => {
          if (z.state !== 'dead') {
            z.state = 'idle';
            z.animTimer = 0;
          }
        });
      } else {
        zombies.forEach(z => {
          if (z.state === 'dead') return;

          if (z.hitFlashTimer > 0) {
            z.hitFlashTimer -= dt;
          }

          const dx = px - z.x;
          const dz = pz - z.z;
          const dist = Math.sqrt(dx * dx + dz * dz);

          if (dist < 10) {
            z.state = 'chase';
          }

          if (z.state === 'chase') {
            if (dist > 1.2) {
              z.x += (dx / dist) * z.speed * dt;
              z.z += (dz / dist) * z.speed * dt;
            } else {
              z.animTimer += dt;
              if (z.animTimer >= 1.0) {
                z.animTimer = 0;
                sound.playHit();
                sound.playZombieGroan(1.1);
                world.addScreenShake(0.45);
                world.spawnBloodParticles(px, 1.0, pz, 8);

                setStats(prev => {
                  const nextHp = Math.max(0, prev.hp - z.damage);
                  if (nextHp <= 0) {
                    setGameState('game_over');
                  }
                  return { ...prev, hp: nextHp };
                });
              }
            }
          }
        });
      }

      // Contextual Interaction Prompts & Proximity item detection
      if (gameState === 'playing') {
        if (chapter === 'ch_house') {
          setInteractionPrompt('Pamit Berangkat Sekolah ke Ibu');
          setCanClaimMistar(false);
          setCanClaimFlashlight(false);
          setCanClaimKey(false);
          setCanClaimMedkit(false);
        } else if (chapter === 'ch_school_gate') {
          setInteractionPrompt('Bicara dengan Kawan-Kawan di Gerbang');
          setCanClaimMistar(false);
          setCanClaimFlashlight(false);
          setCanClaimKey(false);
          setCanClaimMedkit(false);
        } else if (chapter === 'ch_outbreak_12pm') {
          const nearM = !stats.hasMistarBesi && Math.hypot(px - 0, pz - (-6.0)) < 2.8;
          const nearF = !stats.hasFlashlight && Math.hypot(px - 6.0, pz - 2.0) < 2.8;
          setCanClaimMistar(nearM);
          setCanClaimFlashlight(nearF);
          setCanClaimKey(false);
          setCanClaimMedkit(false);

          if (nearM) {
            setInteractionPrompt('Ambil Mistar Besi Guru di Meja');
          } else if (nearF) {
            setInteractionPrompt('Ambil Senter Sekolah');
          } else if (stats.barricadeCount < 3) {
            setInteractionPrompt(`Barikade Pintu Kelas (${stats.barricadeCount}/3)`);
          } else {
            setInteractionPrompt(null);
          }
        } else if (chapter === 'ch_corridor') {
          const distToSatpam = Math.hypot(px - 0, pz - 14.5);
          const distToMedkit = Math.hypot(px - (-2.2), pz - 2.0);
          const nearK = !stats.hasKey && distToSatpam < 3.5;
          const nearMed = distToMedkit < 2.8;
          setCanClaimKey(nearK);
          setCanClaimMedkit(nearMed);
          setCanClaimMistar(false);
          setCanClaimFlashlight(false);

          if (nearK) {
            setInteractionPrompt('Ambil Kunci Gerbang di Pos Satpam');
          } else if (nearMed) {
            setInteractionPrompt('Ambil Kotak P3K PMR');
          } else {
            setInteractionPrompt(null);
          }
        } else if (chapter === 'ch_sacrifice') {
          const distToGate = Math.hypot(px - 0, pz - 9);
          setInteractionPrompt(distToGate < 4.5 ? 'Buka Gembok Gerbang Sekolah' : null);
          setCanClaimMistar(false);
          setCanClaimFlashlight(false);
          setCanClaimKey(false);
          setCanClaimMedkit(false);
        } else {
          setInteractionPrompt(null);
          setCanClaimMistar(false);
          setCanClaimFlashlight(false);
          setCanClaimKey(false);
          setCanClaimMedkit(false);
        }
      }

      // World update
      world.update(
        dt,
        px,
        pz,
        isMoving,
        moveDirRef.current,
        companionsRef.current,
        zombies
      );
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [gameState, chapter, activeDialogue, stats.barricadeCount, stats.hasMistarBesi, stats.hasFlashlight, stats.hasKey, loadChapter]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black font-sans-ui select-none">
      {/* 1. 2.5D WebGL Canvas (Clicking/Tapping screen triggers attack) */}
      <div
        ref={mountRef}
        className="absolute inset-0 z-0 cursor-crosshair"
        onPointerDown={(e) => {
          if (e.button === 0 && gameState === 'playing' && !activeDialogue) {
            triggerMeleeAttack();
          }
        }}
      />

      {/* 2. CRT Scanline & Dark Vignette */}
      <div className="crt-overlay absolute inset-0 z-10 pointer-events-none" />
      <div className="vignette-overlay absolute inset-0 z-10 pointer-events-none" />

      {/* 3. Title Screen */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={startGame}
          onOpenDossier={() => setDossierOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 4. Active In-Game Retro HUD */}
      {gameState === 'playing' && (
        <GameHUD
          stats={stats}
          quest={quest}
          chapter={chapter}
          companions={companionsUI}
          interactionPrompt={interactionPrompt}
          notificationMessage={notificationMessage}
          isMuted={isMuted}
          canClaimMistar={canClaimMistar}
          canClaimFlashlight={canClaimFlashlight}
          canClaimKey={canClaimKey}
          canClaimMedkit={canClaimMedkit}
          onClaimItem={claimItem}
          onInteractClick={handleInteract}
          onAttack={triggerMeleeAttack}
          onToggleMute={handleToggleMute}
          onToggleFlashlight={toggleFlashlight}
          onOpenDossier={() => setDossierOpen(true)}
        />
      )}

      {/* 5. RPG Story Dialogue Overlay with Pixel Portraits */}
      {activeDialogue && (
        <DialogueBox dialogue={activeDialogue} onFinish={handleDialogueFinish} />
      )}

      {/* 6. Grand Ruined Jakarta Skyline Ending Header (during dialogue before transition sequence) */}
      {gameState === 'cinematic_skyline' && !showCinematicSequence && !showDemoCompletePopup && (
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none select-none font-pixel">
          <div className="bg-[#0f0f14]/90 border-2 border-[#dc2626] p-3 text-left shadow-[0_4px_0_rgba(0,0,0,0.8)] backdrop-blur-sm pointer-events-auto">
            <span className="text-[11px] text-[#f43f5e] tracking-widest block font-bold">
              JALUR FLYOVER UTARA · CAKRAWALA KOTA JAKARTA
            </span>
            <span className="text-xs text-[#a1a1aa] font-sans-ui block mt-0.5">
              Pukul 17:45 WIB · Senja Pertama Kejatuhan Ibukota
            </span>
          </div>

          <button
            onClick={handleToggleMute}
            className="px-3 py-1.5 bg-[#18181f]/90 border border-[#3f3f4e] text-xs text-[#a1a1aa] hover:text-white cursor-pointer pointer-events-auto"
          >
            [ AUDIO: {isMuted ? 'MUTE' : 'ON'} ]
          </button>
        </div>
      )}

      {/* Post-Apocalyptic Jakarta Transition Images Sequence */}
      {showCinematicSequence && (
        <CinematicSequence
          onComplete={() => {
            setShowCinematicSequence(false);
            setShowDemoCompletePopup(true);
          }}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Demo Completed Popup Modal */}
      {showDemoCompletePopup && (
        <CinematicEnding
          stats={stats}
          onRestart={() => startGame('ch_house')}
          onOpenDossier={() => setDossierOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* 7. Game Over Screen */}
      {gameState === 'game_over' && (
        <div className="absolute inset-0 z-50 bg-[#1a0505]/95 flex flex-col items-center justify-center p-6 text-center font-pixel">
          <Skull className="w-16 h-16 text-[#dc2626] animate-pulse mb-3" />
          <h2 className="text-3xl sm:text-4xl text-white mb-2 tracking-widest">
            KAMU TERINFEKSI
          </h2>
          <p className="text-xs sm:text-sm text-[#d4d4d8] font-sans-ui max-w-md mb-6 leading-relaxed">
            Dika terluka parah oleh gigitan zombie di koridor SMA Jakarta 03.
            Virus menyebar cepat ke seluruh pembuluh darah dalam hitungan detik.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => startGame(chapter)}
              className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white text-xs border border-white flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> ULANGI BAB INI
            </button>
            <button
              onClick={() => setGameState('title')}
              className="px-5 py-2.5 bg-[#18181f] hover:bg-[#272738] text-[#a1a1aa] hover:text-white text-xs border border-[#3f3f4e] cursor-pointer"
            >
              MENU UTAMA
            </button>
          </div>
        </div>
      )}

      {/* 8. Character Archive & Dossier Modal */}
      <DossierModal isOpen={dossierOpen} onClose={() => setDossierOpen(false)} />
    </div>
  );
}
