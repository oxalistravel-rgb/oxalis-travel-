## 2024-05-23 - Viewport Zoom Accessibility
**Learning:** Hardcoding `maximum-scale=1` in the viewport meta tag restricts users from natively zooming in on mobile devices. This is a severe accessibility issue for users with low vision who depend on zooming (violates WCAG 1.4.4 Resize text).
**Action:** Removed `, maximum-scale=1` from the meta tag to allow native zooming up to 500% by the user, ensuring better mobile accessibility.
