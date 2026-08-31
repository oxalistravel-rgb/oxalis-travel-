## 2024-03-25 - Viewport Accessibility
**Learning:** Preventing users from scaling the viewport by setting `maximum-scale=1` or `user-scalable=no` is an accessibility issue. Users with visual impairments may need to zoom in to read text or interact with the site.
**Action:** Always ensure the viewport meta tag allows scaling, typically by only setting `content="width=device-width, initial-scale=1.0"`.
