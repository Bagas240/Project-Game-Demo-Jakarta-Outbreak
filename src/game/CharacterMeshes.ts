import * as THREE from 'three';

/**
 * CharacterMeshes constructs procedural 2.5D multi-part voxel-pixel models
 * for Dika, his friends (Lia, Rafli, Farel, Dafa), and infected zombies.
 * Complies with the 3-12 part procedural model directive.
 */

export class CharacterMeshes {
  // Reusable materials
  private static skinMat = new THREE.MeshLambertMaterial({ color: 0xdcae86 });
  private static zombieSkinMat = new THREE.MeshLambertMaterial({ color: 0x6e8e72 });
  private static satpamSkinMat = new THREE.MeshLambertMaterial({ color: 0x5a7860 });
  
  // Indonesian SMA Uniform Colors (White shirt, Grey trousers/skirt)
  private static uniformShirtMat = new THREE.MeshLambertMaterial({ color: 0xf0f2f5 });
  private static uniformGreyMat = new THREE.MeshLambertMaterial({ color: 0x4a5568 });
  private static satpamUniformMat = new THREE.MeshLambertMaterial({ color: 0x1e293b });
  private static shoeMat = new THREE.MeshLambertMaterial({ color: 0x111827 });
  private static bloodMat = new THREE.MeshLambertMaterial({ color: 0x880808 });

