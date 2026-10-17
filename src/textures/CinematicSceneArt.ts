/**
 * CinematicSceneArt generates handcrafted pixel art story slides
 * portraying the chaotic collapse of Jakarta during the outbreak:
 * 1. SMA 03 iron gate barricade (Dafa's sacrifice)
 * 2. Bundaran HI & overturned TransJakarta bus
 * 3. Stasiun Manggarai KRL derailment & peron chaos
 * 4. Monas military defense collapse under fire & smoke
 * 5. Flyover view of the burning Jakarta horizon with the 4 survivors
 */

export class CinematicSceneArt {
  private static slideCache: Map<string, string> = new Map();

  private static pRect(ctx: CanvasRenderingContext2D, color: string, x: number, y: number, w: number, h: number) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
  }

  public static getSlide(slideId: string): string {
    if (this.slideCache.has(slideId)) {
      return this.slideCache.get(slideId)!;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    if (slideId === 'sma03_gate') {
      this.drawSMA03Gate(ctx);
    } else if (slideId === 'bundaran_hi') {
      this.drawBundaranHI(ctx);
    } else if (slideId === 'manggarai_station') {
      this.drawManggarai(ctx);
    } else if (slideId === 'monas_siege') {
      this.drawMonasSiege(ctx);
    } else if (slideId === 'flyover_survivors') {
      this.drawFlyoverSurvivors(ctx);
    } else {
      this.drawSMA03Gate(ctx);
    }

    const dataUrl = canvas.toDataURL();
    this.slideCache.set(slideId, dataUrl);
    return dataUrl;
  }

  // 1. SMA 03 Koridor & Gerbang Besi Ditahan Dafa
  private static drawSMA03Gate(ctx: CanvasRenderingContext2D) {
    // Dark ominous corridor background
    this.pRect(ctx, '#141419', 0, 0, 480, 270);

    // Ceiling with broken fluorescent lamps
    this.pRect(ctx, '#09090b', 0, 0, 480, 40);
    this.pRect(ctx, '#ffffff', 80, 20, 70, 4);
    this.pRect(ctx, '#3f3f46', 220, 20, 70, 4); // Dead lamp
    this.pRect(ctx, '#fef08a', 360, 20, 70, 4);

    // Corridor walls & perspective lines
    this.pRect(ctx, '#27272a', 0, 40, 480, 160);
    this.pRect(ctx, '#18181b', 0, 130, 480, 70);

    // Indonesian school bulletin board & posters torn
    this.pRect(ctx, '#713f12', 40, 60, 80, 50);
    this.pRect(ctx, '#ca8a04', 45, 65, 70, 40);
    this.pRect(ctx, '#dc2626', 60, 75, 40, 20); // Torn emergency warning
    this.pRect(ctx, '#fef08a', 150, 70, 30, 40); // Paper note

    // Iron gate barrier in the center
    this.pRect(ctx, '#0f172a', 260, 40, 220, 180);
    for (let x = 270; x < 470; x += 14) {
      this.pRect(ctx, '#475569', x, 40, 4, 180);
    }
    this.pRect(ctx, '#334155', 260, 80, 220, 8);
    this.pRect(ctx, '#334155', 260, 150, 220, 8);

    // Shadows of horde behind the bars with glowing red eyes
    for (let i = 0; i < 7; i++) {
      const zx = 290 + i * 24;
      const zy = 85 + (i % 3) * 10;
      this.pRect(ctx, '#020617', zx - 8, zy, 18, 55);
      // Red eyes
      this.pRect(ctx, '#ef4444', zx - 4, zy + 6, 3, 2);
      this.pRect(ctx, '#ef4444', zx + 2, zy + 6, 3, 2);
    }

    // Heroic silhouette of Dafa holding the iron gate shut with his body
    this.pRect(ctx, '#0f172a', 235, 90, 26, 75); // Body
    this.pRect(ctx, '#0f172a', 242, 70, 14, 20); // Head
    this.pRect(ctx, '#ef4444', 248, 100, 6, 12); // Blood on sleeve
    // Arm braced against iron bar
    this.pRect(ctx, '#0f172a', 255, 95, 20, 8);

    // Floor with blood pools & scattered school bags
    this.pRect(ctx, '#1e1e24', 0, 200, 480, 70);
    this.pRect(ctx, '#7f1d1d', 180, 215, 90, 25);
    this.pRect(ctx, '#991b1b', 200, 225, 50, 15);
    this.pRect(ctx, '#b91c1c', 215, 230, 25, 8);

    // Dropped navy blue school backpack & ruler on floor
    this.pRect(ctx, '#1e3a8a', 90, 220, 24, 18);
    this.pRect(ctx, '#3b82f6', 94, 224, 16, 10);
    this.pRect(ctx, '#94a3b8', 125, 235, 30, 3); // Dropped metal ruler
    this.pRect(ctx, '#f8fafc', 70, 230, 16, 12); // Dropped textbook

    // Emergency red emergency strobe glow
    const grad = ctx.createRadialGradient(400, 50, 10, 400, 50, 240);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);
  }

  // 2. Bundaran HI & Overturned TransJakarta Bus
  private static drawBundaranHI(ctx: CanvasRenderingContext2D) {
    // Twilight smog orange & violet apocalyptic sky
    this.pRect(ctx, '#3b0764', 0, 0, 480, 90);
    this.pRect(ctx, '#831843', 0, 90, 480, 50);
    this.pRect(ctx, '#9a3412', 0, 140, 480, 30);

    // Skyline silhouettes of Thamrin high-rises on fire
    this.pRect(ctx, '#18181b', 20, 40, 50, 140);
    this.pRect(ctx, '#18181b', 80, 20, 65, 160);
    this.pRect(ctx, '#18181b', 160, 50, 45, 130);
    this.pRect(ctx, '#18181b', 340, 30, 70, 150);
    this.pRect(ctx, '#18181b', 420, 60, 50, 120);

    // Broken windows on high-rises
    for (let y = 30; y < 140; y += 12) {
      if (Math.random() > 0.4) this.pRect(ctx, '#f59e0b', 90, y, 6, 5);
      if (Math.random() > 0.6) this.pRect(ctx, '#ef4444', 360, y + 10, 8, 6);
    }

    // Heavy black smoke billowing from towers
    this.pRect(ctx, '#09090b', 120, 10, 40, 60);
    this.pRect(ctx, '#18181b', 130, 0, 50, 40);
    this.pRect(ctx, '#09090b', 380, 15, 45, 50);

    // Selamat Datang Monument (Bundaran HI) Center
    this.pRect(ctx, '#27272a', 232, 70, 16, 90); // Pedestal
    this.pRect(ctx, '#52525b', 236, 50, 8, 20); // Spire
    this.pRect(ctx, '#e4e4e7', 234, 40, 12, 12); // Bronze statue figures waving
    this.pRect(ctx, '#d4d4d8', 230, 42, 6, 8);

    // Fountain water basin (now murky & bloody)
    this.pRect(ctx, '#1c1917', 160, 150, 160, 35);
    this.pRect(ctx, '#7f1d1d', 180, 158, 120, 20);

    // Overturned Orange TransJakarta Bus on the left
    // Bus body tilted at an angle
    this.pRect(ctx, '#ea580c', 30, 175, 140, 42); // Orange body
    this.pRect(ctx, '#0284c7', 30, 195, 140, 8); // Blue TransJakarta stripe
    this.pRect(ctx, '#f8fafc', 30, 203, 140, 5); // White lower body
    // Shattered bus windows
    for (let bx = 45; bx < 160; bx += 22) {
      this.pRect(ctx, '#1e293b', bx, 178, 16, 14);
      this.pRect(ctx, '#e2e8f0', bx + 3, 180, 2, 8); // Glass crack
    }
    // Fallen bus wheels
    this.pRect(ctx, '#0f172a', 45, 215, 22, 12);
    this.pRect(ctx, '#0f172a', 130, 215, 22, 12);

    // Fire burning next to the bus
    this.pRect(ctx, '#ef4444', 165, 185, 15, 25);
    this.pRect(ctx, '#f97316', 168, 190, 10, 15);
    this.pRect(ctx, '#fef08a', 170, 195, 5, 8);

    // Road asphalt foreground
    this.pRect(ctx, '#0f0f12', 0, 210, 480, 60);

    // Silhouettes of zombies wandering around Bundaran HI
    const zombieCoords = [
      [210, 195], [250, 205], [310, 185], [340, 215], [380, 200], [420, 220], [450, 190]
    ];
    zombieCoords.forEach(([zx, zy]) => {
      this.pRect(ctx, '#030712', zx, zy, 10, 24);
      this.pRect(ctx, '#030712', zx + 2, zy - 6, 6, 7);
      // Red eyes in dusk
      this.pRect(ctx, '#ef4444', zx + 3, zy - 4, 2, 2);
    });

    // Dark smoke overlay across bottom
    const grad = ctx.createLinearGradient(0, 160, 0, 270);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 160, 480, 110);
  }

  // 3. Stasiun Manggarai - KRL Derailed & Mass Panic
  private static drawManggarai(ctx: CanvasRenderingContext2D) {
    // Dark cavernous steel truss train station canopy
    this.pRect(ctx, '#09090b', 0, 0, 480, 270);

    // Industrial overhead roof trusses
    this.pRect(ctx, '#18181b', 0, 0, 480, 50);
    for (let x = 0; x < 480; x += 40) {
      this.pRect(ctx, '#27272a', x, 0, 4, 70);
      this.pRect(ctx, '#3f3f46', x, 40, 40, 3);
    }

    // Overhead catenary wire sparks (electric blue/yellow flash)
    this.pRect(ctx, '#38bdf8', 190, 35, 30, 4);
    this.pRect(ctx, '#ffffff', 200, 32, 10, 10);
    this.pRect(ctx, '#fef08a', 202, 34, 6, 6);

    // Station signage: "STASIUN MANGGARAI - JALUR 1 & 2"
    this.pRect(ctx, '#0369a1', 50, 45, 110, 24);
    this.pRect(ctx, '#ffffff', 55, 52, 98, 4);
    this.pRect(ctx, '#facc15', 55, 60, 60, 3);

    // Red emergency beacon on column
    this.pRect(ctx, '#ef4444', 350, 48, 12, 12);

    // Concrete platform edge
    this.pRect(ctx, '#3f3f46', 0, 130, 160, 140);
    this.pRect(ctx, '#eab308', 0, 130, 160, 6); // Yellow safety tactile tile
    this.pRect(ctx, '#18181b', 0, 136, 160, 4);

    // Railway tracks on the right
    this.pRect(ctx, '#1c1917', 160, 140, 320, 130); // Ballast stone
    for (let tz = 145; tz < 270; tz += 10) {
      this.pRect(ctx, '#57534e', 160, tz, 320, 3); // Railway ties
    }
    this.pRect(ctx, '#94a3b8', 210, 140, 4, 130); // Steel rail
    this.pRect(ctx, '#94a3b8', 290, 140, 4, 130); // Steel rail

    // Derailed KRL Silver-Red Commuter Train carriage tilted on tracks
    // Silver body
    this.pRect(ctx, '#cbd5e1', 200, 100, 240, 60);
    this.pRect(ctx, '#dc2626', 200, 100, 240, 10); // Red stripe
    this.pRect(ctx, '#e2e8f0', 200, 150, 240, 10);
    // Smashed sliding doors & windows
    for (let kx = 220; kx < 420; kx += 38) {
      this.pRect(ctx, '#0f172a', kx, 114, 20, 24);
      this.pRect(ctx, '#94a3b8', kx + 8, 114, 2, 24);
    }
    // Head of derailed train tilted
    this.pRect(ctx, '#dc2626', 185, 115, 20, 45);

    // Abandoned suitcases & papers scattered on the platform
    this.pRect(ctx, '#b91c1c', 40, 160, 18, 14); // Red luggage
    this.pRect(ctx, '#1e3a8a', 90, 180, 22, 16); // Blue suitcase
    this.pRect(ctx, '#f8fafc', 60, 195, 10, 8); // Papers
    this.pRect(ctx, '#f8fafc', 110, 165, 8, 6);

    // Blood streaks leading off platform
    this.pRect(ctx, '#7f1d1d', 70, 140, 50, 12);
    this.pRect(ctx, '#991b1b', 100, 148, 30, 8);

    // Infected figures swarming inside and around train carriage
    this.pRect(ctx, '#030712', 230, 120, 12, 20); // Zombie in window
    this.pRect(ctx, '#ef4444', 234, 123, 2, 2);
    this.pRect(ctx, '#030712', 305, 120, 12, 20);
    this.pRect(ctx, '#ef4444', 309, 123, 2, 2);
    this.pRect(ctx, '#030712', 175, 165, 14, 26); // Zombie on track
    this.pRect(ctx, '#030712', 20, 210, 14, 30); // Zombie on platform foreground
    this.pRect(ctx, '#ef4444', 24, 215, 2, 2);

    // Red emergency lighting cast
    const grad = ctx.createRadialGradient(350, 50, 10, 350, 50, 260);
    grad.addColorStop(0, 'rgba(220, 38, 38, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);
  }

  // 4. Monas Military Siege & Black Smoke
  private static drawMonasSiege(ctx: CanvasRenderingContext2D) {
    // Crimson apocalyptic sunset sky
    this.pRect(ctx, '#450a0a', 0, 0, 480, 80);
    this.pRect(ctx, '#7f1d1d', 0, 80, 480, 40);
    this.pRect(ctx, '#b91c1c', 0, 120, 480, 30);

    // Enormous black smoke cloud engulfing Monas
    this.pRect(ctx, '#09090b', 160, 0, 160, 110);
    this.pRect(ctx, '#18181b', 140, 20, 200, 70);
    this.pRect(ctx, '#0f0f12', 180, 10, 120, 120);

    // Monas (Monumen Nasional) Obelisk in Center
    // Golden flame on top
    this.pRect(ctx, '#facc15', 234, 24, 12, 22);
    this.pRect(ctx, '#f59e0b', 236, 26, 8, 18);
    this.pRect(ctx, '#ffffff', 238, 30, 4, 10); // Core golden shine
    // Spire
    this.pRect(ctx, '#e4e4e7', 237, 46, 6, 75);
    this.pRect(ctx, '#d4d4d8', 235, 46, 2, 75);
    // Huge square cup/cawan pedestal
    this.pRect(ctx, '#f8fafc', 215, 120, 50, 18);
    this.pRect(ctx, '#cbd5e1', 205, 138, 70, 24);

    // Red distress flare falling in sky
    this.pRect(ctx, '#ffffff', 110, 45, 4, 4);
    this.pRect(ctx, '#f43f5e', 110, 49, 4, 20); // Flare trail

    // Medan Merdeka plaza ground & lawn
    this.pRect(ctx, '#1c1917', 0, 160, 480, 110);
    this.pRect(ctx, '#292524', 0, 185, 480, 85);

    // Overturned military armored transport (Panser Anoa) on the left
    this.pRect(ctx, '#14532d', 40, 185, 75, 30); // Camo green body
    this.pRect(ctx, '#166534', 50, 175, 45, 14); // Turret
    this.pRect(ctx, '#052e16', 42, 212, 18, 12); // Wheels
    this.pRect(ctx, '#052e16', 68, 212, 18, 12);
    this.pRect(ctx, '#052e16', 92, 212, 18, 12);
    // Fire bursting from the vehicle
    this.pRect(ctx, '#ef4444', 95, 170, 16, 20);
    this.pRect(ctx, '#f97316', 98, 175, 10, 12);

    // Military Sandbag barricade breached in center
    for (let sbx = 160; sbx < 320; sbx += 16) {
      this.pRect(ctx, '#78716c', sbx, 195, 15, 7);
      this.pRect(ctx, '#a8a29e', sbx, 189, 15, 7);
    }
    // Broken concertina razor wire
    for (let rx = 160; rx < 320; rx += 8) {
      this.pRect(ctx, '#94a3b8', rx, 185, 2, 6);
    }

    // Huge horde of zombies overrunning the sandbags
    for (let zi = 0; zi < 14; zi++) {
      const zx = 175 + zi * 12;
      const zy = 175 + (zi % 3) * 6;
      this.pRect(ctx, '#020617', zx, zy, 8, 22);
      this.pRect(ctx, '#ef4444', zx + 2, zy + 3, 2, 2);
    }

    // Heavy ash & ember particles in the foreground
    for (let p = 0; p < 25; p++) {
      const px = (p * 23) % 480;
      const py = (p * 17) % 250;
      this.pRect(ctx, '#fbbf24', px, py, 2, 2);
    }
  }

  // 5. Flyover View with the 4 Survivors Looking at Ruined Jakarta
  private static drawFlyoverSurvivors(ctx: CanvasRenderingContext2D) {
    // Apocalyptic crimson and deep purple sky
    this.pRect(ctx, '#2e1065', 0, 0, 480, 60);
    this.pRect(ctx, '#701a75', 0, 60, 480, 40);
    this.pRect(ctx, '#991b1b', 0, 100, 480, 50);
    this.pRect(ctx, '#b45309', 0, 150, 480, 25);

    // Burning Jakarta skyline panorama on the horizon
    const buildings = [
      [20, 80, 30, 95], [60, 55, 45, 120], [120, 70, 35, 105],
      [170, 45, 55, 130], [240, 60, 40, 115], [290, 40, 60, 135],
      [360, 65, 45, 110], [420, 50, 50, 125]
    ];
    buildings.forEach(([x, y, w, h]) => {
      this.pRect(ctx, '#09090b', x, y, w, h);
      // Fires inside ruined skyscraper windows
      this.pRect(ctx, '#f59e0b', x + 8, y + 15, 6, 8);
      this.pRect(ctx, '#ef4444', x + w - 12, y + 25, 6, 8);
    });

    // Monas silhouette burning in distance
    this.pRect(ctx, '#facc15', 214, 50, 6, 12); // Golden tip
    this.pRect(ctx, '#09090b', 215, 62, 4, 60); // Column
    this.pRect(ctx, '#09090b', 205, 122, 24, 15); // Base

    // Vast clouds of black smoke rising into the blood-red dusk
    this.pRect(ctx, '#030712', 0, 70, 200, 60);
    this.pRect(ctx, '#030712', 260, 65, 220, 65);

    // Elevated concrete flyover overpass structure (foreground)
    this.pRect(ctx, '#18181b', 0, 175, 480, 95);
    this.pRect(ctx, '#27272a', 0, 175, 480, 8); // Top edge railing
    this.pRect(ctx, '#52525b', 0, 183, 480, 4);

    // Concrete barrier posts
    for (let rx = 0; rx < 480; rx += 25) {
      this.pRect(ctx, '#3f3f46', rx, 170, 4, 15);
    }

    // Highway lane markings
    for (let lx = 30; lx < 480; lx += 60) {
      this.pRect(ctx, '#fef08a', lx, 225, 30, 4);
    }

    // FOUR SURVIVORS SILHOUETTES STANDING ON FLYOVER (LOOKING AT CITY)
    // 1. Dika (Center left, holding steel ruler upright)
    this.pRect(ctx, '#000000', 215, 150, 16, 42); // Body
    this.pRect(ctx, '#000000', 218, 138, 10, 12); // Head
    this.pRect(ctx, '#94a3b8', 232, 134, 3, 30); // Mistar Besi shiny edge
    this.pRect(ctx, '#f8fafc', 233, 134, 1, 30); // Metallic reflection

    // 2. Lia (Left of Dika, holding UKS medkit)
    this.pRect(ctx, '#000000', 185, 153, 15, 39); // Body
    this.pRect(ctx, '#000000', 188, 142, 9, 11); // Head
    this.pRect(ctx, '#dc2626', 178, 168, 8, 7); // Red Cross Medkit pouch

    // 3. Rafli (Right of Dika, tall)
    this.pRect(ctx, '#000000', 245, 146, 17, 46); // Body
    this.pRect(ctx, '#000000', 248, 134, 11, 12); // Head

    // 4. Farel (Right of Rafli, looking down at city)
    this.pRect(ctx, '#000000', 275, 152, 16, 40); // Body
    this.pRect(ctx, '#000000', 278, 140, 10, 12); // Head

    // Floating embers and ashes in the wind
    for (let i = 0; i < 30; i++) {
      const ex = (i * 37) % 480;
      const ey = (i * 29) % 260;
      this.pRect(ctx, '#f59e0b', ex, ey, 2, 2);
    }

    // Heavy cinematic letterbox / vignette gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 270);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(0.2, 'rgba(0,0,0,0)');
    grad.addColorStop(0.8, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 480, 270);
  }
}
