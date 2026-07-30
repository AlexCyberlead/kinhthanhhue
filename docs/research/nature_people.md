# PHASE 0 / R3 — Cảnh quan & con người Huế triều Nguyễn

> Tài liệu research cho hệ **vegetation** + **NPC** của digital twin *Hue Imperial City 3D*.  
> Mỗi claim gắn nhãn: **[xác thực — nguồn]** hoặc **[ước lượng hợp lý]**.  
> HEX trang phục / instance budget là **stylized game palette**, không phải mã màu khoa học đo từ hiện vật.

---

## 1. Bảng loài cây (vegetation)

| id | tên VI | tên EN | khoa học | height (m) | canopyRadius (m) | seasonColors | instanceBudgetHint | ghi chú / nguồn |
|---|---|---|---|---|---|---|---|---|
| `tree_ngo_dong` | Ngô đồng | Chinese parasol / Firmiana | *Firmiana simplex* | 12–18 | 4–7 | Xuân–đầu hè: thân trụi lá + hoa hồng-tím `#C48BB8`; hè–thu: lá xanh `#4A7A3C`; đông: xám-vàng `#8B8B6E` | 8–20 (Đại Nội / trục thần đạo) | Vua Minh Mạng đưa từ Quảng Đông trồng cạnh điện Cần Chánh; hoa nở ~cuối T3–T5 khi lá rụng. **[xác thực — Đại Nam nhất thống chí; Tạp chí Sông Hương; VTC / VTV / HNN]** |
| `tree_phuong_vi` | Phượng vĩ | Flame tree / Royal poinciana | *Delonix regia* | 10–15 (max ~18) | 6–9 (tán dù, ngang ≥ cao) | Hè: hoa đỏ-cam `#E6392B` / `#FF6B35` phủ tán; lá lông chim xanh `#3F8F3A`; mùa ít mưa có thể trụi một phần | 15–40 (ngoài tường thành, đường phố quanh Kinh Thành) | Phổ biến cảnh quan nhiệt đới VN; nở hè. Trong Đại Nội ưu tiên ngô đồng hơn phượng. **[xác thực — NParks / ICRAF height+canopy; ước lượng vị trí scene]** |
| `tree_nhan` | Nhãn | Longan | *Dimocarpus longan* | 8–12 | 4–6 | Lá xanh đậm quanh năm `#2F6B2A`; quả nâu vàng hè–thu `#C4A35A` | 10–30 (vườn, khu dân quanh thành) | Cây ăn quả phổ biến miền Trung. **[xác thực — danh pháp; ước lượng mật độ scene]** |
| `tree_su_dai` | Sứ / Đại (hoa sứ) | Frangipani / Plumeria | *Plumeria rubra* / *P. obtusa* | 3–6 | 2–3.5 | Hoa trắng/vàng/hồng `#FFF8E7` `#F2C14E` `#E8A0BF`; lá xanh `#4F8A3E`; đông có thể trụi nhẹ | 20–60 (sân, miếu, vườn ngự uyển) | Phổ biến sân đền/chùa/vườn VN. **[xác thực — danh pháp; ước lượng vị trí]** |
| `tree_tre` | Tre / trúc | Bamboo | *Bambusa* spp. / *Dendrocalamus* spp. (trúc cảnh: *Phyllostachys* / loài trúc địa phương) | 6–15 (bụi) | 2–4 (clump radius) | Xanh quanh năm `#5C9A45` → `#2E6B32`; đọt non vàng-xanh `#A8C96A` | 40–120 clumps (ven hào, bờ hồ Tịnh Tâm) | Wikipedia/sử liệu: quanh đảo & bờ hồ Tịnh Tâm trồng **liễu, trúc**. **[xác thực — Wikipedia Hồ Tịnh Tâm; ước lượng instance]** |
| `plant_sen` | Sen (sen ngự trắng Tịnh Tâm) | Sacred lotus | *Nelumbo nucifera* | 0.8–1.8 (lá + hoa trên mặt nước) | 0.4–0.8 / instance (lá Ø ~0.3–1.0) | Hè: hoa trắng/hồng `#F7F2E8` `#F2A7B8`; lá xanh sáp `#3A7A3C`; thu: đài hạt nâu `#6B4E2E` | 200–800 (mặt hồ Tịnh Tâm, Thái Dịch, ao Liên Trì) | Sen trắng “ngự” hồ Tịnh Tâm; mùa sen hè. **[xác thực — Wikipedia; Tiền Phong; Nhân Dân; NCSU height]** |
| `plant_sung` | Súng | Water lily | *Nymphaea* spp. | 0.05–0.3 (lá nổi) | 0.3–0.6 | Hoa tím/hồng/trắng `#7B5EA7` `#E8A0BF` `#FFFFFF`; lá xanh đậm `#1F5A3A` | 80–250 (mép hồ nông, kênh) | Bổ sung sen; lá nổi vs sen lá đứng. **[ước lượng hợp lý — loài phổ biến ao VN; phân biệt hình thái]** |
| `tree_thong` | Thông | Pine | *Pinus* spp. (thường *P. merkusii* / thông cảnh trồng) | 15–25 | 3–5 | Xanh kim quanh năm `#2A5A32`; thân nâu `#5C4033` | 5–15 (đồi giả sơn / góc vườn; không dọc thần đạo dày) | Ít là “cây chủ đạo” trong Đại Nội; dùng điểm nhấn phong cảnh giả sơn. **[ước lượng hợp lý]** |
| `tree_lieu` | Liễu | Willow | *Salix* spp. | 6–12 | 3–5 | Xanh mềm `#6FAF5A`; đông hơi vàng `#B8A84A` | 10–25 (bờ hồ Tịnh Tâm — “Hồ tân liễu lãng”) | Tài liệu lịch sử: liễu + trúc ven hồ/đảo. Thiệu Trị có cảnh *Hồ tân liễu lãng* (Cơ Hạ). **[xác thực — Wikipedia Tịnh Tâm; khamphahue Cơ Hạ]** |
| `tree_bang_lang` | Bằng lăng | Pride of India / Queen's crape myrtle | *Lagerstroemia speciosa* | 8–15 | 4–6 | Hè: hoa tím `#8B5CF6` / `#9B6BC7`; lá xanh `#3F7A3A` | 8–20 (ven đường ngoài thành, công viên) | Phổ biến Huế đô thị; đối lập sắc với ngô đồng. **[ước lượng hợp lý — loài phổ biến đô thị miền Trung]** |
| `shrub_hoa_co` | Hoa cỏ lạ / bụi trang trí | Ornamental shrubs mix | hỗn hợp (*Ixora*, *Hibiscus*, …) | 0.8–2 | 0.5–1.2 | Đỏ/cam/hồng `#C62828` `#FF8A3D` `#E91E8C`; lá `#3D7A38` | 50–150 (vườn Thiệu Phương, Cơ Hạ, mép sân) | Sử liệu: “hoa cỏ lạ” quanh Tịnh Tâm / ngự uyển — không khóa 1 loài. **[xác thực khái niệm — Wikipedia; ước lượng palette]** |

