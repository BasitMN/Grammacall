import {
  AtkinsonHyperlegible_400Regular,
  AtkinsonHyperlegible_700Bold,
  useFonts,
} from '@expo-google-fonts/atkinson-hyperlegible';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, BackHandler, PermissionsAndroid, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MosterCall from './modules/moster-call';
import { Contact } from './src/contacts';
import { pickDeviceContact } from './src/pickers';
import { ContactEditorScreen, EditorDraft } from './src/screens/ContactEditorScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { PinScreen } from './src/screens/PinScreen';
import { RingerScreen } from './src/screens/RingerScreen';
import { PhoneStatus, SettingsScreen } from './src/screens/SettingsScreen';
import { hasArabicVoice } from './src/speech';
import { cachePhoto, Config, deletePhoto, loadConfig, saveConfig } from './src/store';
import { colors } from './src/theme';
import { useKeepAwakeWhileCharging } from './src/useKeepAwakeWhileCharging';

// Few screens and no history, so plain state instead of a navigation library.
type Screen =
  | { name: 'home' }
  | { name: 'ringer'; contact: Contact }
  | { name: 'pin' }
  | { name: 'newPin' }
  | { name: 'settings' }
  | { name: 'editor'; draft: EditorDraft };

const LOCKED_SCREENS: Screen['name'][] = ['pin', 'newPin', 'settings', 'editor'];
const STATUS_CHECK_MS = 60_000;

// The native side decides auto-answer and speaker without JS running.
function syncNative(config: Config) {
  MosterCall.setWhitelist(config.autoAnswer ? config.contacts.map((c) => c.phone) : []);
  MosterCall.setSpeaker(config.speaker);
  MosterCall.setContacts(
    config.contacts.map(({ name, spokenName, phone, photoUri, position }) => ({
      name,
      spokenName,
      phone,
      photoUri,
      position,
    })),
  );
}

function withPositions(contacts: Contact[]): Contact[] {
  return contacts.map((c, i) => ({ ...c, position: i }));
}

// Checked every time the app comes to the front. Losing the dialer role
// (e.g. someone opened Samsung's Phone app) silently breaks calls, so it
// also raises a notification for whoever looks at the phone next.
function readPhoneStatus(): PhoneStatus {
  const status = {
    dialer: MosterCall.hasDialerRole(),
    home: MosterCall.hasHomeRole(),
    battery: MosterCall.isIgnoringBatteryOptimizations(),
  };
  MosterCall.setRoleWarning(!status.dialer);
  return status;
}

