# Assets

**Art direction:** Original voxel sandbox rendering with clean sharp cubic silhouettes, warm amber-to-teal golden-hour lighting, saturated jade grass, terracotta dirt, slate stone, cyan water, subtle ambient occlusion, and a calm premium game-preview feel. No Minecraft logos, characters, or copied assets.

## References

| Name | Description | Size | Image | Runtime |
|------|-------------|------|-------|---------|
| voxel_reference | In-game visual target showing the island, lake, trees, stone outcrop, first-person hand, crosshair, and hotbar | 16:9, 1920x1080 composition | `/home/ubuntu/webdev-static-assets/voxel-reference.png` | Review-only |

## Textures

| Name | Description | Size | Image | Runtime |
|------|-------------|------|-------|---------|
| voxel_block_atlas | 2×2 atlas: grass/soil, dirt, stone, water | 2m tile regions | `/home/ubuntu/webdev-static-assets/voxel-block-textures.png` | `/manus-storage/` URL recorded after upload |

**Managed storage URL:** `/manus-storage/voxel-block-textures_dacd6876.png`

## Procedural Geometry

| Name | Description | Size | Runtime |
|------|-------------|------|---------|
| block_meshes | Cubic terrain and props generated in Babylon.js | 1m blocks | Shared materials and box meshes |
| water_surface | Translucent animated surface | Island lake area | Babylon plane |
