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
| 2 | Kit mái v2 | done | 5.5 | 2 | 2026-08-13 | Hip + đầu đao + sống + diềm + ô kê + cổ diêm + con giống; hết nắp xà phòng |
| 3 | Kit kết cấu v2 | done | 6.5 | 2.5 | 2026-08-13 | Cột tảng+đấu; vì chồng rường; sân bậc+con tiện; tường chân/thân; cổng vòm đùn |
| 4 | Đất / sân / ánh sáng | done | 7 | 3 | 2026-08-13 | Splat gạch/đất/cỏ; thần đạo+vòng Tử Cấm; Ngoại Kim Thủy; nắng 10:00 đọc normal |
| 5 | Ngọ Môn + Ngũ Phụng | done | 7.5 | 3.5 | 2026-08-13 | Hero #1: U + 5 vòm xuyên + 9 nóc kit + ~100 cột; hết cổng Lego |
| 6 | Thái Hòa + Đại Triều + Thái Dịch | done | 8 | 4 | 2026-08-13 | Hero #2: 80 cột kit, trùng thiềm + máng thừa lưu, sân vạch phẩm, sen + cầu lan can |
| 7 | Kỳ Đài + cửa + tường 3 vòng | done | 8.5 | 5 | 2026-08-13 | 3 tầng đài gạch; 10 cửa + 2 thủy quan; thành dốc + Vauban + hành lang |
| 8 | Nội đình Tử Cấm thiếu | done | 8.5 | 6.5 | 2026-08-13 | Factory `buildDinhHall`; Càn Thành→Kiến Trung liền mạch; 4 cửa Tử Cấm |
| 9 | Vải Hoàng thành | done | 8.5 | 7.5 | 2026-08-13 | Tường hoa ngăn khu; Trường Lang nối Vu; Phủ Nội Vụ; Nội Kim Thủy |
| 10 | Cụm miếu + cung Thái hậu | done | 8.5 | 8 | 2026-08-13 | Thế Miếu 9 gian + phối; Hiển Lâm 3 tầng; 9 đỉnh khác; cung = compound |
| 11 | Hồ Tịnh Tâm | done | 8.5 | 8.5 | 2026-08-13 | Hồ 280×180 tại [220,−620]; 3 đảo + lầu + cầu + sen dày |
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
- **`buildRoof` v2** — giữ `RoofOpts` cũ. Field mới optional: `ridge`, `coDiem`, `tileScale`, `linkedValley`. Đừng viết lại thân mái; hero phiên 5–6 gọi kit này.
- `ridge` thắng `ridgeOrnament` nếu cả hai có. Map cũ: `dragon` → `long-chau-nhat`, `phoenix` → `phuong`.
- UV mái: U dọc diềm, V xuống dốc, chia 2.8 m × `tileScale`. Không instance từng viên mặt.
- Contract đứng: eaves ≈ y 0 của group; `yBase = t * (lod==2 ? 1.2 : 1.55)`; `rise ≈ 1.6` (lod 0–1). Đừng dịch caller trừ khi tỉ lệ vỡ.
- **`buildColumnGrid` v2** — **trả `THREE.Group`** (không còn InstancedMesh trần). Children: shafts + tảng `da_thanh` + đấu/gối + đai `vang_thep` (LOD0). Đáy y=0, đỉnh y=`height` — caller cũ không lệch mái. Opts mới: `plinth?`, `capital?`.
- **`buildBracketSet` v2** — chồng rường + kẻ/bẩy + con sơn bậc (kiểu Huế). Cấm dougong TQ. Wood + gold merged. Signature cũ.
- **`buildPlatform` v2** — sàn `gach_bat_trang` UV lặp, bó vỉa `da_thanh`, bậc + thành bậc, lan can **con tiện** lathe InstancedMesh. Opts mới: `centerDragon?` (default false), `stepFace?: 'south'|'north'|'both'|'none'`.
- **`buildWall` v2** — **trả `THREE.Group`** (chân gạch vồ + thân vôi + đỉnh pháp lam/đá). Citadel / merge pipeline dùng **`extrudeWallGeometry`** (geo trần, UV mét, crenel nhịp đều). `finish?: 'layered'|'masonry'`.
- **`buildGate` v2** — vòm = ExtrudeGeometry có lỗ (Hội Điển ~3.825×5.185). Không hộp + inset tối. Mái = `buildRoof` v2, `name === 'roof'` để `stripKitRoof` vẫn gỡ.
- **`kit/ornament.ts`** — `dragonOrnamentGeo` / `phoenixOrnamentGeo` / `sunOrnamentGeo` / `gourdOrnamentGeo` / `hoiVanBandGeo` + builder `buildLuongLong` / `buildPhuongDao` / `buildBauRuouRidge` / `buildHoiVanBand`. Mái phiên 2 import từ đây.
- **Terrain splat v2** — `createTerrainMaterial(lod)` + `splatWeights(x,z)`. Vertex color = `(brick, dirt, grass)`. UV mét / 8 m. Cấm quay lại tint `#4F6B3C` phẳng. Interior Kinh/Hoàng thành cao độ ≈ 0 (không plateau 0.55 m — đè groundwork).
- **`IMPERIAL_CITY` / `FORBIDDEN_CITY` / `IMPERIAL_MOAT` / `THAI_DICH`** trong `terrainConfig.ts`. Water + groundwork + heightfield dùng chung — đừng nhân bản số.
- **Ngoại Kim Thủy** — `createImperialMoatGeometry()` + mesh `ngoai-kim-thuy` trong WaterSystem (cùng shader hồ). Cầu đất 4 cửa qua `imperialMoatGateBridge`.
- **Groundwork** — `pavePlane` / `paveBox` (UV mét). Thần đạo + sân Đại Triều = `gach_bat_trang`. Vòng Tử Cấm = `dat_nen`. Kè Thái Dịch + kè Ngoại Kim Thủy = `da_thanh`.
- **Ánh sáng** — `SkyPalette.fogDensity`. Nắng 10:00 contrast cao (sun ~1.85, ambient/hemi hạ). Shadow: `bias -0.00008`, `normalBias 0.045`, frustum ±340 ôm Đại Nội, mapSize theo quality (1024/2048/4096).
- **Ngọ Môn v2** — giữ id `ngo-mon`, anchor `[0, 2, 118]`. `NGO_MON` + `ngoMonLayout()` + `ngoMonOpenings()` + `extrudeArchWall` trong `src/monuments/ngomon/geometry.ts`. Đừng thay bằng `buildGate({ type: 'ngo-mon' })` (kit generic, không phải 9 nóc / 100 cột).
- 9 bộ mái = 9 lần `buildRoof`. Giữa `ngoi_hoang_luu_ly` + `ridge: 'long-chau-nhat'`; 8 còn lại `ngoi_thanh_luu_ly`. `ridge` bật ở lod 0–1 (WorldScene lod=1 **có** con giống).
- ~100 cột = `buildColumnGrid` (48 xuyên 8×6 + 52 hồi lang/cánh). Cấm quay lại `buildColumnsAt` cylinder trần.
- **Thái Hòa v2** — giữ id `dien-thai-hoa`, anchor `[0, 1, -48]`. 80 cột = 2 `buildColumnGrid` (9×5 tiền + 7×5 chính). Hai `buildRoof` `tiers: 2`, `ridge: 'long-chau-nhat'` lod 0–1, `linkedValley` trên mái chính. Cấm quay lại cylinder trần / `ridgeOrnament` chỉ lod0.
- **`buildThaiDichLotus(lod)`** — sen thưa InstancedMesh, tránh dải cầu. WaterSystem lod=1.
- **`buildThuyQuan(lod)`** — cống nước, không vọng lâu. Modules `dong-thanh-thuy-quan` / `tay-thanh-thuy-quan`.
- **Tường Kinh thành v2** — mặt ngoài dốc + lõi cao 3.825 + hành lang + parapet + 24 pháo đài góc + bắn ải thưa. `CITADEL.heightOuter/heightInner/thickness` là nguồn số.
- **`buildDinhHall(opts)`** — factory điện Tử Cấm. `status: 'ruin'` → `buildDinhHallRuin` (pure). Variant `royal|office|residence|service`.
- Tường Tử Cấm: gap Nam Đại Cung; Đông/Tây offset z=+35 (Hưng Khánh / Gia Tường); Bắc hai lỗ x=±40 (Tường Loan / Nghi Phụng).
- **Tường hoa Hoàng thành** — `buildPartitionWalls` trong `groundwork/buildImperialFabric.ts`. Ôm Tử Cấm + tách miếu Tây / miếu Đông / cung Tây / phủ Đông. `buildWall` + `buildGate` nhỏ. Không viết tường mới bằng BoxGeometry hero.
- **Sân nội** — `INNER_COURTS` + `buildInnerCourts`. Gạch Bát Tràng giữa các điện. Cấm cỏ giữa hai nhà trên trục / cung / phủ.
- **Hồ Nội Kim Thủy** — `NOI_KIM_THUY` (terrain + water + groundwork kè). 3 mặt Đông/Tây/Bắc, bỏ Nam. `noiKimThuyWeight` / `createNoiKimThuyGeometry`. [ước lượng hợp lý]
- **`buildPhuNoiVu`** — factory `buildDinhHall` (office + service). Id `phu-noi-vu`, anchor `[160, 1, -220]`.
- **Trường Lang nối** — `collectConnectorPositions` + `addConnectorRuns`: NS x=±36 tới z≈−132; EW z=−98 / −125. Mái kit `buildRoof`.
- **`buildCungCompound`** — Diên Thọ / Trường Sanh: nhiều nhà + sân + cổng + hành lang. Mái `ngoi_thanh_luu_ly`, ridge phượng qua `buildDinhHall` variant residence.
- **Thế Miếu** — 9 gian lod 0–1, sân + nghi môn, tả hữu phối `buildDinhHall`. Ridge `long-chau-nhat` lod 0–1.
- **Hiển Lâm** — wrap eave lod 0–1 (đọc 12 mặt mái); 4 xuyên + 12 + 8 cột; bầu rượu kit.
- **Cửu Đỉnh** — 9 geo khác nhau (`URN_VARIANTS`) merge 1 mesh, không InstancedMesh một khuôn.
- **`buildMieu`** — `sideHalls?`; ridge lod 0–1; nghi môn dùng `buildRoof` cả lod1.
- **Hồ Tịnh Tâm** — `ho-tinh-tam` anchor `[220, 0, -620]`, mặt nước 280×180. `HO_TINH_TAM` / `TINH_TAM` / `WORLD.landmarks.hoTinhTam` đã dịch khỏi `[180, −420]`. 3 đảo + cầu + lầu kit. `buildTinhTamLotus`. Vegetation: sen trên nước tránh đảo; tre/liễu chỉ bờ (`inTinhTamShore`).

