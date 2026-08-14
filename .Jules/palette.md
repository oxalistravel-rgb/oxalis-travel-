## 2026-08-14 - Remove maximum-scale from viewport meta tag
**Learning:** Using `maximum-scale=1` in the viewport meta tag prevents users from zooming in on the page, which is a major accessibility issue for visually impaired users who rely on zooming to read content.
**Action:** Always ensure the viewport meta tag allows scaling by omitting `maximum-scale` or setting it to a reasonable value like `5`.