### Gợi ý phân bố cảnh quan nước & trục

| Zone | Loài ưu tiên | Mật độ cảm giác | Tag |
|---|---|---|---|
| Hồ **Tịnh Tâm** (3 đảo Bồng Lai / Phương Trượng / Doanh Châu) | `plant_sen` dày; `tree_tre` + `tree_lieu` ven bờ/đảo; ít `plant_sung` mép nông | Sen phủ phần lớn mặt nước mùa hè | **[xác thực — Wikipedia; báo chí phục hồi sen ngự]** |
| Hồ **Thái Dịch** / mặt nước Hoàng thành | `plant_sen` + `plant_sung` | Thưa hơn Tịnh Tâm | **[xác thực — sen được di thực/phục hồi tới hồ khác; ước lượng tỷ lệ]** |
| **Hào thành** | `tree_tre` clumps dọc mép nước | Hàng/clump, không tán kín đường tuần | **[ước lượng hợp lý]** |
| **Trục thần đạo** (Ngọ Môn → điện Thái Hòa) | `tree_ngo_dong` điểm nhấn; hạn chế tán che kiến trúc | Sparse landmark trees | **[xác thực — vị trí ngô đồng sau Thái Hòa / Cần Chánh]** |
| Vườn **Cơ Hạ** / **Thiệu Phương** | `tree_su_dai`, `shrub_hoa_co`, `tree_lieu`, ao sen (`plant_sen`), tre điểm | Dense garden layering | **[xác thực — ngự uyển; ước lượng mix loài]** |
| Ngoài tường / đường phố hiện đại | `tree_phuong_vi`, `tree_bang_lang`, `tree_nhan` | Urban canopy | **[ước lượng hợp lý]** |