export default function App() {
  const [fontsLoaded] = useFonts({ AtkinsonHyperlegible_400Regular, AtkinsonHyperlegible_700Bold });
  const [config, setConfig] = useState(loadConfig);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });
  const [phoneStatus, setPhoneStatus] = useState(readPhoneStatus);
  useKeepAwakeWhileCharging();
  const [arabicVoice, setArabicVoice] = useState<boolean | null>(null);
  // True after opening a one-shot system screen (role dialog, battery
  // settings); cleared when we come back, so leaving the app doesn't lock settings.
  const external = useRef(false);
  // True for the whole of a picker flow. The image picker goes gallery → crop,
  // briefly returning to us in between, so this is only cleared when the
  // picker's promise settles, never by app state.
  const pickerBusy = useRef(false);
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    syncNative(config);
    hasArabicVoice().then(setArabicVoice);
    // Only on start; later changes go through update().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = useCallback((next: Config) => {
    setConfig(saveConfig(next));
    syncNative(next);
  }, []);

  const goHome = useCallback(() => setScreen({ name: 'home' }), []);

  // The role warning is a notification, so ask for that permission the
  // first time the nephew opens settings.
  useEffect(() => {
    if (screen.name !== 'settings') return;
    const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
    PermissionsAndroid.check(permission).then((granted) => {
      if (granted) return;
      external.current = true;
      PermissionsAndroid.request(permission).catch(() => {});
    });
  }, [screen.name]);

  // Back never leaves the app: it cancels the countdown or steps out of settings.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      setScreen((s) => (s.name === 'editor' ? { name: 'settings' } : { name: 'home' }));
      return true;
    });
    return () => sub.remove();
  }, []);

  // We are the launcher: the home button doesn't change app state, so the
  // native side reports it. It locks settings and cancels a countdown.
  useEffect(() => {
    const sub = MosterCall.addListener('onHomePressed', goHome);
    return () => sub.remove();
  }, [goHome]);

  // She may sit on the home screen for hours; re-check the roles regularly too.
  useEffect(() => {
    const id = setInterval(() => setPhoneStatus(readPhoneStatus()), STATUS_CHECK_MS);
    return () => clearInterval(id);
  }, []);

  // Settings lock as soon as the app leaves the screen, unless we opened a picker.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        setPhoneStatus(readPhoneStatus());
        external.current = false;
      } else if (!external.current && !pickerBusy.current && LOCKED_SCREENS.includes(screenRef.current.name)) {
        setScreen({ name: 'home' });
      }
    });
    return () => sub.remove();
  }, []);

  const dial = useCallback(
    (contact: Contact) => {
      try {
        MosterCall.placeCall(contact.phone);
      } catch (e) {
        // Never surface errors to her; the nephew sees this in logcat.
        console.warn('placeCall failed', e);
      }
      goHome();
    },
    [goHome],
  );

  const addContact = async () => {
    pickerBusy.current = true;
    let picked;
    try {
      picked = await pickDeviceContact();
    } finally {
      pickerBusy.current = false;
    }
    if (!picked) return;
    setScreen({
      name: 'editor',
      draft: {
        isNew: true,
        phones: picked.phones,
        newPhotoSource: picked.imageUri ?? undefined,
        contact: {
          id: `c${Date.now()}`,
          name: picked.name.split(' ')[0],
          phone: picked.phones[0] ?? '',
          position: config.contacts.length,
        },
      },
    });
  };

  const saveContact = (draft: EditorDraft) => {
    let contact = { ...draft.contact, name: draft.contact.name.trim() };
    if (draft.newPhotoSource) {
      try {
        const cached = cachePhoto(draft.newPhotoSource, contact.id);
        deletePhoto(contact.photoUri);
        contact = { ...contact, photoUri: cached };
      } catch (e) {
        console.warn('could not cache photo', e);
      }
    }
    const others = config.contacts.filter((c) => c.id !== contact.id);
    const contacts = draft.isNew
      ? [...others, contact]
      : config.contacts.map((c) => (c.id === contact.id ? contact : c));
    update({ ...config, contacts: withPositions(contacts) });
    setScreen({ name: 'settings' });
  };

  const deleteContact = (contact: Contact) => {
    deletePhoto(contact.photoUri);
    update({ ...config, contacts: withPositions(config.contacts.filter((c) => c.id !== contact.id)) });
    setScreen({ name: 'settings' });
  };

  const moveContact = (contact: Contact, delta: -1 | 1) => {
    const sorted = [...config.contacts].sort((a, b) => a.position - b.position);
    const from = sorted.findIndex((c) => c.id === contact.id);
    const to = from + delta;
    if (to < 0 || to >= sorted.length) return;
    [sorted[from], sorted[to]] = [sorted[to], sorted[from]];
    update({ ...config, contacts: withPositions(sorted) });
  };

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.background }} />;
  }

  const render = () => {
    switch (screen.name) {
      case 'ringer':
        return <RingerScreen contact={screen.contact} onCancel={goHome} onDial={dial} />;
      case 'pin':
        return config.pin ? (
          <PinScreen mode="unlock" pin={config.pin} onSuccess={() => setScreen({ name: 'settings' })} onCancel={goHome} />
        ) : (
          <PinScreen
            mode="create"
            onCreate={(pin) => {
              update({ ...config, pin });
              setScreen({ name: 'settings' });
            }}
            onCancel={goHome}
          />
        );
      case 'newPin':
        return (
          <PinScreen
            mode="create"
            onCreate={(pin) => {
              update({ ...config, pin });
              setScreen({ name: 'settings' });
            }}
            onCancel={() => setScreen({ name: 'settings' })}
          />
        );
      case 'settings':
        return (
          <SettingsScreen
            config={config}
            phoneStatus={phoneStatus}
            arabicVoice={arabicVoice}
            onAdd={addContact}
            onEdit={(contact) => setScreen({ name: 'editor', draft: { contact, phones: [contact.phone], isNew: false } })}
            onMove={moveContact}
            onAutoAnswer={(autoAnswer) => update({ ...config, autoAnswer })}
            onSpeaker={(speaker) => update({ ...config, speaker })}
            onSystemAction={(action) => {
              // These open system screens; don't lock settings meanwhile.
              external.current = true;
              if (action === 'dialer') MosterCall.requestDialerRole();
              if (action === 'home') MosterCall.requestHomeRole();
              if (action === 'battery') MosterCall.requestIgnoreBatteryOptimizations();
              if (action === 'leave') MosterCall.openHomeSettings();
            }}
            onChangePin={() => setScreen({ name: 'newPin' })}
            onLock={goHome}
          />
        );
      case 'editor':
        return (
          <ContactEditorScreen
            draft={screen.draft}
            onSave={saveContact}
            onDelete={deleteContact}
            onCancel={() => setScreen({ name: 'settings' })}
            onExternal={(busy) => {
              pickerBusy.current = busy;
            }}
          />
        );
      default:
        return (
          <HomeScreen
            contacts={config.contacts}
            onCall={(contact) => setScreen({ name: 'ringer', contact })}
            onOpenSettings={() => setScreen({ name: 'pin' })}
          />
        );
    }
  };

  return (
    <SafeAreaProvider>
      {render()}
      <StatusBar style={screen.name === 'pin' || screen.name === 'newPin' ? 'light' : 'dark'} />
    </SafeAreaProvider>
  );
}
