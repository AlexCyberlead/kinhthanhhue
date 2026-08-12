# ĐẠI CÁCH MẠNG KINH THÀNH HUẾ

> Digital twin giáo dục — **không** phải bản đo vẽ khảo cổ chính thức.
> Mục tiêu: đẩy **graphics 1/10 → 10/10** và **độ đầy đủ kiến trúc 2/10 → 10/10**.
> 14 phiên. Mỗi chat mới = 1 phiên. Không nhảy cóc.

**Đọc file này trước mọi dòng code.**
Trạng thái sống nằm ở [`docs/revolution/PROGRESS.md`](./docs/revolution/PROGRESS.md).

---

## 0. Prompt dán vào chat mới

Copy nguyên khối dưới. Đổi **một chỗ duy nhất**: `PHIÊN N`.

```
ĐẠI CÁCH MẠNG KINH THÀNH HUẾ — IMPLEMENT PHIÊN N

Bạn là agent implement duy nhất của phiên này. Làm hết phiên, đừng hỏi "bắt đầu chưa".

BẮT BUỘC đọc theo đúng thứ tự trước khi sửa file:
1. PLAN.md (file này) — toàn bộ. Sau đó đọc kỹ mục "Phiên N" trong phần 5.
2. docs/revolution/PROGRESS.md — phiên trước đã ship gì, file nào đụng, nợ gì.
3. docs/research/layout.md + docs/research/materials.md + docs/research/nature_people.md
4. Code hiện tại liên quan phiên N. Đừng đoán API. Đừng bịa contract.

NHIỆM VỤ
- Chỉ implement Phiên N. Không làm phiên N+1 "tiện tay".
- Không rewrite nửa repo. Nâng cấp in-place theo plan.
- Nếu một mục stretch không kịp: ghi vào PROGRESS.md, bỏ qua, đừng nửa vời.

RÀNG BUỘC CỨNG (vi phạm = fail phiên)
- Procedural Vietnamese Architecture Kit. CẤM thêm GLB/GLTF trả phí, CẤM tải model ngoài.
- Giữ MonumentModule contract (id, displayName vi+en, build(lod), anchor, rotationY, boundingRadius, poi vi+en).
- Hệ tọa độ: gốc (0,0,0) = tâm sân Đại Triều Nghi; +Z = Nam (ra Ngọ Môn / sông Hương); +Y = lên; +X = Đông; 1 unit = 1 mét.
- Material chỉ lấy qua getMaterial(id, lod). Texture mới phải đi qua MaterialLibrary — không rải MeshStandardMaterial màu phẳng lung tung.
- LOD 0 / 1 / 2 bắt buộc trên mọi builder mới. WorldScene hiện build lod=1 — đừng phá.
- InstancedMesh + mergeGeometries cho repetition (ngói sống, cột, cây, nhà phụ). Không spawn 10k Mesh rời.
- POI / HUD / camera / tour / i18n: đừng phá. Chuỗi user-facing phải có đủ VI + EN.
- Công trình mất 1947/1968: bản build() = restored. Ruin là variant riêng, không đọc zustand trong mesh builder (pure function).
- Claim kích thước/vị trí: bám research. Số mới phải tag [xác thực — nguồn] hoặc [ước lượng hợp lý] trong comment hoặc buildings.json.
- Không đổi coordinate system. Không đổi tên id monument đã có.

DONE khi và chỉ khi:
1. Toàn bộ mục "Phải ship" của Phiên N xong (không phải stretch).
2. `npm run typecheck` pass.
3. Không còn BoxGeometry trần làm mái hero / tường hero / sân hero ở đúng phạm vi phiên.
4. Cập nhật docs/revolution/PROGRESS.md: status, files chạm, notes handoff, nợ, điểm tự chấm.
5. Tóm tắt cho user bằng tiếng Việt: đã làm gì, nhìn thấy gì khi zoom, file chính, nợ, và nhắc dán prompt phiên N+1.

PHONG CÁCH MỤC TIÊU
Stylized-realistic hạng National Geographic / AC Discovery Tour — KHÔNG low-poly lego, KHÔNG Unreal 5 photogrammetry (trình duyệt không gánh).
Zoom gần: thấy ngói âm dương, gạch vồ, thớ gỗ, vôi bẩn, sống nóc, đầu đao.
Zoom xa: thấy một kinh thành đặc, có lớp lang sân-tường-hồ-phố — không còn bãi cỏ golf.

Bắt đầu Phiên N ngay. Đọc file, rồi implement.
```

Ví dụ: phiên đầu tiên → thay `PHIÊN N` thành `PHIÊN 1` (cả tiêu đề lẫn câu "Bắt đầu Phiên N").

---

## 1. Chẩn đoán — vì sao đang 1/10 và 2/10

Ảnh chụp hiện tại nói đúng. Đây không phải "thiếu polish". Đây là **sai tầng hình ảnh** và **sai mật độ đô thị**.

### 1.1 Graphics = 1/10 (nhìn như Lego)

| Triệu chứng | Nguyên nhân trong code | File neo |
|---|---|---|
| Mọi bề mặt một màu phẳng | `MaterialLibrary` chỉ set `color` — **zero** map / normal / roughness / AO | `src/core/materials/MaterialLibrary.ts` |
| Mái = miếng nhựa cong | `buildRoof` = heightfield 8×8 segment, không ngói, không sống nóc, không cổ diêm, không diềm mái | `src/core/geometry/kit/buildRoof.ts` |
| Rồng mái = viên thuốc + quả bóng | `makeOrnament` capsule + sphere | cùng file |
| Vì kèo = 3 thanh box | `buildBracketSet` xếp BoxGeometry | `src/core/geometry/kit/buildBracketSet.ts` |
| Cây = kem ốc quế | `ConeGeometry` + `SphereGeometry` sơn vertex color | `src/world/vegetation/geometries.ts` |
| Đất = sân golf | Terrain vertex tint `#4F6B3C` phẳng, không đường, không sân gạch, không thảm cỏ phân lớp | `src/world/terrain/buildTerrainGeometry.ts` |
| Tường thành = thanh chocolate | Extrude box, không gạch, không chân tường, không vọng lâu chi tiết | `src/world/citadel/buildCitadelWalls.ts` |
| Công trình = hộp + nắp | Hầu hết monument = `BoxGeometry` + 1 `buildRoof` | `src/monuments/**` |