---

## File đã chạm (gộp)

- `src/core/materials/MaterialLibrary.ts`
- `src/core/materials/textures/**` (mới)
- `src/core/geometry/kit/uvMeters.ts` (mới)
- `src/core/geometry/kit/buildWall.ts`
- `src/core/geometry/kit/buildRoof.ts`
- `src/core/geometry/kit/roof/**` (mới — phiên 2; ornament tách phiên 3)
- `src/core/geometry/kit/buildPlatform.ts`
- `src/core/geometry/kit/buildColumnGrid.ts`
- `src/core/geometry/kit/buildBracketSet.ts`
- `src/core/geometry/kit/buildGate.ts`
- `src/core/geometry/kit/ornament.ts` (mới — phiên 3)
- `src/core/geometry/kit/index.ts`
- `src/core/Engine.tsx` (fog fallback)
- `src/world/citadel/buildCitadelWalls.ts` (đổi sang `extrudeWallGeometry`)
- `src/world/groundwork/buildGroundwork.ts`
- `src/world/groundwork/geoUtils.ts`
- `src/world/groundwork/constants.ts`
- `src/world/terrain/terrainConfig.ts`
- `src/world/terrain/heightfield.ts`
- `src/world/terrain/buildTerrainGeometry.ts`
- `src/world/terrain/splatWeights.ts` (mới)
- `src/world/terrain/createTerrainMaterial.ts` (mới)
- `src/world/terrain/TerrainSystem.tsx`
- `src/world/terrain/index.ts`
- `src/world/water/waterConfig.ts`
- `src/world/water/buildWaterMeshes.ts`
- `src/world/water/WaterSystem.tsx`
- `src/world/water/index.ts`
- `src/world/sky/skyMath.ts`
- `src/world/sky/Celestial.tsx`
- `src/world/atmosphere/AtmosphereSystem.tsx` (wetness hook)
- `docs/research/materials.md` §9 + §9.1
- `docs/research/layout.md` §2.2 Ngoại Kim Thủy
- `src/monuments/ngomon/**` (phiên 5 — viết lại hình)
- `src/data/buildings.json` (notes `ngo-mon`)
- `src/monuments/thaihoa/**` (phiên 6)
- `src/monuments/daitrieu/courtyard.ts` (phiên 6)
- `src/world/water/buildLotusField.ts` (mới — phiên 6)
- `src/world/water/WaterSystem.tsx` + `index.ts`
- `src/world/groundwork/buildGroundwork.ts` (cầu Trung Đạo lan can)
- `src/monuments/kydai/kyDai.ts` + `geometry.ts` (phiên 7)
- `src/monuments/gates/buildCitadelGate.ts` + `buildThuyQuan.ts` (mới) + `gateDefs.ts`
- `src/world/citadel/buildCitadelWalls.ts` (phiên 7)
- `src/monuments/imperial/buildImperialWalls.ts` + `buildImperialGate.ts`
- `src/monuments/tucam/buildTuCamWalls.ts` + `constants.ts` + `buildDaiCungMon.ts`
- `src/monuments/noicung/buildDinhHall.ts` (mới — phiên 8)
- `src/monuments/noicung/innerHalls.ts` + `cungKhonThai.ts` + `lucVien.ts` + `nguTienVanPhong.ts` + `tuCamGates.ts`
- `src/monuments/noicung/index.ts` + `dienKienTrung.ts` + `thaiBinhLau.ts`
- `src/monuments/vu/dienCanChanh.ts` (ridge lod 0–1)
- `src/registry/registerAll.ts`
- `docs/revolution/PROGRESS.md`
- `src/world/groundwork/buildImperialFabric.ts` (mới — phiên 9)
- `src/monuments/hoangthanh/**` (mới — phiên 9)
- `src/monuments/truonglang/buildTruongLang.ts` + `truongLang.ts`
- `src/monuments/themieu/**` (phiên 10)
- `src/monuments/mieu/**` (phiên 10)
- `src/monuments/cung/buildCungCompound.ts` (mới) + `cungDienTho.ts` + `cungTruongSanh.ts` + `dienPhungTien.ts`
- `src/monuments/tinhtam/**` (mới — phiên 11)
- `src/world/water/**` (Nội Kim Thủy + Tịnh Tâm sen)
- `src/world/terrain/terrainConfig.ts` + `heightfield.ts` + `splatWeights.ts`
- `src/world/vegetation/placements.ts`
- `src/data/worldConfig.ts` + `buildings.json`
- `src/registry/registerAll.ts`
- `docs/research/layout.md` (Nội Kim Thủy + Tịnh Tâm)

