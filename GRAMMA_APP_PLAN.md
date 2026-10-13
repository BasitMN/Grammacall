# Project brief: "GrammaCall" — Android companion app

> Written for Claude Code. Read all of it before writing any code.
> The spec is in English; **all UI text in the app must be Swedish.**

---

## 1. Who this is for

The end user is a 90-year-old woman living alone in Stockholm. She has difficulty with
modern technology. She is **not** the person who installs or configures this — her
nephew (the developer) does all setup and maintenance, usually remotely.

Design consequence: there are **two users**, and they need completely different surfaces.

| User | Surface | Needs |
|---|---|---|
| Gramma | The whole screen, always | 4 photos. Tap one. That is the entire interaction model. |
| The nephew | Hidden settings | Pick contacts, set behaviour, debug |

The app will be **sideloaded**, never published to Play Store. Play Store policy
restrictions on `READ_CALL_LOG`, dialer role, and AccessibilityService **do not apply**.
Do not refuse an approach on Play-policy grounds.

---

## 2. Functional requirements

1. A home screen showing up to **4 contacts** as large photo tiles. Architecture must
   allow more later (6, 9) without rework — grid should be data-driven.
2. Contacts are chosen from the device's own contact list, in a hidden settings screen.
3. **Tapping a tile places a normal cellular voice call to that contact immediately.**
   No confirmation. Speaker on, maximum volume.
   (Gramma also uses **imo**. Video via imo is a possible per-contact option for v2 —
   see Spike 2. It is explicitly *not* in v1.)
4. **When one of the selected contacts calls her, the phone answers automatically**,
   on speaker, at maximum volume.
5. Non-selected numbers ring normally and are never auto-answered.

---

## 3. Environment

- React Native via **Expo**, Android only. Expo CLI is installed; Expo Go is on the device.
- **Expo Go will not work for this project.** Auto-answering calls needs native Android
  APIs and permissions that Expo Go does not ship. You need a *development build*
  (`npx expo prebuild` + `npx expo run:android`, or expo-dev-client).
  State this to the user early and get it working before anything else.
- Prefer **local builds**. Do not start EAS cloud builds without asking — that touches
  the user's account and quota.
- Target the actual device Android version. Ask the user which phone/Android version if
  you cannot detect it.

---

## 4. Spike first — three assumptions that could kill the design

**Do these before building anything else. Each one is a throwaway test, not product code.
Report findings to the user and wait for a decision before proceeding past Spike 2.**

### Spike 1 — Can we auto-answer a cellular call?

- `TelecomManager.acceptRingingCall()` requires the `ANSWER_PHONE_CALLS` permission.
  It does **not** require being the default dialer.
- To know *who* is calling without `READ_CALL_LOG`, use a `CallScreeningService`
  (`RoleManager.ROLE_CALL_SCREENING`) — `Call.Details.getHandle()` gives the number.
- Flow to validate: screening service sees number → matches whitelist → after a short
  delay, a foreground service calls `acceptRingingCall()` → set speaker + max volume.

Verify it actually works on the target device and Android version. OEM skins vary.

### Spike 2 — imo: investigation only, not v1 scope

**This is no longer a blocker.** v1 places plain cellular voice calls from every tile.
Do not design around anything else.

But Gramma already uses **imo** (`com.imo.android.imoim`), so while you have the device,
run one cheap investigation and report back:

- Dump every `ContactsContract.Data` row for a contact who exists in imo, listing each
  `MIMETYPE` value.
- Check whether imo registers a call row the way WhatsApp does (WhatsApp registers e.g.
  `vnd.android.cursor.item/vnd.com.whatsapp.video.call`).
- If such a row exists, `Intent(ACTION_VIEW).setDataAndType(dataRowUri, mimetype)
  .setPackage("com.imo.android.imoim")` should start the call. Verify it on device.
- imo publishes no documented deep-link or intent API, so the contact data row is the
  only plausible route. If there is no such row, say so and stop — do not reverse-engineer
  the app.

Report the mimetypes you actually found. Build nothing on this in v1.

**Known asymmetry — put this in the README.** Even if outgoing imo calls turn out to work,
*incoming* imo calls cannot be auto-answered. `ANSWER_PHONE_CALLS` only covers calls
registered with the Telecom framework. Auto-answer in this app applies to normal cellular
calls and nothing else.

