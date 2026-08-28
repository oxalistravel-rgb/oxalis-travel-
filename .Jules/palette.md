## 2024-08-28 - Removed maximum-scale from viewport meta tag
**Learning:** Found an accessibility issue where users (especially those with visual impairments) were restricted from pinch-to-zooming on mobile devices due to `maximum-scale=1` in the viewport meta tag.
**Action:** Removed `maximum-scale=1` from `index.html`'s `<meta name="viewport">` tag to restore default zooming behavior, adhering to WCAG guidelines for resizing text.
