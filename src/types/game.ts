export type GameState = 
  | 'title' 
  | 'playing' 
  | 'dialogue' 
  | 'cinematic_skyline' 
  | 'game_over' 
  | 'demo_cleared';

export type ChapterId = 
  | 'ch_house'           // 1. Depan Rumah Dika, pamit berangkat sekolah
  | 'ch_walk'            // 2. Perjalanan di gang Jakarta menuju SMA 03
  | 'ch_school_gate'     // 3. Tiba di gerbang SMA 03, bertemu kawan-kawan
  | 'ch_classroom_study' // 4. Pembelajaran di kelas XII IPA 2 bersama Pak Budi
  | 'ch_outbreak_12pm'   // 5. Jam 12.00 Siang, bel istirahat & jeritan pecah!
  | 'ch_corridor'        // 6. Koridor berdarah & pos satpam
  | 'ch_sacrifice'       // 7. Pengorbanan heroik Dafa di gerbang
  | 'ch_skyline';        // 8. Ending: Cakrawala Jakarta yang hancur & Monas terbakar

export interface CharacterProfile {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'alive' | 'deceased' | 'missing';
  portraitColor: string;
  schoolUniform: string;
}

export interface DialogueLine {
  speaker: string;
  role?: string;
  portrait: string;
  text: string;
  voicePitch?: number;
  emotion?: 'normal' | 'shock' | 'crying' | 'determined' | 'heroic';
}

export interface Weapon {
  id: string;
  name: string;
  damage: number;
  range: number;
  cooldown: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'weapon' | 'tool' | 'key' | 'heal';
  icon: string;
  description: string;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  flashlightOn: boolean;
  hasFlashlight: boolean;
  hasMistarBesi: boolean;
  kills: number;
  hasKey: boolean;
  barricadeCount: number;
  activeWeapon: Weapon;
  inventory: InventoryItem[];
}

export interface ZombieEntity {
  id: number;
  type: 'student' | 'satpam' | 'runner';
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  state: 'idle' | 'chase' | 'attack' | 'dead';
  facingAngle: number;
  animTimer: number;
  hitFlashTimer: number;
  spriteMesh?: any;
}

export interface GameQuest {
  title: string;
  description: string;
  progress: number;
  total: number;
  isDone: boolean;
}
