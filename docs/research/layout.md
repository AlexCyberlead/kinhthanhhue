# PHASE 0 / R1 — Sử liệu & quy hoạch Kinh Thành Huế

> Hệ tọa độ world (dùng cho Digital Twin): gốc `(0,0,0)` = tâm sân **Đại Triều Nghi**; trục **+Z = hướng Nam** (ra Ngọ Môn → sông Hương); **+Y = lên**; **+X = Đông**; `1 unit = 1 mét`.
>
> Quy ước nguồn: **[xác thực — nguồn]** = có trích dẫn đối chiếu; **[ước lượng hợp lý]** = suy từ mặt bằng / bản đồ / khoảng cách tương đối, chưa đo GIS.

---

## 1. Tổng quan lịch sử xây dựng (Gia Long – Minh Mạng)

| Mốc | Sự kiện | Độ tin cậy |
| --- | --- | --- |
| 1-5-1803 | Bắt đầu quy hoạch tổng thể Kinh thành; giải tỏa mặt bằng, nắn thủy lộ | [xác thực — Cố đô Huế / codohue.vn] |
| 5-1804 | Khởi xây **Hoàng thành** và **Cung thành** (sau đổi tên Tử Cấm thành) | [xác thực — Wikipedia Hoàng thành Huế; Cố đô Huế] |
| 28-5-1805 | Khởi xây **Kinh thành**: đắp đất, đào hào, nắn sông Bạch Yến & Kim Long thành **Hộ Thành Hà** và **Ngự Hà** | [xác thực — Cố đô Huế] |
| 1806 | Đàn Nam Giao, đàn Xã Tắc | [xác thực — Cố đô Huế] |
| 1807 | Xây **Kỳ Đài** | [xác thực — Cố đô Huế; VnExpress] |
| 1809 | Xây 10 cửa đường bộ Kinh thành (chưa có vọng lâu) | [xác thực — Cố đô Huế] |
| 1818–1822 | Ốp gạch các mặt thành (trước/phải/sau/trái) | [xác thực — Cố đô Huế] |
| 1822 | Minh Mạng đổi tên Cung thành → **Tử Cấm thành** | [xác thực — Wikipedia Tử Cấm thành (Huế)] |
| 1824–1831 | Xây vọng lâu các cửa Kinh thành theo từng đợt | [xác thực — Cố đô Huế] |
| 1832 | Tạm hoàn thành tổng thể Kinh thành | [xác thực — Cố đô Huế; heritages.vn] |
| ~1833 | Hoàn chỉnh hệ thống cung điện Hoàng thành (~147 công trình theo một số tài liệu) | [xác thực — Wikipedia Hoàng thành Huế] |
| 1833–1834 | Đại Cung môn (1833); Ngọ Môn dạng hiện nay (Minh Mạng 14 / 1833–1834) | [xác thực — Wikipedia] |

**Kiến trúc phòng thủ:** kiểu **Vauban** (pháo đài lồi, tường dày, hào nước) kết hợp bố cục **phong thủy** Việt–Hán. [xác thực — Cố đô Huế; nhiều nguồn phụ]

**Ghi chú về số “~2.400 m / cạnh”:** các mặt Kinh thành **không đều** theo Hội Điển (xem mục 2). Con số ~2.400 m là **xấp xỉ truyền thông** [ước lượng hợp lý / phổ biến trong giới thiệu du lịch], không khớp số đo Hội Điển chi tiết.

---

## 2. Sơ đồ 3 vòng thành với kích thước

```
                    [Bắc / −Z]
                         │
    ┌────────────────────┼────────────────────┐
    │         KINH THÀNH (Vauban + hào)       │
    │  chu vi ~10.572 m · 24 pháo đài         │
    │    ┌───────────────┼───────────────┐    │
    │    │     HOÀNG THÀNH / Đại Nội     │    │
    │    │   ~622 × ~604–606 m           │    │
    │    │  ┌────────────┼────────────┐  │    │
    │    │  │  TỬ CẤM THÀNH           │  │    │
    │    │  │  ~324 × ~290,7 m        │  │    │
    │    │  └────────────┼────────────┘  │    │
    │    │     Ngọ Môn / Thái Hòa        │    │
    │    └───────────────┼───────────────┘    │
    │              Kỳ Đài │                   │
    └────────────────────┼────────────────────┘
                         │
                    [Nam / +Z] → sông Hương → Ngự Bình
```

