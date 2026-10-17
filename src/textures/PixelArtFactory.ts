import * as THREE from 'three';

/**
 * PixelArtFactory creates authentic, handcrafted 2D pixel art textures,
 * 4-directional character sprite sheets (Up, Down, Left, Right),
 * 48x48 pixel dialogue face portraits (zero emojis),
 * and Indonesian school buildings & props.
 */
export class PixelArtFactory {
  private static cache: Map<string, THREE.CanvasTexture> = new Map();

  private static makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return [canvas, ctx];
  }

  private static toTexture(canvas: HTMLCanvasElement, key?: string): THREE.CanvasTexture {
    const tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    if (key) {
      this.cache.set(key, tex);
    }
    return tex;
  }

  private static pRect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  // -------------------------------------------------------------
  // 1. FOUR-DIRECTIONAL DIKA SPRITES (Up, Down, Left, Right)
  // -------------------------------------------------------------

  public static getDikaDirectionalSprite(
    dir: 'down' | 'up' | 'left' | 'right',
    anim: 'idle1' | 'idle2' | 'walk1' | 'walk2' | 'attack',
    hasWeapon: boolean = false
  ): THREE.CanvasTexture {
    const key = `dika_${dir}_${anim}_${hasWeapon ? 'wpn' : 'nowpn'}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(32, 48);
    ctx.clearRect(0, 0, 32, 48);

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.ellipse(16, 45, 10, 3.2, 0, 0, Math.PI * 2);
    ctx.fill();

    const isWalk1 = anim === 'walk1';
    const isWalk2 = anim === 'walk2';
    const isIdle2 = anim === 'idle2'; // Breathing bob
    const bob = isIdle2 ? 1 : 0;

    // --- DIRECTION: DOWN (MUNDUR / FACING CAMERA) ---
    if (dir === 'down') {
      const lOff = isWalk1 ? -2 : isWalk2 ? 2 : 0;
      const rOff = isWalk1 ? 2 : isWalk2 ? -2 : 0;

      // Shoes
      this.pRect(ctx, '#0f172a', 11, 42 + lOff, 4, 3);
      this.pRect(ctx, '#0f172a', 17, 42 + rOff, 4, 3);

      // Grey trousers
      this.pRect(ctx, '#475569', 11, 28 + bob, 4, 14 + lOff - bob);
      this.pRect(ctx, '#475569', 17, 28 + bob, 4, 14 + rOff - bob);

      // Backpack straps & back peek
      this.pRect(ctx, '#1e3a8a', 8, 16 + bob, 2, 10);
      this.pRect(ctx, '#1e3a8a', 22, 16 + bob, 2, 10);

      // White shirt
      this.pRect(ctx, '#f8fafc', 10, 16 + bob, 12, 12);
      this.pRect(ctx, '#cbd5e1', 10, 26 + bob, 12, 2);

      // Tie & OSIS Badge
      this.pRect(ctx, '#64748b', 15, 18 + bob, 2, 7);
      this.pRect(ctx, '#dc2626', 12, 19 + bob, 2, 3);
      this.pRect(ctx, '#f8fafc', 12, 20 + bob, 2, 1);

      // Arms & Weapon
      if (anim === 'attack') {
        this.pRect(ctx, '#f8fafc', 21, 14 + bob, 3, 4);
        this.pRect(ctx, '#dcae86', 23, 11 + bob, 3, 4);
        if (hasWeapon) {
          this.pRect(ctx, '#94a3b8', 21, 2 + bob, 3, 16);
          this.pRect(ctx, '#f1f5f9', 22, 2 + bob, 1, 16);
        } else {
          // Punch fist
          this.pRect(ctx, '#dcae86', 23, 8 + bob, 4, 4);
        }
      } else {
        this.pRect(ctx, '#f8fafc', 8, 17 + bob, 3, 4);
        this.pRect(ctx, '#dcae86', 8, 21 + bob, 3, 6);
        this.pRect(ctx, '#f8fafc', 21, 17 + bob, 3, 4);
        this.pRect(ctx, '#dcae86', 21, 21 + bob, 3, 6);
        if (hasWeapon) {
          this.pRect(ctx, '#94a3b8', 23, 18 + bob, 2, 14); // Weapon resting
        }
      }

      // Head & Face
      this.pRect(ctx, '#dcae86', 14, 14 + bob, 4, 2);
      this.pRect(ctx, '#fcd34d', 11, 7 + bob, 10, 7);
      this.pRect(ctx, '#dcae86', 11, 9 + bob, 10, 5);

      // Eyes
      this.pRect(ctx, '#0f172a', 13, 10 + bob, 2, 2);
      this.pRect(ctx, '#0f172a', 17, 10 + bob, 2, 2);
      this.pRect(ctx, '#ffffff', 13, 10 + bob, 1, 1);
      this.pRect(ctx, '#ffffff', 17, 10 + bob, 1, 1);

      // Hair
      this.pRect(ctx, '#171717', 10, 4 + bob, 12, 4);
      this.pRect(ctx, '#171717', 9, 6 + bob, 3, 5);
      this.pRect(ctx, '#171717', 20, 6 + bob, 3, 5);
      this.pRect(ctx, '#262626', 12, 5 + bob, 4, 2);
    }

    // --- DIRECTION: UP (MAJU / MEMBELAKANGI KAMERA MENUJU DEPAN) ---
    else if (dir === 'up') {
      const lOff = isWalk1 ? -2 : isWalk2 ? 2 : 0;
      const rOff = isWalk1 ? 2 : isWalk2 ? -2 : 0;

      // Shoes
      this.pRect(ctx, '#0f172a', 11, 42 + lOff, 4, 3);
      this.pRect(ctx, '#0f172a', 17, 42 + rOff, 4, 3);

      // Grey trousers back
      this.pRect(ctx, '#475569', 11, 28 + bob, 4, 14 + lOff - bob);
      this.pRect(ctx, '#475569', 17, 28 + bob, 4, 14 + rOff - bob);

      // White shirt back
      this.pRect(ctx, '#f8fafc', 10, 16 + bob, 12, 12);

      // NAVY BACKPACK (Prominent in back view)
      this.pRect(ctx, '#1e3a8a', 9, 17 + bob, 14, 10);
      this.pRect(ctx, '#1d4ed8', 11, 19 + bob, 10, 6); // Pocket
      this.pRect(ctx, '#60a5fa', 14, 20 + bob, 4, 1); // Zipper

      // Arms from back
      this.pRect(ctx, '#f8fafc', 7, 17 + bob, 3, 4);
      this.pRect(ctx, '#dcae86', 7, 21 + bob, 3, 5);
      this.pRect(ctx, '#f8fafc', 22, 17 + bob, 3, 4);
      this.pRect(ctx, '#dcae86', 22, 21 + bob, 3, 5);

      if (hasWeapon) {
        if (anim === 'attack') {
          this.pRect(ctx, '#94a3b8', 23, 4 + bob, 3, 18);
        } else {
          this.pRect(ctx, '#94a3b8', 24, 16 + bob, 2, 14);
        }
      }

      // Back of head & hair (no face visible!)
      this.pRect(ctx, '#dcae86', 14, 14 + bob, 4, 2);
      this.pRect(ctx, '#171717', 10, 4 + bob, 12, 11);
      this.pRect(ctx, '#262626', 12, 6 + bob, 8, 3); // Hair shine
    }

    // --- DIRECTION: LEFT (PROFILE VIEW FACING LEFT) ---
    else if (dir === 'left') {
      const stepOff = isWalk1 ? 3 : isWalk2 ? -3 : 0;

      // Shoes
      this.pRect(ctx, '#0f172a', 12 - stepOff, 42, 5, 3);
      this.pRect(ctx, '#0f172a', 15 + stepOff, 42, 4, 3);

      // Grey trousers side
      this.pRect(ctx, '#475569', 13 - stepOff, 28 + bob, 4, 14 - bob);
      this.pRect(ctx, '#334155', 15 + stepOff, 28 + bob, 4, 14 - bob);

      // White shirt
      this.pRect(ctx, '#f8fafc', 12, 16 + bob, 8, 12);

      // Backpack on back (right side of character)
      this.pRect(ctx, '#1e3a8a', 18, 17 + bob, 5, 9);

      // Left Arm & weapon
      this.pRect(ctx, '#f8fafc', 13, 17 + bob, 4, 4);
      this.pRect(ctx, '#dcae86', 12 - (isWalk1 ? 2 : 0), 21 + bob, 3, 6);

      if (hasWeapon) {
        if (anim === 'attack') {
          this.pRect(ctx, '#94a3b8', 6, 8 + bob, 12, 3);
        } else {
          this.pRect(ctx, '#94a3b8', 11, 22 + bob, 2, 14);
        }
      }

      // Head Profile facing left
      this.pRect(ctx, '#fcd34d', 11, 7 + bob, 8, 8);
      this.pRect(ctx, '#0f172a', 11, 10 + bob, 2, 2); // Left eye
      this.pRect(ctx, '#171717', 12, 4 + bob, 9, 6); // Hair
      this.pRect(ctx, '#171717', 9, 6 + bob, 4, 4); // Hair fringe left
    }

    // --- DIRECTION: RIGHT (PROFILE VIEW FACING RIGHT) ---
    else if (dir === 'right') {
      const stepOff = isWalk1 ? 3 : isWalk2 ? -3 : 0;

      // Shoes
      this.pRect(ctx, '#0f172a', 14 + stepOff, 42, 5, 3);
      this.pRect(ctx, '#0f172a', 11 - stepOff, 42, 4, 3);

      // Grey trousers side
      this.pRect(ctx, '#475569', 14 + stepOff, 28 + bob, 4, 14 - bob);
      this.pRect(ctx, '#334155', 12 - stepOff, 28 + bob, 4, 14 - bob);

      // White shirt
      this.pRect(ctx, '#f8fafc', 12, 16 + bob, 8, 12);

      // Backpack on back (left side of character)
      this.pRect(ctx, '#1e3a8a', 9, 17 + bob, 5, 9);

      // Right Arm & weapon
      this.pRect(ctx, '#f8fafc', 14, 17 + bob, 4, 4);
      this.pRect(ctx, '#dcae86', 16 + (isWalk1 ? 2 : 0), 21 + bob, 3, 6);

      if (hasWeapon) {
        if (anim === 'attack') {
          this.pRect(ctx, '#94a3b8', 14, 8 + bob, 12, 3);
        } else {
          this.pRect(ctx, '#94a3b8', 18, 22 + bob, 2, 14);
        }
      }

      // Head Profile facing right
      this.pRect(ctx, '#fcd34d', 13, 7 + bob, 8, 8);
      this.pRect(ctx, '#0f172a', 19, 10 + bob, 2, 2); // Right eye
      this.pRect(ctx, '#171717', 11, 4 + bob, 9, 6); // Hair
      this.pRect(ctx, '#171717', 19, 6 + bob, 4, 4); // Hair fringe right
    }

    return this.toTexture(canvas, key);
  }

  // -------------------------------------------------------------
  // MELEE SLASH EFFECT SPRITE (Arc crescent slash on attack)
  // -------------------------------------------------------------
  public static getSlashEffectSprite(hasWeapon: boolean): THREE.CanvasTexture {
    const key = `slash_fx_${hasWeapon ? 'wpn' : 'fist'}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(48, 48);
    ctx.clearRect(0, 0, 48, 48);

    if (hasWeapon) {
      // Steel Ruler sharp metallic crescent slash arc
      const grad = ctx.createLinearGradient(6, 6, 42, 42);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
      grad.addColorStop(0.35, 'rgba(56, 189, 248, 0.9)');
      grad.addColorStop(0.7, 'rgba(14, 165, 233, 0.6)');
      grad.addColorStop(1, 'rgba(2, 132, 199, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(24, 24, 18, -Math.PI * 0.75, Math.PI * 0.25);
      ctx.stroke();

      // Sharp white glint spark
      this.pRect(ctx, '#ffffff', 32, 8, 4, 4);
      this.pRect(ctx, '#38bdf8', 34, 6, 2, 8);
      this.pRect(ctx, '#38bdf8', 30, 8, 6, 2);
      this.pRect(ctx, '#ffffff', 14, 34, 3, 3);
    } else {
      // Fist punch impact shockwave (concentric orange/yellow shock burst)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.95)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(24, 24, 15, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(254, 240, 138, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, 24, 9, 0, Math.PI * 2);
      ctx.stroke();

      this.pRect(ctx, '#ffffff', 22, 22, 5, 5);
    }

    return this.toTexture(canvas, key);
  }

  // -------------------------------------------------------------
  // ITEM GROUND PICKUP SPRITES (Mistar, Senter, Kunci, P3K)
  // -------------------------------------------------------------

  public static getItemPickupSprite(type: 'mistar' | 'flashlight' | 'key' | 'medkit'): THREE.CanvasTexture {
    const key = `pickup_${type}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(32, 32);
    ctx.clearRect(0, 0, 32, 32);

    // Subtle glow circle
    ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, Math.PI * 2);
    ctx.fill();

    if (type === 'mistar') {
      // Shiny Steel Ruler
      this.pRect(ctx, '#94a3b8', 6, 14, 20, 4);
      this.pRect(ctx, '#f8fafc', 8, 15, 16, 1); // Glint
      // Tick marks
      for (let tx = 8; tx < 24; tx += 3) {
        this.pRect(ctx, '#0f172a', tx, 14, 1, 2);
      }
    } else if (type === 'flashlight') {
      // Black & Yellow school flashlight
      this.pRect(ctx, '#18181b', 7, 13, 14, 6);
      this.pRect(ctx, '#eab308', 21, 11, 4, 10); // Bezel
      this.pRect(ctx, '#fef08a', 25, 12, 2, 8); // Lens
      this.pRect(ctx, '#eab308', 11, 13, 2, 6); // Grip ring
    } else if (type === 'key') {
      // Brass Gate Key
      this.pRect(ctx, '#f59e0b', 8, 14, 16, 4);
      this.pRect(ctx, '#f59e0b', 6, 12, 6, 8); // Key ring
      this.pRect(ctx, '#000000', 8, 14, 2, 4); // Ring hole
      this.pRect(ctx, '#f59e0b', 20, 18, 2, 4); // Tooth 1
      this.pRect(ctx, '#f59e0b', 23, 18, 2, 3); // Tooth 2
    } else if (type === 'medkit') {
      // PMR Medical Box
      this.pRect(ctx, '#ffffff', 8, 10, 16, 14);
      this.pRect(ctx, '#ef4444', 14, 13, 4, 8);
      this.pRect(ctx, '#ef4444', 12, 15, 8, 4);
    }

    return this.toTexture(canvas, key);
  }

  private static portraitDataUrls: Map<string, string> = new Map();

  // -------------------------------------------------------------
  // 2. HANDCRAFTED 48x48 PIXEL ART FACE PORTRAITS (ZERO EMOJIS!)
  // -------------------------------------------------------------

  public static getCharacterPortrait(id: string): string {
    const key = `portrait_${id}`;
    if (this.portraitDataUrls.has(key)) return this.portraitDataUrls.get(key)!;

    const [canvas, ctx] = this.makeCanvas(48, 48);
    ctx.clearRect(0, 0, 48, 48);

    // Frame background
    ctx.fillStyle = '#181820';
    ctx.fillRect(0, 0, 48, 48);

    if (id === 'ibu') {
      // Ibu Dika: Caring mother with pastel hijab & gentle eyes
      this.pRect(ctx, '#0284c7', 10, 36, 28, 12); // Soft blue kebaya/dress
      this.pRect(ctx, '#38bdf8', 12, 12, 24, 26); // Hijab drape
      this.pRect(ctx, '#fde68a', 15, 17, 18, 17); // Face
      this.pRect(ctx, '#f472b6', 16, 26, 4, 2); // Warm smile cheeks
      this.pRect(ctx, '#f472b6', 28, 26, 4, 2);
      this.pRect(ctx, '#1e293b', 18, 22, 3, 3); // Warm eyes
      this.pRect(ctx, '#ffffff', 19, 22, 1, 1);
      this.pRect(ctx, '#1e293b', 27, 22, 3, 3);
      this.pRect(ctx, '#ffffff', 28, 22, 1, 1);
      this.pRect(ctx, '#be185d', 22, 29, 4, 2); // Gentle smile
    } else if (id === 'dika') {
      // Dika: Determined High School Student (Putih Abu-abu)
      this.pRect(ctx, '#f8fafc', 12, 36, 24, 12); // White collar
      this.pRect(ctx, '#64748b', 22, 38, 4, 10); // Grey tie
      this.pRect(ctx, '#dcae86', 20, 30, 8, 7); // Neck
      // Face
      this.pRect(ctx, '#fcd34d', 14, 14, 20, 18);
      this.pRect(ctx, '#dcae86', 14, 20, 20, 12); // Shading
      // Eyes
      this.pRect(ctx, '#0f172a', 17, 21, 4, 4);
      this.pRect(ctx, '#ffffff', 18, 21, 2, 2);
      this.pRect(ctx, '#0f172a', 27, 21, 4, 4);
      this.pRect(ctx, '#ffffff', 28, 21, 2, 2);
      // Eyebrows
      this.pRect(ctx, '#171717', 16, 19, 6, 2);
      this.pRect(ctx, '#171717', 26, 19, 6, 2);
      // Mouth
      this.pRect(ctx, '#991b1b', 22, 28, 4, 2);
      // Hair
      this.pRect(ctx, '#171717', 12, 8, 24, 8);
      this.pRect(ctx, '#171717', 10, 14, 5, 12);
      this.pRect(ctx, '#171717', 33, 14, 5, 12);
      this.pRect(ctx, '#334155', 16, 10, 8, 3); // Glint
    } else if (id === 'lia') {
      // Lia: Friendly girl with brown ponytail & red cross PMR collar
      this.pRect(ctx, '#ffffff', 12, 36, 24, 12);
      this.pRect(ctx, '#ef4444', 22, 38, 4, 4); // Red cross
      this.pRect(ctx, '#dcae86', 20, 31, 8, 6);
      // Face
      this.pRect(ctx, '#fde68a', 15, 15, 18, 17);
      this.pRect(ctx, '#f472b6', 15, 25, 4, 3); // Soft blush
      this.pRect(ctx, '#f472b6', 29, 25, 4, 3);
      // Eyes
      this.pRect(ctx, '#1e293b', 18, 21, 3, 4);
      this.pRect(ctx, '#ffffff', 19, 21, 2, 2);
      this.pRect(ctx, '#1e293b', 27, 21, 3, 4);
      this.pRect(ctx, '#ffffff', 28, 21, 2, 2);
      // Hair (Brown ponytail with side bangs)
      this.pRect(ctx, '#451a03', 13, 8, 22, 9);
      this.pRect(ctx, '#451a03', 11, 14, 5, 15);
      this.pRect(ctx, '#451a03', 32, 14, 5, 15);
      this.pRect(ctx, '#78350f', 36, 10, 7, 10); // Ponytail
    } else if (id === 'rafli') {
      // Rafli: Athletic teen boy with varsity jacket & spiky hair
      this.pRect(ctx, '#ea580c', 10, 36, 28, 12); // Orange jacket
      this.pRect(ctx, '#f8fafc', 20, 36, 8, 12); // White inner
      this.pRect(ctx, '#dcae86', 19, 29, 10, 8);
      // Face
      this.pRect(ctx, '#fcd34d', 14, 14, 20, 17);
      this.pRect(ctx, '#dcae86', 14, 21, 20, 10);
      // Sharp eyes
      this.pRect(ctx, '#0f172a', 17, 21, 4, 3);
      this.pRect(ctx, '#ffffff', 18, 21, 1, 1);
      this.pRect(ctx, '#0f172a', 27, 21, 4, 3);
      this.pRect(ctx, '#ffffff', 28, 21, 1, 1);
      // Spiky black hair
      this.pRect(ctx, '#0f172a', 11, 6, 26, 9);
      this.pRect(ctx, '#0f172a', 14, 3, 8, 4);
      this.pRect(ctx, '#0f172a', 26, 3, 8, 4);
    } else if (id === 'farel') {
      // Farel: Smart teen boy with square glasses
      this.pRect(ctx, '#f8fafc', 12, 36, 24, 12);
      this.pRect(ctx, '#dcae86', 20, 30, 8, 7);
      this.pRect(ctx, '#fcd34d', 15, 15, 18, 17);
      // Glasses (Blue metallic square frames)
      this.pRect(ctx, '#0284c7', 16, 20, 6, 5);
      this.pRect(ctx, '#ffffff', 17, 21, 2, 2); // Lens glint
      this.pRect(ctx, '#0284c7', 26, 20, 6, 5);
      this.pRect(ctx, '#ffffff', 27, 21, 2, 2);
      this.pRect(ctx, '#0f172a', 22, 21, 4, 2); // Bridge
      // Messy brown hair
      this.pRect(ctx, '#3f2212', 13, 8, 22, 8);
      this.pRect(ctx, '#3f2212', 12, 14, 4, 8);
    } else if (id === 'dafa') {
      // Dafa: Red headband (Ikat kepala merah putih), courageous look
      this.pRect(ctx, '#f8fafc', 12, 36, 24, 12);
      this.pRect(ctx, '#dcae86', 19, 29, 10, 8);
      this.pRect(ctx, '#fcd34d', 14, 15, 20, 16);
      // Red Headband
      this.pRect(ctx, '#dc2626', 13, 13, 22, 5);
      this.pRect(ctx, '#f8fafc', 17, 14, 4, 3); // White center badge
      this.pRect(ctx, '#ef4444', 34, 15, 5, 8); // Headband ribbon
      // Eyes
      this.pRect(ctx, '#0f172a', 17, 22, 4, 3);
      this.pRect(ctx, '#ffffff', 18, 22, 1, 1);
      this.pRect(ctx, '#0f172a', 27, 22, 4, 3);
      this.pRect(ctx, '#ffffff', 28, 22, 1, 1);
      // Hair on top
      this.pRect(ctx, '#171717', 13, 8, 22, 6);
    } else if (id === 'guru') {
      // Pak Budi: Teacher with mustache, glasses & batik shirt
      this.pRect(ctx, '#78350f', 10, 36, 28, 12);
      this.pRect(ctx, '#b45309', 14, 38, 4, 4); // Batik pattern
      this.pRect(ctx, '#dcae86', 19, 29, 10, 8);
      this.pRect(ctx, '#fcd34d', 14, 14, 20, 17);
      // Glasses
      this.pRect(ctx, '#334155', 16, 19, 6, 4);
      this.pRect(ctx, '#334155', 26, 19, 6, 4);
      // Teacher Mustache
      this.pRect(ctx, '#1e293b', 20, 26, 8, 3);
      // Salt & pepper hair
      this.pRect(ctx, '#52525b', 12, 7, 24, 8);
    }

    const dataUrl = canvas.toDataURL();
    this.portraitDataUrls.set(key, dataUrl);
    this.toTexture(canvas, key);
    return dataUrl;
  }

  // -------------------------------------------------------------
  // 3. PIXEL ART SMA 03 SCHOOL BUILDING (For street & arrival)
  // -------------------------------------------------------------

  public static getSchoolBuildingSprite(): THREE.CanvasTexture {
    const key = 'env_school_building';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(256, 160);
    ctx.clearRect(0, 0, 256, 160);

    // 2-Story Public High School Building (Gedung SMA Negeri 03 Jakarta)
    // Tiled Red Roof
    this.pRect(ctx, '#991b1b', 16, 16, 224, 20);
    this.pRect(ctx, '#7f1d1d', 20, 24, 216, 6);

    // Second Floor (Cream wall + Indonesian school green trim)
    this.pRect(ctx, '#fef3c7', 24, 36, 208, 44);
    this.pRect(ctx, '#065f46', 24, 76, 208, 4); // Green separator

    // 2nd Floor Classroom Windows
    for (let wx = 36; wx < 220; wx += 28) {
      this.pRect(ctx, '#1e293b', wx, 44, 20, 24);
      this.pRect(ctx, '#38bdf8', wx + 2, 46, 16, 20);
      this.pRect(ctx, '#0284c7', wx + 2, 55, 16, 2);
    }

    // First Floor
    this.pRect(ctx, '#fef3c7', 24, 80, 208, 54);
    this.pRect(ctx, '#064e3b', 24, 126, 208, 8); // Lower dark green wainscot

    // 1st Floor Classroom Windows & Doors
    for (let wx = 36; wx < 220; wx += 28) {
      if (wx === 120) {
        // Main School Entrance Doorway
        this.pRect(ctx, '#78350f', wx, 90, 24, 44);
        this.pRect(ctx, '#0f172a', wx + 2, 92, 20, 42);
      } else {
        this.pRect(ctx, '#1e293b', wx, 90, 20, 24);
        this.pRect(ctx, '#38bdf8', wx + 2, 92, 16, 20);
      }
    }

    // Large School Signboard ("SMA NEGERI 03 JAKARTA")
    this.pRect(ctx, '#064e3b', 92, 70, 72, 16);
    this.pRect(ctx, '#ffffff', 94, 72, 68, 12);
    ctx.fillStyle = '#064e3b';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('SMA NEGERI 03', 100, 79);
    ctx.fillText('JAKARTA PUSAT', 100, 83);

    // Front School Fence (Pagar besi & tiang gerbang)
    this.pRect(ctx, '#1e293b', 0, 134, 256, 26);
    for (let gx = 8; gx < 248; gx += 8) {
      if (gx >= 108 && gx <= 148) continue; // Gate opening
      this.pRect(ctx, '#334155', gx, 124, 3, 36);
    }

    // Gate pillars
    this.pRect(ctx, '#475569', 104, 116, 8, 44);
    this.pRect(ctx, '#475569', 144, 116, 8, 44);

    return this.toTexture(canvas, key);
  }

  // Indonesian Street Cart (Gerobak Batagor)
  public static getGerobakSprite(): THREE.CanvasTexture {
    const key = 'env_gerobak';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(64, 48);
    ctx.clearRect(0, 0, 64, 48);

    this.pRect(ctx, '#2563eb', 8, 6, 48, 6);
    this.pRect(ctx, '#78350f', 12, 12, 3, 20);
    this.pRect(ctx, '#78350f', 49, 12, 3, 20);
    this.pRect(ctx, '#38bdf8', 16, 14, 32, 12);
    this.pRect(ctx, '#eab308', 18, 16, 6, 8);
    this.pRect(ctx, '#b45309', 26, 18, 8, 6);
    this.pRect(ctx, '#b45309', 10, 26, 44, 12);
    this.pRect(ctx, '#ffffff', 14, 30, 36, 6);

    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 5px monospace';
    ctx.fillText('BATAGOR', 16, 35);

    this.pRect(ctx, '#0f172a', 16, 36, 10, 10);
    this.pRect(ctx, '#94a3b8', 18, 38, 6, 6);

    return this.toTexture(canvas, key);
  }

  // Dika's House Front
  public static getDikaHouseSprite(): THREE.CanvasTexture {
    const key = 'env_dika_house';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(128, 96);
    ctx.clearRect(0, 0, 128, 96);

    this.pRect(ctx, '#991b1b', 10, 12, 108, 16);
    this.pRect(ctx, '#7f1d1d', 14, 16, 100, 4);
    this.pRect(ctx, '#fef3c7', 16, 28, 96, 52);
    this.pRect(ctx, '#78350f', 52, 44, 24, 36);
    this.pRect(ctx, '#92400e', 54, 46, 20, 32);
    this.pRect(ctx, '#fef08a', 70, 60, 2, 4);

    [24, 82].forEach(wx => {
      this.pRect(ctx, '#1e293b', wx, 42, 20, 24);
      this.pRect(ctx, '#38bdf8', wx + 2, 44, 16, 20);
      this.pRect(ctx, '#0f172a', wx + 7, 44, 2, 20);
      this.pRect(ctx, '#0f172a', wx + 12, 44, 2, 20);
    });

    this.pRect(ctx, '#1e293b', 0, 80, 128, 16);
    for (let fx = 4; fx < 124; fx += 8) {
      this.pRect(ctx, '#334155', fx, 74, 3, 22);
    }

    return this.toTexture(canvas, key);
  }

  // Motorbike
  public static getMotorbikeSprite(): THREE.CanvasTexture {
    const key = 'env_motorbike';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(48, 36);
    ctx.clearRect(0, 0, 48, 36);

    this.pRect(ctx, '#0f172a', 6, 20, 12, 12);
    this.pRect(ctx, '#e2e8f0', 8, 22, 8, 8);
    this.pRect(ctx, '#0f172a', 30, 20, 12, 12);
    this.pRect(ctx, '#e2e8f0', 32, 22, 8, 8);
    this.pRect(ctx, '#dc2626', 14, 14, 18, 10);
    this.pRect(ctx, '#1e293b', 16, 12, 12, 4);
    this.pRect(ctx, '#94a3b8', 34, 8, 4, 12);
    this.pRect(ctx, '#fef08a', 36, 10, 3, 4);

    return this.toTexture(canvas, key);
  }

  // Classroom Desk
  public static getDeskSprite(): THREE.CanvasTexture {
    const key = 'env_desk_chair';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(48, 32);
    ctx.clearRect(0, 0, 48, 32);

    this.pRect(ctx, '#b45309', 4, 10, 40, 6);
    this.pRect(ctx, '#92400e', 4, 15, 40, 2);
    this.pRect(ctx, '#334155', 6, 16, 3, 14);
    this.pRect(ctx, '#334155', 39, 16, 3, 14);
    this.pRect(ctx, '#38bdf8', 12, 8, 8, 3);
    this.pRect(ctx, '#ef4444', 24, 9, 6, 2);

    return this.toTexture(canvas, key);
  }

  // Blackboard
  public static getBlackboard(): THREE.CanvasTexture {
    const key = 'env_blackboard';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(128, 64);
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(0, 0, 128, 64);
    ctx.fillStyle = '#143825';
    ctx.fillRect(4, 4, 120, 56);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px monospace';
    ctx.fillText('SMA N 03 JAKARTA', 10, 16);
    ctx.fillStyle = '#fef08a';
    ctx.fillText('KELAS XII IPA 2 - FISIKA', 10, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px monospace';
    ctx.fillText('Materi: Gerak Lurus (v = s/t)', 10, 40);
    ctx.fillText('Pukul 12:00 WIB (Istirahat)', 10, 52);

    return this.toTexture(canvas, key);
  }

  // Street Floor
  public static getStreetFloor(): THREE.CanvasTexture {
    const key = 'floor_street';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(64, 64);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 0, 64, 64);

    for (let i = 0; i < 90; i++) {
      const px = Math.floor(Math.random() * 64);
      const py = Math.floor(Math.random() * 64);
      ctx.fillStyle = Math.random() > 0.5 ? '#1e293b' : '#475569';
      ctx.fillRect(px, py, 1, 1);
    }

    return this.toTexture(canvas, key);
  }

  // Ruined Jakarta Skyline (Monas, Skyscrapers, Smoke, Sunset)
  public static getRuinedJakartaSkyline(): THREE.CanvasTexture {
    const key = 'env_ruined_jakarta_skyline';
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(512, 256);

    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#1c0703');
    grad.addColorStop(0.35, '#5e1b0b');
    grad.addColorStop(0.65, '#c44d18');
    grad.addColorStop(0.9, '#e07a2a');
    grad.addColorStop(1, '#2b1008');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Smoky clouds
    ctx.fillStyle = 'rgba(30, 20, 25, 0.45)';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(60 * i + 30, 85 + (i % 3) * 15, 60, 0, Math.PI * 2);
      ctx.fill();
    }

    // Skyscrapers
    const bldgs = [
      [20, 110, 26, 146], [50, 85, 32, 171], [86, 130, 20, 126],
      [112, 70, 38, 186], [155, 120, 24, 136], [185, 95, 36, 161],
      [270, 75, 42, 181], [318, 100, 28, 156], [354, 60, 40, 196],
      [400, 115, 30, 141], [435, 80, 34, 176], [475, 105, 32, 151],
    ];
    bldgs.forEach(([x, y, w, h]) => {
      ctx.fillStyle = '#1c0907';
      ctx.fillRect(x, y, w, h);
      for (let wy = y + 10; wy < y + h - 10; wy += 8) {
        if (Math.random() > 0.55) {
          ctx.fillStyle = Math.random() > 0.4 ? '#ff9900' : '#ff3300';
          ctx.fillRect(x + 4, wy, 3, 3);
        }
      }
    });

    // MONAS (Monumen Nasional)
    const mx = 232;
    ctx.fillStyle = '#140605';
    ctx.fillRect(mx - 34, 175, 68, 81);
    ctx.fillRect(mx - 24, 158, 48, 18);
    ctx.fillRect(mx - 18, 144, 36, 14);
    ctx.fillRect(mx - 7, 70, 14, 76);
    ctx.fillRect(mx - 12, 64, 24, 6);

    // Monas Flame of Independence
    ctx.fillStyle = '#ffaa00';
    ctx.beginPath();
    ctx.moveTo(mx, 38);
    ctx.lineTo(mx + 8, 64);
    ctx.lineTo(mx - 8, 64);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ff2200';
    ctx.beginPath();
    ctx.arc(mx, 54, 5, 0, Math.PI * 2);
    ctx.fill();

    // Billowing smoke
    ctx.fillStyle = 'rgba(20, 10, 10, 0.6)';
    for (let s = 0; s < 14; s++) {
      ctx.beginPath();
      ctx.arc(mx - 12 + Math.sin(s) * 16, 32 - s * 5, 8 + s * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    return this.toTexture(canvas, key);
  }

  // Companion Sprites (Lia, Rafli, Farel, Dafa, Guru)
  public static getCompanionSprite(id: string): THREE.CanvasTexture {
    const key = `companion_spr_${id}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(32, 48);
    ctx.clearRect(0, 0, 32, 48);

    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath();
    ctx.ellipse(16, 45, 10, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    if (id === 'lia') {
      this.pRect(ctx, '#1e293b', 12, 43, 3, 2);
      this.pRect(ctx, '#1e293b', 17, 43, 3, 2);
      this.pRect(ctx, '#475569', 11, 26, 10, 9);
      this.pRect(ctx, '#dcae86', 12, 35, 3, 8);
      this.pRect(ctx, '#dcae86', 17, 35, 3, 8);
      this.pRect(ctx, '#ffffff', 11, 15, 10, 11);
      this.pRect(ctx, '#ffffff', 6, 22, 5, 6);
      this.pRect(ctx, '#ef4444', 8, 23, 1, 4);
      this.pRect(ctx, '#ef4444', 7, 24, 3, 2);
      this.pRect(ctx, '#fcd34d', 12, 7, 8, 8);
      this.pRect(ctx, '#0f172a', 13, 10, 2, 2);
      this.pRect(ctx, '#0f172a', 17, 10, 2, 2);
      this.pRect(ctx, '#451a03', 10, 5, 12, 5);
      this.pRect(ctx, '#451a03', 8, 7, 3, 8);
    } else if (id === 'rafli') {
      this.pRect(ctx, '#0f172a', 11, 42, 4, 3);
      this.pRect(ctx, '#0f172a', 17, 42, 4, 3);
      this.pRect(ctx, '#475569', 11, 28, 4, 14);
      this.pRect(ctx, '#475569', 17, 28, 4, 14);
      this.pRect(ctx, '#ea580c', 10, 16, 12, 12);
      this.pRect(ctx, '#f8fafc', 14, 17, 4, 10);
      this.pRect(ctx, '#dcae86', 11, 7, 10, 8);
      this.pRect(ctx, '#0f172a', 13, 10, 2, 2);
      this.pRect(ctx, '#0f172a', 17, 10, 2, 2);
      this.pRect(ctx, '#0f172a', 9, 3, 14, 5);
    } else if (id === 'farel') {
      this.pRect(ctx, '#0f172a', 11, 42, 4, 3);
      this.pRect(ctx, '#0f172a', 17, 42, 4, 3);
      this.pRect(ctx, '#475569', 11, 28, 4, 14);
      this.pRect(ctx, '#475569', 17, 28, 4, 14);
      this.pRect(ctx, '#f8fafc', 10, 16, 12, 12);
      this.pRect(ctx, '#eab308', 21, 20, 5, 7);
      this.pRect(ctx, '#dcae86', 11, 7, 10, 8);
      this.pRect(ctx, '#0284c7', 12, 9, 3, 3);
      this.pRect(ctx, '#0284c7', 17, 9, 3, 3);
      this.pRect(ctx, '#3f2212', 10, 4, 12, 4);
    } else if (id === 'dafa') {
      this.pRect(ctx, '#0f172a', 11, 42, 4, 3);
      this.pRect(ctx, '#0f172a', 17, 42, 4, 3);
      this.pRect(ctx, '#475569', 11, 28, 4, 14);
      this.pRect(ctx, '#475569', 17, 28, 4, 14);
      this.pRect(ctx, '#f8fafc', 10, 16, 12, 12);
      this.pRect(ctx, '#dc2626', 10, 6, 12, 3);
      this.pRect(ctx, '#ef4444', 21, 7, 3, 5);
      this.pRect(ctx, '#dcae86', 11, 9, 10, 6);
      this.pRect(ctx, '#0f172a', 13, 11, 2, 2);
      this.pRect(ctx, '#0f172a', 17, 11, 2, 2);
      this.pRect(ctx, '#171717', 10, 3, 12, 3);
    } else if (id === 'guru') {
      this.pRect(ctx, '#1e293b', 11, 42, 4, 3);
      this.pRect(ctx, '#1e293b', 17, 42, 4, 3);
      this.pRect(ctx, '#1e293b', 11, 28, 10, 14);
      this.pRect(ctx, '#78350f', 10, 15, 12, 13);
      this.pRect(ctx, '#b45309', 12, 17, 3, 3);
      this.pRect(ctx, '#dcae86', 11, 7, 10, 8);
      this.pRect(ctx, '#0f172a', 13, 10, 2, 2);
      this.pRect(ctx, '#0f172a', 17, 10, 2, 2);
      this.pRect(ctx, '#71717a', 10, 4, 12, 4);
      this.pRect(ctx, '#ffffff', 22, 22, 2, 4);
    }

    return this.toTexture(canvas, key);
  }

  // Zombie Sprite
  public static getZombieSprite(type: 'student' | 'satpam' | 'runner', frame: 'walk1' | 'walk2' = 'walk1'): THREE.CanvasTexture {
    const key = `zombie_${type}_${frame}`;
    if (this.cache.has(key)) return this.cache.get(key)!;

    const [canvas, ctx] = this.makeCanvas(32, 48);
    ctx.clearRect(0, 0, 32, 48);

    const lOff = frame === 'walk1' ? -2 : 2;
    const rOff = frame === 'walk1' ? 2 : -2;

    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.ellipse(16, 45, 11, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinColor = '#6e8e72';
    const bloodColor = '#880808';

    if (type === 'satpam') {
      this.pRect(ctx, '#0f172a', 10, 42 + lOff, 5, 4);
      this.pRect(ctx, '#0f172a', 17, 42 + rOff, 5, 4);
      this.pRect(ctx, '#1e293b', 10, 27, 5, 15);
      this.pRect(ctx, '#1e293b', 17, 27, 5, 15);
      this.pRect(ctx, '#1e293b', 9, 14, 14, 14);
      this.pRect(ctx, bloodColor, 12, 17, 6, 8);
      this.pRect(ctx, skinColor, 4, 17, 5, 5);
      this.pRect(ctx, skinColor, 23, 17, 5, 5);
      this.pRect(ctx, skinColor, 11, 7, 10, 8);
      this.pRect(ctx, '#dc2626', 13, 10, 2, 2);
      this.pRect(ctx, '#dc2626', 17, 10, 2, 2);
      this.pRect(ctx, '#0f172a', 10, 4, 12, 4);
      this.pRect(ctx, '#eab308', 15, 5, 2, 2);
    } else {
      this.pRect(ctx, '#1e293b', 11, 42 + lOff, 4, 3);
      this.pRect(ctx, '#1e293b', 17, 42 + rOff, 4, 3);
      this.pRect(ctx, '#475569', 11, 28, 4, 14 + lOff);
      this.pRect(ctx, '#475569', 17, 28, 4, 14 + rOff);
      this.pRect(ctx, '#f8fafc', 10, 16, 12, 12);
      this.pRect(ctx, bloodColor, 13, 18, 5, 7);
      this.pRect(ctx, bloodColor, 11, 24, 4, 3);
      this.pRect(ctx, skinColor, 5, 17, 5, 4);
      this.pRect(ctx, skinColor, 22, 17, 5, 4);
      this.pRect(ctx, skinColor, 11, 7, 10, 8);
      this.pRect(ctx, '#ef4444', 13, 10, 2, 2);
      this.pRect(ctx, '#ef4444', 17, 10, 2, 2);
      this.pRect(ctx, '#1e293b', 10, 4, 12, 4);
      this.pRect(ctx, bloodColor, 10, 12, 3, 3);
    }

    return this.toTexture(canvas, key);
  }
}
