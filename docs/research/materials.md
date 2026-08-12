# Vật liệu & cấu kiện kiến trúc cung đình Huế (PBR contract)

> Digital twin **Hue Imperial City 3D** — tài liệu dùng chung cho mesh/material pipeline (React + Three.js / R3F).  
> Mỗi claim đánh dấu **[xác thực — nguồn]** hoặc **[ước lượng hợp lý]**. Giá trị `roughness` / `metalness` thuộc khoảng `[0, 1]` và phần lớn là **ước lượng PBR** phục vụ realtime (không phải đo lab).

---

## 1. Cấu kiện kiến trúc

### 1.1 Mái — trùng thiềm điệp ốc & lợp ngói lưu ly

**Trùng thiềm điệp ốc** (còn gọi *trùng lương trùng thiềm*): kiểu nhà kép hai mái trên **một nền**; tiền điện + chính điện nối bằng **máng thừa lưu** tạo trần **vòm mai cua** (vỏ cua), không gian nội thất liên tục. **[xác thực — Wikipedia *Trùng thiềm điệp ốc*; Cục Du lịch QG / vietnamtourism.gov.vn về Điện Thái Hòa; Tạp chí Kiến trúc — phương pháp thiết kế cung điện Nguyễn]**

- Điện Thái Hòa: xây kiểu trùng thiềm điệp ốc; mái lợp **ngói hoàng lưu ly**; mô tả phổ biến có **ba tầng mái** với **cổ diêm** (ô hộc nhất thi nhất họa) giữa các tầng mái. **[xác thực — Wikipedia *Điện Thái Hòa*; vietnamtourism.gov.vn]**
- Hệ mái cung đình Nguyễn thường lợp **ngói ống âm dương** tráng men: **hoàng lưu ly** (vàng — công trình vua / trục dũng đạo) hoặc **thanh lưu ly** (xanh — công trình quan / hai bên). **[xác thực — Wikipedia *Ngói lưu ly*, *Hoàng thành Huế*; Trần Đức Anh Sơn / tư liệu quy chế màu mái]**

**Ngọ Môn / Lầu Ngũ Phụng:**

| Đặc điểm | Giá trị | Evidence |
|---|---|---|
| Số bộ mái tầng trên | **9** | **[xác thực — Wikipedia *Ngọ Môn*; Vietnam Tourism]** |
| Mái giữa | **hoàng lưu ly** | **[xác thực — cùng nguồn; ca dao “một lầu vàng, tám lầu xanh”]** |
| 8 mái còn lại | **thanh lưu ly** | **[xác thực]** |
| Cột gỗ lim | **100** (trong đó ~48 cột xuyên 2 tầng) | **[xác thực — Wikipedia *Ngọ Môn*; Vietnam Tourism]** |
| Tầng lầu | 2 tầng; mái tầng dưới nối liền vòng quanh hồi lang; tầng trên chia 9 bộ | **[xác thực]** |

> Ghi chú naming: “9 bộ mái” = chín tổ hợp mái của chín tòa lầu ghép (5 chính + 4 phụ), không đồng nghĩa 9 tầng mái chồng. **[xác thực — cấu trúc mô tả trên Wikipedia / tư liệu Ngọ Môn]**

### 1.2 Vì kèo — chồng rường giả thủ

- **Chồng rường – giả thủ**: hệ vì kèo tiền điện điển hình (Điện Thái Hòa nhà trước): các thanh **rường** xếp chồng đỡ mái + chi tiết **giả thủ** (cột ngắn trang trí / chịu lực phụ, thường chạm rồng–mây). **[xác thực — vietnamtourism.gov.vn Điện Thái Hòa; Wikipedia *Cung Diên Thọ* (cùng kiểu thức)]**
- Nhà sau Thái Hòa: vì **cánh ác** đơn giản hơn. **[xác thực — vietnamtourism.gov.vn]**
- Liên kết hai nhà: vì / trần **vỏ cua** dưới máng thừa lưu. **[xác thực — Wikipedia trùng thiềm; VnExpress trùng tu Thái Hòa]**