### 2.1. Kinh thành (vòng ngoài)

| Thông số | Giá trị | Độ tin cậy |
| --- | --- | --- |
| Chu vi | **10.571,64 m** (Hội Điển) | [xác thực — Cố đô Huế trích Hội Điển] |
| Mặt tiền (Nam) | 641 trượng = **2.724,25 m** | [xác thực — Cố đô Huế] |
| Mặt tả (Đông) | **2.587,36 m** | [xác thực — Cố đô Huế] |
| Mặt hữu (Tây) | **2.660,03 m** | [xác thực — Cố đô Huế] |
| Mặt hậu (Bắc) | **2.599,64 m** | [xác thực — Cố đô Huế] |
| Dày thân thành | 5 trượng = **21,25 m** | [xác thực — Cố đô Huế] |
| Cao mặt ngoài | **6,46 m** (1 trượng 5 thước 2 tấc) | [xác thực — Cố đô Huế] |
| Cao mặt trong | **3,825 m** | [xác thực — Cố đô Huế] |
| Cao ~6,6 m (làm tròn phổ biến) | ~6,6 m | [ước lượng hợp lý — làm tròn từ 6,46 m / đo thực địa có biến thiên] |
| Pháo đài | **24** (4 giác bảo + 20 cỡ lớn/trung/nhỏ) | [xác thực — Cố đô Huế] |
| Pháo nhãn | **404** (386 trên đài + bổ sung thủy quan) | [xác thực — Cố đô Huế] |
| Hào / sông | Hộ Thành Hà + hào chân thành; Ngự Hà xuyên trong | [xác thực — nhiều nguồn] |
| Thời xây | 1805–1832 | [xác thực] |

### 2.2. Hoàng thành (Đại Nội — vòng giữa)

| Thông số | Giá trị | Độ tin cậy |
| --- | --- | --- |
| Mặt trước / sau (Đông–Tây) | **622 m** | [xác thực — netcodo.com.vn; Giáo dục Thời đại / Châu bản] |
| Mặt tả / hữu (Bắc–Nam) | **604 m** (một nguồn ghi ~606 m) | [xác thực — 604 m: netcodo / Châu bản; 606 m: số tham chiếu dự án — gần khớp] |
| Wikipedia rút gọn | “mỗi bề khoảng 600 m” | [xác thực — Wikipedia (làm tròn)] |
| Tường cao | **~4 m** (một nguồn: 4,16 m) | [xác thực — Wikipedia ~4 m; netcodo 4,16 m] |
| Tường dày | **~1 m** (một nguồn: 1,04 m) | [xác thực — Wikipedia; netcodo] |
| Cổng | 4: Ngọ Môn (Nam), Hiển Nhơn (Đông), Chương Đức (Tây), Hòa Bình (Bắc) | [xác thực] |
| Hào | Hồ **Ngoại Kim Thủy** bao quanh | [xác thực] |
| Khởi / hoàn chỉnh cung điện | 1804 / ~1833 | [xác thực] |

### 2.3. Tử Cấm thành (vòng trong)

| Thông số | Giá trị | Độ tin cậy |
| --- | --- | --- |
| Mặt trước / sau (Đông–Tây) | **324 m** | [xác thực — Wikipedia; netcodo] |
| Mặt tả / hữu (Bắc–Nam) | **290 m** / **290,68 m** | [xác thực — Wikipedia ghi 290,68 m] |
| Chu vi | **1.229,36 m** | [xác thực — Wikipedia] |
| Tường cao | **3,72 m** (~3,7 m) | [xác thực — Wikipedia] |
| Tường dày | **0,72 m** | [xác thực — Wikipedia] (một bài báo ghi 0,2 m — **không dùng**, nghi lỗi) |
| Cổng chính | **Đại Cung môn** (Nam, gỗ, 1833) | [xác thực] |
| Số cửa (biến động lịch sử) | ~7 cửa chính + một số cửa mở/lấp thêm | [xác thực — Wikipedia] |
| Thiệt hại | Phần lớn cung điện nội đình phá **1947** (tiêu thổ); thêm thiệt hại **1968** | [xác thực — Wikipedia] |

