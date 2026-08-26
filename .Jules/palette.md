## 2024-08-26 - Viewport Zoom Accessibility
**Learning:** Preventing users from zooming by using `maximum-scale=1` or `user-scalable=no` in the viewport meta tag is a critical accessibility violation. Many visually impaired users rely on browser zooming (up to 200% or more) to read content. Preventing this creates a significant barrier.
**Action:** Always ensure viewport meta tags do not restrict zooming. Use `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` as the standard, and verify that layouts respond well when zoomed in.