### 1.3 Đấu củng kiểu Việt / Huế (khác dougong TQ)

- Kiến trúc gỗ **cung đình Nguyễn / Huế** lấy trọng tâm **chồng rường + kẻ / bẩy / con sơn** đua mái, **không** dựng hệ **đấu củng nhiều tầng** kiểu cung điện Trung Hoa (dougong vươn xa hai phương). **[xác thực — Tạp chí Kiến trúc *Nhận diện các loại hình kiến trúc gỗ Việt Nam*; so sánh với dougong TQ]**
- **Đấu củng** từng phổ biến hơn thời Lý–Trần (Thăng Long); hiện còn lẻ tẻ (vd. chùa Keo). **[xác thực — Wikipedia *Đấu củng*; khảo cổ Thăng Long]**
- Ở Huế / Hiển Lâm Các: **con sơn** ở góc đẩy độ đua mái — vai trò tương đương “bracket” nhưng thuộc dòng kẻ–bẩy–con sơn Việt. **[xác thực — Quỹ Di sản / mô tả Hiển Lâm Các]**

**Implication 3D:** model “dougong TQ đầy đủ” cho Thái Hòa / Ngọ Môn là **sai kiểu thức**. Ưu tiên chồng rường lộ trần + giả thủ + con sơn đầu mái. **[ước lượng hợp lý — suy ra từ nguồn kết cấu]**

### 1.4 Cột, nền / bậc, lan can, tường thành

| Cấu kiện | Vật liệu / hoàn thiện điển hình | Evidence |
|---|---|---|
| Cột cung điện | Gỗ **lim**, **sơn son thếp vàng**, họa tiết long–vân | **[xác thực — Wikipedia Thái Hòa / Ngọ Môn]** |
| Nền điện | Cao ~0,9 m (Thái Hòa); bó vỉa **đá thanh**; lát **gạch Bát Tràng** (men xanh/vàng hoặc hoa) | **[xác thực — Wikipedia Thái Hòa, Hoàng thành Huế]** |
| Nền đài Ngọ Môn | **Gạch vồ** + **đá thanh**; mặt đài từng lát gạch Bát Tràng, sau có lát gạch hoa xi măng kiểu Pháp | **[xác thực — Wikipedia *Ngọ Môn*]** |
| Bậc cấp | Đá thanh / đá xanh Thanh Hóa; thành bậc đắp rồng (lối vua) | **[xác thực — Hiển Lâm Các / Hoàng thành Huế]** |
| Lan can / thành bậc | Đá hoặc xây đắp; họa tiết rồng / hồi văn | **[xác thực một phần — mô tả di tích; chi tiết mesh = ước lượng]** |
| Tường thành / tường hồi | Gạch (vồ) + trát **vôi vữa**; tường hồi điện có thể gạch trát vôi | **[xác thực — Wikipedia Thái Hòa / Hiển Lâm Các]** |
| Cổ diêm / bờ nóc trang trí | **Pháp lam**, sành sứ đắp nổi, con giống | **[xác thực — pháp lam kiến trúc Nguyễn; Thế Miếu thái cực pháp lam]** |

### 1.5 Con giống (mái)

| Loại | Vị trí / ý nghĩa | Evidence |
|---|---|---|
| **Lưỡng long chầu nhật** | Bờ nóc / đỉnh nóc — hai rồng chầu mặt trời / thái cực | **[xác thực về motif cung đình Huế trên bờ nóc — tư liệu Hoàng thành / Thế Miếu; biến thể pháp lam–sành]** |
| **Bờ nóc** | Đường sống mái: đắp / gắn con giống + pháp lam (bầu rượu, thái cực…) | **[xác thực — Hiển Lâm Các bầu rượu pháp lam; Thế Miếu]** |
| **Đầu đao** | Góc mái uốn; trang trí rồng / phượng | **[xác thực — Cung Diên Thọ (phượng ở đầu đao); phổ biến cung đình]** |
| **Phượng** | Đầu đao / mái công trình liên quan hậu cung / biểu tượng phụng | **[xác thực — Diên Thọ; tên Lầu Ngũ Phụng mang hình tượng phụng]** |

