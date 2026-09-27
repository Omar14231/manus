# Game Plan: Voxel World Sandbox

## Scope

An original browser voxel sandbox inspired by block-building games. It does not copy Minecraft branding, assets, characters, or code.

## Risk Tasks

### 1. Procedural voxel terrain and runtime block editing
- **Why isolated:** The terrain is generated from a deterministic height function and then edited at runtime through ray-picked block meshes.
- **Approach:** Keep a keyed block map, create compact box meshes with shared materials, and update the map and mesh ownership atomically on break/place actions.
- **Verify:** Terrain loads without gaps in the playable island, left click removes the targeted block, right click places the selected block on the hit face, and edits remain stable while the camera moves.

### 2. First-person camera and pointer-lock input
- **Why isolated:** Browser pointer lock needs a user gesture and can be unavailable in embedded previews.
- **Approach:** Use Babylon UniversalCamera with collisions/gravity, attach controls to the canvas, request pointer lock only after a canvas click, and provide a deterministic `?demo` camera mode that requires no pointer lock.
- **Verify:** WASD movement and mouse look respond after clicking the canvas; the demo URL renders a stable showcase without user input; no camera or listener errors occur on unmount.

## Main Build

- Full-screen Babylon.js canvas hosted in the WebDev React shell.
- Deterministic grassy island with dirt, stone, water, trees, and distant voxel hills.
- Five-slot hotbar with keyboard selection (1–5), selected block indicator, and interaction hints.
- First-person block breaking/placing with a center crosshair.
- Warm cinematic lighting, fog, shadows, and crisp block materials.
- Generated art direction reference plus generated block texture atlas used as runtime visual material.

- **Assets needed:**
  - `voxel-reference.png` — visual target only, 16:9 in-game composition.
  - `voxel-block-textures.png` — generated 2×2 block texture atlas used by Babylon materials.

- **Verify:**
  - Movement direction matches WASD input and camera look follows mouse after pointer lock.
  - Procedural terrain, trees, water, and distant hills are visible with no obvious fallback errors.
  - Block selection, breaking, and placing update the world and HUD.
  - HUD remains readable over the 3D scene and does not overflow at desktop size.
  - `?demo` shows a deterministic camera presentation.
  - `pnpm check` and `pnpm build` pass.
  - No browser console errors during capture.
  - Reference consistency: warm amber sunlight, jade grass, terracotta dirt, slate stone, cyan water, and clean cubic silhouettes.
