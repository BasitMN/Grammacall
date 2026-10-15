# GrammaCall

An Android phone app for one person: a 90-year-old who only speaks Arabic and
finds modern phones hard to use. Her whole screen is up to nine large photo
tiles. Tap one and a normal phone call goes
out on loudspeaker automatically. When one of those people calls her, the phone answers by
itself on loudspeaker.

Everything is set up and maintained by a relative (the nephew), mostly
remotely. All on-screen text is Swedish; only the spoken announcements are
Arabic. Day-to-day instructions for the family are in Swedish in
[`DRIFT.md`](DRIFT.md). The test checklist is [`TESTSKRIPT.md`](TESTSKRIPT.md).

The app is **sideloaded**, never published to Play Store.

> This app is not a medical alarm and must never be described as one. She has
> a separate municipal alarm for emergencies.

## How it works

| Situation | What happens |
|---|---|
| She taps a tile | "Ringer Fatima" screen, 5-second countdown with a big AVBRYT, Arabic "جاري الاتصال بـ …" (media volume raised to max first). Then a cellular call goes out, speaker on, max volume. |
| A contact with auto-answer on calls | Green "SVARAR AUTOMATISKT" screen, Arabic "مكالمة من …", answered after 2 s, speaker on, max volume. |
| A contact with auto-answer off calls | Rings with their name and photo, big SVARA / AVVISA. Per-contact switch in the contact editor; master switch in settings. |
| Anyone else calls | Normal ringing with big SVARA / AVVISA. Never auto-answered. Speaker on if she answers. |
| Call ends | App returns to the tiles by itself. |
| Home button / reboot | Lands on the tiles (the app is the launcher). |
| Something takes the phone-app role away | Sticky notification "GrammaCall tar inte emot samtal" within a minute; red status in settings. |

Settings (Swedish, for the nephew): hold the faint gear in the top-right corner for
5 seconds (a 5…1 countdown shows), then a 4-digit PIN.

## Architecture

```
App.tsx                         Screen state machine, config, native sync, role watchdog
src/
  screens/HomeScreen.tsx        Clock + tile grid (1–3 → column, 4 → 2×2, 5–6 → 2×3, 7–9 → 3×3)
  screens/RingerScreen.tsx      5-second undo window before an outgoing call
  screens/PinScreen.tsx         Unlock / create PIN
  screens/SettingsScreen.tsx    Contacts, auto-answer switches, phone status + fixes
  screens/ContactEditorScreen.tsx  Name, Arabic spoken name, photo, number
  store.ts                      Config JSON + cached photos (expo-file-system)
  speech.ts                     Arabic TTS for outgoing confirmation (expo-speech)
  pickers.ts                    System contact picker, gallery photo picker
  useKeepAwakeWhileCharging.ts  Screen stays on while on the charger
modules/gramma-call/            Local Expo module (Kotlin)
  GrammaInCallService.kt        Telecom InCallService: every call, auto-answer, speaker
  CallActivity.kt               Her call screens (native, see below)
  PortraitView.kt               Round photo / silhouette for the call screen
  CallSettings.kt               Whitelist, speaker flag, contacts — SharedPreferences
  CallSpeech.kt                 Arabic "call from …" announcement (Android TTS)
  RoleWarning.kt                Notification when the dialer role is lost
  GrammaCallModule.kt           JS ↔ native bridge (roles, placeCall, settings sync)
  AndroidManifest.xml           Declares the InCallService and CallActivity
plugins/withGrammaManifest.js   All app-manifest changes (permissions, DIAL + HOME filters)
```

### Why the app is the default phone app

The first design (call-screening role + `TelecomManager.acceptRingingCall()`)
could answer calls, but on Android 16 / One UI 8.5 Telecom **ignored every
attempt to switch a cellular call to speaker** from an ordinary app
(`AudioManager.setCommunicationDevice` returned true, audio stayed on the
earpiece). Only the app that owns the call UI (`InCallService`) can change the
route, via `requestCallEndpointChange(TYPE_SPEAKER)`.

So the app holds `ROLE_DIALER`. Consequences:

- It must handle **every** call, including unknown numbers — hence the plain
  SVARA/AVVISA screen.
- If it crashes, calls cannot be shown. Every Telecom callback is wrapped in
  `safely()` so an error is logged, never fatal.
- Opening Samsung's Phone app can take the role back silently, which also
  revokes permissions granted by the role (`CALL_PHONE`, `POST_NOTIFICATIONS`).
  The watchdog notification exists for this.

### Why the call screens are native