---

## Nợ chuyển phiên

| Từ phiên | Nợ | Phiên dự kiến gỡ | Ưu tiên |
|---:|---|---:|---|
| 1 | Monument BoxGeometry vẫn UV 0–1 (1 cycle stretch trên mặt dài) — không đụng monument | 5–7 (hero) | trung |
| 1 | aoMap chỉ hiện khi có uv2 — kit đã copy; monument cũ không có | hero | thấp |
| 2 | Hầu hết caller truyền `ridgeOrnament: lod===0 ? … : 'none'` → WorldScene lod=1 **không** thấy con giống. **Ngọ Môn đã bật `ridge` ở lod 0–1.** Còn Thái Hòa / khác | 6 (hero) | thấp |
| 2 | `linkedValley` chỉ là hook; Thái Hòa tiền+chính chưa nối máng thừa lưu | 6 | thấp |
| 3 | Stretch `buildTruongLang` / hồi lang 1 gian lặp — **bỏ**, đã có `monuments/truonglang` | 9 | thấp |
| 3 | `buildColumnGrid` đổi return Group — comment monument cũ vẫn viết “1 InstancedMesh” | không bắt buộc sửa | thấp |
| 4 | CSM 3 tầng Three.js đòi `setupMaterial` mọi mesh — **không làm** (sẽ phá kit). 1 frustum ±340 + bias/normalBias. Kỳ Đài / tường ngoài có thể thiếu bóng | 7 hoặc 14 | thấp |
| 4 | Stretch puddle khi `raining` — **bỏ**. Wetness material đã có từ phiên 1 | 14 | thấp |
| 4 | Heightfield ~28 m/ô: hào 18 m có thể trượt ô — nước + kè groundwork là nguồn nhìn chính | không bắt buộc | thấp |
| 5 | Nội thất lầu tầng 2 chỉ gợi ý (sàn + vì + bao lơn) — chưa trần vỏ cua / hoành phi | 14 (chốt hero) | thấp |
| 5 | G 8/10 lock khi Thái Hòa + Kỳ Đài cũng chịu zoom walk | 6–7 | — |
| 6 | Stretch nội thất Thái Hòa walk-in (trần vỏ cua chỉ lod0; chưa hoành phi) | 14 | thấp |
| 6 | `linkedValley` kit nằm trên mái chính +Z; máng giữa hai khối là mesh riêng | ổn | — |
| 7 | Stretch pháo trên mặt thành / cờ vọng lâu — **bỏ** (bắn ải thưa đã có) | 14 | thấp |
| 7 | CSM bóng tường ngoài / Kỳ Đài vẫn 1 frustum ±340 | 14 | thấp |
| 8 | Stretch nội thất Càn Thành lod0 — **bỏ** | 14 | thấp |
| 8 | `buildDinhHall` LOD1 = 1 tầng mái (tiers 2 chỉ lod0) — WorldScene lod=1 không thấy cổ diêm điện phụ | 14 | thấp |
| 9 | Stretch Tàng thơ / kho nhỏ phía Đông — **bỏ** | 12 | thấp |
| 9 | Tường hoa + 7 cổng kit thêm draw call — chấp nhận mật độ | 14 | thấp |
| 10 | Stretch án thờ / khám lod0 trong Thế Miếu — **bỏ** | 14 | thấp |
| 11 | Stretch đình/bến thứ 4 + đá giả sơn — **bỏ** | 14 | thấp |
| 11 | `tree_lieu` chưa vào vegetation species (phiên 14). Tịnh Tâm có liễu/trúc stylized local InstancedMesh | 14 | trung |

