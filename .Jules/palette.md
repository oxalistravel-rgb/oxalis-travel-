## 2024-05-18 - Viewport Zoom Accessibility
**Learning:** Hardcoding `maximum-scale=1` or `user-scalable=no` in the viewport meta tag restricts users from zooming in, which violates WCAG accessibility guidelines. Users with visual impairments need to be able to scale the UI (at least 200%).
**Action:** Always ensure the viewport meta tag is set to `content="width=device-width, initial-scale=1.0"` to permit zooming across all pages.
