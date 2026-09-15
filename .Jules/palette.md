## 2026-09-15 - Viewport Accessibility
**Learning:** Found maximum-scale=1 in viewport meta tag, which prevents users with visual impairments from zooming in, a crucial WCAG violation.
**Action:** Always ensure meta viewport tags use at least `width=device-width, initial-scale=1.0` without restricting `maximum-scale` or setting `user-scalable=no`.