---

## Handoff — phiên vừa xong

### Phiên 11 — Hồ Tịnh Tâm — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8.5/10 · K 8.5/10

**Đã ship (khớp DoD):**
- Mặt nước riêng `HO_TINH_TAM` 280×180 tại `[220, 0.08, −620]` — không recycle Thái Dịch.
- Sen dày `buildTinhTamLotus` InstancedMesh, tránh 3 đảo.
- 3 đảo Bồng Lai (Nam tâm) / Phương Trượng / Doanh Châu + cầu vòm + kè đá + đường bao + tường vườn + cửa Nam.
- Lầu Nhất Trụ (Bồng Lai, hoàng) + Trần Thanh (Phương Trượng) + đình Doanh Châu — kit v2.
- Liễu/trúc ven bờ InstancedMesh trong module; vegetation không mọc giữa hồ.
- Module `ho-tinh-tam` + POI VI+EN + `buildings.json` + `WORLD.landmarks.hoTinhTam` đã dịch.

**Nợ / stretch bỏ:**
- Đình/bến thứ 4, đá giả sơn — không làm.
- `tree_lieu` chưa là species hệ vegetation (phiên 14).

**API mới / đổi:**
- `TINH_TAM` `tinhTamWeight` `tinhTamIslandMask` `buildTinhTamLotus` `tinhTamModules`
- `HO_TINH_TAM.center` = `[220, 0.08, −620]`, `size` = `[280, 180]`
- `WORLD.landmarks.hoTinhTam` = `[220, 0, −620]`

