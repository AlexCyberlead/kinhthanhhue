# Đại Cách Mạng — Progress

Nguồn sự thật sống. Mỗi phiên **phải** cập nhật file này trước khi kết thúc.
Plan: [`../../PLAN.md`](../../PLAN.md)

**Baseline (trước phiên 1):** graphics **1/10** · kiến trúc **2/10**  
**Mục tiêu sau phiên 14:** graphics **10/10** · kiến trúc **10/10**

---

## Bảng phiên

| Phiên | Tên | Status | G | K | Ngày | Agent note (1 dòng) |
|------:|---|---|---:|---:|---|---|
| 1 | Texture + MaterialLibrary v2 | done | 4 | 2 | 2026-08-13 | Albedo/normal/rough/AO procedural; kit UV mét; hình học vẫn thô |
| 2 | Kit mái v2 | pending | — | — | | |
| 3 | Kit kết cấu v2 | pending | — | — | | |
| 4 | Đất / sân / ánh sáng | pending | — | — | | |
| 5 | Ngọ Môn + Ngũ Phụng | pending | — | — | | |
| 6 | Thái Hòa + Đại Triều + Thái Dịch | pending | — | — | | |
| 7 | Kỳ Đài + cửa + tường 3 vòng | pending | — | — | | |
| 8 | Nội đình Tử Cấm thiếu | pending | — | — | | |
| 9 | Vải Hoàng thành | pending | — | — | | |
| 10 | Cụm miếu + cung Thái hậu | pending | — | — | | |
| 11 | Hồ Tịnh Tâm | pending | — | — | | |
| 12 | Lục Bộ + Giám + phủ | pending | — | — | | |
| 13 | Ngự Hà + phố + Trấn Bình | pending | — | — | | |
| 14 | Cây v2 + LOD + chốt 10/10 | pending | — | — | | |

`status`: `pending` | `in_progress` | `done` | `done_with_debt`

---

## API / contract mới (phiên sau phải dùng, cấm viết lại)

- `getMaterial(id, lod)` luôn có `map`. LOD 0–1 thêm `normalMap` / `roughnessMap` / `aoMap`. `color` là tint (mặc định trắng).
- Texture mới: `getTextureSet(factoryId, lod)` trong `src/core/materials/textures/`. Cache `id::lod::size`. Cấm `new MeshStandardMaterial({ color })` song song library.
- `textureSizeForLod`: 512 / 256 / 128. `UV_REPEAT_METERS` = mét / 1 cycle UV (ngói 2.8, gạch vồ 4.0, cột wrap U=1).
- `disposeMaterialLibrary()` dispose material **và** texture cache.
- `applyWetness(0..1)` — raining hook; AtmosphereSystem đã gắn.
- Kit UV: `copyUvToUv2`, `scaleBoxUvToMeters`, `uvRepeat` trong `kit/uvMeters.ts`. Tường / mái / sân / cột kit đã dùng.
- Clearcoat `MeshPhysicalMaterial` chỉ LOD0 men ngói / pháp lam / Bát Tràng.

---

## File đã chạm (gộp)

- `src/core/materials/MaterialLibrary.ts`
- `src/core/materials/textures/**` (mới)
- `src/core/geometry/kit/uvMeters.ts` (mới)
- `src/core/geometry/kit/buildWall.ts`
- `src/core/geometry/kit/buildRoof.ts`
- `src/core/geometry/kit/buildPlatform.ts`
- `src/core/geometry/kit/buildColumnGrid.ts`
- `src/world/atmosphere/AtmosphereSystem.tsx` (wetness hook)
- `docs/research/materials.md` §9
- `docs/revolution/PROGRESS.md`

---

## Nợ chuyển phiên

| Từ phiên | Nợ | Phiên dự kiến gỡ | Ưu tiên |
|---:|---|---:|---|
| 1 | Monument BoxGeometry vẫn UV 0–1 (1 cycle stretch trên mặt dài) — không đụng monument | 3 (kit tường/sân) / 5–7 (hero) | trung |
| 1 | Terrain / WaterSystem chưa dùng factory (vertex tint + shader riêng) | 4 | thấp |
| 1 | aoMap chỉ hiện khi có uv2 — kit đã copy; monument cũ không có | 3 / hero | thấp |

---

## Handoff — phiên vừa xong

### Phiên 1 — Nhà máy texture + MaterialLibrary v2 — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 4/10 · K 2/10

**Đã ship (khớp DoD):**
- Factory procedural 15 generator (đủ list tối thiểu + `dongThau` / `nuoc` để mọi id có map).
- `getMaterial` gắn map; LOD<2 thêm normal / roughness / AO.
- UV kit: tường mét (bỏ `* 0.1` XZ), mái XZ/mét, sân box mét, cột wrap 1 vòng + V theo cao.
- `disposeMaterialLibrary` dispose texture.
- Note `docs/research/materials.md` §9.
- Stretch: clearcoat LOD0 men; `applyWetness` khi mưa.

**Nợ / stretch bỏ:**
- Không nửa vời. Monument UV 0–1 cố ý (cấm đụng monument phiên 1).

**API mới:**
- `getTextureSet(id, lod)` / `disposeTextureCache()` / `textureSizeForLod` / `UV_REPEAT_METERS`
- `applyWetness(amount)`
- `copyUvToUv2` / `scaleBoxUvToMeters` / `uvRepeat`

**File chính:**
- `src/core/materials/**`
- `src/core/geometry/kit/uvMeters.ts` + 4 kit UV
- `docs/research/materials.md`

**Nhìn thấy gì khi F5:**
- Zoom tường Hoàng thành / thành Kinh: gạch vồ + vữa, hết màu phẳng.
- Zoom mái Thái Hòa / Ngọ Môn: hàng ngói âm dương + men (hình vẫn là heightfield 8×8).
- Zoom cột son: thớ / mòn cạnh.
- Mưa HUD: roughness giảm, mặt tối nhẹ.
- Hình học vẫn Lego — phiên 2 giết mái.

**Typecheck:** pass

**Phiên sau cần biết:**
- Đừng viết lại factory. Mái v2 chỉ đổi geo `buildRoof`, giữ `RoofOpts`, lấy material qua `getMaterial`.
- WorldScene vẫn `build(1)` → texture 256. Clearcoat LOD0 chưa thấy cho đến phiên 14 (hoặc test `build(0)`).
- UV kit lấy `UV_REPEAT_METERS`; mái v2 nên UV mét / cycle ngói 2.8.

---

## Ghi chú ổn định (đừng xóa)

- Origin `(0,0,0)` = tâm sân Đại Triều Nghi. `+Z` = Nam. `1 unit = 1 m`.
- `WorldScene` hiện `m.build(1)` cho mọi monument — đổi LOD động chỉ ở phiên 14.
- `build()` luôn restored. Ruin = hàm riêng, không đọc zustand trong builder.
- Material: chỉ `getMaterial(id, lod)`.
- Không GLB trả phí.