PostFX (SSAO, bloom, ACES) đang **trang điểm lên mesh rỗng**. Không texture thì SSAO chỉ làm hộp tối hơn — không biến hộp thành kiến trúc.

### 1.2 Kiến trúc = 2/10 (bãi đất trống)

Đã đăng ký 3D (xương, chưa phải thịt):

Ngọ Môn, Thái Hòa, Đại Triều, Kỳ Đài, Phu Văn Lâu, Nghinh Lương Đình, cửa Hoàng thành, Thế / Thái / Triệu / Hưng Miếu, Hiển Lâm Các, Cửu Đỉnh, Diên Thọ, Trường Sanh, Phụng Tiên, Trường Lang, Tả–Hữu Vu, Cần Chánh, Đại Cung môn, Kiến Trung, Thái Bình Lâu, Tả–Hữu Vu nội, Duyệt Thị Đường, Cơ Hạ, Thiệu Phương, 10 cửa Kinh thành.

**Có trong `buildings.json` nhưng không có mesh:**

Càn Thành, Văn Minh, Võ Hiển, Trinh Minh, Quang Minh, Thuận Huy, Dưỡng Tâm, Khôn Thái, Thượng Thiện Đường, Lục Viện, Ngự Tiền Văn Phòng, Phủ Nội Vụ, Hưng Khánh / Gia Tường / Tường Loan / Nghi Phụng môn, Trấn Bình Đài / Môn.

**Không có cả trong data — đây là 80% bãi xanh trong ảnh:**

| Khu | Lịch sử có gì | Hiện tại |
|---|---|---|
| Bắc / Đông-Bắc Hoàng thành | **Hồ Tịnh Tâm** + 3 đảo Bồng Lai / Phương Trượng / Doanh Châu + lâu đài | 1 zone cây + mặt cỏ |
| Bắc Hoàng thành | **Ngự Hà**, **Hồ Học Hải**, hành cung / phủ | Trống |
| Đông Hoàng thành | Quốc Tử Giám, kho, phố ra Đông Ba | Trống |
| Tây Hoàng thành | Tôn Nhân Phủ, một số phủ đệ | Trống |
| Đông-Nam trong Kinh thành | **Lục Bộ**, Võ Khố (gần cửa Nhà Đồ) | Trống |
| Trong Hoàng thành giữa các điện | Tường hoa, hành lang, sân trong, hồ Nội Kim Thủy | Cỏ |
| Giữa 3 vòng thành | Phố, nhà dân, doanh trại, cầu, vườn | Cỏ |

Kinh thành chu vi **10.572 m**. Hoàng thành chỉ ~622 × 604 m. Phần còn lại đang là một hình chữ nhật xanh. Ngày xưa không bao giờ như vậy.

### 1.3 10/10 nghĩa là gì (và không nghĩa là gì)

**Là:**

- Zoom Ngọ Môn / Thái Hòa: đọc được trùng thiềm, ngói lưu ly âm dương, cột son, tảng đá, bậc, lan can, cổ diêm.
- Zoom ra: Kinh thành **đặc** — hồ, phố, bộ viện, vườn, tường lớp lang — không còn golf course.
- Vật liệu PBR có albedo + normal + roughness. Đất có sân, đường, bờ, không phải 1 tint.
- Cây có thân + tán cụm + loài đọc được (ngô đồng ≠ phượng ≠ tre).
- Stylized-realistic, nhất quán, chạy được trên trình duyệt.

**Không phải:**

- Photogrammetry Unreal 5 / Nanite.
- 147 công trình khảo cổ đúng từng thước (ta không có bản vẽ TTBTDT).
- GLB mua từ Sketchfab.
- Đổ texture 8K cho mọi tường xa 2 km.

Mọi số đo mới = **ước lượng hợp lý** trừ khi research đã tag xác thực. Ghi rõ.

---

## 2. Nguyên tắc cách mạng

1. **Nền trước, thịt sau.** Phiên 1–4 nâng kit + material. Phiên 5+ mới đụng hero. Nếu đắp điện mới bằng kit cũ, Lego nhân lên.
2. **Một hệ thống, nhiều instance.** `buildDinhHall` / `buildDistrictBlock` thay vì 40 file copy-paste hộp.
3. **Mật độ bằng lớp, không bằng hero.** Phố / bộ / phủ = footprint + seed + kind. Chỉ hero (Ngọ Môn, Thái Hòa, Kỳ Đài, Tịnh Tâm, Thế Miếu) được sculpt tay.
4. **Texture procedural, không asset bin.** Canvas / DataTexture, cache theo id+lod, dispose đúng cách.
5. **In-place.** Giữ id, anchor, registry. Nâng `build()`. Thêm module mới thì `registerAll.ts` + `buildings.json`.
6. **Một phiên = một DoD đóng.** Typecheck xanh. PROGRESS cập nhật. User paste phiên sau là chạy tiếp được.
7. **Không phá UX.** HUD, camera, tour, POI, i18n, quality preset, ruin/restored — giữ contract.

---

## 3. Bản đồ 14 phiên

```
ACT I    NỀN TẢNG HÌNH ẢNH          1 ── 2 ── 3 ── 4
ACT II   HERO (chỗ người ta zoom)    5 ── 6 ── 7
ACT III  ĐẠI NỘI ĐẦY                 8 ── 9 ── 10
ACT IV   KINH THÀNH HẾT ĐẤT TRỐNG    11 ── 12 ── 13
ACT V    SỰ SỐNG + CHỐT 10/10        14
```