**File chính:**
- `src/monuments/tinhtam/**`
- `src/world/water/waterConfig.ts` + `buildLotusField.ts` + `WaterSystem.tsx`
- `src/world/vegetation/placements.ts`
- `src/data/worldConfig.ts` + `buildings.json`

**Nhìn thấy gì khi F5:**
- Phía Bắc-Đông Đại Nội: hồ lớn có 3 đảo, không còn cỏ + vài cây kem.
- Zoom đảo: lầu kit, cầu lan can, sen phủ mặt nước, kè đá.

**Typecheck:** pass (`tsc --noEmit`)

**Phiên sau cần biết:**
- Đừng đặt Lục Bộ / district đè AABB hồ `[220±140, −620±90]` ± 15 m.
- Không làm Hồ Học Hải (phiên 13).
- WorldScene vẫn `build(1)`.

---

### Phiên 10 — Cụm miếu + cung Thái hậu — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8.5/10 · K 8/10

**Đã ship (khớp DoD):**
- Thế Miếu: 9 gian lod 0–1, sân + nghi môn, tả hữu phối, mái hoàng + ridge lod 0–1.
- Hiển Lâm Các: 3 tầng thu dần ~17 m; wrap eave lod 0–1; 24 cột (4 xuyên + 12 + 8); bầu rượu kit.
- Cửu Đỉnh: 9 geo khác nhau (bụng/cổ/tay/nắp), merge 1 mesh.
- Thái / Triệu / Hưng Miếu: `buildMieu` + sân dày + nghi môn mái kit + tả hữu phối.
- Diên Thọ / Trường Sanh: `buildCungCompound` — nhiều nhà, sân gạch, cổng, hành lang, mái thanh, phượng.
- Phụng Tiên: `buildDinhHallRuin` — nền, cột gãy, tường thấp đọc được.

**Nợ / stretch bỏ:**
- Án thờ / khám lod0 Thế Miếu — không làm.

**API mới / đổi:**
- `buildCungCompound` `URN_VARIANTS` `buildUrnGeometry(lod, variant)` `BuildMieuOpts.sideHalls`

**File chính:**
- `src/monuments/themieu/**`
- `src/monuments/mieu/**`
- `src/monuments/cung/buildCungCompound.ts` + 3 module cung

**Nhìn thấy gì khi F5:**
- Góc Tây-Nam Đại Nội: miếu 9 gian + các 3 tầng + 9 đỉnh khác nhau + tường khu.
- Góc Tây: Diên Thọ / Trường Sanh là xóm nhà, không 2 hộp.

**Typecheck:** pass (`tsc --noEmit`)

---

### Phiên 9 — Vải Hoàng thành — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8.5/10 · K 7.5/10

**Đã ship (khớp DoD):**
- Tường hoa / tường ngăn khu: khung Tử Cấm + miếu Tây / miếu Đông / cung Tây / phủ Đông. Cổng nhỏ `buildGate`.
- Trường Lang nối Thái Hòa ↔ Tả Hữu Vu ↔ Đại Cung (thêm hàng cột + mái kit).
- Phủ Nội Vụ `[160, 1, −220]` — 4 nhà factory + sân + tường + cổng. POI VI+EN.
- Hồ Nội Kim Thủy 3 mặt + kè đá; chừa cầu 4 cửa Tử Cấm.
- Sân gạch `INNER_COURTS` giữa các điện / cung / phủ.
- Cửa Tử Cấm đã có POI từ phiên 8 — không đụng id.

**Nợ / stretch bỏ:**
- Tàng thơ / kho Đông — không làm.

**API mới / đổi:**
- `buildPartitionWalls` `buildInnerCourts` `buildNoiKimThuyBanks`
- `NOI_KIM_THUY` `noiKimThuyWeight` `noiKimThuyGateBridge` `createNoiKimThuyGeometry`
- `INNER_COURTS` `collectConnectorPositions`