### Mùa nở (timeline shader / LOD swap)

| Tháng (dương lịch, xấp xỉ) | Event thực vật | Tag |
|---|---|---|
| T3–T5 | Ngô đồng nở (lá rụng → hoa hồng-tím) | **[xác thực]** |
| T5–T8 | Phượng vĩ đỏ; sen Tịnh Tâm nở rộ | **[xác thực mùa sen; ước lượng cửa sổ phượng]** |
| T6–T9 | Bằng lăng tím (đô thị) | **[ước lượng hợp lý]** |
| T9–T2 | Mưa Huế; lá ướt tối màu; sen tàn → đài hạt / mặt nước trống hơn | **[xác thực khí hậu; ước lượng visual]** |

---

## 2. Bảng NPC types (≥12)

> `height` = chiều cao nhân vật stylized (m), scale Unity/Unreal ~1.0 = người chuẩn.  
> `outfitColors` = HEX stylized cho material / palette atlas — **không** thay đo colorimetry hiện vật.  
> Animation states tối thiểu mọi type: **`idle`**, **`walk`**, **`bow`** (vái / cúi chào). Một số type thêm gợi ý phụ.

| id | name | outfitColors (HEX) | height (m) | role | animation notes | Tag |
|---|---|---|---|---|---|---|
| `npc_vua` | Vua (long bào / hoàng bào) | Primary `#E8B923` (vàng chính sắc); trim `#1A4B8C` (bảo lam tay); cổ `#F5F5F0`; accent rồng `#D4AF37` | 1.70–1.75 | Hoàng đế — scene lễ / điện Thái Hòa | `idle` trang nghiêm; `walk` chậm; `bow` nhẹ (hoặc nhận lạy — optional `receive_bow`) | Vàng = hành Thổ, độc tôn. **[xác thực màu/ý niệm — Khâm định ĐNHĐSL / bài “Giải mã long bào”; HEX ước lượng]** |
| `npc_quan_van` | Quan văn (áo tấc / phẩm phục) | Áo `#5B2C6F` (tím / quá vũ thiên thanh) hoặc `#2E6B4F` (quan lục); bổ tử `#C9A227`; khăn/mũ `#1A1A1A` | 1.65–1.72 | Văn quan — sân Đại Triều Nghi, hành lang | `idle` cầm hốt (prop); `walk`; `bow` sâu | Màu phẩm cấp đa dạng. **[xác thực loại áo/màu mẫu BTLSQG; HEX ước lượng]** |
| `npc_quan_vo` | Quan võ | Áo `#8B1E1E` hoặc `#6B2D2D`; giáp/đai `#B87333`; mũ phốc đầu vuông `#222222`; accent `#D4AF37` | 1.68–1.78 | Võ quan — Ngọ Môn, cửa thành, thao trường | `idle` tay sau lưng / chống kiếm; `walk` vững; `bow` ngắn | Mũ võ dáng vuông vs văn tròn. **[xác thực phân biệt mũ — VNMH; HEX ước lượng]** |
| `npc_ve_binh` | Lính vệ binh | Biến thể A (tỉnh binh stylized): áo `#C62828`, viền `#2E7D32`, nón `#E6C84A`; Biến thể B (phủ binh): áo `#1A1A1A`, viền `#B71C1C`, nón `#2F4F2F` | 1.65–1.75 | Canh gác cửa / hào / tường | `idle` đứng gác (có thể `spear_idle`); `walk` tuần; `bow` nhanh với quan | Thái Đình Lan 1835 mô tả áo đỏ/đen + nón. **[xác thực mô tả màu; HEX ước lượng]** |
| `npc_thai_giam` | Thái giám | Áo dài `#2C3E50` / `#3D4F5F`; khăn vấn đen `#111111`; đế `#5D4037` | 1.55–1.68 | Nội cung, hành lang Cấm Thành | `idle` chắp tay; `walk` nhẹ; `bow` sâu | Ăn mặc áo dài + khăn đen trong nghi lễ. **[xác thực khái niệm phục vụ cung; HEX ước lượng]** |
| `npc_cung_nu` | Cung nữ | Áo `#A67C52` / `#8D6E63` hoặc lụa nhạt `#D7CCC8`; quần `#F5F0E6`; tóc `#1A1A1A`; điểm hoa `#C2185B` (loan/phượng giản lược) | 1.50–1.62 | Nội đình, vườn ngự uyển | `idle` quạt/khay (prop); `walk` nhỏ bước; `bow` thấp | Họa tiết chim loan giản hơn hậu. **[xác thực ý niệm trang trí; HEX ước lượng]** |
| `npc_hau` | Người hầu / cung nhân thường | Áo nâu `#6D4C41`; quần `#E8DCC8`; khăn `#3E2723` | 1.55–1.68 | Phục vụ sân sau, kho, bếp | `idle` mang đồ; `walk` nhanh hơn quan; `bow` | Tông trầm bình dân. **[ước lượng hợp lý — kế thừa ngũ thân nâu]** |
| `npc_tang_si` | Tăng sĩ / người hầu lễ | Cà sa nâu `#8D6E41` / xám `#7A7A72`; hoặc áo tế tối `#2B2B2B`; chuỗi hạt `#F5F5DC` | 1.60–1.72 | Miếu / đàn tế / chùa trong thành | `idle` niệm; `walk` chậm; `bow` (lạy) | Phục vụ scene lễ. **[ước lượng hợp lý stylized]** |
| `npc_dan_ngu_than` | Dân thường áo dài ngũ thân | Nam: `#3E2723` / `#4E342E` + khăn đen; Nữ: `#5D4037` / `#A1887F` + quần `#F5F0E6` | 1.55–1.70 | Phố trong Kinh Thành, ngoài Ngọ Môn | `idle`; `walk`; `bow` | Bình dân tông nâu/đen. **[xác thực — mô tả áo ngũ thân bình dân; HEX ước lượng]** |
| `npc_non_la` | Người đội nón lá | Áo `#6D4C41` hoặc `#1565C0` nhạt nông; nón `#E8D5A3` → `#C4A574`; quần `#EDE6D9` | 1.55–1.70 | Nông / dân dã / chợ ven thành | `idle` đội nón; `walk`; `bow` (+ optional `fan_self`) | Iconic VN; phổ biến hình ảnh dân gian. **[ước lượng hợp lý]** |
| `npc_tay_su` | Khách Tây / sứ thần (C19 stylized) | Áo Âu `#1B2838` / `#F5F5F5`; cổ `#FFFFFF`; mũ `#2C2C2C`; accent `#8B0000` | 1.70–1.80 | Đoàn sứ / ảnh C19 — Ngọ Môn, sân triều | `idle` quan sát; `walk`; `bow` (mũ tip / cúi nhẹ) | Optional historical tourism layer. **[ước lượng hợp lý stylized]** |
| `npc_tourist` | Khách du lịch hiện đại | Áo thường `#2196F3` / `#FFFFFF` / `#FF7043`; quần `#37474F`; máy ảnh `#212121`; nón/mũ `#FFEB3B` optional | 1.55–1.80 | Layer hiện đại — toàn bộ di tích mở cửa | `idle` chụp ảnh (`photo`); `walk`; `bow` (selfie pose optional, không bắt buộc) | Đối lập timeline historical vs today. **[ước lượng hợp lý]** |
| `npc_hoang_hau` *(bonus)* | Hoàng hậu / phi (đại lễ) | Áo `#9C1B2E` / `#C62828`; đoàn phượng `#D4AF37`; xiêm `#F8E7C9` | 1.55–1.65 | Nội điện / đại lễ | `idle`; `walk` chậm; `bow` | Phượng đoàn vs loan. **[xác thực ý niệm họa tiết; HEX ước lượng]** |
| `npc_nhac_cong` *(bonus)* | Nhạc công cung đình | Áo `#1565C0` / `#6A1B9A`; khăn `#111111` | 1.58–1.70 | Duyệt Thị Đường / lễ nhạc | `idle` + `play` (prop); `walk`; `bow` | Hữu ích cho scene biểu diễn. **[ước lượng hợp lý]** |

