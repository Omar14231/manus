# Memory

- The game is intentionally original and uses the working title **Voxel World** rather than Minecraft branding.
- WebDev static project initialized at `/home/ubuntu/voxel-world`.
- Babylon.js was added as a runtime dependency.
- The first slice uses procedural boxes for terrain and props, with a generated block atlas wired through managed storage when available.
- `?demo` is the deterministic visual QA mode; normal mode is interactive first-person.
- Keep large images outside the project tree. Upload them with `manus-upload-file --webdev` and record the resulting managed URL in `ASSETS.md`.