### 1.6 Công trình neo số liệu (bắt buộc)

#### Ngọ Môn / Lầu Ngũ Phụng
- 9 bộ mái; mái giữa hoàng lưu ly; 8 mái thanh lưu ly; ~**100** cột lim sơn son thếp vàng. **[xác thực — mục 1.1]**

#### Điện Thái Hòa
- **80** cột gỗ lim sơn (son) thếp vàng, trang trí rồng vờn mây. **[xác thực — Wikipedia; VnExpress; Báo Pháp luật VN]**
- Ngai vàng trên bệ gỗ 3 tầng sơn son thếp vàng; phía trên **bửu tán** thếp vàng kết hợp **pháp lam** (chạm chín rồng; bản gỗ 1923 thay bản gấm thời Gia Long). **[xác thực — Wikipedia *Điện Thái Hòa*]**
- Diện tích nội thất thường dẫn ~1440 m²; mặt tiền 7 gian 2 chái (tiền) + chính điện 5 gian 2 chái kép. **[xác thực — vietnamtourism / Wikipedia]**

#### Hiển Lâm Các
- **3 tầng gỗ**, cao khoảng **17 m** — công trình gỗ cao nhất trong Hoàng thành (quy định thời Nguyễn không xây cao hơn). **[xác thực — Wikipedia *Hoàng thành Huế*; Quân đội Nhân dân; Quỹ Di sản]**
- ~12 mái; 24 cột (4 cột chính ~13 m xuyên suốt); nền lát gạch Bát Tràng, bó gạch vồ. **[xác thực — Wikipedia / Kiến Thức]**

#### Cửu Đỉnh
- Chín đỉnh **đồng hợp kim** (nguyên liệu chính đồng + kẽm, có thể chì/thiếc) trước sân Thế Miếu / Hiển Lâm Các; tổng khối lượng đồng ~22 tấn. **[xác thực — Wikipedia *Cửu Đỉnh*; dsvh.gov.vn]**  
  → Material id `dong_thau` dùng cho look brass/bronze hợp kim đồng–kẽm (không phải vàng lá).

---

## 2. Bảng màu chủ đạo (verify)

| Token | HEX đề xuất | Trạng thái |
|---|---|---|
| Đỏ son | `#8B1A1A` | **[ước lượng hợp lý]** — đỏ son ta đậm, hơi nâu; phù hợp nhìn ảnh điện sau trùng tu, chưa đo spectrophotometer |
| Vàng thếp | `#C9A227` | **[ước lượng hợp lý]** — vàng quỳ / thếp già (không phải `#FFD700` bóng mới) |
| Ngói vàng (hoàng lưu ly) | `#D4A017` | **[ước lượng hợp lý]** — men vàng đậm hơi hổ phách; thực tế lệch theo lò nung / patina |
| Ngói xanh (thanh lưu ly) | `#2E5E4E` | **[ước lượng hợp lý]** — xanh lục đậm (không phải cyan); bích lưu ly coban **không** dùng cho ngói thời Nguyễn **[xác thực — chú thích Wikipedia *Ngói lưu ly*]** |
| Tường vôi | `#E8DCC8` | **[ước lượng hợp lý]** — kem ấm, có dirty mask |
| Đá thanh | `#6E6E68` | **[ước lượng hợp lý]** — xám lục–nâu nhạt của đá Thanh Hóa sau weathering |
| Gạch vồ | `#9C6B4F` | **[ước lượng hợp lý]** — nâu đỏ gạch nung đặc Huế |

**Điều chỉnh đề xuất khi có photo-ref:** saturation ngói vàng/xanh ±8%; đỏ son có thể tối hơn (`#6F1212`) ở vùng bóng cột. **[ước lượng hợp lý]**

---

## 3. Bảng vật liệu PBR (contract ids)

> `hex` = albedo / baseColor gần đúng dưới ánh sáng trung tính.  
> `roughness` / `metalness` = gợi ý realtime PBR (Three.js `MeshStandardMaterial` / glTF).  
> Cột **evidence**: `xác thực` cho định danh vật liệu lịch sử; thông số PBR hầu hết `ước lượng`.

