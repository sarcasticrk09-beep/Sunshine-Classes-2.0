# Known Issues & Bug Tracker: Sunshine ERP

This document catalogs identified bugs, performance limitations, and active workarounds inside **Sunshine ERP**.

---

## 🐛 Bug Registry

---

### 1. Twilio Sandboxed WhatsApp Restrictions
- **Severity**: MEDIUM
- **Description**: Messages fail to deliver when sent to parents who have not joined the Twilio developer sandbox.
- **Cause**: Twilio developer accounts restrict outgoing WhatsApp notifications to verified sandbox participants.
- **Workaround**: Administrators must manually add test parent numbers to the Sandbox configuration in the Twilio dashboard. The system will soon transition to a production-cleared Twilio WhatsApp business profile.

---

### 2. Multi-Render Sync Triggers (React StrictMode)
- **Severity**: LOW
- **Description**: Some console logs show double writes to the Firestore caching adapter on startup.
- **Cause**: React 18 `StrictMode` intentionally triggers double-mounts in development to highlight side-effects.
- **Workaround**: This behavior is restricted to development environments and does not occur in production. The synchronized deduplication logic in `SyncService.ts` prevents actual duplicate data creation.

---

### 3. Horizontal Table Overflows on Small Devices
- **Severity**: LOW
- **Description**: Extremely wide data tables (e.g., student rosters or full year ledger lists) cause horizontal scroll overflows on mobile viewports.
- **Cause**: Large amounts of quantitative data columns exceed mobile screen sizes.
- **Workaround**: Content is enclosed inside Tailwind's `overflow-x-auto` to allow horizontal scrolling on mobile, ensuring data remains readable.

---

### 4. Direct Webcam Frame Mirrors
- **Severity**: LOW
- **Description**: Some browser engines (such as old Safari releases) do not mirror viewports by default during live camera feeds.
- **Cause**: Inconsistent WebRTC video element support on older iOS/macOS systems.
- **Workaround**: Explicit CSS transform transforms are forced (`scaleX(-1)`) exclusively on video layouts to ensure a consistent mirrored display.
