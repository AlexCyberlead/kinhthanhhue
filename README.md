# Kinh Thành Huế 3D · Hue Imperial City Digital Twin

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](./package.json)
[![Good first issues](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)](https://github.com/AlexCyberlead/kinhthanhhue/labels/good%20first%20issue)

<p align="center">
  <strong>VI</strong> · Tái hiện 3D mang tính <em>giáo dục</em> toàn bộ Kinh thành Huế trên trình duyệt (React + three.js / R3F).<br/>
  <strong>EN</strong> · Educational browser-based 3D reconstruction of Hue’s imperial citadel (React + three.js / R3F).
</p>

> **Không phải** bản đo vẽ khảo cổ chính thức. / **Not** a certified archaeological survey.  
> Kích thước & anchor có nguồn xác thực lẫn ước lượng — xem research notes bên dưới.

---

## Research first · Nghiên cứu là mặt tiền

Trước khi sửa mesh hay đặt công trình mới, đọc bộ ghi chép Phase 0:

| Doc | VI | EN |
|-----|----|----|
| **[docs/research/](./docs/research/)** | Mục lục research | Research index |
| [layout.md](./docs/research/layout.md) | 3 vòng thành, Hội Điển, mốc lịch sử, hệ tọa độ | Layout, dimensions, chronology, world axes |
| [materials.md](./docs/research/materials.md) | Ngói lưu ly, vì kèo, contract PBR | Roof tiles, joinery, PBR contract |
| [nature_people.md](./docs/research/nature_people.md) | Cây Đại Nội, sen, trang phục | Vegetation, gardens, costumes |

Claims are tagged **`[xác thực — nguồn]`** (sourced) or **`[ước lượng hợp lý]`** (reasoned estimate).

### World coordinates

| | |
|--|--|
| Origin `(0,0,0)` | Center of **Sân Đại Triều Nghi** |
| `+Z` | South → Ngọ Môn → Hương River |
| `+Y` | Up · `+X` = East |
| 1 unit | **1 meter** |

---

## Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- three.js + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`
- zustand · Firebase Hosting
- **Procedural** Vietnamese Architecture Kit — no paid GLBs

## Quick start

```bash
npm install
npm run dev
```

```bash
npm run build      # production
npm run preview
npm run typecheck
```

## Controls · Điều khiển

| Input | Behavior |
|-------|----------|
| HUD camera | Orbit / Walk (WASD + click-lock) / Drone (WASD+QE) / Tour |
| Time / season / rain | Sky, leaves, Huế rain |
| Quality | Low → Ultra (PostFX); GPU auto-detect on first load |
| Yellow markers | Bilingual POI + deep-link `?poi=ngo-mon` |
| Tour panel | 12 stops + TTS (respects mute) |

## Add a monument · Thêm công trình

1. Implement `MonumentModule` in `src/monuments/<name>/` using `src/core/geometry/kit` + `getMaterial(...)`.
2. Export modules from that folder’s `index.ts`.
3. Register in `src/registry/registerAll.ts` → `bootstrapMonuments()`.
4. Fill bilingual `displayName` + `poi` (align anchors with [layout.md](./docs/research/layout.md)).

```ts
export interface MonumentModule {
  id: string
  displayName: { vi: string; en: string }
  build(lod: 0 | 1 | 2): THREE.Group
  anchor: [number, number, number] // meters; origin = Đại Triều Nghi court; +Z = South
  rotationY: number
  boundingRadius: number
  poi: { vi: string; en: string; year?: string }
}
```

Full guide: **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

## Roadmap for newcomers

Open issues labeled **`good first issue`** — e.g. richer **Điện Cần Chánh**, new **POIs**, **LOD** budgets, tour stops, research citations.

👉 https://github.com/AlexCyberlead/kinhthanhhue/labels/good%20first%20issue

## Deploy (Firebase Hosting)

```bash
npm run build
npx firebase login          # first time
npx firebase use kinhthanhhue
npx firebase deploy --only hosting
```

`firebase.json`: `public = dist`, SPA rewrite `** → /index.html`.

## Credits & sources

- Layout & dimensions: [`docs/research/layout.md`](./docs/research/layout.md)
- Materials: [`docs/research/materials.md`](./docs/research/materials.md)
- Nature & people: [`docs/research/nature_people.md`](./docs/research/nature_people.md)
- Textures: procedural canvas/noise + imperial Hue palette

## Disclaimer

Educational / experiential digital twin, stylized-realistic.  
Some structures lost after 1947 are shown as reconstructions; use the HUD `ruin` mode when a ruin variant exists.

## License

[MIT](./LICENSE) — free to use, modify, and contribute.