| id | name_vi | hex | roughness | metalness | notes | evidence |
|---|---|---|---:|---:|---|---|
| `ngoi_hoang_luu_ly` | Ngói hoàng lưu ly | `#D4A017` | 0.32 | 0.0 | Men bóng vừa; specular ceramic; dùng mái vua / Ngọ Môn giữa / Thái Hòa | Men vàng cung đình **[xác thực]**; HEX+PBR **[ước lượng]** |
| `ngoi_thanh_luu_ly` | Ngói thanh lưu ly | `#2E5E4E` | 0.34 | 0.0 | Men xanh lục; 8 mái phụ Ngọ Môn; công trình hai bên trục | **[xác thực]** loại; HEX+PBR **[ước lượng]** |
| `mai_ngoi_am_duong` | Ngói âm dương (xương / không men hoặc men mờ) | `#8A7355` | 0.62 | 0.0 | Ngói ống sấp–ngửa; dùng khi cần thấy xương ngói / dân gian / lớp dưới | Kiểu lợp âm dương **[xác thực]**; HEX **[ước lượng]** |
| `go_son_son` | Gỗ sơn son | `#8B1A1A` | 0.42 | 0.0 | Sơn ta đỏ bóng sâu trên cột/cửa; không kim loại | Sơn son cung đình **[xác thực]**; PBR **[ước lượng]** |
| `vang_thep` | Vàng thếp (quỳ) | `#C9A227` | 0.22 | 0.92 | Lá vàng trên son; rồng cột, ngai, hoành phi | Thếp vàng **[xác thực]**; PBR kim loại **[ước lượng]** |
| `go_lim` | Gỗ lim (trần / cắt mới) | `#4A3428` | 0.58 | 0.0 | Gỗ lim thô hoặc đã bào, chưa son; thớ thẳng đậm | Cột lim **[xác thực]**; HEX **[ước lượng]** |
| `da_thanh` | Đá thanh | `#6E6E68` | 0.78 | 0.0 | Bó vỉa, bậc, tảng kê cột/đỉnh; bề mặt mài–weather | Đá thanh / đá xanh Thanh Hóa **[xác thực]**; PBR **[ước lượng]** |
| `gach_vo` | Gạch vồ | `#9C6B4F` | 0.82 | 0.0 | Gạch nung lớn xây đài/tường; vữa mật mía–nhựa (tài liệu Ngọ Môn) | Gạch vồ đài Ngọ Môn **[xác thực]**; PBR **[ước lượng]** |
| `gach_bat_trang` | Gạch Bát Tràng | `#C4B89A` | 0.45 | 0.0 | Lát nền; bản men xanh/vàng → tint overlay `#2E5E4E` / `#D4A017` | Lát nền cung điện **[xác thực]**; HEX nền men mờ **[ước lượng]** |
| `dong_thau` | Đồng thau / hợp kim đồng–kẽm | `#B08D57` | 0.40 | 0.85 | Cửu Đỉnh + phụ kiện kim loại đúc; patina xanh nhẹ optional | Cửu Đỉnh đồng+kẽm **[xác thực]**; PBR **[ước lượng]** |
| `phap_lam` | Pháp lam (men trên cốt đồng) | `#3A6B8C` | 0.28 | 0.15 | Albedo lấy màu men chủ đạo; metalness thấp (men phủ); đa màu qua texture | Pháp lam kiến trúc Nguyễn **[xác thực]**; PBR đơn giản hóa **[ước lượng]** |
| `tuong_voi` | Tường vôi vữa | `#E8DCC8` | 0.88 | 0.0 | Trát vôi tường hồi / thành; dirty AO mép gạch | Tường trát vôi **[xác thực]**; PBR **[ước lượng]** |

**Tổng material entries (contract): 12.**

### 3.1 Extension (không bắt buộc orchestrator — optional)