### 2.4. Kỳ Đài

| Thông số | Giá trị | Độ tin cậy |
| --- | --- | --- |
| Vị trí | Pháo đài Nam Chánh, mặt tiền Kinh thành, giữa cửa Thể Nhơn & Quảng Đức, trước Ngọ Môn | [xác thực — Đại đoàn kết / nhiều nguồn] |
| Năm xây đài | 1807 (Gia Long) | [xác thực] |
| 3 tầng đài | Tổng cao đài ~**17,5 m** (tầng ~5,5 / 6 / 6 m) | [xác thực — VnExpress; Đại đoàn kết] |
| Cột cờ hiện nay | **37 m** (bê tông, dựng 1948) | [xác thực — VnExpress] |
| Tổng cao mặt đất → đỉnh cột | **~54–54,5 m** | [xác thực — VnExpress; Đại đoàn kết] |

---

## 3. Bảng tọa độ tương đối (mét)

Gốc: tâm sân Đại Triều Nghi. `y` = cao độ nền ước lượng (mặt đất ≈ 0).

> Toàn bộ tọa độ dưới đây là **[ước lượng hợp lý]** từ tỷ lệ mặt bằng Hoàng thành / Tử Cấm thành và sơ đồ 1909 (Đại Nam nhất thống chí), **chưa** hiệu chỉnh GPS/GIS. Sai số kỳ vọng ±15–40 m trong Đại Nội; ±80–200 m với cửa Kinh thành.

| ID / Mốc | anchor `[x, y, z]` | Ghi chú |
| --- | --- | --- |
| `san-dai-trieu-nghi` | `[0, 0, 0]` | Gốc hệ tọa độ |
| `dien-thai-hoa` | `[0, 1, -48]` | Bắc sân Đại Triều |
| `cau-trung-dao` | `[0, 0, 55]` | Giữa hồ Thái Dịch |
| `ho-thai-dich` | `[0, -1, 55]` | Hồ trước Ngọ Môn |
| `ngo-mon` | `[0, 2, 118]` | Cổng Nam Hoàng thành |
| `ky-dai` | `[0, 0, 340]` | Trên tường Nam Kinh thành |
| `dai-cung-mon` | `[0, 1, -95]` | Cổng Nam Tử Cấm |
| `dien-can-chanh` | `[0, 1, -145]` | Trục thần đạo |
| `dien-can-thanh` | `[0, 1, -205]` | Tư cung vua |
| `dien-kien-trung` | `[0, 1, -275]` | Cực Bắc nội đình |
| `hoa-binh-mon` | `[0, 2, -480]` | Cổng Bắc Hoàng thành |
| `hien-nhon-mon` | `[308, 2, -180]` | Cổng Đông Hoàng thành |
| `chuong-duc-mon` | `[-308, 2, -180]` | Cổng Tây Hoàng thành |
| Tâm hình học Hoàng thành | `[0, 0, -180]` | Ước từ 604 m N–S |
| Tâm hình học Tử Cấm | `[0, 0, -235]` | Ước từ 290 m N–S |
| `cua-chinh-nam` (Nhà Đồ) | `[-420, 0, 1180]` | Cửa Kinh thành |
| `cua-quang-duc` | `[-180, 0, 1280]` | Nam, gần Kỳ Đài (Tây) |
| `cua-the-nhon` | `[180, 0, 1280]` | Nam, gần Kỳ Đài (Đông) |
| `cua-thuong-tu` | `[980, 0, 780]` | Đông-Nam |
| `cua-dong-ba` | `[1180, 0, 80]` | Chính Đông |
| `cua-ke-trai` | `[1050, 0, -780]` | Đông-Bắc |
| `cua-chinh-bac` | `[80, 0, -1200]` | Chính Bắc |
| `cua-an-hoa` | `[-780, 0, -1050]` | Tây-Bắc |
| `cua-chinh-tay` | `[-1200, 0, -50]` | Chính Tây |
| `cua-huu` | `[-980, 0, 750]` | Tây-Nam |
| `dong-thanh-thuy-quan` | `[1100, 0, -200]` | Cửa thủy Đông (Ngự Hà) |
| `tay-thanh-thuy-quan` | `[-1100, 0, -80]` | Cửa thủy Tây (Ngự Hà) |
| `tran-binh-dai` | `[1350, 0, -1100]` | Thành phụ Mang Cá |
| Núi Ngự Bình (tiền án) | `[200, 105, 5200]` | ~4–5 km Nam; cao ~103–105 m |
| Sông Hương (minh đường, gần) | `[0, -2, 1600]` | Đoạn trước mặt tiền thành |