### Tỷ lệ chiều cao gợi ý (relative scale)

| Nhóm | Scale vs `npc_dan_ngu_than` = 1.0 |
|---|---|
| Vua / sứ Tây | 1.02–1.08 |
| Quan văn–võ / vệ binh | 1.00–1.05 |
| Thái giám / cung nữ / hầu | 0.92–1.00 |
| Trẻ em (nếu thêm sau) | 0.65–0.80 |

**[ước lượng hợp lý — stylized readability, không nhân trắc học]**

---

## 3. Waypoint zones (gợi ý spawn / patrol)

| zone_id | Khu vực | NPC ưu tiên | Vegetation gắn | Hành vi gợi ý |
|---|---|---|---|---|
| `wp_dai_trieu_nghi` | Sân Đại Triều Nghi (trước điện Thái Hòa) | `npc_vua`, `npc_quan_van`, `npc_quan_vo`, `npc_ve_binh` | `tree_ngo_dong` sparse | Lễ triều: hàng ngũ, `bow` theo nhịp |
| `wp_ngo_mon` | Ngọ Môn / Lầu Ngũ Phụng | `npc_ve_binh`, `npc_quan_vo`, `npc_tourist`, `npc_tay_su` | Ít cây lớn (giữ silhouette cổng) | Tuần tra + du khách chụp ảnh |
| `wp_than_dao` | Trục Ngọ Môn → Thái Hòa | `npc_quan_van`, `npc_ve_binh`, `npc_tourist` | Ngô đồng landmark | Walk dọc trục, tránh tán dày |
| `wp_tu_cam` | Tử Cấm Thành / nội đình | `npc_thai_giam`, `npc_cung_nu`, `npc_hau`, `npc_vua` | Sứ, bụi hoa | Mật độ thấp, đường mòn hẹp |
| `wp_thieu_phuong` | Vườn Thiệu Phương | `npc_cung_nu`, `npc_hau`, `npc_vua` (hiếm) | Sứ, sen ao Liên Trì, bụi | Dạo vườn, idle dài |
| `wp_co_ha` | Vườn Cơ Hạ / Minh Hồ | `npc_cung_nu`, `npc_hau`, `npc_tang_si` (hiếm) | Liễu, sen, trúc | Patrol cầu Kim Nghê stylized |
| `wp_tinh_tam` | Hồ Tịnh Tâm | `npc_tourist`, `npc_dan_ngu_than`, `npc_non_la` | Sen dày, trúc, liễu | Walk bờ hồ; không đi trên mặt sen |
| `wp_mieu` | Thế Tổ Miếu / các miếu trong Hoàng thành | `npc_tang_si`, `npc_quan_van`, `npc_hau` | Sứ, thông điểm | `bow` / lễ |
| `wp_hao_thanh` | Hào & chân tường | `npc_ve_binh`, `npc_non_la` | Tre clumps | Patrol dài, tốc độ đều |
| `wp_duyet_thi` | Duyệt Thị Đường | `npc_nhac_cong`, `npc_quan_van`, `npc_cung_nu` | Bụi thấp | Idle + `play` |
| `wp_pho_ngoai` | Phố trong Kinh Thành (layer dân sự) | `npc_dan_ngu_than`, `npc_non_la`, `npc_tourist` | Nhãn, phượng, bằng lăng | Đông đúc hơn nội cung |