| id | name_vi | hex | roughness | metalness | notes | evidence |
|---|---|---|---:|---:|---|---|
| `son_then` | Sơn then (đen bóng) | `#1A1210` | 0.35 | 0.0 | Nội thất / đồ thờ bổ trợ | Phổ biến mỹ thuật cung đình **[ước lượng hợp lý]** |
| `mau_sam` | Mảnh sành khảm tường | `#D8D2C8` | 0.50 | 0.0 | Đắp nổi mảnh sành Hiển Lâm Các | **[xác thực]** kỹ thuật trang trí; HEX **[ước lượng]** |

---

## 4. Gợi ý procedural texture (canvas / noise) — không code

| id | Gợi ý procedural |
|---|---|
| `ngoi_hoang_luu_ly` | Tile UV lặp theo hàng ống: ridge (ngói dương) + valley (ngói âm); noise fine cho micro-crack men; variation hue ±5° theo viên; wet specular strip dọc sống ngói |
| `ngoi_thanh_luu_ly` | Giống vàng nhưng hue xanh; thêm subtle blotch (men xanh khó đều lửa) |
| `mai_ngoi_am_duong` | Cùng layout âm–dương nhưng albedo đất nung; roughness cao hơn; rêu ở valley (green noise mask theo AO) |
| `go_son_son` | Noise thấp; edge wear lộ gỗ `#4A3428` ở góc cột; anisotropic highlight dọc trục cột (fake bằng stretched noise) |
| `vang_thep` | Mask thếp theo họa tiết rồng (SDF / decal); flake micro-normal; nơi mòn lộ son bên dưới |
| `go_lim` | Wood grain stretched noise; dark pore lines; không clearcoat |
| `da_thanh` | Voronoi / Worley crack + fine grit; lichen mask xanh xám 5–10% coverage |
| `gach_vo` | Brick module ~ lớn hơn gạch dân dụng; mortar dark; chip corner mask |
| `gach_bat_trang` | Square tiles; glaze gloss map; optional stamped motif (chữ thọ / hoa thị) bằng height nhẹ |
| `dong_thau` | Cast metal: low-freq undulation; engraved decal 17 motif/đỉnh (LOD0); patina cavity map (AO → xanh `#3F5D4A`) |
| `phap_lam` | Multi-color enamel islands (palette vàng / lục / lam / trắng); soft color bleed; copper edge glint mỏng |
| `tuong_voi` | Large-scale blotch + fine dust; rain streak vertical; expose brick ở chân tường |

---

## 5. LOD tips

| LOD | Mục tiêu | Mái | Cột / vì | Con giống / pháp lam | Material |
|---|---|---|---|---|---|
| **LOD0** | Hero shot, nội thất gần | Ngói âm–dương riêng viên hoặc atlas dày; cổ diêm đủ ô hộc; lộ chồng rường–giả thủ | Cột tròn đủ segments; rồng thếp decal/normal; 80/100 cột đúng layout | Lưỡng long, đầu đao, bầu pháp lam mesh riêng | Full PBR + normal + occlusion |
| **LOD1** | Khu vực điện / cổng trong khung hình vừa | Mái gộp solid + normal map ngói; bỏ viên rời; giữ silhouette 9 bộ mái Ngọ Môn / trùng thiềm | Cột cylinder đơn; bỏ vì kèo chi tiết hoặc bake vào interior card | Con giống = simplified mesh / billboard bình thường | Cùng albedo; giảm normal; gộp `vang_thep` vào atlas cột |
| **LOD2** | Skyline / Kinh thành xa | **Box + roof silhouette** (khối chữ nhật / chữ U Ngọ Môn); màu mái phẳng hoàng/thanh | Không cột riêng; màu khối `#8B1A1A` hoặc bake | Bỏ hết ornament | Unlit hoặc 1 light; 2–3 màu phẳng |

**Ngọ Môn LOD đặc biệt:** LOD2 phải giữ chữ U nền đài + nhịp 9 nóc (cao giữa, thấp hai cánh). **[ước lượng hợp lý — silhouette nhận diện]**  
**Hiển Lâm Các:** LOD1 giữ 3 tầng thu dần; LOD2 tháp 3 bậc + mái.

