# Research notes / Ghi chép nghiên cứu

Tài liệu nền cho digital twin **Kinh Thành Huế 3D**. Mỗi claim nên mang nhãn:

- **`[xác thực — nguồn]`** — có trích dẫn đối chiếu
- **`[ước lượng hợp lý]`** — suy từ mặt bằng / khoảng cách / nhu cầu realtime

> Educational reconstruction, not a certified archaeological survey.
> Phục dựng giáo dục — **không** thay bản vẽ khảo cổ chính thức.

## Index

| File | Nội dung | EN summary |
|------|----------|------------|
| [layout.md](./layout.md) | Quy hoạch 3 vòng thành, kích thước Hội Điển, mốc Gia Long–Minh Mạng, hệ tọa độ world | Citadel layout, dimensions, chronology, world coordinates |
| [materials.md](./materials.md) | Ngói lưu ly, vì kèo, cột lim, PBR roughness/metalness contract | Roof tiles, timber joinery, PBR material contract |
| [nature_people.md](./nature_people.md) | Loài cây Đại Nội, sen Tịnh Tâm, palette trang phục triều Nguyễn | Vegetation table, garden zones, costume palettes |

## World coordinate system

| Axis | Meaning |
|------|---------|
| Origin `(0,0,0)` | Center of **Sân Đại Triều Nghi** (Great Court) |
| `+Z` | South → Ngọ Môn → Hương River |
| `+Y` | Up |
| `+X` | East |
| 1 unit | 1 meter |

## How to use in code

1. Place monuments with `anchor: [x, y, z]` matching research distances (see `layout.md`).
2. Pick materials via `getMaterial(id, lod)` using ids documented in `materials.md`.
3. Instance vegetation / NPCs within budgets from `nature_people.md`.

## Contributing research

- Prefer primary/secondary sources (Hội Điển, Cố đô Huế, peer articles) over travel blogs.
- Keep the authenticity tags when you add a number.
- Open a PR that only touches docs if you are only fixing sources — small PRs welcome.
