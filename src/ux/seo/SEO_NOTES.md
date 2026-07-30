# SEO Notes — Kinh Thành Huế 3D

`HeadMeta` cập nhật `<title>` / Open Graph / Twitter lúc runtime (SPA).
Bot không chạy JS (Facebook/Slack/Twitter crawler cũ, một số SEO bot) **không thấy** các thẻ do JS inject.

Orchestrator **phải merge** các thẻ dưới vào `index.html` (không để D6 agent sửa file đó).

## Placeholder domain

Hiện dùng `https://kinhthanhhue.web.app` (`SITE_ORIGIN` trong `src/ux/seo/site.ts`).
Sau khi Firebase Hosting / custom domain sẵn sàng: thay origin trong `site.ts`, `public/sitemap.xml`, `public/robots.txt`, và các URL tuyệt đối bên dưới.

## Recommended static tags for `index.html`

Thay / bổ sung trong `<head>` (giữ `charset`, `viewport`, favicon hiện có):

```html
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kinh Thành Huế 3D</title>
  <meta
    name="description"
    content="Digital Twin giáo dục — tái hiện 3D toàn bộ Kinh thành Huế: Hoàng Thành, Tử Cấm Thành, cung điện và di tích."
  />
  <meta
    name="keywords"
    content="Kinh Thành Huế, Hue Imperial City, Đại Nội, Tử Cấm Thành, digital twin, 3D, UNESCO, Huế, Vietnam heritage"
  />
  <meta name="theme-color" content="#8B1A1A" />
  <meta name="application-name" content="Kinh Thành Huế 3D" />
  <meta name="robots" content="index, follow" />
  <meta name="author" content="Kinh Thành Huế Digital Twin" />

  <!-- Open Graph -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Kinh Thành Huế 3D" />
  <meta property="og:title" content="Kinh Thành Huế 3D" />
  <meta
    property="og:description"
    content="Digital Twin giáo dục — tái hiện 3D toàn bộ Kinh thành Huế: Hoàng Thành, Tử Cấm Thành, cung điện và di tích."
  />
  <meta property="og:url" content="https://kinhthanhhue.web.app/" />
  <meta property="og:locale" content="vi_VN" />
  <meta property="og:locale:alternate" content="en_US" />
  <meta property="og:image" content="https://kinhthanhhue.web.app/og-image.svg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:type" content="image/svg+xml" />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Kinh Thành Huế 3D" />
  <meta
    name="twitter:description"
    content="Digital Twin giáo dục — tái hiện 3D toàn bộ Kinh thành Huế: Hoàng Thành, Tử Cấm Thành, cung điện và di tích."
  />
  <meta name="twitter:image" content="https://kinhthanhhue.web.app/og-image.svg" />

  <!-- i18n hints for crawlers -->
  <link rel="canonical" href="https://kinhthanhhue.web.app/" />
  <link rel="alternate" hreflang="vi" href="https://kinhthanhhue.web.app/?lang=vi" />
  <link rel="alternate" hreflang="en" href="https://kinhthanhhue.web.app/?lang=en" />
  <link rel="alternate" hreflang="x-default" href="https://kinhthanhhue.web.app/" />

  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

## Optional (sau deploy)

1. **PNG/WebP OG** — nhiều crawler thích raster hơn SVG. Export `og-image.svg` → `og-image.png` (1200×630) rồi đổi `og:image` / `twitter:image`.
2. **JSON-LD** `TouristAttraction` / `WebApplication` trong `index.html` nếu cần rich results.
3. **`?lang=vi|en`** — orchestrator có thể đọc query lúc boot và gọi `setLocale` (D6 không wire App).

## Public assets (đã ship bởi D6)

| File | Mục đích |
|------|----------|
| `/robots.txt` | Allow all + Sitemap |
| `/sitemap.xml` | URL gốc |
| `/og-image.svg` | Open Graph / Twitter share image |

## Mount runtime SEO

```tsx
import { HeadMeta } from '@/ux/seo'
import { SkipLinks } from '@/ux/a11y'

// trong App shell:
<>
  <HeadMeta />
  <SkipLinks />
  …
</>
```