  // Create Dika (SMA student protagonist)
  public static createDika(): THREE.Group {
    const group = new THREE.Group();
    group.name = 'player_dika';

    // 1. Torso (Putih SMA with red OSIS badge)
    const torsoGeo = new THREE.BoxGeometry(0.5, 0.6, 0.3);
    const torso = new THREE.Mesh(torsoGeo, this.uniformShirtMat);
    torso.position.y = 0.9;
    torso.castShadow = true;
    group.add(torso);

    // OSIS Pocket Badge on chest
    const badgeGeo = new THREE.BoxGeometry(0.1, 0.1, 0.02);
    const badgeMat = new THREE.MeshLambertMaterial({ color: 0xb91c1c });
    const badge = new THREE.Mesh(badgeGeo, badgeMat);
    badge.position.set(0.14, 0.95, 0.16);
    group.add(badge);

    // Backpack
    const packGeo = new THREE.BoxGeometry(0.42, 0.48, 0.22);
    const packMat = new THREE.MeshLambertMaterial({ color: 0x1e3a8a }); // Navy backpack
    const pack = new THREE.Mesh(packGeo, packMat);
    pack.position.set(0, 0.88, -0.22);
    pack.castShadow = true;
    group.add(pack);

    // 2. Head with Hair
    const headGeo = new THREE.BoxGeometry(0.36, 0.36, 0.34);
    const head = new THREE.Mesh(headGeo, this.skinMat);
    head.position.y = 1.35;
    head.castShadow = true;
    group.add(head);

    // Black anime/pixel hair
    const hairGeo = new THREE.BoxGeometry(0.38, 0.18, 0.36);
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x171717 });
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.set(0, 1.48, 0.02);
    group.add(hair);

    // 3. Legs (Abu-abu SMA)
    const legGeo = new THREE.BoxGeometry(0.18, 0.55, 0.2);
    const leftLeg = new THREE.Mesh(legGeo, this.uniformGreyMat);
    leftLeg.name = 'left_leg';
    leftLeg.position.set(-0.14, 0.35, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.uniformGreyMat);
    rightLeg.name = 'right_leg';
    rightLeg.position.set(0.14, 0.35, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.2, 0.12, 0.26);
    const leftShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    leftShoe.position.set(-0.14, 0.06, 0.03);
    group.add(leftShoe);
    const rightShoe = new THREE.Mesh(shoeGeo, this.shoeMat);
    rightShoe.position.set(0.14, 0.06, 0.03);
    group.add(rightShoe);

    // 4. Arms
    const armGeo = new THREE.BoxGeometry(0.14, 0.5, 0.16);
    const leftArm = new THREE.Mesh(armGeo, this.skinMat);
    leftArm.name = 'left_arm';
    leftArm.position.set(-0.35, 0.85, 0);
    group.add(leftArm);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.name = 'weapon_arm';
    rightArmGroup.position.set(0.35, 1.05, 0);

    const rightArm = new THREE.Mesh(armGeo, this.skinMat);
    rightArm.position.set(0, -0.2, 0);
    rightArmGroup.add(rightArm);

    // Weapon: Heavy Iron School Ruler / Pipe (Mistar Besi / Pipa)
    const weaponGeo = new THREE.BoxGeometry(0.08, 0.8, 0.04);
    const weaponMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.25,
    });
    const weapon = new THREE.Mesh(weaponGeo, weaponMat);
    weapon.position.set(0.02, -0.4, 0.25);
    weapon.rotation.x = Math.PI / 4;
    rightArmGroup.add(weapon);

    group.add(rightArmGroup);

    // 5. Contact Shadow
    const shadowGeo = new THREE.CircleGeometry(0.45, 16);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(shadowGeo, shadowMat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    // 6. Flashlight (Senter Dika)
    const light = new THREE.SpotLight(0xfffae6, 3.5, 16, Math.PI / 5, 0.4, 1.2);
    light.position.set(0.2, 0.8, 0.3);
    light.target.position.set(0.2, 0.6, 6);
    light.castShadow = true;
    light.name = 'dika_flashlight';
    group.add(light);
    group.add(light.target);

    return group;
  }

  // Create Companion (Lia, Rafli, Farel, Dafa)
  public static createCompanion(id: 'lia' | 'rafli' | 'farel' | 'dafa'): THREE.Group {
    const group = new THREE.Group();
    group.name = `companion_${id}`;

    let shirtColor = 0xf0f2f5; // Putih SMA default
    let hairColor = 0x171717;
    let extraPropColor = 0x000000;

    if (id === 'lia') {
      shirtColor = 0xffffff;
      hairColor = 0x3e2723; // Brown ponytail
      extraPropColor = 0xef4444; // Red cross medical kit pouch
    } else if (id === 'rafli') {
      shirtColor = 0xd97706; // Sports varsity over uniform
      hairColor = 0x0f172a;
    } else if (id === 'farel') {
      shirtColor = 0xe2e8f0;
      hairColor = 0x1e293b;
    } else if (id === 'dafa') {
      shirtColor = 0xf8fafc;
      hairColor = 0x111827;
    }

    // Torso
    const torsoMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const torsoGeo = new THREE.BoxGeometry(0.48, 0.58, 0.28);
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.88;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const headGeo = new THREE.BoxGeometry(0.34, 0.34, 0.32);
    const head = new THREE.Mesh(headGeo, this.skinMat);
    head.position.y = 1.32;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hairGeo = new THREE.BoxGeometry(0.36, 0.16, 0.34);
    const hair = new THREE.Mesh(hairGeo, new THREE.MeshLambertMaterial({ color: hairColor }));
    hair.position.set(0, 1.44, 0.02);
    group.add(hair);

    // Specific features
    if (id === 'dafa') {
      // Heroic red headband (Ikat kepala merah)
      const bandGeo = new THREE.BoxGeometry(0.38, 0.08, 0.36);
      const band = new THREE.Mesh(bandGeo, new THREE.MeshLambertMaterial({ color: 0xdc2626 }));
      band.position.set(0, 1.38, 0);
      group.add(band);
    } else if (id === 'farel') {
      // Glasses frame
      const glassesGeo = new THREE.BoxGeometry(0.28, 0.06, 0.04);
      const glasses = new THREE.Mesh(glassesGeo, new THREE.MeshBasicMaterial({ color: 0x0f172a }));
      glasses.position.set(0, 1.32, 0.18);
      group.add(glasses);
    } else if (id === 'lia') {
      // Medical cross bag
      const medGeo = new THREE.BoxGeometry(0.24, 0.24, 0.12);
      const medBag = new THREE.Mesh(medGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }));
      medBag.position.set(0.28, 0.7, 0);
      group.add(medBag);
      const crossGeo = new THREE.BoxGeometry(0.12, 0.12, 0.02);
      const cross = new THREE.Mesh(crossGeo, new THREE.MeshBasicMaterial({ color: extraPropColor }));
      cross.position.set(0.35, 0.7, 0);
      cross.rotation.y = Math.PI / 2;
      group.add(cross);
    }

    // Legs
    const legGeo = new THREE.BoxGeometry(0.16, 0.52, 0.18);
    const leftLeg = new THREE.Mesh(legGeo, this.uniformGreyMat);
    leftLeg.position.set(-0.13, 0.33, 0);
    leftLeg.name = 'left_leg';
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, this.uniformGreyMat);
    rightLeg.position.set(0.13, 0.33, 0);
    rightLeg.name = 'right_leg';
    group.add(rightLeg);

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.42, 16);
    const shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.4, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    return group;
  }

  // Create Zombie Mesh (Student or Satpam)
  public static createZombie(type: 'student' | 'satpam' | 'runner' = 'student'): THREE.Group {
    const group = new THREE.Group();
    group.name = `zombie_${type}`;

    const isSatpam = type === 'satpam';
    const isRunner = type === 'runner';

    const torsoMat = isSatpam
      ? this.satpamUniformMat
      : isRunner
      ? new THREE.MeshLambertMaterial({ color: 0x78350f })
      : this.uniformShirtMat;

    const skin = isSatpam ? this.satpamSkinMat : this.zombieSkinMat;

    // Torso (with blood splatters)
    const scale = isSatpam ? 1.25 : isRunner ? 0.95 : 1.05;
    const torsoGeo = new THREE.BoxGeometry(0.52 * scale, 0.62 * scale, 0.3 * scale);
    const torso = new THREE.Mesh(torsoGeo, torsoMat);
    torso.position.y = 0.9 * scale;
    torso.castShadow = true;
    group.add(torso);

    // Blood stains on chest
    const bloodPatchGeo = new THREE.BoxGeometry(0.24 * scale, 0.28 * scale, 0.04);
    const bloodPatch = new THREE.Mesh(bloodPatchGeo, this.bloodMat);
    bloodPatch.position.set(0.08, 0.88 * scale, 0.16 * scale);
    group.add(bloodPatch);

    // Decayed head
    const headGeo = new THREE.BoxGeometry(0.38 * scale, 0.38 * scale, 0.34 * scale);
    const head = new THREE.Mesh(headGeo, skin);
    head.position.y = 1.36 * scale;
    head.castShadow = true;
    group.add(head);

    // Glowing creepy eyes
    const eyeGeo = new THREE.BoxGeometry(0.07, 0.07, 0.04);
    const eyeMat = new THREE.MeshBasicMaterial({ color: isRunner ? 0xff2200 : 0xeab308 });
    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.1 * scale, 1.38 * scale, 0.18 * scale);
    group.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.1 * scale, 1.38 * scale, 0.18 * scale);
    group.add(rightEye);

    // Outstretched zombie arms (classic zombie reach)
    const armGeo = new THREE.BoxGeometry(0.14 * scale, 0.14 * scale, 0.55 * scale);
    const leftArm = new THREE.Mesh(armGeo, skin);
    leftArm.position.set(-0.35 * scale, 0.95 * scale, 0.28 * scale);
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeo, skin);
    rightArm.position.set(0.35 * scale, 0.95 * scale, 0.28 * scale);
    group.add(rightArm);

    // Legs
    const legGeo = new THREE.BoxGeometry(0.18 * scale, 0.55 * scale, 0.2 * scale);
    const leftLeg = new THREE.Mesh(legGeo, isSatpam ? this.satpamUniformMat : this.uniformGreyMat);
    leftLeg.name = 'left_leg';
    leftLeg.position.set(-0.14 * scale, 0.32 * scale, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeo, isSatpam ? this.satpamUniformMat : this.uniformGreyMat);
    rightLeg.name = 'right_leg';
    rightLeg.position.set(0.14 * scale, 0.32 * scale, 0);
    group.add(rightLeg);

    // Shadow
    const shadowGeo = new THREE.CircleGeometry(0.48 * scale, 16);
    const shadow = new THREE.Mesh(
      shadowGeo,
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.5, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    group.add(shadow);

    return group;
  }
}