**File chính:**
- `src/world/groundwork/buildImperialFabric.ts`
- `src/monuments/hoangthanh/phuNoiVu.ts`
- `src/monuments/truonglang/buildTruongLang.ts`
- `src/world/water/buildWaterMeshes.ts` + `heightfield.ts`

**Nhìn thấy gì khi F5:**
- Zoom Đại Nội: lưới sân–tường–nhà. Hết nhà nổi trên rau.
- Hào nhỏ ôm 3 mặt Tử Cấm; Phủ Nội Vụ là khu, không hộp.

**Typecheck:** pass (`tsc --noEmit`)

---

### Phiên 8 — Nội đình Tử Cấm còn thiếu — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8.5/10 · K 6.5/10

**Đã ship (khớp DoD):**
- Factory `buildDinhHall` / `buildDinhHallRuin` — variant royal / office / residence / service; LOD 0/1/2; ruin = nền + cột gãy + tường thấp, không đọc store.
- Đăng ký: `dien-can-thanh` (hoàng, lớn hơn Cần Chánh), `dien-van-minh` / `dien-vo-hien`, `dien-trinh-minh` / `dien-quang-minh`, `vien-thuan-huy` / `vien-duong-tam`, `thuong-thien-duong` (service).
- `cung-khon-thai` — khu 3 nhà + tường sân, không 1 hộp.
- `luc-vien` — 1 module, 6 nhà + tường khu.
- `ngu-tien-van-phong` — khối Bảo Đại hơi Tây.
- 4 cửa Tử Cấm: `hung-khanh-mon` `gia-tuong-mon` `tuong-loan-mon` `nghi-phung-mon` (`buildGate` vòm). Tường Tử Cấm chừa lỗ khớp.
- Nâng nhẹ Cần Chánh / Kiến Trung / Thái Bình Lâu / Đại Cung: `ridge` lod 0–1.

**Nợ / stretch bỏ:**
- Nội thất Càn Thành lod0 — không làm.
- Điện phụ lod1 = 1 tầng mái (WorldScene không thấy cổ diêm 2 tầng).

**API mới / đổi:**
- `buildDinhHall(DinhHallOpts)` `buildDinhHallRuin` `buildCanThanhRuin`
- `TUCAM.sideGapOffsetZ` = 35; gap Bắc hai lỗ x=±40

**File chính:**
- `src/monuments/noicung/buildDinhHall.ts`
- `src/monuments/noicung/innerHalls.ts`
- `src/monuments/noicung/cungKhonThai.ts`
- `src/monuments/noicung/lucVien.ts`
- `src/monuments/noicung/nguTienVanPhong.ts`
- `src/monuments/noicung/tuCamGates.ts`
- `src/monuments/tucam/constants.ts` + `buildTuCamWalls.ts`
- `src/registry/registerAll.ts`

**Nhìn thấy gì khi F5 (WorldScene `build(1)`):**
- Bay +Z→−Z: Ngọ Môn–Thái Hòa–Đại Cung–Cần Chánh–Càn Thành–Khôn Thái–Kiến Trung **liền mạch**.
- Hai bên: Văn Minh / Võ Hiển, Trinh Minh / Quang Minh, viện nhỏ, Lục Viện 6 mái, bếp ngự.
- Cửa Đông/Tây/Bắc Tử Cấm có vọng lâu kit, tường không đè cổng.

**Typecheck:** pass (`tsc --noEmit`)

**Phiên sau cần biết:**
- Factory phiên 9 (Phủ Nội Vụ) phải gọi `buildDinhHall`, không viết lại hộp.
- Không đụng Tịnh Tâm / Phủ Nội Vụ (phiên 9 / 11).
- WorldScene vẫn `build(1)`.

---

### Phiên 7 — Kỳ Đài + cửa + tường 3 vòng — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8.5/10 · K 5/10

**Đã ship (khớp DoD):**
- Kỳ Đài 3 tầng thu dần ốp gạch vồ UV mét, lan can mỗi sân, cầu thang Nam, cột 37 m. Không 3 hộp chồng.
- 10 cửa: vọng lâu `ridge` lod 0–1; cao cửa 8.5 m.
- 2 thủy quan — cống + nước chảy, không vọng lâu. Register `dong-thanh-thuy-quan` / `tay-thanh-thuy-quan`.
- Tường Kinh thành: dày 21.25, cao ngoài 6.46 / trong 3.825, mặt ngoài dốc, hành lang, 24 pháo đài góc đọc được, bắn ải thưa.
- Tường Hoàng thành + Tử Cấm: `extrudeWallGeometry` UV mét, chân đá / thân gạch / đỉnh vôi. Cổng 4 hướng Hoàng thành ridge lod 0–1.

**Nợ / stretch bỏ:**
- Pháo + cờ vọng lâu — không làm (bắn ải thưa đủ đọc).
- CSM tường ngoài — nợ phiên 14.

**API mới / đổi:**
- `buildThuyQuan(lod)` `thuyQuanModules`
- Citadel: scarp offset + walkway + embrasures

