# Kinh Thành Huế 3D — Digital Twin

Tái hiện 3D mang tính **giáo dục** toàn bộ Kinh thành Huế trên trình duyệt (React + three.js / R3F).  
**Không phải** bản đo vẽ khảo cổ chính thức — kích thước/anchor có nguồn xác thực lẫn ước lượng (xem `docs/research/`).

## Stack

- React 18 + Vite + TypeScript + Tailwind CSS
- three.js + `@react-three/fiber` + `@react-three/drei` + `@react-three/postprocessing`
- zustand (state) · Firebase Hosting (deploy)
- Geometry procedural (Vietnamese Architecture Kit) — không GLB trả phí

## Chạy local

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
npm run preview
```

Typecheck:

```bash
npx tsc --noEmit
```

## Điều khiển

| Input | Hành vi |
|-------|---------|
| HUD camera | Orbit / Walk (WASD + click lock) / Drone (WASD+QE) / Tour |
| Time / season / rain | Đổi bầu trời, lá, mưa Huế |
| Quality | Low→Ultra (PostFX); GPU auto-detect lần đầu |
| Click marker vàng | POI song ngữ + deep-link `?poi=ngo-mon` |
| Tour panel | 12 điểm + TTS (tắt khi mute) |

## Thêm công trình mới

1. Implement `MonumentModule` trong `src/monuments/<ten>/` dùng kit `src/core/geometry/kit` + `getMaterial(...)`.
2. Export mảng modules từ `index.ts`.
3. Orchestrator đăng ký trong `src/registry/registerAll.ts` → `bootstrapMonuments()`.
4. POI lấy từ `displayName` + `poi` trên module.

Contract:

```ts
export interface MonumentModule {
  id: string
  displayName: { vi: string; en: string }
  build(lod: 0 | 1 | 2): THREE.Group
  anchor: [number, number, number] // mét; gốc = sân Đại Triều Nghi; +Z = Nam
  rotationY: number
  boundingRadius: number
  poi: { vi: string; en: string; year?: string }
}
```

## Hệ tọa độ

- Gốc `(0,0,0)` = tâm sân **Đại Triều Nghi**
- `+Z` = Nam (Ngọ Môn → sông Hương)
- `1 unit = 1 mét`

## Deploy Firebase Hosting

```bash
npm run build
npx firebase login   # lần đầu
npx firebase use kinhthanhhue   # hoặc đổi project trong .firebaserc
npx firebase deploy --only hosting
```

`firebase.json`: `public = dist`, SPA rewrite `** → /index.html`.

## Credit / nguồn

- Quy hoạch & kích thước: `docs/research/layout.md` (Hội Điển / Cố đô Huế / Wikipedia — có nhãn xác thực vs ước lượng)
- Vật liệu PBR: `docs/research/materials.md`
- Cây & trang phục: `docs/research/nature_people.md`
- Texture: procedural canvas/noise + palette cung đình Huế

## Disclaimer

Đây là **digital twin giáo dục / trải nghiệm**, phục dựng stylized-realistic.  
Một số công trình đã mất (1947…) được dựng ở chế độ phục dựng; bật `ruin` trên HUD khi có bản phế tích.