`CallActivity` is plain Kotlin views, not React Native. Telecom starts it from
`GrammaInCallService` at any time — phone locked, app not running, JS not
loaded. A native screen has no JS startup delay and no dependency on the JS
runtime being healthy. Contacts (name, Arabic name, photo path, tile position)
are mirrored into SharedPreferences by `GrammaCall.setContacts` so the call
screen can show who is calling. Atkinson Hyperlegible is bundled into
`assets/fonts/` by the expo-font config plugin so native and JS screens match.

### Why the app is the launcher

So the home button, a reboot or an accidental "close" always lands on the
tiles, and she never sees Samsung's home screen or the Phone app icon. No
`BOOT_COMPLETED` receiver or foreground service is needed: Android starts the
launcher after boot, and Telecom binds the `InCallService` on its own for each
call, regardless of whether the app process is running.

### Storage

One JSON file (`gramma-config.json`) plus a `photos/` folder in the app's
document directory, via `expo-file-system`. It survives app updates, needs no
extra library, and keeps photos next to the config. Photos are **copied** from
the contact or gallery at pick time, so the home screen never reads the
contacts provider and survives the contact being edited or deleted.

The native side keeps its own copy (whitelist, speaker flag, contacts) in
SharedPreferences; `syncNative()` in `App.tsx` writes it on every change and
on start.

### imo (not in v1)

imo registers per-contact data rows with mimetypes
`vnd.android.cursor.item/vnd.com.imo.android.imoim.audio.profile` and
`…imoim.video.profile` (`data1` = phone number), handled by
`com.imo.android.imoim/.deeplink.DeepLinkActivity`. A v2 "video via imo" tile
option could launch `ACTION_VIEW` on that data row. Not live-tested.

**Known asymmetry:** even if outgoing imo calls work, **incoming imo calls
cannot be auto-answered**. Auto-answer only covers calls registered with the
Telecom framework, i.e. normal cellular calls.

## Requirements on her device

- Android 12 (API 31) or newer — `minSdkVersion 31` via `expo-build-properties`,
  so older devices refuse the install instead of failing quietly.
- Speaker routing uses `requestCallEndpointChange` (Android 14+). On Android
  12–13 it falls back to the deprecated `setAudioRoute`; that path is
  verified on a Motorola moto e13 (Android 13 Go): route 8 = speaker after ACTIVE.
- Must make **cellular voice calls**. Many LTE tablets only do data; on those
  the app cannot call or answer at all.
- An Arabic text-to-speech voice (Google or Samsung TTS).
- Verified on: Samsung Galaxy S26 Ultra (SM-S948B), Android 16, One UI 8.5;
  Motorola moto e13 (Android 13 Go edition, 2 GB RAM) — outgoing call + speaker.
  Re-run `TESTSKRIPT.md` on her actual device — OEM skins differ.

## Building

Local builds only; no EAS. Expo SDK 57, React Native 0.86. `android/` is
generated (`expo prebuild`) and gitignored — never edit it by hand; manifest
changes go in `plugins/withGrammaManifest.js` or the module's manifest.

Windows notes (from experience): build from PowerShell with
`ANDROID_HOME=C:\Android\Sdk`. Before `expo prebuild`, stop Metro and the
Gradle daemon (`gradlew --stop`) **and make sure no terminal has `android/` as
its current directory** — Windows won't delete a folder a process is standing
in, and prebuild fails half-way with `EBUSY` (then rerun with `--clean`). Run
Gradle from outside with `android\gradlew.bat -p android …`.
Port 8081 may belong to another project's Metro, so this one uses 8082.

```powershell
npm install
npx expo prebuild --platform android      # after changing app.json / plugins
cd android
.\gradlew.bat app:assembleRelease          # standalone APK, no PC needed
# → android/app/build/outputs/apk/release/app-release.apk
```

Development (hot reload):

```powershell
.\gradlew.bat app:installDebug -PreactNativeArchitectures=arm64-v8a
cd ..; npm start                            # Metro on 8082
adb reverse tcp:8082 tcp:8082
```

Native (Kotlin, manifest, plugin) changes need a rebuild; JS changes don't.

### Installing from a file: restricted settings

Android 13+ treats an APK opened from a file manager, browser or Drive as
untrusted and blocks it from **restricted roles/permissions**, including
`ROLE_DIALER` ("App was denied access"). The user must unlock it once:
Settings → Apps → GrammaCall → ⋮ → *Allow restricted settings*, then
retry. `adb install` is trusted and skips this. Documented for the family in
`DRIFT.md` §6.

### Signing

Release builds are signed with the template's `android/app/debug.keystore`.
That is acceptable for a sideloaded family app, and it is the same file on
every `prebuild`, so updates install over the old version. If you ever switch
to a private keystore, the app must be uninstalled once (losing its settings)
— keep the keystore outside the repo (`*.jks` is gitignored).

### Typecheck

```powershell
npx tsc --noEmit
```