**File chính:**
- `src/monuments/kydai/kyDai.ts` + `geometry.ts`
- `src/monuments/gates/buildThuyQuan.ts` + `gateDefs.ts` + `buildCitadelGate.ts`
- `src/world/citadel/buildCitadelWalls.ts`
- `src/monuments/imperial/buildImperialWalls.ts` + `buildImperialGate.ts`
- `src/monuments/tucam/buildTuCamWalls.ts`

**Nhìn thấy gì khi F5:**
- Drone vòng ngoài: thành đặc, góc lồi Vauban, cửa có vọng lâu + sống nóc, thủy quan là cống.
- Kỳ Đài: 3 bậc gạch + lan can + cờ, landmark Nam.

**Typecheck:** pass (`tsc --noEmit`)

---

### Phiên 6 — Thái Hòa + Đại Triều + Thái Dịch + Trung Đạo — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 8/10 · K 4/10

**Đã ship (khớp DoD):**
- Điện Thái Hòa: `buildPlatform` + 80 cột kit + 2 mái trùng thiềm hoàng lưu ly (`ridge` lod 0–1) + máng thừa lưu + cửa bức bàn 7 gian + tường hồi vôi UV mét + chồng rường lod 0–1 + ngai/bửu tán lod 0–1 (WorldScene thấy ngai).
- Sân Đại Triều: 1 tấm Bát Tràng UV mét + vạch phẩm + thần đạo, không hàng trăm hộp viên.
- Hồ Thái Dịch: sen thưa InstancedMesh (tránh cầu) + kè đá sẵn phiên 4.
- Cầu Trung Đạo: 3 nhịp vòm + lan can con tiện + tay vịn liền, không tấm ván bay.
- Phẩm sơn / tứ tượng đã nằm trong `san-dai-trieu-nghi` — không register trùng.

**Nợ / stretch bỏ:**
- Trần vỏ cua chỉ lod0; hoành phi — không làm.

**API mới / đổi:**
- `buildThaiHoaColumns` = 2 `buildColumnGrid`
- `buildThaiDichLotus(lod)`

**File chính:**
- `src/monuments/thaihoa/**`
- `src/monuments/daitrieu/courtyard.ts`
- `src/world/water/buildLotusField.ts`
- `src/world/groundwork/buildGroundwork.ts`

**Nhìn thấy gì khi F5:**
- Đứng sân nhìn lên điện: 2 khối mái vàng, cột son hàng, cửa bức bàn, sân có vạch phẩm.
- Drone: trục Ngọ Môn–hồ–cầu–sân–điện thẳng; sen hai bên cầu.

**Typecheck:** pass (`tsc --noEmit`)

---

### Phiên 5 — Ngọ Môn + Lầu Ngũ Phụng — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 7.5/10 · K 3.5/10

**Đã ship (khớp DoD):**
- Nền đài chữ U đặc, gạch vồ + đá thanh, 5 lối **xuyên** (ExtrudeGeometry có lỗ, không hộp thủng). Giữa rộng hơn, thành bậc rồng hai mặt.
- Lầu 2 tầng, **100 cột** `buildColumnGrid` (48 xuyên 8×6 + 52 hồi lang / cánh).
- **9 bộ mái** `buildRoof` v2: giữa hoàng lưu ly + lưỡng long; 8 thanh lưu ly. Silhouette cao giữa, thấp cánh (2 nóc mỗi cánh). LOD2 vẫn chữ U + 9 nóc.
- Lan can con tiện mặt đài, cầu thang đá hai cánh lên đài, cầu thang gỗ lên tầng 2.
- Pháp lam ô trên vòm + dải men + biển ngạch stylized + phượng hai bên (lod 0–1).
- Stretch: nội thất tầng 2 gợi ý (sàn gỗ, chồng rường, bao lơn, bình phong lod0).

**Nợ / stretch bỏ:**
- Nội thất chưa đủ walk-in (không trần vỏ cua / hoành phi) — ghi nợ phiên 14.
- Không đụng Thái Hòa / tour.

**API mới / đổi:**
- `NGO_MON` dims cập nhật (58 × 27.5 × đài 8.6 m) — [ước lượng hợp lý]
- `ngoMonLayout()` `ngoMonOpenings()` `extrudeArchWall()` `archDressingGeo()` `meterBox()`
- Xóa `buildColumnsAt` / `buildCompactRoof` (không còn caller)

**File chính:**
- `src/monuments/ngomon/geometry.ts`
- `src/monuments/ngomon/uPlatform.ts`
- `src/monuments/ngomon/nguPhung.ts`
- `src/monuments/ngomon/ngoMon.ts`

