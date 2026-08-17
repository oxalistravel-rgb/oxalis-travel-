## 2026-08-17 - Viewport Zoom Accessibility
**Learning:** Preventing user zoom with `maximum-scale=1` or `user-scalable=no` in the viewport meta tag is a severe accessibility issue. Low-vision users often need to zoom in up to 200% or 400% to read content, and preventing this significantly harms their experience.
**Action:** Always ensure the viewport meta tag allows scaling (e.g., `content="width=device-width, initial-scale=1.0"`).