**[ước lượng hợp lý — map gameplay; vị trí di tích xác thực tên]**

---

## 4. Gió / mưa / sương — notes cho shader & particle

### 4.1 Khí hậu Huế (input thiết kế)

| Hiện tượng | Đặc điểm | Tag |
|---|---|---|
| Mưa Huế | Mùa mưa lệch cả nước: ~T9–T12/T2; lượng mưa TB năm cao (~2700–4000 mm tỉnh); số ngày mưa nhiều; độ ẩm ~83–87% | **[xác thực — Địa chí TTH / hue.gov.vn / Tuổi Trẻ / VnExpress]** |
| Cơ chế | Gió mùa Đông Bắc + địa hình Bạch Mã / Trường Sơn chắn → mây ẩm tụ | **[xác thực]** |
| “Một cơn mưa thành mùa đông” | Mưa hè làm trời tối lạnh đột ngột rồi tan | **[xác thực — thành ngữ/khí hậu địa phương]** |
| Đông âm u | Trời xám kéo dài, ít nắng; cảm giác ẩm | **[xác thực mô tả]** |
| Sương sớm | Sương/mù ẩm sáng sớm phổ biến mùa mưa–đông (visual design) | **[ước lượng hợp lý cho particle — hiện tượng ẩm cao thực tế]** |

