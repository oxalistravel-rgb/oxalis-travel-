## 2024-05-24 - Viewport Accessibility: Avoid maximum-scale=1
**Learning:** Using `maximum-scale=1` or `user-scalable=no` in the viewport meta tag restricts users with visual impairments from zooming in on the page content, which is a key WCAG accessibility violation.
**Action:** Always ensure the viewport meta tag is set to allow scaling (e.g., `content="width=device-width, initial-scale=1.0"`) to permit zoom for all users.