| Phiên | Tên | Điểm kỳ vọng sau phiên (G / K) |
|------:|---|---|
| 1 | Nhà máy texture + MaterialLibrary v2 | 4 / 2 |
| 2 | Kit mái v2 (giết nắp Lego) | 5.5 / 2 |
| 3 | Kit kết cấu v2 (cột, tường, sân, vì, cổng, con giống) | 6.5 / 2.5 |
| 4 | Đất / sân / ánh sáng (giết sân golf) | 7 / 3 |
| 5 | Ngọ Môn + Lầu Ngũ Phụng | 8 / 3.5 |
| 6 | Thái Hòa + Đại Triều + Hồ Thái Dịch + Trung Đạo | 8.5 / 4 |
| 7 | Kỳ Đài + 10 cửa + tường 3 vòng | 8.5 / 5 |
| 8 | Nội đình Tử Cấm còn thiếu | 8.5 / 6.5 |
| 9 | Vải Hoàng thành (sân, tường hoa, phủ, hành lang) | 8.5 / 7.5 |
| 10 | Cụm miếu + cung Diên Thọ / Trường Sanh đúng dạng khu | 8.5 / 8 |
| 11 | Hồ Tịnh Tâm (cụm lớn nhất còn trống) | 8.5 / 8.5 |
| 12 | Lục Bộ + Quốc Tử Giám + phủ viện | 8.5 / 9 |
| 13 | Ngự Hà + phố + doanh + Trấn Bình Đài | 9 / 9.5 |
| 14 | Cây v2 + khí hậu + LOD + chốt hero | 10 / 10 |

G = graphics, K = kiến trúc / mật độ.

---

## 4. Hợp đồng kỹ thuật dùng chung mọi phiên

### 4.1 Monument