---

## 4. Danh sách 10 cửa Kinh thành + 2 cửa thủy

Ngoài ra còn **Trấn Bình Môn** (cửa phụ thông Trấn Bình Đài) → tổng thường gọi **13 cửa**. [xác thực — Wikipedia; suckhoedoisong.vn / TTBTDT Cố đô Huế]

### 4.1. Mười cửa đường bộ chính

| # | Tên chính | Tên dân gian / khác | Mặt thành | Ghi chú |
| --- | --- | --- | --- | --- |
| 1 | Chính Nam | Nhà Đồ | Nam | Gần Võ Khố thời Gia Long |
| 2 | Quảng Đức | — | Nam | Hoàng gia; bên phải Kỳ Đài (nhìn từ trong ra?) — vị trí sát Kỳ Đài |
| 3 | Thể Nhơn | Ngăn | Nam | Hoàng gia; tường ngăn đường vua ra sông |
| 4 | Đông-Nam | Thượng Tứ | Đông-Nam | Viện Thượng Kỵ / tàu ngựa |
| 5 | Chính Đông | Đông Ba | Đông | Tên khu dân cư |
| 6 | Đông-Bắc | Kẻ Trài / Trài | Đông-Bắc | — |
| 7 | Chính Bắc | Hậu | Bắc | Mặt sau |
| 8 | Tây-Bắc | An Hòa | Tây-Bắc | Tên làng |
| 9 | Chính Tây | — | Tây | — |
| 10 | Tây-Nam | Hữu | Tây-Nam | Bên phải Kinh thành |

[xác thực — Wikipedia Kinh thành Huế; TTBTDT Cố đô Huế]

Vòm cửa (Hội Điển, số đo chung): cao cửa 8,5 m; vòm cao 5,185 m × rộng 3,825 m; vọng lâu cao ~8,9 m → tổng cao ~17,4 m. [xác thực — Cố đô Huế]

### 4.2. Hai cửa đường thủy

| Tên | Vị trí | Ghi chú |
| --- | --- | --- |
| **Đông Thành Thủy Quan** | Đầu đông Ngự Hà | Thông Kinh thành với ngoài qua Ngự Hà |
| **Tây Thành Thủy Quan** | Đầu tây Ngự Hà | Đối xứng |

[xác thực — Wikipedia; suckhoedoisong.vn]

### 4.3. Cửa phụ liên quan

| Tên | Ghi chú |
| --- | --- | --- |
| **Trấn Bình Môn** | Thông Kinh thành ↔ **Trấn Bình Đài** (Mang Cá), góc Đông-Bắc | [xác thực] |

---

## 5. Công trình Hoàng thành & Tử Cấm thành (còn / mất / phục dựng)

Trạng thái cập nhật theo tài liệu mở công chúng (~2024–2026); có thể lệch tiến độ trùng tu thực tế.

### 5.1. Hoàng thành — khu nghi lễ & ngoại đình

