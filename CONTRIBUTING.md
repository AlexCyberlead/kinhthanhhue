# Contributing · Hướng dẫn đóng góp

Cảm ơn bạn quan tâm tới **Kinh Thành Huế 3D** — digital twin giáo dục chạy trên trình duyệt.

Thanks for contributing to **Hue Imperial City 3D** — an educational browser digital twin.

## Quick start

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

## Good first issues

Look for issues labeled [`good first issue`](https://github.com/AlexCyberlead/kinhthanhhue/labels/good%20first%20issue). Typical entry points:

- Monument geometry (kit-based, no paid GLBs)
- POI copy (VI + EN)
- LOD / draw-call budgets
- Research doc citations

## Project map

| Path | Role |
|------|------|
| `src/core/geometry/kit/` | Vietnamese Architecture Kit (roof, platform, columns…) |
| `src/core/materials/` | Shared PBR materials |
| `src/monuments/` | One folder per complex / building |
| `src/registry/` | Registers modules into the world |
| `src/ux/poi/` | Hotspots + panel + deep-links |
| `docs/research/` | Layout, materials, nature — **read before modeling** |

## Add a monument

1. Implement `MonumentModule` under `src/monuments/<name>/`.
2. Export from that folder’s `index.ts`.
3. Register in `src/registry/registerAll.ts`.
4. Fill `displayName` + `poi` in **both** Vietnamese and English.
5. Align anchors with `docs/research/layout.md` (1 unit = 1 m; `+Z` = South).

```ts
export interface MonumentModule {
  id: string
  displayName: { vi: string; en: string }
  build(lod: 0 | 1 | 2): THREE.Group
  anchor: [number, number, number]
  rotationY: number
  boundingRadius: number
  poi: { vi: string; en: string; year?: string }
}
```

## Pull requests

- Keep PRs focused (one building, one bugfix, or one doc topic).
- Run `npm run typecheck` before opening the PR.
- Mention which research section you used if dimensions change.
- Prefer procedural kit geometry over large binary assets.

## Code of collaboration

- Educational first: label reconstructions vs ruins clearly.
- Respect cultural heritage — no satirical/defamatory alterations of sacred sites.
- Be kind in issues and reviews.

## License

By contributing, you agree your contributions are licensed under the [MIT License](./LICENSE).
