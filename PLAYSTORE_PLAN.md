# Plan: GrammaCall as a commercial app on Google Play

*Written 2026-10-13. Starting point: a working v1 built for one person
(sideloaded, Swedish UI, Arabic voice, verified on a Samsung S26 Ultra /
Android 16). Items marked **(verify)** are Play/legal rules that change often —
check the current wording before relying on them.*

---

## 0. The honest summary

The core of the app works and is genuinely useful: big photo tiles, one-tap
calls with an undo window, auto-answer for chosen contacts, speaker always on,
voice announcements in the user's language, and a locked-down launcher.

What it is **not** yet is a product. Today it assumes a technical relative
with a PC and `adb`, one language setup, one device model, and no support. The
work below is mostly about **setup without a developer**, **many devices and
languages**, **legal/privacy**, and **Play Store compliance** — not about
the core calling features.

Biggest risks, in order:
1. **Being the default phone app is a heavy responsibility.** A bug means a
   vulnerable person can't take calls. Emergency calls (112) must always work.
2. **Device fragmentation.** Auto-answer and speaker routing must be verified on
   Samsung, Google Pixel, Xiaomi, Motorola, OnePlus etc.
3. **Play policy** on permissions such as battery-optimisation exemption and on
   apps that replace the dialer and launcher **(verify)**.
4. **Liability.** It must never be marketed or perceived as a safety alarm.

---

## Phase 1 — Decide what you are selling (1–2 weeks)

1. **Target customer.** Pick one to start:
   - Relatives setting it up for a parent (B2C, Play Store purchase).
   - Home-care services / municipalities (B2B, managed devices, invoices).
   B2C is the simplest start; B2B pays better but needs contracts and support.
2. **Talk to 10–15 real families** (and 2–3 care workers). Show v1. Ask: would
   they pay, how much, what blocked them, which languages they need.
3. **Business model** — choose one:
   - One-time purchase (e.g. 99–199 kr). Simple, no backend needed.
   - Subscription (e.g. 29–49 kr/month) — only justified once there is a
     cloud feature such as remote management (Phase 5).
   - Free app + paid "remote family management".
4. **Name and brand.** Chosen 2026-10-13: **GrammaCall** (package `se.basit.grammacall`). Still check that
   it is free in Play Store and as a trademark (PRV / EUIPO), and get a domain.
5. **Final package name**: `se.basit.grammacall` (or a company domain). **This cannot be changed
   after the first Play upload** — decide it now.
6. **Legal entity.** Enskild firma is enough to start; AB limits personal
   liability (relevant for an app that handles calls for the elderly). Talk to
   an accountant about VAT — Google is merchant of record for Play sales in
   the EU **(verify)**, but your income still has to be declared.

**Exit:** one-page product description, price, name, package name, company.

---

## Phase 2 — Product changes for strangers, not just family (6–10 weeks)

### 2.1 Setup without a PC
7. **Setup wizard** on first launch, for the relative: language → PIN → allow
   notifications → become phone app → become home screen → battery exemption →
   add contacts → test call. One screen per step, each with a big
   "Fixa" button and a clear status. No `adb`.
8. **Handle "restricted settings"**: Play installs are trusted, so the
   "App was denied access" problem from sideloading largely disappears — but
   keep a help screen for it.
9. **Handle permission ordering automatically** (the notification permission
   must be granted on its own, not only via the dialer role — learned in v1).

### 2.2 Languages
10. **Separate UI language from voice language.** v1 hard-codes Swedish UI +
    Arabic voice. Make both selectable per installation.
11. **Translate the UI** with an i18n library (e.g. `i18next` / `expo-localization`).
    Start with Swedish, English, Arabic; later Persian, Somali, Turkish,
    Bosnian/Serbian/Croatian, Finnish, Spanish — driven by customer interviews.
12. **Right-to-left layout** for Arabic/Persian UI (only needed once UI, not just
    voice, is in those languages).