---

## 6. Mapping nhanh cấu kiện → material id

| Cấu kiện | ids chính |
|---|---|
| Mái vua / giữa Ngọ Môn / Thái Hòa | `ngoi_hoang_luu_ly` (+ `mai_ngoi_am_duong` nếu cần xương) |
| Mái phụ Ngọ Môn / công trình quan | `ngoi_thanh_luu_ly` |
| Cột, cửa, ngai (nền son) | `go_son_son` + overlay `vang_thep` |
| Cắt gỗ lộ / trùng tu thô | `go_lim` |
| Bậc, bó vỉa, tảng | `da_thanh` |
| Đài / tường xây | `gach_vo`, `tuong_voi` |
| Nền lát | `gach_bat_trang` |
| Cửu Đỉnh | `dong_thau` |
| Cổ diêm, biển ngạch men, bầu nóc | `phap_lam` |

---

## 7. Nguồn tham khảo

1. Wikipedia tiếng Việt: [*Ngọ Môn (Hoàng thành Huế)*](https://vi.wikipedia.org/wiki/Ng%E1%BB%8D_M%C3%B4n_(Ho%C3%A0ng_th%C3%A0nh_Hu%E1%BA%BF)), [*Điện Thái Hòa*](https://vi.wikipedia.org/wiki/%C4%90i%E1%BB%87n_Th%C3%A1i_H%C3%B2a_(Ho%C3%A0ng_th%C3%A0nh_Hu%E1%BA%BF)), [*Trùng thiềm điệp ốc*](https://vi.wikipedia.org/wiki/Tr%C3%B9ng_thi%E1%BB%81m_%C4%91i%E1%BB%87p_%E1%BB%91c), [*Ngói lưu ly*](https://vi.wikipedia.org/wiki/Ng%C3%B3i_l%C6%B0u_ly), [*Hoàng thành Huế*](https://vi.wikipedia.org/wiki/Ho%C3%A0ng_th%C3%A0nh_Hu%E1%BA%BF), [*Cửu Đỉnh (nhà Nguyễn)*](https://vi.wikipedia.org/wiki/C%E1%BB%ADu_%C4%90%E1%BB%89nh_(nh%C3%A0_Nguy%E1%BB%85n)), [*Pháp lam*](https://vi.wikipedia.org/wiki/Ph%C3%A1p_lam), [*Đấu củng*](https://vi.wikipedia.org/wiki/%C4%90%E1%BA%A5u_c%E1%BB%A7ng).
2. Cục Du lịch Quốc gia Việt Nam — bài Điện Thái Hòa; trang điểm đến Ngọ Môn (vietnamtourism).
3. Tạp chí Kiến trúc — phương pháp thiết kế cung điện triều Nguyễn; nhận diện kết cấu gỗ Việt; nghiên cứu tái thiết Điện Cần Chánh.
4. Quỹ Di sản / báo QĐND / Kiến Thức — Hiển Lâm Các (cao ~17 m, 3 tầng).
5. Cổng thông tin di sản văn hóa (dsvh.gov.vn) — hồ sơ Cửu Đỉnh.
6. Trần Đức Anh Sơn — tư liệu gạch ngói tráng men & pháp lam Huế (tham chiếu qua Wikipedia *Ngói lưu ly* và các bài nghiên cứu pháp lam).
7. VnExpress / Báo Pháp luật VN — mô tả trùng tu Điện Thái Hòa (80 cột, ngai, bửu tán).

---

## 8. Open issues (còn tồn)

1. HEX chưa calibrate từ ảnh RAW / đo màu tại hiện trường — cần pass photo-ref trước khi lock art direction.
2. Số đo chính xác đường kính cột, bước gian, độ dốc mái Thái Hòa / Ngọ Môn chưa đưa vào file này (chỉ material + cấu kiện định tính).
3. Biến thể men gạch Bát Tràng (xanh vs vàng vs hoa xi măng mặt đài Ngọ Môn hiện đại) cần flag theo **epoch** (nguyên bản vs trùng tu).
4. Pháp lam đa màu — một `phap_lam` id là simplification; production có thể cần atlas palette riêng.
5. “Đồng thau” vs “đồng” trên Cửu Đỉnh: nguồn ghi đồng + kẽm (± chì, thiếc) → id `dong_thau` chấp nhận được cho PBR brass, nhưng không khẳng định thành phần % hợp kim từng đỉnh.

---

## 9. Texture factory (Revolution)

Nguồn: `src/core/materials/textures/`. Procedural canvas, deterministic, cache `id + lod + size`. Không PNG/GLB.

**Size theo LOD:** LOD0 = **512** · LOD1 = **256** (WorldScene hiện `build(1)`) · LOD2 = **128**.

`getMaterial(id, lod)` luôn gắn `map`. LOD 0–1 thêm `normalMap` + `roughnessMap` + `aoMap`. `color` là tint (mặc định trắng); albedo nằm trong map.

| MaterialId | Factory id | Size (0/1/2) | Repeat gợi ý (m / cycle) | Ghi chú |
|---|---|---|---|---|
| `ngoi_hoang_luu_ly` | `ngoiMenVang` | 512 / 256 / 128 | 2.8 × 2.8 | 8 viên × 0.35 m; glaze + nứt + blotch lò |
| `ngoi_thanh_luu_ly` | `ngoiMenXanh` | 512 / 256 / 128 | 2.8 × 2.8 | Cùng layout, men lục |
| `mai_ngoi_am_duong` | `ngoiAmDuong` | 512 / 256 / 128 | 2.8 × 2.8 | Xương đất nung + rêu valley |
| `gach_vo` | `gachVo` | 512 / 256 / 128 | 4.0 × 4.0 | Viên ~0.4 × 0.2; vữa tối; sứt góc |
| `gach_bat_trang` | `gachBatTrang` | 512 / 256 / 128 | 3.2 × 3.2 | Ô vuông men; LOD0 stamp hoa thị |
| `go_lim` | `goLim` | 512 / 256 / 128 | 0.8 × 1.6 | Thớ dọc; cột wrap 1 vòng |
| `go_son_son` | `sonSon` | 512 / 256 / 128 | 1.0 × 2.0 | Đỏ sâu; mòn cạnh lộ gỗ |
| `vang_thep` | `vangThep` | 512 / 256 / 128 | 1.0 × 1.0 | Flake; mòn lộ son |
| `da_thanh` | `daThanh` | 512 / 256 / 128 | 2.4 × 2.4 | Worley + grit + địa y |
| `tuong_voi` | `tuongVoi` | 512 / 256 / 128 | 4.0 × 4.0 | Blotch; vệt mưa; chân lộ gạch |
| `phap_lam` | `phapLam` | 512 / 256 / 128 | 1.2 × 1.2 | Đảo men vàng/lục/lam/trắng |
| `co_xanh` | `co` | 512 / 256 / 128 | 8.0 × 8.0 | Thảm noise, không golf |
| `dat_nen` | `dat` | 512 / 256 / 128 | 6.0 × 6.0 | Mùn + sỏi |
| `dong_thau` | `dongThau` | 512 / 256 / 128 | 1.0 × 1.0 | Đúc + patina (không trong list tối thiểu, để đủ map) |
| `nuoc` | `nuoc` | 512 / 256 / 128 | 4.0 × 4.0 | Ripple nhẹ; WaterSystem vẫn shader riêng |

Repeat metres = **[ước lượng hợp lý]**. Kit (`buildWall` / `buildRoof` / `buildPlatform` / `buildColumnGrid`) chia UV cho các số này. Monument BoxGeometry 0–1 vẫn thấy một cycle đặc (da), chưa đúng mét.

**Stretch đã ship:** `MeshPhysicalMaterial` clearcoat men ngói / pháp lam / Bát Tràng ở LOD0. `applyWetness(0..1)` — AtmosphereSystem gọi khi `raining`.

**API phiên sau phải dùng:** `getMaterial` luôn có `map`; texture mới đi qua `getTextureSet` / factory, không `new MeshStandardMaterial({ color })`.