| Công trình | Trạng thái | Ghi chú |
| --- | --- | --- |
| Ngọ Môn | extant | Xây/định hình Minh Mạng 1833–34 |
| Hồ Thái Dịch / Trung Đạo kiều | extant | Trước sân Đại Triều |
| Sân Đại Triều Nghi | extant | — |
| Điện Thái Hòa | extant | 1805; dời/làm lại 1833 |
| Tả Vu / Hữu Vu (ngoài điện Thái Hòa — khu triều) | extant / restored | Phân biệt với Tả–Hữu Vu trước Cần Chánh |
| Cửa Hiển Nhơn | extant | Đông |
| Cửa Chương Đức | reconstructed | Trùng tu 2003–2004 theo mẫu Khải Định |
| Cửa Hòa Bình | extant / restored | Bắc |
| Thế Miếu | extant | Thờ các vua Nguyễn |
| Hưng Miếu | extant | Thờ Nguyễn Phúc Luân |
| Thái Miếu | extant / restored | Chúa Nguyễn |
| Triệu Miếu | extant / restored | Nguyễn Kim |
| Hiển Lâm Các | extant | — |
| Cửu Đỉnh | extant | Trước Thế Miếu |
| Cung Diên Thọ | extant | Thái hậu |
| Cung Trường Sanh (Trường Sinh) | extant / restored | — |
| Điện Phụng Tiên | ruin / partial | Nhiều nguồn ghi hư hại nặng |
| Phủ Nội Vụ | ruin / partial | — |
| Hồ Nội Kim Thủy / vườn | extant (địa hình) | — |

### 5.2. Tử Cấm thành — nội đình

| Công trình | Trạng thái | Ghi chú |
| --- | --- | --- |
| Đại Cung môn | destroyed / nền | Phá 1947; nghiên cứu phục dựng |
| Tả Vu / Hữu Vu (trước Cần Chánh) | extant | Ít ỏi còn lại sau chiến tranh |
| Điện Cần Chánh | ruin → đang phục dựng | Phá 1947; dự án Waseda / TTBTDT |
| Điện Văn Minh | destroyed / ruin | Trái Cần Chánh |
| Điện Võ Hiển | destroyed / ruin | Phải Cần Chánh |
| Điện Càn Thành | destroyed / ruin | Tư cung; phá 1947/1968 |
| Điện Trinh Minh | destroyed / ruin | — |
| Điện Quang Minh | destroyed / ruin | Đông cung |
| Viện Thuận Huy / Dưỡng Tâm | destroyed / ruin | — |
| Cung Khôn Thái / Cao Minh Trung Chính | destroyed | Triệt / mất sớm hơn một phần thời Khải Định |
| Điện Kiến Trung | reconstructed | Phục dựng khởi công 2018; đã mở lại |
| Thái Bình Lâu | extant / restored | Đọc sách (Khải Định 1919–21) |
| Duyệt Thị Đường | reconstructed | 1826; phục hồi hoạt động ~2004 |
| Thượng Thiện đường | destroyed | Bếp ngự |
| Thái Y viện | destroyed | — |
| Ngự Uyển / Thiệu Phương | ruin / partial | Vườn ngự |
| Lục Viện | destroyed | Sáu viện phi tần |
| Ngự Tiền Văn phòng | destroyed / ruin | Thời Bảo Đại |
| Các cửa: Hưng Khánh, Gia Tường, Tây An, Tường Loan, Nghi Phụng… | mixed | Một số còn dấu vết / trùng tu |

[xác thực tổng hợp — Wikipedia Hoàng thành / Tử Cấm thành; TTBTDT Cố đô Huế]

---

## 6. Trục thần đạo & quan hệ sông Hương / Ngự Bình

### 6.1. Trục thần đạo (dũng đạo)

- Trục chính xuyên: **Kỳ Đài → Ngọ Môn → Trung Đạo → Đại Triều Nghi → Thái Hòa → Đại Cung môn → Cần Chánh → Càn Thành → Kiến Trung → Hòa Bình**. [xác thực — mô tả mặt bằng; TS Phan Thanh Hải qua các bài phong thủy]
- Hướng thực địa: gần **Tây Bắc – Đông Nam** (không phải chính Bắc–Nam địa lý), để ôm sông Hương làm minh đường. [xác thực — Bảo tàng Lịch sử VN / học giả phong thủy]
- Trong Digital Twin: quy ước **+Z = “Nam thần đạo”** (hướng ra sông / Ngọ Môn), tức trục đã được **xoay local** cho dễ dựng scene — **không** đồng nhất tuyệt đối với true north GPS. [ước lượng hợp lý — quyết định kỹ thuật dự án]

### 6.2. Phong thủy bốn phương