13. **Voice check** in the wizard: detect whether a TTS voice exists for the
    chosen language and walk the user through installing it.

### 2.3 Safety and robustness (non-negotiable before launch)
14. **Emergency calls.** As default dialer, the app must not block 112:
    - Test that the system emergency dialer from the lock screen still works.
    - Handle incoming emergency call-backs (never auto-reject, never hidden).
    - Consider an explicit, clearly separated emergency path — but **never**
      describe the app as an alarm.
15. **Crash safety review** of `GrammaInCallService` / `CallActivity`
    (already wrapped in `safely()`); add automated tests for every call state.
16. **Fallback if our call screen fails**: verify on several devices that
    Telecom falls back to the system dialer if our InCallService dies.
17. **Watchdog** for lost dialer/home role (exists) — add a way to notify the
    relative remotely (see Phase 5) instead of only a local notification.
18. **Call waiting / second call / conference**: v1 shows only the first call.
    Decide behaviour and implement it.
19. **Bluetooth / wired headsets**: speaker-always-on must not override a
    headset the user chose.

### 2.4 Devices
20. **Tablet support** (layout + "this tablet can't make voice calls" detection
    with a clear message).
21. **Android 12–13 speaker fallback** is untested — test it.
22. **Device test matrix**, at minimum: Samsung A-series (most common among
    elderly), Samsung S-series, Google Pixel, Xiaomi/Redmi, Motorola, Doro
    (Android-based senior phones). Use Firebase Test Lab for UI smoke tests and
    real devices for calls.

### 2.5 Remove or justify sensitive permissions
23. `REQUEST_IGNORE_BATTERY_OPTIMIZATIONS`: Play only allows it for specific
    use cases **(verify)**. Either justify it in the declaration or replace it
    with in-app guidance to the system setting.
24. `READ_CONTACTS`: keep — core feature — with a clear in-app explanation.
25. `CALL_PHONE`, dialer role, home role: core features; document why.

**Exit:** a stranger can install and set it up from Play without help, in at
least 2 languages, on at least 5 device models, and 112 works.

---

## Phase 3 — Engineering for a product (2–4 weeks, parallel with Phase 2)

26. **Version control + backup**: put the project in a private Git repo
    (GitHub). Today it is untracked under `~/ws`.
27. **Release signing**: generate a **private upload keystore** (not the
    template debug key) and keep it in a password manager + offline backup.
    Enroll in **Play App Signing**.
28. **Build an Android App Bundle (AAB)**, not APK: `gradlew bundleRelease`
    (or EAS Build if you accept cloud builds — costs/quotas).