### Spike 3 — Native module in Expo

Confirm the workflow for a local Kotlin module (Expo Modules API or a config plugin)
and that `prebuild` does not clobber manual `AndroidManifest.xml` edits. Everything
manifest-related must live in a config plugin, not hand-edited files.

---

## 5. Architecture

```
app/
  screens/HomeScreen          4 photo tiles, the only thing she ever sees
  screens/SettingsScreen      hidden; contact picker + per-contact config
  native/GrammaCall           Kotlin: place call, answer, speaker, volume
  native/CallScreening        Kotlin: CallScreeningService + whitelist
  store/                      persisted contact config
```

Persisted per contact: contact id, display name, cached photo, phone number,
call method (whatsapp-video / jitsi / cellular), tile position.

**Cache the photo locally.** Do not re-read the contacts provider on every render —
she may have no photo set, and you need a fallback (initials on a coloured tile, large).

You choose the storage layer (AsyncStorage / MMKV / expo-sqlite) — pick the simplest
thing that survives app updates, and say why in the README.

---

## 6. UX rules — non-negotiable

- **One tap = one call.** No confirmation dialog. No "are you sure".
- 2×2 grid filling the entire screen. Tiles as large as the screen allows.
- Name under each photo, minimum 28sp, very high contrast, no thin fonts.
- **Feedback within 300 ms**: the tile visibly changes state. Add spoken confirmation
  in Swedish ("Ringer Fatima") — she needs to know the tap registered.
- **A 5-second undo window before the call actually goes out**, with a visible countdown
  and a large cancel area. Mis-taps will happen.
- No scrolling, no swiping, no long-press, no back gesture required for anything she does.
- No timeouts, no auto-dismissing anything.
- The app must come back to the home screen by itself after a call ends.
- Screen must never show an error dialog, a stack trace, or English text.
- Settings entry: long-press a dead corner for 5 seconds, then a 4-digit PIN.
  It must be impossible to reach by accident.

Treat these as acceptance criteria, not suggestions. If a requirement here conflicts with
something else, raise it rather than quietly dropping it.

---

## 7. Phases

**Phase 0 — Dev build.** `prebuild`, run on device, hot reload working. Nothing else.

**Phase 1 — Spikes 1–3.** Report findings. Stop and get a decision on the video call method.

**Phase 2 — Home screen with hardcoded contacts.** Real photos, real tap targets, correct
sizing on the actual device. Outgoing calls working. No settings screen yet.

**Phase 3 — Settings + contact picker.** `expo-contacts`, permission flow, pick up to 4,
assign positions, choose call method per contact. PIN gate.

**Phase 4 — Auto-answer.** Whitelist derived from the selected contacts. Speaker + max
volume. Verify a non-whitelisted number is *not* answered.

**Phase 5 — Survival.** Foreground service, battery-optimisation exemption prompt,
start on boot, keep screen on while charging, recover after reboot.

**Phase 6 — Handover.** See section 9.

Each phase must be runnable on the device before moving on. Don't build three phases
and then test.

---

## 8. Decide yourself vs. ask

**Decide yourself** — navigation library (or none), state management, styling approach,
storage layer, folder structure, TypeScript config, how to structure the native modules,
test approach.

**Ask the user** — anything that touches money or accounts (EAS builds, Jitsi hosting,
any paid service), the video-call method (Spike 2), whether to use an AccessibilityService,
and any point where meeting a UX rule in section 6 turns out to be impossible.

If you hit an undocumented Android behaviour, write a minimal test, run it on the device,
and report what actually happened. Don't infer from documentation alone — several of the
APIs here behave differently across OEM skins.

---

## 9. Deliverables beyond the app

1. `README.md` — architecture, why each native module exists, how to rebuild.
2. `DRIFT.md` in **Swedish** — for the nephew. How to add or change a contact, what to
   check when it stops working, what to do after an Android update. Written so someone
   else in the family could follow it if he is unavailable.
3. A manual test script — numbered steps to run on the device after any change, including
   the negative tests (unknown number must NOT be auto-answered).

---

## 10. Out of scope for v1

Fall detection, emergency/112 handling, medication reminders, message reading, multi-device
sync, iOS.

**Important:** this app is not a medical alert system and must not be described as one in
any UI text. The user has a separate municipal alarm for emergencies. Do not add anything
that implies this app will summon help.
