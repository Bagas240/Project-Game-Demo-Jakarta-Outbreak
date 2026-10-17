import * as THREE from 'three';
import { PixelArtFactory } from '../textures/PixelArtFactory';
import { ChapterId, ZombieEntity } from '../types/game';

/**
 * 2.5D Pixel Art Game World Engine
 * Supports 4-directional player sprites (Up, Down, Left, Right),
 * idle breathing animations, authentic pixel environments, and cinematic camera.
 */

export interface ZombieSpriteEntry {
  sprite: THREE.Sprite;
  group: THREE.Group;
  hpSprite: THREE.Sprite;
  hpCanvas: HTMLCanvasElement;
  hpCtx: CanvasRenderingContext2D;
  hpTexture: THREE.CanvasTexture;
  lastHp?: number;
  lastHitFlash?: boolean;
}

export class GameWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private container: HTMLDivElement;

  // Lighting
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private flickerLight?: THREE.PointLight;
  private emergencyRedLight?: THREE.PointLight;
  private flashlight?: THREE.SpotLight;

  // Player 2.5D Pixel Sprite
  public playerSprite: THREE.Sprite;
  public playerShadow: THREE.Mesh;
  public playerGroup: THREE.Group;
  public playerDirection: 'down' | 'up' | 'left' | 'right' = 'down';
  public hasWeapon: boolean = false;
  private attackAnimTimer: number = 0;
  private attackSlashSprite?: THREE.Sprite;

  // Ground Item Pickups (Mistar, Senter, Kunci, P3K)
  public itemPickups: Map<string, THREE.Sprite> = new Map();

  // Companion Sprites
  public companionSprites: Map<string, { sprite: THREE.Sprite; group: THREE.Group }> = new Map();

  // Zombie Sprites with Health Bars
  public zombieSprites: Map<number, ZombieSpriteEntry> = new Map();

  // Environment
  private environmentGroup: THREE.Group = new THREE.Group();
  private particlesGroup: THREE.Group = new THREE.Group();

  // Particles
  private bloodParticles: { mesh: THREE.Mesh; vel: THREE.Vector3; life: number }[] = [];

  // Camera & Screen Shake
  private targetCameraPos = new THREE.Vector3();
  private cameraLookTarget = new THREE.Vector3();
  private shakeIntensity = 0;
  public isCinematicMode = false;
  private cinematicProgress = 0;

  public currentChapter: ChapterId = 'ch_house';

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0f172a);
    this.scene.fog = new THREE.FogExp2(0x0f172a, 0.025);

    // 2.5D Camera: Angled tilted view (60 deg pitch)
    const aspect = container.clientWidth / container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(46, aspect, 0.1, 1000);
    this.camera.position.set(0, 10, 9.5);
    this.camera.lookAt(0, 0.8, 0);

    // Renderer configured for retro pixel crispness
    this.renderer = new THREE.WebGLRenderer({
      antialias: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;

    container.appendChild(this.renderer.domElement);
    this.renderer.domElement.classList.add('pixel-canvas');

    // Lighting
    this.hemiLight = new THREE.HemisphereLight(0x94a3b8, 0x1e293b, 0.9);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    this.dirLight.position.set(8, 16, 10);
    this.dirLight.castShadow = true;
    this.scene.add(this.dirLight);

    this.scene.add(this.environmentGroup);
    this.scene.add(this.particlesGroup);

    // Player 2.5D Pixel Sprite Setup (Initial down / idle)
    this.playerGroup = new THREE.Group();
    const dikaTex = PixelArtFactory.getDikaDirectionalSprite('down', 'idle1');
    const spriteMat = new THREE.SpriteMaterial({ map: dikaTex, transparent: true });
    this.playerSprite = new THREE.Sprite(spriteMat);
    this.playerSprite.scale.set(1.5, 2.25, 1);
    this.playerSprite.position.y = 1.12;
    this.playerGroup.add(this.playerSprite);

    // Oval contact shadow
    const shadowGeo = new THREE.CircleGeometry(0.5, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    this.playerShadow = new THREE.Mesh(shadowGeo, shadowMat);
    this.playerShadow.rotation.x = -Math.PI / 2;
    this.playerShadow.position.y = 0.02;
    this.playerGroup.add(this.playerShadow);

    // Player Flashlight (initially off until flashlight claimed in classroom)
    this.flashlight = new THREE.SpotLight(0xfffae6, 3.5, 16, Math.PI / 5, 0.4, 1.2);
    this.flashlight.position.set(0, 1.0, 0.2);
    this.flashlight.target.position.set(0, 0.6, 6);
    this.flashlight.visible = false;
    this.playerGroup.add(this.flashlight);
    this.playerGroup.add(this.flashlight.target);

    // Melee attack slash visual effect sprite
    const slashTex = PixelArtFactory.getSlashEffectSprite(this.hasWeapon);
    const slashMat = new THREE.SpriteMaterial({ map: slashTex, transparent: true });
    this.attackSlashSprite = new THREE.Sprite(slashMat);
    this.attackSlashSprite.scale.set(2.4, 2.4, 1);
    this.attackSlashSprite.position.set(0, 1.15, 1.0);
    this.attackSlashSprite.visible = false;
    this.playerGroup.add(this.attackSlashSprite);

    this.scene.add(this.playerGroup);

    window.addEventListener('resize', this.onWindowResize);
  }

  public setFlashlight(on: boolean) {
    if (this.flashlight) {
      this.flashlight.visible = on;
    }
  }

  public setHasWeapon(has: boolean) {
    this.hasWeapon = has;
    if (this.attackSlashSprite) {
      this.attackSlashSprite.material.map = PixelArtFactory.getSlashEffectSprite(this.hasWeapon);
    }
    this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
      this.playerDirection,
      'idle1',
      this.hasWeapon
    );
  }

  private onWindowResize = () => {
    if (!this.container || !this.renderer || !this.camera) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  public addScreenShake(amount: number = 0.4) {
    this.shakeIntensity = Math.min(this.shakeIntensity + amount, 0.8);
  }

  // Load Chapter Environment
  public loadChapterEnvironment(chapter: ChapterId) {
    this.currentChapter = chapter;
    this.isCinematicMode = chapter === 'ch_skyline';
    this.cinematicProgress = 0;

    // Set initial player direction: 'up' when advancing toward school, 'down' when facing front
    if (chapter === 'ch_walk' || chapter === 'ch_school_gate' || chapter === 'ch_classroom_study') {
      this.playerDirection = 'up';
    } else {
      this.playerDirection = 'down';
    }
    this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
      this.playerDirection,
      'idle1',
      this.hasWeapon
    );

    while (this.environmentGroup.children.length > 0) {
      const obj = this.environmentGroup.children[0];
      this.environmentGroup.remove(obj);
    }

    this.zombieSprites.forEach(({ group }) => this.scene.remove(group));
    this.zombieSprites.clear();

    this.itemPickups.clear();

    if (chapter === 'ch_house') {
      this.setupHouseScene();
    } else if (chapter === 'ch_walk') {
      this.setupWalkScene();
    } else if (chapter === 'ch_school_gate') {
      this.setupSchoolGateScene();
    } else if (chapter === 'ch_classroom_study' || chapter === 'ch_outbreak_12pm') {
      this.setupClassroomScene(chapter === 'ch_outbreak_12pm');
    } else if (chapter === 'ch_corridor') {
      this.setupCorridorScene();
    } else if (chapter === 'ch_sacrifice') {
      this.setupSacrificeScene();
    } else if (chapter === 'ch_skyline') {
      this.setupSkylineScene();
    }
  }

  // Item Pickup Spawning on the Ground
  public spawnItemPickup(id: string, type: 'mistar' | 'flashlight' | 'key' | 'medkit', x: number, z: number) {
    const tex = PixelArtFactory.getItemPickupSprite(type);
    const mat = new THREE.SpriteMaterial({ map: tex });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.4, 1.4, 1);
    sprite.position.set(x, 0.7, z);
    this.environmentGroup.add(sprite);
    this.itemPickups.set(id, sprite);
  }

  public removeItemPickup(id: string) {
    const sprite = this.itemPickups.get(id);
    if (sprite) {
      this.environmentGroup.remove(sprite);
      this.itemPickups.delete(id);
    }
  }

  // 1. SCENE: DEPAN RUMAH DIKA
  private setupHouseScene() {
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.015);
    this.hemiLight.color.setHex(0xe0f2fe);
    this.dirLight.color.setHex(0xffedd5);
    this.dirLight.intensity = 1.6;

    // Street ground
    const floorGeo = new THREE.PlaneGeometry(32, 24);
    const floorMat = new THREE.MeshLambertMaterial({ map: PixelArtFactory.getStreetFloor() });
    floorMat.map!.repeat.set(4, 3);
    floorMat.map!.wrapS = THREE.RepeatWrapping;
    floorMat.map!.wrapT = THREE.RepeatWrapping;
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.environmentGroup.add(floor);

    // Dika's House Sprite Billboard in background
    const houseTex = PixelArtFactory.getDikaHouseSprite();
    const houseMat = new THREE.SpriteMaterial({ map: houseTex });
    const houseSprite = new THREE.Sprite(houseMat);
    houseSprite.scale.set(14, 10.5, 1);
    houseSprite.position.set(0, 5.2, -6.5);
    this.environmentGroup.add(houseSprite);

    // Motor Bebek parked on porch
    const motorTex = PixelArtFactory.getMotorbikeSprite();
    const motorMat = new THREE.SpriteMaterial({ map: motorTex });
    const motorSprite = new THREE.Sprite(motorMat);
    motorSprite.scale.set(2.4, 1.8, 1);
    motorSprite.position.set(-3.5, 0.9, -2.8);
    this.environmentGroup.add(motorSprite);
  }

  // 2. SCENE: DIKA JALAN KE SEKOLAH (Visible SMA 03 School Building ahead!)
  private setupWalkScene() {
    this.scene.background = new THREE.Color(0x7dd3fc);
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.015);
    this.hemiLight.color.setHex(0xe0f2fe);
    this.dirLight.intensity = 1.5;

    // Long Street leading towards school
    const floorGeo = new THREE.PlaneGeometry(16, 48);
    const floorMat = new THREE.MeshLambertMaterial({ map: PixelArtFactory.getStreetFloor() });
    floorMat.map!.repeat.set(2, 6);
    floorMat.map!.wrapS = THREE.RepeatWrapping;
    floorMat.map!.wrapT = THREE.RepeatWrapping;
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(floor);

    // LARGE SMA NEGERI 03 JAKARTA SCHOOL BUILDING AHEAD (NOT EMPTY VOID!)
    const bldgTex = PixelArtFactory.getSchoolBuildingSprite();
    const bldgMat = new THREE.SpriteMaterial({ map: bldgTex });
    const bldgSprite = new THREE.Sprite(bldgMat);
    bldgSprite.scale.set(22, 13.5, 1);
    bldgSprite.position.set(0, 6.75, -14.5);
    this.environmentGroup.add(bldgSprite);

    // Gerobak Batagor di pinggir jalan
    const gerobakTex = PixelArtFactory.getGerobakSprite();
    const gerobakMat = new THREE.SpriteMaterial({ map: gerobakTex });
    const gerobakSprite = new THREE.Sprite(gerobakMat);
    gerobakSprite.scale.set(3.2, 2.4, 1);
    gerobakSprite.position.set(-4.2, 1.2, -4);
    this.environmentGroup.add(gerobakSprite);

    // Motor bebek terparkir di pinggir
    const motorTex = PixelArtFactory.getMotorbikeSprite();
    const motorMat = new THREE.SpriteMaterial({ map: motorTex });
    const motorSprite = new THREE.Sprite(motorMat);
    motorSprite.scale.set(2.4, 1.8, 1);
    motorSprite.position.set(4.2, 0.9, 2);
    this.environmentGroup.add(motorSprite);
  }

  // 3. SCENE: GERBANG SMA NEGERI 03 JAKARTA (Arrival at School Gate)
  private setupSchoolGateScene() {
    this.scene.background = new THREE.Color(0x38bdf8);
    this.scene.fog = new THREE.FogExp2(0xbae6fd, 0.015);
    this.hemiLight.color.setHex(0xe0f2fe);
    this.dirLight.intensity = 1.6;

    // Courtyard Ground
    const floorGeo = new THREE.PlaneGeometry(36, 28);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x94a3b8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(floor);

    // Large School Building Billboard right behind the gate
    const bldgTex = PixelArtFactory.getSchoolBuildingSprite();
    const bldgMat = new THREE.SpriteMaterial({ map: bldgTex });
    const bldgSprite = new THREE.Sprite(bldgMat);
    bldgSprite.scale.set(26, 16, 1);
    bldgSprite.position.set(0, 8.0, -9.0);
    this.environmentGroup.add(bldgSprite);

    // Gerobak Batagor Mang Ujang where friends gather
    const gerobakTex = PixelArtFactory.getGerobakSprite();
    const gerobakMat = new THREE.SpriteMaterial({ map: gerobakTex });
    const gerobakSprite = new THREE.Sprite(gerobakMat);
    gerobakSprite.scale.set(3.4, 2.5, 1);
    gerobakSprite.position.set(4.8, 1.25, -2);
    this.environmentGroup.add(gerobakSprite);
  }

  // 4 & 5. SCENE: KELAS XII IPA 2
  private setupClassroomScene(isOutbreak: boolean) {
    this.scene.background = new THREE.Color(isOutbreak ? 0x18181b : 0x27272a);
    this.scene.fog = new THREE.FogExp2(isOutbreak ? 0x18181b : 0x27272a, 0.03);
    this.hemiLight.color.setHex(0x64748b);
    this.dirLight.intensity = isOutbreak ? 0.8 : 1.2;

    const floorGeo = new THREE.PlaneGeometry(28, 22);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x64748b });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(floor);

    // Blackboard
    const bbTex = PixelArtFactory.getBlackboard();
    const bbMat = new THREE.SpriteMaterial({ map: bbTex });
    const bbSprite = new THREE.Sprite(bbMat);
    bbSprite.scale.set(8.5, 4.2, 1);
    bbSprite.position.set(0, 3.2, -8.5);
    this.environmentGroup.add(bbSprite);

    // Pak Budi (Teacher) in study scene
    if (!isOutbreak) {
      const guruTex = PixelArtFactory.getCompanionSprite('guru');
      const guruMat = new THREE.SpriteMaterial({ map: guruTex });
      const guruSprite = new THREE.Sprite(guruMat);
      guruSprite.scale.set(1.5, 2.25, 1);
      guruSprite.position.set(-2.5, 1.12, -7.0);
      this.environmentGroup.add(guruSprite);
    } else {
      // In Outbreak: Claimable Mistar Besi and Flashlight
      this.spawnItemPickup('mistar_besi', 'mistar', 0, -6.0);
      this.spawnItemPickup('flashlight', 'flashlight', 6.0, 2.0);
    }

    // Desks
    const deskTex = PixelArtFactory.getDeskSprite();
    for (let r = 0; r < 3; r++) {
      for (let c = -2; c <= 2; c++) {
        if (c === 0) continue;
        const deskMat = new THREE.SpriteMaterial({ map: deskTex });
        const deskSprite = new THREE.Sprite(deskMat);
        deskSprite.scale.set(2.6, 1.8, 1);
        deskSprite.position.set(c * 2.8, 0.9, -4.5 + r * 3.2);
        this.environmentGroup.add(deskSprite);
      }
    }

    this.flickerLight = new THREE.PointLight(0xfef08a, 2.2, 18);
    this.flickerLight.position.set(0, 4.5, 0);
    this.environmentGroup.add(this.flickerLight);
  }

  // 6. SCENE: KORIDOR BERDARAH
  private setupCorridorScene() {
    this.scene.background = new THREE.Color(0x09090b);
    this.scene.fog = new THREE.FogExp2(0x09090b, 0.045);
    this.hemiLight.color.setHex(0x334155);
    this.dirLight.intensity = 0.3;

    const floorGeo = new THREE.PlaneGeometry(8, 48);
    const floorMat = new THREE.MeshLambertMaterial({ color: 0x3f3f46 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(floor);

    this.emergencyRedLight = new THREE.PointLight(0xef4444, 3.0, 18);
    this.emergencyRedLight.position.set(0, 4.0, 0);
    this.environmentGroup.add(this.emergencyRedLight);

    // Key in Pos Satpam and Medkit in corridor
    this.spawnItemPickup('school_key', 'key', 0, 14.5);
    this.spawnItemPickup('medkit', 'medkit', -2.2, 2.0);
  }

  // 7. SCENE: GERBANG UTAMA & PENGORBANAN DAFA
  private setupSacrificeScene() {
    this.scene.background = new THREE.Color(0x18181b);
    this.scene.fog = new THREE.FogExp2(0x18181b, 0.035);
    this.hemiLight.color.setHex(0x475569);
    this.dirLight.intensity = 0.6;

    const roadGeo = new THREE.PlaneGeometry(24, 36);
    const roadMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    this.environmentGroup.add(road);

    const fireLight = new THREE.PointLight(0xf97316, 4.0, 18);
    fireLight.position.set(5, 1.8, 4);
    this.environmentGroup.add(fireLight);
  }

  // 8. SCENE: CAKRAWALA JAKARTA YANG HANCUR
  private setupSkylineScene() {
    this.scene.background = new THREE.Color(0x270703);
    this.scene.fog = new THREE.FogExp2(0x380b05, 0.016);
    this.hemiLight.color.setHex(0xf97316);
    this.dirLight.color.setHex(0xffedd5);
    this.dirLight.intensity = 1.8;

    const bridgeGeo = new THREE.BoxGeometry(24, 1.2, 14);
    const bridgeMat = new THREE.MeshLambertMaterial({ color: 0x334155 });
    const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
    bridge.position.set(0, 0.6, 0);
    this.environmentGroup.add(bridge);

    const skyTex = PixelArtFactory.getRuinedJakartaSkyline();
    const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, depthWrite: false });
    const skyPlane = new THREE.Mesh(new THREE.PlaneGeometry(85, 42), skyMat);
    skyPlane.position.set(0, 16, -30);
    this.environmentGroup.add(skyPlane);

    const fLight = new THREE.PointLight(0xff5500, 4.0, 22);
    fLight.position.set(-6, 2.0, -4);
    this.environmentGroup.add(fLight);
  }

  public spawnBloodParticles(x: number, y: number, z: number, count: number = 10) {
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshBasicMaterial({ color: 0x880808 });
    for (let i = 0; i < count; i++) {
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 4.0,
        Math.random() * 3.0 + 1.0,
        (Math.random() - 0.5) * 4.0
      );
      this.particlesGroup.add(mesh);
      this.bloodParticles.push({ mesh, vel, life: 1.0 });
    }
  }

  // Attack swing with current direction and weapon status
  public triggerPlayerAttack() {
    this.attackAnimTimer = 0.28; // 280ms visible attack animation
    if (this.attackSlashSprite) {
      this.attackSlashSprite.material.map = PixelArtFactory.getSlashEffectSprite(this.hasWeapon);
      this.attackSlashSprite.visible = true;

      const slashDist = 1.15;
      let sx = 0, sz = 0;
      if (this.playerDirection === 'left') sx = -slashDist;
      else if (this.playerDirection === 'right') sx = slashDist;
      else if (this.playerDirection === 'up') sz = -slashDist;
      else if (this.playerDirection === 'down') sz = slashDist;
      this.attackSlashSprite.position.set(sx, 1.15, sz);
    }
    this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
      this.playerDirection,
      'attack',
      this.hasWeapon
    );
  }

  // Main Loop update
  public update(
    dt: number,
    playerX: number,
    playerZ: number,
    isMoving: boolean,
    moveDir: { x: number; z: number },
    companions: { id: string; x: number; z: number; active: boolean }[],
    zombies: ZombieEntity[]
  ) {
    const clampedDt = Math.min(dt, 0.05);

    // 1. Update Player 4-Directional Facing & Attack Animation
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= clampedDt;
      this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
        this.playerDirection,
        'attack',
        this.hasWeapon
      );
      if (this.attackSlashSprite) {
        this.attackSlashSprite.visible = true;
      }
    } else {
      if (this.attackSlashSprite) {
        this.attackSlashSprite.visible = false;
      }

      if (isMoving) {
        if (Math.abs(moveDir.x) > Math.abs(moveDir.z)) {
          this.playerDirection = moveDir.x > 0 ? 'right' : 'left';
        } else {
          this.playerDirection = moveDir.z > 0 ? 'down' : 'up';
        }

        const frameIndex = Math.floor(Date.now() / 140) % 2;
        this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
          this.playerDirection,
          frameIndex === 0 ? 'walk1' : 'walk2',
          this.hasWeapon
        );
      } else {
        const idleBob = Math.floor(Date.now() / 600) % 2;
        this.playerSprite.material.map = PixelArtFactory.getDikaDirectionalSprite(
          this.playerDirection,
          idleBob === 0 ? 'idle1' : 'idle2',
          this.hasWeapon
        );
      }
    }

    this.playerGroup.position.x = playerX;
    this.playerGroup.position.z = playerZ;

    // 2. Update Companions Sprites with idle breathing
    const idleCycle = Math.sin(Date.now() * 0.003) * 0.03;

    companions.forEach(c => {
      let entry = this.companionSprites.get(c.id);
      if (!entry) {
        const group = new THREE.Group();
        const tex = PixelArtFactory.getCompanionSprite(c.id);
        const mat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.5, 2.25, 1);
        sprite.position.y = 1.12;
        group.add(sprite);

        const sGeo = new THREE.CircleGeometry(0.45, 16);
        const sMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false });
        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.rotation.x = -Math.PI / 2;
        sMesh.position.y = 0.02;
        group.add(sMesh);

        this.scene.add(group);
        entry = { sprite, group };
        this.companionSprites.set(c.id, entry);
      }

      entry.group.visible = c.active;
      entry.group.position.x = c.x;
      entry.group.position.z = c.z;
      // Idle bob
      entry.sprite.scale.y = 2.25 + idleCycle;
    });

    this.companionSprites.forEach((entry, id) => {
      const active = companions.some(c => c.id === id && c.active);
      entry.group.visible = active;
    });

    // 3. Update Zombies Sprites & Health Bars
    zombies.forEach(z => {
      let entry = this.zombieSprites.get(z.id);
      if (!entry) {
        const group = new THREE.Group();
        const tex = PixelArtFactory.getZombieSprite(z.type);
        const mat = new THREE.SpriteMaterial({ map: tex });
        const sprite = new THREE.Sprite(mat);
        sprite.scale.set(1.6, 2.3, 1);
        sprite.position.y = 1.15;
        group.add(sprite);

        // Oval shadow
        const sGeo = new THREE.CircleGeometry(0.5, 16);
        const sMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false });
        const sMesh = new THREE.Mesh(sGeo, sMat);
        sMesh.rotation.x = -Math.PI / 2;
        sMesh.position.y = 0.02;
        group.add(sMesh);

        // Floating Pixel Art Health Bar Canvas
        const hpCanvas = document.createElement('canvas');
        hpCanvas.width = 64;
        hpCanvas.height = 18;
        const hpCtx = hpCanvas.getContext('2d')!;
        hpCtx.imageSmoothingEnabled = false;

        const hpTexture = new THREE.CanvasTexture(hpCanvas);
        hpTexture.magFilter = THREE.NearestFilter;
        hpTexture.minFilter = THREE.NearestFilter;
        hpTexture.colorSpace = THREE.SRGBColorSpace;

        const hpMat = new THREE.SpriteMaterial({ map: hpTexture, transparent: true });
        const hpSprite = new THREE.Sprite(hpMat);
        hpSprite.scale.set(1.6, 0.45, 1);
        hpSprite.position.y = 2.45; // Right above zombie head
        group.add(hpSprite);

        this.scene.add(group);
        entry = { sprite, group, hpSprite, hpCanvas, hpCtx, hpTexture };
        this.zombieSprites.set(z.id, entry);
      }

      entry.group.position.x = z.x;
      entry.group.position.z = z.z;

      if (z.state === 'chase') {
        const f = Math.floor(Date.now() / 160 + z.id) % 2;
        entry.sprite.material.map = PixelArtFactory.getZombieSprite(z.type, f === 0 ? 'walk1' : 'walk2');
      }

      if (z.hitFlashTimer > 0) {
        entry.sprite.scale.set(1.8, 2.0, 1);
      } else {
        entry.sprite.scale.set(1.6, 2.3, 1);
      }

      if (z.state === 'dead') {
        entry.group.position.y = -0.5;
        entry.sprite.scale.set(1.6, 1.2, 1);
        entry.hpSprite.visible = false;
      } else {
        entry.hpSprite.visible = true;
        const isHit = z.hitFlashTimer > 0;

        if (entry.lastHp !== z.hp || entry.lastHitFlash !== isHit) {
          entry.lastHp = z.hp;
          entry.lastHitFlash = isHit;

          const ctx = entry.hpCtx;
          ctx.clearRect(0, 0, 64, 18);

          // Black pixel outer border
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 64, 18);

          // Dark maroon background
          ctx.fillStyle = '#2b0c0c';
          ctx.fillRect(2, 2, 60, 14);

          // Health bar fill
          const pct = Math.max(0, Math.min(1, z.hp / z.maxHp));
          const barW = Math.round(pct * 60);

          if (isHit) {
            ctx.fillStyle = '#ffffff'; // White damage flash
          } else if (pct > 0.5) {
            ctx.fillStyle = '#22c55e'; // Green
          } else if (pct > 0.25) {
            ctx.fillStyle = '#f59e0b'; // Amber
          } else {
            ctx.fillStyle = '#ef4444'; // Red
          }

          if (barW > 0) {
            ctx.fillRect(2, 2, barW, 14);
            // Highlight shine
            ctx.fillStyle = isHit ? '#f8fafc' : pct > 0.5 ? '#86efac' : pct > 0.25 ? '#fde047' : '#fca5a5';
            ctx.fillRect(2, 2, barW, 2);
          }

          // HP Text Overlay
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`HP ${Math.max(0, Math.round(z.hp))}/${z.maxHp}`, 32, 12);

          entry.hpTexture.needsUpdate = true;
        }
      }
    });

    const activeZIds = new Set(zombies.map(z => z.id));
    this.zombieSprites.forEach((entry, id) => {
      if (!activeZIds.has(id)) {
        this.scene.remove(entry.group);
        this.zombieSprites.delete(id);
      }
    });

    // Item Pickups gentle floating bob
    const itemBob = Math.sin(Date.now() * 0.006) * 0.12;
    this.itemPickups.forEach(sprite => {
      sprite.position.y = 0.75 + itemBob;
    });

    // 4. Lights
    if (this.flickerLight) {
      this.flickerLight.intensity = 2.0 + (Math.random() > 0.88 ? -1.2 : 0.2);
    }
    if (this.emergencyRedLight) {
      this.emergencyRedLight.intensity = 1.5 + Math.sin(Date.now() * 0.008) * 1.5;
    }

    // 5. Particles
    for (let i = this.bloodParticles.length - 1; i >= 0; i--) {
      const p = this.bloodParticles[i];
      p.life -= clampedDt * 2.5;
      p.vel.y -= 9.8 * clampedDt;
      p.mesh.position.addScaledVector(p.vel, clampedDt);
      if (p.mesh.position.y <= 0.05) {
        p.mesh.position.y = 0.05;
        p.vel.set(0, 0, 0);
      }
      if (p.life <= 0) {
        this.particlesGroup.remove(p.mesh);
        this.bloodParticles.splice(i, 1);
      }
    }

    // 6. Camera Director
    if (this.isCinematicMode && this.currentChapter === 'ch_skyline') {
      this.cinematicProgress += clampedDt * 0.14;
      const t = this.cinematicProgress;

      if (t < 0.35) {
        const closeX = playerX;
        const closeY = 2.8;
        const closeZ = playerZ + 4.2;
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, closeX, 2.5, clampedDt);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, closeY, 2.5, clampedDt);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, closeZ, 2.5, clampedDt);
        this.camera.lookAt(playerX, 1.2, playerZ);
      } else {
        const grandX = 0;
        const grandY = 9.2;
        const grandZ = 12.0;
        this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, grandX, 1.2, clampedDt);
        this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, grandY, 1.2, clampedDt);
        this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, grandZ, 1.2, clampedDt);
        this.camera.lookAt(0, 9.5, -28);
      }
    } else {
      this.targetCameraPos.set(playerX, 9.8, playerZ + 9.5);
      this.cameraLookTarget.set(playerX, 0.8, playerZ);

      let shakeX = 0;
      let shakeY = 0;
      if (this.shakeIntensity > 0) {
        shakeX = (Math.random() - 0.5) * this.shakeIntensity;
        shakeY = (Math.random() - 0.5) * this.shakeIntensity;
        this.shakeIntensity = Math.max(0, this.shakeIntensity - clampedDt * 1.8);
      }

      this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, this.targetCameraPos.x + shakeX, 5, clampedDt);
      this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, this.targetCameraPos.y + shakeY, 5, clampedDt);
      this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, this.targetCameraPos.z, 5, clampedDt);
      this.camera.lookAt(this.cameraLookTarget.x, this.cameraLookTarget.y, this.cameraLookTarget.z);
    }

    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
  }
}
