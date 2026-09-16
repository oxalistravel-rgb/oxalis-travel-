## 2023-10-24 - Viewport scaling restriction
**Learning:** Found an accessibility issue pattern specific to this app's components: the `<meta name="viewport">` tag had `maximum-scale=1, user-scalable=no`, which restricted zooming.
**Action:** Removed scaling restrictions in `<meta name="viewport">` to allow visually impaired users to use zoom.
