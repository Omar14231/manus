import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { UniversalCamera } from "@babylonjs/core/Cameras/universalCamera";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Texture } from "@babylonjs/core/Materials/Textures/texture";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Ray } from "@babylonjs/core/Culling/ray";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Nullable } from "@babylonjs/core/types";

export type GameHandle = { scene: Scene; dispose: () => void };
type BlockType = "grass" | "dirt" | "stone" | "wood" | "leaf";
type BlockRecord = { type: BlockType; mesh: Mesh };

type MaterialPack = Record<BlockType, StandardMaterial>;

const BLOCK_TYPES: BlockType[] = ["grass", "dirt", "stone", "wood", "leaf"];
const ATLAS_URL = "/manus-storage/voxel-block-textures_dacd6876.png";
const demoMode = new URLSearchParams(window.location.search).has("demo");

const palette: Record<BlockType, string> = {
  grass: "#71b85c",
  dirt: "#a96542",
  stone: "#89939a",
  wood: "#9b633f",
  leaf: "#4d9360",
};

function keyOf(x: number, y: number, z: number) {
  return `${x}|${y}|${z}`;
}

function hash2(x: number, z: number) {
  const value = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function heightAt(x: number, z: number) {
  const radial = Math.max(0, 1 - Math.sqrt(x * x + z * z) / 17);
  const contour = Math.sin(x * 0.38) * 0.75 + Math.cos(z * 0.31) * 0.65;
  const pocket = Math.sin((x + z) * 0.7) * 0.3;
  return Math.max(1, Math.floor(2 + radial * 3 + contour + pocket));
}

function makeMaterial(scene: Scene, type: BlockType): StandardMaterial {
  const material = new StandardMaterial(`${type}-material`, scene);
  material.diffuseColor = Color3.FromHexString(palette[type]);
  material.specularColor = new Color3(0.05, 0.06, 0.06);
  material.roughness = type === "stone" ? 0.85 : 0.7;

  // The generated atlas is optional during local iteration; the palette remains a safe fallback.
  try {
    const texture = new Texture(ATLAS_URL, scene, true, false);
    texture.uScale = 0.5;
    texture.vScale = 0.5;
    const atlasOffset: Record<BlockType, [number, number]> = {
      grass: [0, 0.5],
      dirt: [0.5, 0.5],
      stone: [0, 0],
      wood: [0.5, 0],
      leaf: [0.5, 0],
    };
    texture.uOffset = atlasOffset[type][0];
    texture.vOffset = atlasOffset[type][1];
    material.diffuseTexture = texture;
  } catch {
    // Keep the solid-color material when the managed asset is not available yet.
  }
  return material;
}

function createTree(scene: Scene, blocks: Map<string, BlockRecord>, materials: MaterialPack, x: number, baseY: number, z: number) {
  for (let y = baseY + 1; y <= baseY + 4; y += 1) addBlock(scene, blocks, materials, x, y, z, "wood");
  for (let dx = -2; dx <= 2; dx += 1) {
    for (let dz = -2; dz <= 2; dz += 1) {
      for (let dy = 2; dy <= 4; dy += 1) {
        const edge = Math.abs(dx) + Math.abs(dz) + (dy === 4 ? 1 : 0);
        if (edge <= 3 && !(dx === 0 && dz === 0 && dy < 4)) {
          addBlock(scene, blocks, materials, x + dx, baseY + dy, z + dz, "leaf");
        }
      }
    }
  }
}

function addBlock(scene: Scene, blocks: Map<string, BlockRecord>, materials: MaterialPack, x: number, y: number, z: number, type: BlockType) {
  const key = keyOf(x, y, z);
  if (blocks.has(key)) return;
  const mesh = MeshBuilder.CreateBox(`block-${key}`, { size: 1 }, scene);
  mesh.position.set(x, y + 0.5, z);
  mesh.material = materials[type];
  mesh.checkCollisions = true;
  mesh.metadata = { voxel: true, x, y, z, type };
  blocks.set(key, { type, mesh });
}

function createWater(scene: Scene) {
  const water = MeshBuilder.CreateGround("water-surface", { width: 9, height: 12, subdivisions: 8 }, scene);
  water.position.set(4.5, 3.02, -1.2);
  const material = new StandardMaterial("water-material", scene);
  material.diffuseColor = new Color3(0.06, 0.45, 0.66);
  material.emissiveColor = new Color3(0.01, 0.09, 0.12);
  material.alpha = 0.72;
  material.specularColor = new Color3(0.6, 0.9, 1);
  water.material = material;
  water.isPickable = false;
  return water;
}

function updateHud(selected: BlockType, blockCount: number) {
  const status = document.getElementById("status");
  if (status) status.textContent = `${blockCount.toLocaleString()} blocks · ${selected.toUpperCase()} selected`;
  document.querySelectorAll<HTMLElement>(".hotbar-slot").forEach((slot, index) => {
    slot.classList.toggle("selected", BLOCK_TYPES[index] === selected);
  });
}

export async function createGameScene(engine: Engine, canvas: HTMLCanvasElement): Promise<GameHandle> {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.035, 0.07, 0.1, 1);
  scene.fogMode = Scene.FOGMODE_EXP2;
  scene.fogDensity = 0.009;
  scene.fogColor = new Color3(0.09, 0.18, 0.22);
  scene.collisionsEnabled = true;
  scene.gravity = new Vector3(0, -9.81, 0);

  const camera = new UniversalCamera("frontier-camera", new Vector3(0, 8.5, 12), scene);
  camera.attachControl(canvas, true);
  camera.speed = 0.35;
  camera.angularSensibility = 2800;
  camera.inertia = 0.15;
  camera.minZ = 0.05;
  camera.checkCollisions = true;
  camera.applyGravity = true;
  camera.ellipsoid = new Vector3(0.32, 0.9, 0.32);
  camera.keysUp = [87];
  camera.keysDown = [83];
  camera.keysLeft = [65];
  camera.keysRight = [68];
  camera.setTarget(new Vector3(0, 4.2, 0));

  const hemi = new HemisphericLight("sky-fill", new Vector3(0, 1, 0), scene);
  hemi.intensity = 0.72;
  hemi.diffuse = new Color3(0.62, 0.78, 0.98);
  hemi.groundColor = new Color3(0.2, 0.13, 0.08);

  const sun = new DirectionalLight("amber-sun", new Vector3(-0.45, -1, -0.35), scene);
  sun.position = new Vector3(18, 28, 18);
  sun.intensity = 1.8;
  sun.diffuse = new Color3(1, 0.73, 0.46);

  const materials = BLOCK_TYPES.reduce((pack, type) => {
    pack[type] = makeMaterial(scene, type);
    return pack;
  }, {} as MaterialPack);

  const blocks = new Map<string, BlockRecord>();
  for (let x = -19; x <= 19; x += 1) {
    for (let z = -19; z <= 19; z += 1) {
      const h = heightAt(x, z);
      for (let y = 0; y < h; y += 1) {
        const type: BlockType = y === h - 1 ? "grass" : y < h - 3 ? "stone" : "dirt";
        addBlock(scene, blocks, materials, x, y, z, type);
      }
    }
  }

  const treeSpots = [
    [-9, -5], [-6, 8], [1, -10], [9, 7], [13, -3], [-13, 4],
  ];
  treeSpots.forEach(([x, z]) => createTree(scene, blocks, materials, x, heightAt(x, z) - 1, z));
  createWater(scene);

  // Distant silhouettes keep the horizon readable while keeping the playable area compact.
  for (let x = -25; x <= 25; x += 3) {
    const z = -24;
    const h = 3 + Math.floor(hash2(x, z) * 5);
    for (let y = 0; y < h; y += 1) addBlock(scene, blocks, materials, x, y, z, "stone");
  }

  let selected: BlockType = "grass";
  let disposed = false;
  let lastAction = 0;
  const startHint = document.querySelector<HTMLElement>(".start-hint");
  const demoBadge = document.getElementById("demo-badge");
  if (demoMode) {
    camera.detachControl();
    camera.position = new Vector3(18, 12, 20);
    camera.rotation.y = Math.PI * 0.78;
    camera.rotation.x = 0.22;
    demoBadge?.classList.add("visible");
    if (startHint) startHint.classList.add("hidden");
  }

  const chooseSlot = (index: number) => {
    selected = BLOCK_TYPES[index] ?? selected;
    updateHud(selected, blocks.size);
  };

  const performRayAction = (mode: "break" | "place") => {
    const now = performance.now();
    if (now - lastAction < 170 || disposed) return;
    lastAction = now;
    const ray = camera.getForwardRay(7);
    const pick = scene.pickWithRay(ray, (mesh) => mesh.metadata?.voxel === true);
    if (!pick?.hit || !pick.pickedMesh || !pick.pickedPoint) return;
    const target = pick.pickedMesh as Mesh;
    const metadata = target.metadata as { x: number; y: number; z: number; type: BlockType };
    if (mode === "break") {
      const record = blocks.get(keyOf(metadata.x, metadata.y, metadata.z));
      record?.mesh.dispose();
      blocks.delete(keyOf(metadata.x, metadata.y, metadata.z));
    } else {
      const normal = pick.getNormal(true) ?? new Vector3(0, 1, 0);
      const point = pick.pickedPoint.add(normal.scale(0.55));
      const x = Math.round(point.x);
      const y = Math.floor(point.y);
      const z = Math.round(point.z);
      const wouldOverlap = Vector3.Distance(new Vector3(x, y + 0.5, z), camera.position) < 1.25;
      if (!wouldOverlap) addBlock(scene, blocks, materials, x, y, z, selected);
    }
    updateHud(selected, blocks.size);
  };

  const onPointerDown = (event: PointerEvent) => {
    if (demoMode) return;
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock?.();
      startHint?.classList.add("hidden");
      return;
    }
    if (event.button === 0) performRayAction("break");
    if (event.button === 2) performRayAction("place");
  };
  const onContextMenu = (event: Event) => event.preventDefault();
  const onKeyDown = (event: KeyboardEvent) => {
    const index = Number(event.key) - 1;
    if (index >= 0 && index < BLOCK_TYPES.length) chooseSlot(index);
  };
  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("contextmenu", onContextMenu);
  window.addEventListener("keydown", onKeyDown);

  const updateObserver = scene.onBeforeRenderObservable.add(() => {
    const time = performance.now() * 0.00035;
    if (demoMode) {
      camera.position.x = Math.cos(time) * 18;
      camera.position.z = Math.sin(time) * 18;
      camera.position.y = 10.5 + Math.sin(time * 1.8) * 1.2;
      camera.setTarget(new Vector3(0, 4.5, 0));
    }
    const water = scene.getMeshByName("water-surface");
    if (water) water.position.y = 3.02 + Math.sin(time * 8) * 0.025;
  });

  updateHud(selected, blocks.size);
  return {
    scene,
    dispose: () => {
      disposed = true;
      scene.onBeforeRenderObservable.remove(updateObserver);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("contextmenu", onContextMenu);
      window.removeEventListener("keydown", onKeyDown);
      if (document.pointerLockElement === canvas) document.exitPointerLock?.();
      scene.dispose();
    },
  };
}