| Yếu tố | Đối tượng | Độ tin cậy |
| --- | --- | --- |
| Tiền án | Núi **Ngự Bình** (~103–105 m, ~3–4 km phía Nam sông Hương) | [xác thực — Dư địa chí / nhiều nguồn] |
| Minh đường | **Sông Hương** trước mặt thành | [xác thực] |
| Tả Thanh Long | **Cồn Hến** (dài ~1.660 m, rộng ~237 m) | [xác thực — Dân Việt trích số đo] |
| Hữu Bạch Hổ | **Cồn Dã Viên** (dài ~890 m, rộng ~185 m) | [xác thực — Dân Việt] |
| Hậu chẩm (tầm rộng) | Dãy Trường Sơn / địa thế phía Tây–Bắc | [xác thực — diễn giải phong thủy] |

Nguyên tắc bố cục nội cung: **tả văn hữu võ**, **tả nam hữu nữ**, **tả chiêu hữu mục**. [xác thực — Wikipedia]

---

## 7. Nguồn tham khảo

1. Cố đô Huế — *Kinh thành Huế: lịch sử xây dựng và kiến trúc tổng thể* — https://codohue.vn/kinh-thanh-hue-lich-su-xay-dung-va-kien-truc-tong-the/
2. Cố đô Huế — *Tên gọi, lịch sử, phạm vi…* — https://codohue.vn/kinh-thanh-hue-ten-goi-lich-su-pham-vi-va-qua-trinh-xay-dung/
3. Wikipedia — *Kinh thành Huế* — https://vi.wikipedia.org/wiki/Kinh_thành_Huế
4. Wikipedia — *Hoàng thành Huế* — https://vi.wikipedia.org/wiki/Hoàng_thành_Huế
5. Wikipedia — *Tử Cấm thành (Huế)* — https://vi.wikipedia.org/wiki/Tử_Cấm_thành_(Huế)
6. Netcodo — *Hoàng thành và Tử cấm thành* — http://netcodo.com.vn/vi/57/7/Hue-xua-va-nay/Hoang-thanh-va-Tu-cam-thanh.html
7. Giáo dục Thời đại — *Tử Cấm Thành qua Châu bản* — https://giaoducthoidai.vn/kham-pha-tu-cam-thanh-hue-qua-chau-ban-trieu-nguyen-post625981.html
8. Sức khỏe & Đời sống — *13 cửa Kinh thành Huế* (dẫn TTBTDT Cố đô Huế) — https://suckhoedoisong.vn/dieu-it-biet-ve-loat-13-cua-ra-vao-di-tich-kinh-thanh-hue-169240310204253508.htm
9. VnExpress — *Kỳ Đài hơn 200 năm tuổi* — https://vnexpress.net/ky-dai-hon-200-nam-tuoi-cua-trieu-nguyen-4648302.html
10. Đại đoàn kết — *Cột cờ xứ Huế* — https://daidoanket.vn/cot-co-xu-hue-10040496.html
11. Heritages.vn — *Kinh thành Huế* — https://heritages.vn/heritage/kinh-thanh-hue
12. Dân Việt — phong thủy Ngự Bình / Cồn Hến / Dã Viên — https://danviet.vn/vi-sao-goi-hue-la-dat-than-kinh-song-huong-nui-ngu-binh-co-vai-tro-gi-trong-phong-thuy-kinh-thanh-20241002134557028-d1187347.html
13. Bảo tàng Lịch sử Việt Nam — *Vua Gia Long và phong thủy kinh thành Huế* — https://baotanglichsu.vn/vi/Articles/3096/16059/vua-gia-long-va-phong-thuy-kinh-thanh-hue.html
14. Bản vẽ mặt bằng Đại Nội 1909 trong *Đại Nam nhất thống chí* (trích qua Wikipedia Hoàng thành Huế)

### Việc cần làm tiếp (ngoài Phase 0)

- Hiệu chỉnh `anchor` bằng GIS / orthophoto / bản đồ đo đạc TTBTDT.
- Đối chiếu Hội Điển / Châu bản gốc cho kích thước Hoàng thành (604 vs 606).
- Cập nhật status phục dựng Cần Chánh / Kiến Trung theo tiến độ thực tế trước khi lock scene 3D.
