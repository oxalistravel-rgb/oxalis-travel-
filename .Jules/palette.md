## 2026-08-29 - Allow viewport zoom for accessibility
**Learning:** Preventing user zoom with `maximum-scale=1` in the viewport meta tag is a critical accessibility issue (violates WCAG). Users with visual impairments need to be able to zoom in to read content comfortably.
**Action:** Always ensure the viewport meta tag allows scaling (`content="width=device-width, initial-scale=1.0"`) and avoid using `maximum-scale` or `user-scalable=no`.
