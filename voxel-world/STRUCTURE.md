# Voxel World Sandbox

## Runtime

- Babylon.js 9.28.x
- React 19 + TypeScript + Vite
- Browser URL: WebDev preview
- Dimension: 3D

## App Entry

- `client/index.html` -> `client/src/main.tsx`
- `client/src/main.tsx` -> React app
- `client/src/App.tsx` -> renders the full-screen game canvas route
- `client/src/components/GameCanvas.tsx` -> owns the Babylon Engine lifecycle and DOM HUD shell

## Game Entry

- `client/src/game/scene.ts` -> exports `createGameScene(engine, canvas)` and owns the voxel world, input, camera, lighting, and gameplay update loop

## Planned Modules

- `VoxelWorld` responsibilities are currently kept in `scene.ts` because the first playable slice is compact.
- `InputManager` responsibilities are semantic DOM/canvas handlers in `scene.ts`.
- `CameraController` is the Babylon UniversalCamera plus deterministic demo camera branch.
- `UIController` responsibilities are DOM updates through `#status`, `#hotbar`, and `#demo-badge`.

## Assets

- `ASSETS.md` records generated references and runtime storage URLs.
- Large generated images stay outside the project source tree and are uploaded to managed storage.

## Verification

- `pnpm check`
- `pnpm build`
- `?demo` preview screenshot
- Interactive canvas test with pointer lock, WASD, left-click break, right-click place, and 1–5 hotbar selection