```ts
// src/core/types/MonumentModule.ts — KHÔNG đổi signature
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

Module mới: folder `src/monuments/<khu>/`, export qua `index.ts`, `registerAll.ts` gọi `registerAll([...])`, thêm entry `buildings.json`.

### 4.2 Material

Mọi mesh mới: `getMaterial(id, lod)`.

Id cốt lõi (đã có):  
`ngoi_hoang_luu_ly` `ngoi_thanh_luu_ly` `mai_ngoi_am_duong` `go_son_son` `vang_thep` `go_lim` `da_thanh` `gach_vo` `gach_bat_trang` `dong_thau` `phap_lam` `tuong_voi` `nuoc` `co_xanh` `dat_nen`

Được **thêm** id mới nếu research cần (ví dụ `co_kho` `duong_dat` `ngoi_am_duong_normal`) — ghi vào `docs/research/materials.md`.

Từ phiên 1 trở đi: material phải có ít nhất `map`. LOD0 thêm `normalMap` + `roughnessMap`. LOD2 được rút còn map nhỏ / flat.

### 4.3 Kit

`src/core/geometry/kit/` là nguồn sự thật hình học. Monument **không** tự `new BoxGeometry` làm mái / cột / sân hero. Được dùng box cho LOD2 massing và chi tiết vụn (then cửa, bậu).

### 4.4 Ngân sách (mục tiêu, không phải luật tử)

| Tầng | Draw calls scene full (med) | Ghi chú |
|---|---|---|
| Kit + monuments lod1 | giữ merge / instance | 1 mái = 1–3 mesh, không 400 viên ngói rời |
| Cột / ngói sống / cây / nhà phụ | InstancedMesh | |
| Terrain | 1–2 mesh | đã có |
| LOD2 xa | box + silhouette | WorldScene vẫn lod=1 cho đến phiên 14 |

`npm run typecheck` = cổng bắt buộc. `npm run build` nếu đụng Vite/asset.

### 4.5 Handoff giữa phiên

Cuối mỗi phiên, `PROGRESS.md` phải trả lời được:

- Phiên nào xong / đang dở / nợ
- File đụng
- API mới (hàm, opts)
- Cái gì phiên sau **phải** dùng, không được viết lại
- Điểm tự chấm G/K

---

## 5. Chi tiết từng phiên

---

### Phiên 1 — Nhà máy texture + MaterialLibrary v2

**Mục tiêu.** Kết thúc kỷ nguyên màu phẳng. Zoom bất kỳ tường / mái / cột hiện có phải thấy *bề mặt*, dù hình học vẫn thô.

**Phải ship**

1. `src/core/materials/textures/` — factory procedural (canvas hoặc `DataTexture`), deterministic, cache theo `id + lod + size`.
   Tối thiểu generator:
   - `ngoiAmDuong` — hàng ống sấp/ngửa, khe, variation hue
   - `ngoiMenVang` / `ngoiMenXanh` — glaze + micro-crack + blotch lò
   - `gachVo` — viên lớn, vữa tối, sứt góc
   - `gachBatTrang` — ô vuông, men, optional chữ thọ / hoa thị LOD0
   - `goLim` — thớ dọc, lỗ
   - `sonSon` — đỏ sâu, mòn cạnh lộ gỗ
   - `vangThep` — flake, mòn lộ son
   - `daThanh` — worley/grit, địa y nhẹ
   - `tuongVoi` — blotch, vệt mưa dọc, chân tường lộ gạch
   - `phapLam` — đảo men vàng/lục/lam/trắng
   - `co` / `dat` — noise thảm, không flat golf
2. `MaterialLibrary.getMaterial` gắn `map` (+ `normalMap`/`roughnessMap`/`aoMap` khi lod < 2). `color` giữ làm tint, không thay texture.
3. UV: generator ghi rõ repeat gợi ý (vd. ngói 0.35 m/viên, gạch vồ ~0.4×0.2, cột wrap 1 vòng). Sửa UV kit đang sai (`buildWall` uv `* 0.1` là điểm bắt đầu).
4. `disposeMaterialLibrary` dispose cả texture.
5. 1 trang note ngắn trong `docs/research/materials.md` mục "Texture factory (Revolution)" — id, size theo lod (256 / 512 / 128).

**Không làm.** Không đổi hình mái. Không đụng monument. Không thêm GLB.

**Stretch.** `MeshPhysicalMaterial` clearcoat cho men ngói lod0. Wetness hook (`raining` → roughness ↓) nếu làm được sạch, không bắt buộc.

**DoD nhìn.** F5, zoom tường Hoàng thành / mái Thái Hòa / cột: hết "shader mặc định Three". Vẫn xấu hình, nhưng đã có da.

**File chính:** `src/core/materials/**`, `docs/research/materials.md`. Có thể chỉnh UV tối thiểu trong `kit/buildWall.ts` / `buildRoof.ts` / `buildPlatform.ts` nếu texture bị stretch — không redesign mesh.

---

### Phiên 2 — Kit mái v2

**Mục tiêu.** Mái là 70% silhouette cung đình. Đây là phiên giết Lego rõ nhất.

**Phải ship**

Viết lại `buildRoof` (giữ `RoofOpts`, được **mở rộng** thêm field optional — không phá caller cũ):

| Chi tiết | LOD0 | LOD1 | LOD2 |
|---|---|---|---|
| Thân mái cong + đầu đao uốn | geo đặc, ≥16 seg | geo vừa, ≥10 seg | silhouette box/wedge có độ dốc |
| Sống nóc + sống góc | mesh riêng, material `vang_thep` / pháp lam | mesh đơn giản | bỏ hoặc 1 box mỏng |
| Diềm mái / ô kê | thanh gỗ + hàng ngói dương instanced thưa | thanh gỗ | bỏ |
| Cổ diêm giữa tầng (trùng thiềm) | band ô hộc + pháp lam | band phẳng có map | bỏ |
| Con giống lưỡng long / phượng | mesh stylized đọc được (thân S, đầu, chân mây) — **cấm** capsule+sphere | simplified | bỏ |
| Ngói mặt mái | normal+albedo từ factory; **không** instance từng viên mặt | chỉ texture | màu + dốc |

Opts mới gợi ý (optional): `ridge: 'long-chau-nhat' | 'phuong' | 'bau-phap-lam' | 'none'`, `coDiem?: boolean`, `tileScale?: number`.

**Không làm.** Không overhaul Ngọ Môn. Caller cũ (`tiers`, `curvature`, `tileMaterial`, `ridgeOrnament`) phải còn chạy.

**Stretch.** Máng thừa lưu (mái kép trùng thiềm) như 1 opts `linkedValley`.

**DoD nhìn.** Mọi công trình dùng `buildRoof` tự lên đời. Zoom mái Thái Hòa: có sống, có diềm, có độ cong đầu đao, có men — hết miếng xà phòng.

**File chính:** `src/core/geometry/kit/buildRoof.ts` (+ helper mới trong `kit/roof/` nếu file quá dài).

---

### Phiên 3 — Kit kết cấu v2

**Mục tiêu.** Hộp trắng + cột ống hết đất diễn. Mọi điện sau này inherit chất lượng này.

**Phải ship**

1. **`buildColumnGrid`** — cột tròn đủ seg, tảng đá kê (`da_thanh`), đầu cột đấu/gối, sơn son. LOD0: decal/ring thếp. InstancedMesh.
2. **`buildBracketSet`** — chồng rường + kẻ/bẩy/con sơn (kiểu Huế, **cấm dougong TQ nhiều tầng**). Research: `docs/research/materials.md` §1.2–1.3.
3. **`buildPlatform`** — nền, bó vỉa đá thanh, bậc, lan can con tiện, optional rồng thành bậc (lối giữa). Sàn `gach_bat_trang` có UV lặp.
4. **`buildWall`** — chân gạch vồ, thân vôi, đỉnh / con sơn / hoa văn pháp lam lod0. Crenel tử tế. UV world-ish mét.
5. **`buildGate`** — vòm, vọng lâu dùng mái v2, không còn 1 hộp thủng lỗ.
6. **Ornament kit** mới `kit/ornament.ts`: lưỡng long, phượng đầu đao, hồi văn, bờ nóc bầu rượu — dùng lại ở phiên 2 nếu chưa tách.

Giữ signature cũ, thêm opts optional.

**Không làm.** Không viết lại từng monument. Chúng tự hưởng khi gọi kit. Trừ khi một caller truyền số làm vỡ tỉ lệ — sửa caller tối thiểu.

**Stretch.** `buildTruongLang` / hồi lang mẫu 1 gian lặp được.

**DoD nhìn.** Cột có tảng + đầu. Sân có bậc + lan can. Tường có chân/thân. Vì kèo nhìn như gỗ xếp, không phải pallet IKEA.

**File chính:** `src/core/geometry/kit/**`.

---

### Phiên 4 — Đất, sân, ánh sáng — giết sân golf

**Mục tiêu.** Mặt đất kể chuyện: sân gạch, thần đạo, bờ hồ, đường đất, thảm cỏ không đều. Ánh sáng làm vật liệu phiên 1–3 sống.

**Phải ship**

1. **Terrain splats / tint v2** — trong `buildTerrainGeometry` + heightfield:
   - trong Hoàng thành: ưu tiên đất nền / sân, **không** cỏ bóng đá
   - thần đạo + sân Đại Triều: gạch (có thể để Groundwork lo phần gần, terrain lo phần xa)
   - bờ hào / bờ sông: đất, sỏi, không cỏ neon
   - ngoài thành: cỏ + đất đường, variation
2. **Groundwork v2** — `buildGroundwork`:
   - lát gạch Bát Tràng có mạch (texture, không 1 box trắng)
   - thần đạo Ngọ Môn → Thái Hòa → Đại Cung rõ
   - mép hồ Thái Dịch, bậc xuống nước
   - đường vòng trong Hoàng thành (ít nhất 1 vòng chữ nhật ôm Tử Cấm)
3. **Lighting** — `SkySystem` / `Celestial`:
   - nắng 10:00 (default HUD) đủ contrast để normal map đọc được
   - shadow cascade / bias chỉnh để cột không bị acne, sân không bị peter-panning
   - fog: Kinh thành còn đọc được, không gột trắng
4. **Ngoại Kim Thủy** (hào Hoàng thành) phải nhìn là nước, không phải rãnh tối — bám `WaterSystem` hiện có.

**Không làm.** Không Tịnh Tâm. Không phố ngoài. Không cây v2.

**Stretch.** Vệt mòn đường (darken giữa sân). Puddle khi `raining`.

**DoD nhìn.** Ảnh chụp cùng góc hiện tại: hết biển xanh. Có đường, sân, hào, đất. Vẫn thiếu nhà — đó là Act III–IV.

**File chính:** `src/world/terrain/**`, `src/world/groundwork/**`, `src/world/sky/**`, `src/world/water/**`, `src/core/Engine.tsx` (chỉ nếu shadow/tone cần).

---

### Phiên 5 — Ngọ Môn + Lầu Ngũ Phụng

**Mục tiêu.** Hero #1. Zoom vào không còn "cổng Lego".

**Phải ship**

Dùng kit v2, viết lại phần hình trong `src/monuments/ngomon/` (giữ id `ngo-mon`, anchor `[0, 2, 118]`):

- Nền đài **chữ U** đặc, gạch vồ + đá thanh, 5 lối (giữa rộng hơn, thành bậc rồng).
- Lầu 2 tầng, ~100 cột layout thật (không 12 ống).
- **9 bộ mái**: giữa hoàng lưu ly, 8 thanh lưu ly. Silhouette cao giữa, thấp cánh. LOD2 vẫn đọc được chữ U + 9 nóc.
- Lan can mặt đài, cầu thang lên lầu, cửa vòm có độ sâu (không plane thủng).
- Pháp lam / biển ngạch stylized lod0–1.

Bám `docs/research/materials.md` §1.1, §1.6 và `ngomon/geometry.ts`.

**Không làm.** Không Thái Hòa. Không đổi tour trừ copy POI nếu sai.

**Stretch.** Nội thất lầu tầng 2 gợi ý (sàn, vì, bao lơn) khi camera walk vào.

**DoD nhìn.** Cùng góc ảnh user: Ngọ Môn là cổng, không phải hộp có lỗ. 9 mái đọc được từ drone.

**File chính:** `src/monuments/ngomon/**`.

---

### Phiên 6 — Thái Hòa + Đại Triều + Hồ Thái Dịch + Trung Đạo

**Mục tiêu.** Hero #2 + trục lễ. Đây là origin world — phải đẹp từ mọi hướng.

**Phải ship**

1. **Điện Thái Hòa** — trùng thiềm điệp ốc thật (tiền + chính, máng thừa lưu), 80 cột, ngói hoàng lưu ly, chồng rường lod0, tường hồi vôi, cửa bức bàn, ngai + bửu tán giữ và nâng. `src/monuments/thaihoa/**`
2. **Sân Đại Triều Nghi** — phẩm sơn / vạch hàng quan, sân gạch, không box phẳng. `src/monuments/daitrieu/**`
3. **Hồ Thái Dịch** — nước + sen thưa + kè đá. Cầu **Trung Đạo** có lan can, nhịp, không tấm ván bay.
4. Phẩm sơn / tứ tượng nếu module optional (`phamSon`, `tuTuong`) chưa register — register nếu hình đã đạt.

**Không làm.** Không Cần Chánh (đã có, nâng nhẹ nếu tỉ lệ lệch trục). Không Tịnh Tâm.

**Stretch.** Nội thất Thái Hòa walk-in: trần vỏ cua, hoành phi.

**DoD nhìn.** Đứng sân nhìn lên điện: 2 khối mái, cột son hàng, sân có nhịp. Bay drone: trục Ngọ Môn–hồ–cầu–sân–điện thẳng và đặc.

**File chính:** `thaihoa/**`, `daitrieu/**`, groundwork/water đoạn hồ Thái Dịch.

---

### Phiên 7 — Kỳ Đài + cửa Kinh thành + tường 3 vòng

**Mục tiêu.** Vòng ngoài hết "thanh chocolate + 10 cổng giống hệt".

**Phải ship**

1. **Kỳ Đài** — 3 tầng đài thu dần, ốp gạch vồ, lan can, cầu thang, cột cờ 37 m + đàn 17.5 m (tổng ~54 m). Không 3 hộp chồng. `src/monuments/kydai/**`
2. **10 cửa + 2 thủy quan** — cùng DNA (`buildCitadelGate`) nhưng:
   - vòm đúng tỉ lệ research (cao cửa ~8.5 m, vọng lâu ~8.9 m)
   - vọng lâu dùng mái v2
   - tên / hướng đúng `gateDefs.ts`
   - thủy quan khác cửa bộ (cống, nước chảy qua)
3. **Tường Kinh thành** — dày 21.25 m, cao ngoài 6.46 / trong 3.825, mặt ngoài dốc nhẹ, 24 pháo đài Vauban **đọc được** (không chỉ radius blob), hành lang mặt thành, bắn ải / pháo nhãn stylized thưa. `src/world/citadel/**`
4. **Tường Hoàng thành + Tử Cấm** — cao/dày đúng constant, cổng 4 hướng Hoàng thành nâng cùng kit cổng v2. `src/monuments/imperial/**`, `tucam/**`

**Không làm.** Không Trấn Bình Đài (phiên 13). Không phủ bên trong vòng.

**Stretch.** Pháo trên mặt thành (instance thưa). Cờ trên vọng lâu.

**DoD nhìn.** Drone vòng ngoài: thành đặc, góc lồi Vauban, cửa có vọng lâu, Kỳ Đài là landmark.

**File chính:** `kydai/**`, `gates/**`, `world/citadel/**`, `imperial/**`, `tucam/buildTuCamWalls.ts`.

---

### Phiên 8 — Nội đình Tử Cấm còn thiếu

**Mục tiêu.** Trục thần đạo phía Bắc Thái Hòa không còn 2–3 nhà rồi cỏ.

**Phải ship — factory trước, instance sau**

`src/monuments/noicung/buildDinhHall.ts` (hoặc `src/core/geometry/kit/buildDinhHall.ts`):

```ts
type DinhHallOpts = {
  width: number
  depth: number
  tiers: 1 | 2
  tile: 'ngoi_hoang_luu_ly' | 'ngoi_thanh_luu_ly'
  columnsX: number
  columnsZ: number
  variant: 'royal' | 'office' | 'residence' | 'service'
  status?: 'restored' | 'ruin'
  lod: 0 | 1 | 2
}
```

Rồi đăng ký module (anchor lấy `buildings.json` / `layout.md`):

| id | Ghi chú |
|---|---|
| `dien-can-thanh` | Tư cung, mái hoàng, lớn hơn Cần Chánh một bậc |
| `dien-van-minh` | Tả văn, thanh lưu ly |
| `dien-vo-hien` | Hữu võ, đối xứng |
| `dien-trinh-minh` | Tây Càn Thành |
| `dien-quang-minh` | Đông cung |
| `vien-thuan-huy` | Viện nhỏ |
| `vien-duong-tam` | Viện nhỏ |
| `cung-khon-thai` | Cung Hoàng hậu, khu không phải 1 hộp |
| `thuong-thien-duong` | Bếp ngự, variant service |
| `luc-vien` | 6 viện — **1 module** instance 6 nhà + tường khu |
| `ngu-tien-van-phong` | Bảo Đại, khối sau / hơi Tây |
| `hung-khanh-mon` `gia-tuong-mon` `tuong-loan-mon` `nghi-phung-mon` | Cửa Tử Cấm, dùng `buildGate` |

Nâng nhẹ Cần Chánh / Kiến Trung / Thái Bình Lâu / Đại Cung môn cho khớp tỉ lệ factory (đừng rewrite nếu đã ổn).

Ruin variant: nền + cột gãy + tường thấp — `buildXxxxRuin(lod)`, không đọc store.

**Không làm.** Không Phủ Nội Vụ (phiên 9). Không vườn lớn.

**Stretch.** Nội thất Càn Thành lod0.

**DoD nhìn.** Bay dọc trục +Z→−Z: Ngọ Môn–Thái Hòa–Đại Cung–Cần Chánh–Càn Thành–Khôn Thái–Kiến Trung **liền mạch**, hai bên có nhà, không lỗ cỏ 80 m.

**File chính:** `src/monuments/noicung/**`, `vu/**` (nếu Cần Chánh lệch), `registerAll.ts`, `buildings.json`.

---

### Phiên 9 — Vải Hoàng thành

**Mục tiêu.** Đại Nội là **khu**, không phải 12 nhà thả trên thảm.

**Phải ship**

1. **Tường hoa / tường ngăn khu** trong Hoàng thành — ô chữ nhật ôm Tử Cấm, tách miếu Tây / miếu Đông / cung Tây / phủ Đông. Dùng `buildWall`, thấp hơn thành, có cổng nhỏ.
2. **Hành lang / trường lang** mật độ thật — nối Thái Hòa ↔ Tả Hữu Vu ↔ Đại Cung. Nâng `truonglang/**`.
3. **Phủ Nội Vụ** `[160, 1, -220]` — khu hành chính nhiều nhà, không 1 hộp. Factory phiên 8.
4. **Hồ Nội Kim Thủy** (hào nhỏ trong / sát tường Tử Cấm hoặc mặt nước nội) + kè. [ước lượng hợp lý] nếu research chưa khóa polygon.
5. Sân trong các cung: nền gạch, không cỏ giữa hai điện.
6. Đăng ký POI mới (VI+EN) cho phủ + cửa Tử Cấm nếu chưa có.

**Không làm.** Không overhaul Diên Thọ (phiên 10). Không Tịnh Tâm.

**Stretch.** Tàng thơ / kho nhỏ phía Đông như massing.

**DoD nhìn.** Zoom Đại Nội: lưới sân–tường–nhà. Hết "nhà nổi trên rau".

**File chính:** `src/world/groundwork/**` hoặc `src/monuments/hoangthanh/` mới, `cung/` (tường khu), `truonglang/**`, module `phu-noi-vu`.

---

### Phiên 10 — Cụm miếu + cung Thái hậu

**Mục tiêu.** Thế Miếu / Hiển Lâm / Cửu Đỉnh / Diên Thọ nhìn như di tích, không như nhà kho + tháp.

**Phải ship**

1. **Thế Miếu** — nhà chính 9 gian stylized, sân, nghi môn, tả hữu phối, ngói thanh/hoàng đúng cấp. `themieu/theMieu.ts`
2. **Hiển Lâm Các** — 3 tầng gỗ thu dần, ~17 m, 12 mái, 24 cột (4 cột xuyên). Silhouette bắt buộc đúng. `hienLamCac.ts`
3. **Cửu Đỉnh** — 9 đỉnh đồng khác nhau (cao thấp / họa tiết stylized), không 9 viên nang. `cuuDinh.ts`
4. **Thái / Triệu / Hưng Miếu** — cùng DNA `buildMieu` nhưng tỷ lệ + sân + nghi môn đủ dày. `mieu/**`
5. **Cung Diên Thọ + Trường Sanh** — **compound**: nhiều nhà, sân trong, cổng, hành lang, mái thanh lưu ly, đầu đao phượng. `cung/**`
6. Phụng Tiên: ruin/partial có nền, cột, tường gãy đọc được.

**Không làm.** Không Tịnh Tâm. Không Lục Bộ.

**Stretch.** Án thờ / khám lod0 trong Thế Miếu.

**DoD nhìn.** Góc Tây-Nam Đại Nội đặc như ảnh tư liệu: miếu + các + đỉnh + tường khu. Góc Tây: cung Thái hậu là một xóm nhà, không 2 hộp.

**File chính:** `themieu/**`, `mieu/**`, `cung/**`.

---

### Phiên 11 — Hồ Tịnh Tâm

**Mục tiêu.** Lấp "cánh đồng" Bắc / Đông-Bắc Hoàng thành bằng cụm hồ–đảo–lâu lớn nhất Kinh thành.

**Neo [ước lượng hợp lý]** (hiệu chỉnh cho khớp tường, không đè Hoàng thành):

```
ho-tinh-tam   tâm ≈ [220, 0, -620]   mặt nước ~ 280 × 180 m
đảo Bồng Lai  hơi Nam tâm hồ
đảo Phương Trượng / Doanh Châu  hai đảo nhỏ hơn
```

`WORLD.landmarks.hoTinhTam` hiện `[180, 0, -420]` — **được dịch** nếu đè tường Bắc (~z = −482). Ghi note research.

**Phải ship**

1. Mặt nước riêng (không recycle nhầm Thái Dịch), sen dày theo mùa (bám `nature_people.md`).
2. 3 đảo + cầu nối + kè đá + liễu / trúc ven bờ.
3. Lầu / đình trên đảo (Nhất Trụ / Trần Thanh stylized) — hero vừa, dùng kit v2.
4. Tường / đường bao hồ, cửa vào vườn.
5. Module + POI + `buildings.json` + vegetation zone cập nhật (đừng để cây mọc giữa hồ).

**Không làm.** Không Lục Bộ. Không Hồ Học Hải (phiên 13) trừ khi nước thông nhau bắt buộc.

**Stretch.** Đình/bến thứ 4, đá giả sơn.

**DoD nhìn.** Cùng góc ảnh user: phía Bắc-Đông Đại Nội là **hồ lớn có đảo**, không phải cỏ + 4 cây kem.

**File chính:** `src/monuments/tinhtam/` (mới), `world/water/**`, `world/vegetation/placements.ts`, `worldConfig.ts`, `buildings.json`, `registerAll.ts`.

---

### Phiên 12 — Bộ máy + học viện + phủ

**Mục tiêu.** Kinh thành là kinh đô hành chính, không phải công viên bao quanh Đại Nội.

**Phải ship — `buildDistrictBlock`**

```ts
// src/world/districts/buildDistrictBlock.ts
type DistrictKind = 'bo' | 'phu' | 'hoc' | 'kho' | 'doanh' | 'dan'
type BlockOpts = {
  id: string
  kind: DistrictKind
  cx: number; cz: number; hx: number; hz: number
  rotY?: number
  seed: number
  lod: 0 | 1 | 2
}
// Trả Group: tường khu + cổng + 3–12 nhà kit + sân + 1–2 cây
```

Đặt khối (anchor [ước lượng hợp lý], tránh đè hồ / thành / Đại Nội):

| id | kind | Gợi ý tâm | Ghi chú |
|---|---|---|---|
| `luc-bo` | `bo` | `[380, 0, 40]` Đông / Đông-Nam Đại Nội | 6 bộ = 6 sân con trong 1 module hoặc 6 block |
| `quoc-tu-giam` | `hoc` | `[420, 0, -180]` Đông | Văn miếu / giám, nhà dài + sân |
| `ton-nhan-phu` | `phu` | `[-420, 0, -180]` Tây | Phủ tông thất |
| `co-mat-vien` | `phu` | `[-280, 0, -40]` | Viện mật |
| `vo-kho` | `kho` | `[-380, 0, 280]` gần cửa Chính Nam / Nhà Đồ | Kho vũ khí |
| `kham-thien-giam` | `hoc` | `[280, 0, -320]` | Khối nhỏ |

LOD2: 1–2 khối mái + tường chu vi. LOD1: đủ đọc là "khu nhà".

POI cho Lục Bộ, Quốc Tử Giám, Tôn Nhân Phủ. `buildings.json` + register.

**Không làm.** Không nhà dân từng căn. Không Trấn Bình.

**Stretch.** Thái Y viện, Tàng Thơ Lâu nếu còn ngân sách draw call.

**DoD nhìn.** Đông và Tây Đại Nội có **đô thị hành chính**. Drone không còn 400 m cỏ.

**File chính:** `src/world/districts/**`, `src/monuments/kinhthanh/` (module bọc), registry, research note ngắn `docs/research/layout.md` (bảng anchor ước lượng).

---

### Phiên 13 — Ngự Hà + phố + doanh + Trấn Bình

**Mục tiêu.** Lấp nốt vòng Kinh thành. Sau phiên này **cấm còn cánh đồng trống > ~120 m** trong tường ngoài (trừ thao trường / mặt hồ cố ý).

**Phải ship**

1. **Ngự Hà** — kênh Đông–Tây, nối `dong-thanh-thuy-quan` ↔ `tay-thanh-thuy-quan`, qua Bắc Hoàng thành (`WORLD.landmarks.nguHa ≈ z=-380`). Bờ, 3–5 cầu, nước chảy stylized.
2. **Hồ Học Hải** (Tây-Bắc, nhỏ hơn Tịnh Tâm) + kè + 1 đình.
3. **Phố / nhà dân** — `buildDistrictBlock({ kind: 'dan' })` dọc trục ra Đông Ba, An Hòa, Thượng Tứ. Nhà thấp, ngói âm dương không men, mật độ cao, **instance**.
4. **Doanh trại** `kind: 'doanh'` gần cửa Bắc / Mang Cá.
5. **Trấn Bình Đài + Môn** — thành phụ Mang Cá, góc Đông-Bắc, không bỏ trống `buildings.json`.
6. Đường đất / gạch nối cửa → Đại Nội (groundwork vòng ngoài).

**Không làm.** Đàn Nam Giao / Ngự Bình sculpt (ngoài scope mật độ). Cung An Định.

**Stretch.** Chợ Đông Ba massing ngoài cửa Đông. Thuyền trên Ngự Hà.

**DoD nhìn.** Ảnh drone toàn Kinh thành: đặc. Còn "thở" ở hồ + sân lễ + mặt thành — không còn golf.

**File chính:** `world/water/**`, `world/districts/**`, `world/groundwork/**`, `monuments/gates` (nếu thủy quan), module `tran-binh-dai`, `registerAll.ts`.

---

### Phiên 14 — Cây v2 + khí hậu + LOD + chốt 10/10

**Mục tiêu.** Hết kem ốc quế. Hết lod1 cứng cho cả thế giới. Hero cuối cùng. Chấm 10/10.

**Phải ship**

1. **Vegetation v2** — `src/world/vegetation/geometries.ts`:
   - LOD0: thân + 4–8 cụm tán + card lá
   - LOD1: thân + 2–3 cụm
   - LOD2: cross-plane
   - Loài đọc được: ngô đồng (thân thẳng, hoa), phượng (tán dù), tre (clump), liễu (rũ), sứ, sen (lá đứng ≠ súng nổi)
   - Placement: không mọc trên mái / giữa thần đạo / giữa hồ; dày Tịnh Tâm, Cơ Hạ, Thiệu Phương, bờ hào; thưa trục lễ
2. **Atmosphere polish** — sương sớm, god ray cửa Ngọ Môn, lá mùa, mưa Huế ướt material (nếu phiên 1 chưa hook).
3. **LOD thế giới** — `WorldScene` không `build(1)` cho mọi thứ:
   - hero gần camera: lod0
   - vòng Đại Nội: lod1
   - Kinh thành xa / district: lod2
   - Có thể khoảng cách đơn giản (không bắt buộc BVH)
4. **Chốt hero** — pass cuối Ngọ Môn + Thái Hòa + Kỳ Đài + Tịnh Tâm: tỉ lệ, z-fight, shadow acne, mái xuyên tường.
5. Draw-call sanity: district + cây instance, không nổ GPU low preset.
6. Tour / POI: thêm stop Tịnh Tâm, Lục Bộ, Quốc Tử Giám nếu thiếu. Copy VI+EN.
7. Cập nhật `PROGRESS.md` + mục điểm cuối. Ghi nợ thật (nếu còn) — đừng bịa 10/10 nếu còn cánh đồng.

**Không làm.** Không feature UX mới (minimap redesign, v.v.) trừ khi vỡ do LOD.

**Stretch.** Instanced NPC dày hơn ở phố / sân triều. Chim đậu mái.

**DoD nhìn.**

- Walk Ngọ Môn → Thái Hòa: kiến trúc + vật liệu + sân, không Lego.
- Drone 200 m: Kinh thành đặc, hồ Tịnh Tâm đọc được, thành Vauban đọc được.
- Cây không còn cone.
- Low preset vẫn ~mượt (không đo số cứng — cảm tính + không freeze).

**File chính:** `vegetation/**`, `scenes/WorldScene.tsx`, `atmosphere/**`, `postfx/**`, hero folders, `ux/tour/stops.ts`, `PROGRESS.md`.

---

## 6. Anchor Kinh thành ngoài Đại Nội

Toàn bộ **[ước lượng hợp lý]** — dịch nếu đè tường / hồ / hero. Sai số kỳ vọng ±40–80 m.

```
                    −Z Bắc
                       │
     An Hòa          Học Hải        Tịnh Tâm         Kẻ Trài
         ·          [−350,-850]    [220,-620]           ·
                       │               ~~~
     Tôn Nhân     Ngự Hà ═══════════════════════ Đông Ba
     [−420,-180]       │  z≈−380              [1180,80]
                       │
    Tây ·──────── Hoàng thành 622×604 ────────· Đông
                  tâm [0,-180]
                       │
     Võ Khố        Ngọ Môn [0,118]         Lục Bộ / Giám
    [−380,280]         │                  [380,40] / [420,-180]
                       │
                    Kỳ Đài [0,340]
                       │
                    +Z Nam → sông Hương
```

Hoàng thành xấp xỉ: `x ∈ [-311, 311]`, `z ∈ [-482, 122]`.
Tử Cấm xấp xỉ: `x ∈ [-162, 162]`, `z ∈ [-380, -90]`.
Kinh thành xấp xỉ: `x ∈ [-1362, 1362]`, `z ∈ [-1300, 480]`.

District **cấm** overlap các AABB trên ± 15 m buffer.

---

## 7. Thứ tự đọc code (để khỏi lạc)

```
PLAN.md
docs/revolution/PROGRESS.md
docs/research/{layout,materials,nature_people}.md
src/core/types/MonumentModule.ts
src/core/materials/MaterialLibrary.ts
src/core/geometry/kit/
src/registry/registerAll.ts
src/data/buildings.json
src/data/worldConfig.ts
src/scenes/WorldScene.tsx
src/monuments/<khu của phiên>/
src/world/<hệ của phiên>/
```

---

## 8. Cấm

- `BoxGeometry` làm mái hero / tường hero / sân hero từ sau phiên 3 (LOD2 massing được).
- Capsule + sphere làm rồng / phượng.
- Cone + sphere làm cây từ sau phiên 14 (phiên 14 xóa hẳn).
- Tự `new MeshStandardMaterial({ color })` song song library.
- Sửa id monument cũ, xoay trục thế giới, đổi 1 unit ≠ 1 m.
- GLB / texture PNG 4K nhồi `public/` trừ khi tự generate và tối thiểu (ưu tiên canvas runtime).
- "Tiện" làm phiên sau. "Tiện" rewrite HUD.
- Claim 10/10 khi còn bãi cỏ > 120 m trong thành (trừ mặt hồ / sân lễ / mặt thành).

---

## 9. Cách chấm điểm giữa đường

Chấm trong `PROGRESS.md` mỗi cuối phiên. Thang:

**Graphics**

| Điểm | Điều kiện |
|---:|---|
| 1 | Màu phẳng, mái blob, cây cone (baseline) |
| 4 | Có albedo/normal đọc được trên mái + tường + cột |
| 6 | Mái có sống/đầu đao; sân không golf; kit không hộp trần |
| 8 | 3 hero (Ngọ Môn, Thái Hòa, Kỳ Đài) chịu zoom walk |
| 10 | Hero + cây + đất + ánh sáng đồng bộ; low preset sống |

**Kiến trúc**

| Điểm | Điều kiện |
|---:|---|
| 2 | ~20 nhà thả trên cỏ (baseline) |
| 4 | Trục lễ đặc (Ngọ Môn→Kiến Trung) |
| 6 | Đại Nội kín tường/sân; Tử Cấm đủ điện |
| 8 | Tịnh Tâm + 1 vành đai bộ/phủ |
| 10 | Trong tường ngoài không còn cánh đồng; phố + kênh + đài phụ |

---

## 10. Bắt đầu

1. Mở chat mới.
2. Dán prompt mục 0, viết `PHIÊN 1`.
3. Để agent làm hết, đọc tóm tắt, check `PROGRESS.md`.
4. Chat mới, `PHIÊN 2`. Lặp đến 14.

Không nhồi 2 phiên một chat. Context đầy → kit vỡ → Lego trở lại.