**Nhìn thấy gì khi F5 (WorldScene `build(1)`):**
- Từ Kỳ Đài nhìn Bắc: chữ U ôm vào, 5 vòm xuyên đọc được, không còn hộp có lỗ tối.
- Zoom mặt đài: gạch vồ, vành đá, pháp lam trên vòm, thành bậc rồng lối giữa.
- Drone: 9 nóc (vàng giữa, xanh 8 phía) + cánh U; cột son hàng, không 12 ống.
- Lầu: biển ngạch men + hồi văn, mái kit có sống / đầu đao.

**Typecheck:** pass (`tsc --noEmit`)

**Phiên sau cần biết:**
- Giữ id / anchor / `rotationY`. Đừng rewrite Ngọ Môn khi làm Thái Hòa.
- Hero phiên 6: Thái Hòa + Đại Triều + Hồ Thái Dịch + Trung Đạo. Dùng cùng kit v2 (`buildRoof` trùng thiềm, `buildColumnGrid` 80 cột).
- `linkedValley` vẫn là hook — phiên 6 nối máng thừa lưu tiền+chính.
- WorldScene vẫn `build(1)`.

---

### Phiên 4 — Đất / sân / ánh sáng — 2026-08-13

**Status:** done  
**Điểm tự chấm:** G 7/10 · K 3/10

**Đã ship (khớp DoD):**
- Terrain splat v2 — vertex `(brick, dirt, grass)` + factory maps lặp mét. Hoàng thành = đất/sân, không cỏ bóng đá. Bờ hào/sông = đất sỏi. Ngoài thành = cỏ loang + đường đất.
- Interior Kinh/Hoàng thành hạ xuống y≈0 — hết plateau 0,55 m đè thần đạo.
- Groundwork v2 — lát Bát Tràng UV mạch; thần đạo Ngọ Môn → Thái Hòa → Đại Cung; sân Đại Triều 92×64; kè + bậc Hồ Thái Dịch; vòng đất ôm Tử Cấm; kè Ngoại Kim Thủy 4 cửa.
- Lighting — nắng 10:00 contrast đủ đọc normal; shadow bias/normalBias; fog đất, không gột trắng.
- Ngoại Kim Thủy — mesh nước cùng WaterSystem shader, không còn rãnh tối.
- Stretch vệt mòn giữa thần đạo (dirt dải giữa) — làm gọn. Stretch puddle — bỏ.

**Nợ / stretch bỏ:**
- Puddle mưa — không làm (nửa vời dễ xấu).
- CSM đa tầng — không đụng mọi material.

**API mới / đổi:**
- `createTerrainMaterial(lod)` — splat PBR
- `splatWeights(x, z)`
- `IMPERIAL_CITY` `FORBIDDEN_CITY` `IMPERIAL_MOAT` `THAI_DICH`
- `imperialMoatWeight` `thaiDichWeight` `imperialInteriorWeight` `imperialMoatGateBridge`
- `pavePlane` / `paveBox` trong groundwork `geoUtils`
- `createImperialMoatGeometry()` + `NGOAI_KIM_THUY`
- `SkyPalette.fogDensity`
- `HO_THAI_DICH.center` Y = 0.08 (trên đáy kè y≈0.015; heightfield vẫn đào bedY)
- `THAN_DAO_NORTH_Z` = −210

**File chính:**
- `src/world/terrain/**`
- `src/world/groundwork/**`
- `src/world/sky/skyMath.ts` + `Celestial.tsx`
- `src/world/water/**`
- `src/core/Engine.tsx`

**Nhìn thấy gì khi F5 (WorldScene `build(1)`):**
- Hết biển xanh golf: Đại Nội là đất + gạch, thần đạo đọc được.
- Sân Đại Triều lát Bát Tràng có mạch, không tấm trắng.
- Hồ Thái Dịch có mép đá + bậc; hào Hoàng thành là nước.
- Cột/sân: bóng không còn acne nặng / sân không peter-pan trắng.
- Vẫn thiếu nhà ngoài Đại Nội — Act III–IV.

**Typecheck:** pass (`tsc --noEmit` + `tsc -p tsconfig.app.json`)

**Phiên sau cần biết:**
- Đừng nâng lại heightfield interior lên 0.55 — groundwork sẽ chìm.
- Đừng viết splat terrain mới; gọi `createTerrainMaterial`.
- Hero phiên 5: Ngọ Môn ngồi sát cạnh Nam Ngoại Kim Thủy (southExtra 46 m). Cầu đất Nam rộng 16 m trên thần đạo.
- Hồ Tịnh Tâm / phố / cây v2: **chưa** — phiên 11 / 13 / 14.
- WorldScene vẫn `build(1)`.

---

## Ghi chú ổn định (đừng xóa)

- Origin `(0,0,0)` = tâm sân Đại Triều Nghi. `+Z` = Nam. `1 unit = 1 m`.
- `WorldScene` hiện `m.build(1)` cho mọi monument — đổi LOD động chỉ ở phiên 14.
- `build()` luôn restored. Ruin = hàm riêng, không đọc store.
- Material: chỉ `getMaterial(id, lod)`.
- Không GLB trả phí.
