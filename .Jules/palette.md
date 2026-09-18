## 2024-09-18 - Allow page zooming
**Learning:** By default this template had `maximum-scale=1` hardcoded which prevented users with visual impairments from zooming in to read the text. The UI handles zoom gracefully, so this restriction was unnecessary and harmful to accessibility.
**Action:** Always check the viewport meta tag and ensure `maximum-scale` or `user-scalable=no` are not present unless absolutely necessary (e.g. for a map or specific web app).
