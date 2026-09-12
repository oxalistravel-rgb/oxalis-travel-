## 2024-03-24 - Viewport Accessibility
**Learning:** Hardcoding `maximum-scale=1` in the viewport meta tag breaks accessibility for visually impaired users by preventing native browser zoom.
**Action:** Always use `content="width=device-width, initial-scale=1.0"` to ensure WCAG compliance and allow users to scale the interface as needed.