29. **Target API level**: Play requires a recent `targetSdkVersion` **(verify
    the current year's minimum)**; Expo SDK updates usually handle it.
30. **Automated tests**: unit tests for config/store logic, Kotlin tests for
    the call state machine, and a manual test script per release (exists:
    `TESTSKRIPT.md`).
31. **CI** (GitHub Actions): typecheck, lint, tests, build AAB on every push.
32. **Crash reporting** (Sentry or Firebase Crashlytics) — must be declared in
    the Data Safety form and privacy policy; no contact names/numbers in reports.
33. **Remove dev leftovers**: unused `getDeviceInfo`, spike comments, `expo-dev-client`
    from release config, internal `GrammaCall`/`gramma-call` names (optional).
34. **Versioning**: `versionCode` / `versionName` bump per release; changelog.

---

## Phase 4 — Legal, privacy and store compliance (2–3 weeks)

35. **Privacy policy** (public URL, in every UI language). State clearly:
    contacts and photos stay on the device; what crash data is sent; no ads,
    no selling data.
36. **GDPR**: the app processes data about third parties (the contacts) and
    about an elderly user. If you add a cloud backend, you need a data
    processing record, a DPA with providers, data in the EU, and deletion on
    request. Consider a short consultation with a GDPR lawyer.
37. **Terms of use** with a clear **"not an emergency or alarm service"** clause.
38. **Google Play Developer account** — one-time fee (around USD 25), identity
    verification. Prefer an **organization account** (needs a D-U-N-S number
    for the company) **(verify)**.
39. **New personal developer accounts** must run a **closed test with a minimum
    number of testers for a minimum number of days** before production access
    **(verify current numbers — it was 12 testers × 14 days)**. Recruit testers
    from the family interviews in Phase 1.
40. **Store forms**:
    - Data Safety form.
    - Content rating questionnaire (IARC).
    - Target audience (adults; not "designed for families").
    - Permission declarations for any sensitive permission Play asks about.
    - App access instructions for reviewers (they will hit the PIN screen —
      give them a demo PIN or a review mode).
41. **Accessibility claims**: only claim what you have tested.

---

## Phase 5 — Optional: the feature worth a subscription (8–12 weeks)

42. **Remote management for relatives**: a companion app or web page where the
    relative adds/changes contacts and photos, sees "phone app status OK",
    battery level and last activity — without touching the elderly person's
    phone. Requires:
    - Backend (e.g. Firebase or Supabase, EU region), authentication, pairing
      by QR code.
    - End-to-end thinking about privacy (Phase 4, item 36).
    - Push notifications to the relative when the dialer role is lost (fixes the
      biggest weakness found in v1).
43. **Video calls** via WhatsApp/imo/Jitsi per contact (v1 investigation: imo
    exposes call data rows; incoming imo calls can never be auto-answered).
44. **Missed-call view** with photos, photo slideshow while charging.

Ship v1.0 on Play **without** Phase 5; add it as a paid upgrade later.

---

## Phase 6 — Store listing and launch (2–3 weeks)

45. **Store listing**: short + full description per language, 4–8 phone
    screenshots, feature graphic, app icon (replace the Expo placeholder),
    promo video (optional). Show real-looking but **fictional** people.
46. **Internal testing track** → **closed testing** (item 39) → **open testing**
    (optional) → **production** with **staged rollout** (e.g. 10 % → 50 % → 100 %).
47. **Pre-launch report** in Play Console: fix crashes and accessibility warnings.
48. **Support channel**: e-mail + a simple FAQ page (reuse `DRIFT.md`),
    including "how to restore the normal phone app and home screen".
49. **Launch marketing** (low budget): Facebook groups for relatives of the
    elderly, diaspora community groups (Arabic, Somali, Persian…), PRO / SPF
    senior organisations, pharmacies, care-home staff.

---

## Phase 7 — After launch (ongoing)

50. **Watch Android vitals** (crash rate, ANRs) — Play penalises bad vitals.
51. **Test every Android/One UI major update** before users get it (betas).
52. **Answer reviews** within a few days.
53. **Release rhythm**: small updates monthly, manual test script every release.
54. **Measure**: installs → completed setup → still active after 30 days.
    The setup completion rate tells you whether Phase 2.1 worked.

---

## Rough timeline and cost (solo developer, part-time)

| Phase | Time | Out-of-pocket cost (approx.) |
|---|---|---|
| 1 Decide & interview | 1–2 weeks | company registration, domain |
| 2 Product changes | 6–10 weeks | 4–6 test phones (used) |
| 3 Engineering | 2–4 weeks (parallel) | — |
| 4 Legal & compliance | 2–3 weeks | Play account fee, optional lawyer |
| 6 Launch | 2–3 weeks + closed test period | — |
| **v1.0 on Play** | **≈ 3–5 months** | |
| 5 Remote management | +2–3 months | backend hosting (small) |

---

## Immediate next steps (this week)

1. Put the code in a private Git repository.
2. Choose the brand name and final package name.
3. Write 10 interview questions and book 5 families.
4. Get Gramma's device details and run `TESTSKRIPT.md` on it — her real-world
   use is the best product research you have.
5. Create the Play developer account early (identity/organisation verification
   can take time).