### 4.2 Preset atmosphere (gợi ý engine)

| preset_id | Sky | Fog | Particles | Wind | Vegetation response |
|---|---|---|---|---|---|
| `atmo_clear_summer` | Sky xanh `#87B8E0`, sun cứng | Fog density thấp, color `#D7E6F2` | Dust nhẹ sân gạch | Wind 0.2–0.5 | Phượng/sen full bloom materials |
| `atmo_hue_rain` | Overcast `#6A737A` → `#4A5258` | Density cao, color `#8A9196`, start gần camera | Rain streaks dài, tốc độ chậm (mưa dầm ≠ mưa bão nhiệt đới flash); splash puddle trên đá/gạch | Wind 0.4–0.8 ngang | Lá tối (wet darken −15~25% albedo); tre nghiêng; sen lá run |
| `atmo_early_mist` | Horizon xám-trắng `#B8C2C8` | Exponential height fog, density cao gần mặt đất/hồ | Soft fog sprites + light godray yếu | Wind 0.1–0.3 | Silhouette tường thành mờ; specular ướt |
| `atmo_winter_overcast` | Flat grey `#7A8086`, sun disk ẩn | Fog liên tục, contrast thấp | Drizzle thưa + breath mist (NPC mũi miệng optional) | Wind 0.3–0.6 | Desaturate scene −10~20%; ngô đồng trụi/hoa tùy tháng |

### 4.3 Particle / shader checklist

1. **Rain**: streak dài, góc nghiêng theo wind vector; intensity theo tháng (peak ~T10–T11). **[xác thực peak mưa; ước lượng VFX]**
2. **Wet surface**: roughness↓ trên đá thanh / ngói / gạch Bát Tràng stylized.
3. **Fog over water**: hồ Tịnh Tâm / Thái Dịch — fog denser 1.2× so với sân cao.
4. **Wind zones**: hào & mặt hồ wind↑; nội đình tường cao wind↓.
5. **Lightning**: hiếm; ưu tiên mưa dầm liên tục hơn thunderstorm cinematic (tránh sai “vibe Huế”). **[ước lượng đạo diễn]**

---

## 5. Animation state matrix (vegetation + NPC)

### NPC (bắt buộc)

| State | Mô tả | Áp dụng |
|---|---|---|
| `idle` | Đứng thở / chờ | All |
| `walk` | Di chuyển waypoint | All |
| `bow` | Cúi chào / vái | All (tourist = cúi nhẹ hoặc wave→map `bow`) |

Optional per-role: `spear_idle`, `photo`, `play`, `carry`.

### Vegetation

| State / param | Gợi ý |
|---|---|
| `windBend` | Tre > liễu > phượng > ngô đồng > thông |
| `bloomFactor` 0–1 | Sen, phượng, ngô đồng, bằng lăng theo tháng |
| `wetness` 0–1 | Đồng bộ `atmo_hue_rain` |

---

## 6. Nguồn tham khảo

### Cảnh quan / thực vật
1. Wikipedia — *Hồ Tịnh Tâm* (liễu, trúc, sen trắng; 3 đảo; cửa hồ).  
2. Tiền Phong / Nhân Dân — phục hồi sen trắng “ngự” hồ Tịnh Tâm; di thực hồ khác.  
3. Tạp chí Sông Hương; VTC; VTV; Hue Ngay Nay — ngô đồng Đại Nội; *Đại Nam nhất thống chí* (Minh Mạng, Quảng Đông → điện Cần Chánh).  
4. NParks / ICRAF / WorldFloraOnline / NCSU Extension — danh pháp & chiều cao *Delonix regia*, *Nelumbo nucifera*, *Firmiana simplex*.  
5. Tạp chí Kiến trúc; khamphahue; tư liệu ngự uyển — Thiệu Phương (1828), Cơ Hạ (1837), Minh Hồ, ao Liên Trì.  
6. Cổng thông tin tỉnh / Địa chí Thừa Thiên Huế — mưa, Bạch Mã, lượng mưa.

### Trang phục / nhân vật
7. Bảo tàng Lịch sử Quốc gia / baotanglichsu — y phục cung đình Nguyễn; long bào, mãng bào, áo tấc; màu mẫu (cổ đồng, hỏa hoàng, quan lục, tím…).  
8. VNMH — chế độ y quan; mũ văn tròn / võ vuông; áo lính song khai.  
9. Giáo dục Thời đại — “Giải mã long bào” / Khâm định Đại Nam hội điển sự lệ (vàng chính sắc, bảo lam).  
10. Thái Đình Lan, *Hải Nam tạp trứ* (1835) — màu áo/nón lính tỉnh vs phủ huyện (dẫn lại báo chí).  
11. VietnamPlus — áo ngũ thân bình dân tông nâu/đen.  
12. Album *Grande Tenue de la Cour d’Annam* (Nguyễn Văn Nhân, 1902) — tham chiếu hình họa (qua nghiên cứu Trần Minh Nhựt).

### Khí hậu
13. Tuổi Trẻ — “Chỉ một cơn mưa Huế là thành mùa đông”; số liệu mưa/ẩm.  
14. VnExpress — mưa Huế; Bạch Mã chắn gió mùa.  
15. hue.gov.vn (Du địa chí — Tự nhiên) — lượng mưa, mùa mưa lệch.

---

## 7. Ranh giới xác thực vs ước lượng (tóm tắt QA)

| Được coi **xác thực** | Phải gắn **ước lượng** |
|---|---|
| Tên di tích, sự kiện trồng ngô đồng, sen trắng Tịnh Tâm, liễu/trúc ven hồ | HEX material NPC/cây |
| Danh pháp khoa học loài chính | `instanceBudgetHint` chính xác từng scene |
| Mùa hoa ngô đồng (~T3–T5), đặc trưng mưa Huế | Chiều cao NPC stylized; wind numeric |
| Phân cấp ý niệm trang phục (vàng vua, mãng/long, áo tấc, lính đỏ/đen) | Vị trí chính xác từng cây trong mesh hiện trạng 2026 |
| Tồn tại ngự uyển Cơ Hạ / Thiệu Phương | Mix loài bụi “hoa cỏ lạ” chi tiết từng mét vuông |

---

## 8. Deliverable checklist (nghiệm thu)

- [x] ≥ 8 loài cây (bảng có **11** entries)  
- [x] ≥ 12 NPC types (có **12** bắt buộc + **2** bonus)  
- [x] HEX trang phục trong bảng NPC  
- [x] Waypoint zones  
- [x] Gió/mưa/sương notes  
- [x] Nguồn tham khảo  
- [x] Phân biệt **[xác thực]** / **[ước lượng hợp lý]**  

**Dependency:** không (tài liệu thuần).  
**Không đụng:** `package.json`, scaffold, code runtime.
