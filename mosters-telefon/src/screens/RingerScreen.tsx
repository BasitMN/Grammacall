import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Portrait } from '../components/Portrait';
import { Contact } from '../contacts';
import { speakCalling, stopSpeaking } from '../speech';
import { colors, fonts, paletteFor } from '../theme';

const UNDO_SECONDS = 5;

type Props = {
  contact: Contact;
  onCancel: () => void;
  onDial: (contact: Contact) => void;
};

// The undo window between a tap and the call actually going out.
export function RingerScreen({ contact, onCancel, onDial }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(UNDO_SECONDS);
  const dialled = useRef(false);

  useEffect(() => {
    speakCalling(contact);
    const start = Date.now();
    const id = setInterval(() => {
      const left = UNDO_SECONDS - Math.floor((Date.now() - start) / 1000);
      if (left > 0) {
        setSecondsLeft(left);
      } else if (!dialled.current) {
        dialled.current = true;
        clearInterval(id);
        onDial(contact);
      }
    }, 100);
    return () => {
      clearInterval(id);
      stopSpeaking();
    };
  }, [contact, onDial]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.center}>
        <Portrait photoUri={contact.photoUri} palette={paletteFor(contact.position)} style={styles.portrait} />
        <Text style={styles.title}>Ringer {contact.name}</Text>
        <View style={styles.countdown}>
          <View style={styles.ring}>
            <Text style={styles.number}>{secondsLeft}</Text>
          </View>
          <Text style={styles.unit}>{secondsLeft === 1 ? 'sekund' : 'sekunder'}</Text>
        </View>
      </View>
      <Pressable
        onPress={onCancel}
        accessibilityRole="button"
        accessibilityLabel="Avbryt samtalet"
        style={({ pressed }) => [styles.cancel, pressed && styles.cancelPressed]}
      >
        <Text style={styles.cancelText}>AVBRYT</Text>
        <Text style={styles.cancelHint}>tryck här om du tryckte fel</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 24,
    gap: 20,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 26,
  },
  portrait: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 40,
    lineHeight: 46,
    color: colors.ink,
    textAlign: 'center',
  },
  countdown: {
    alignItems: 'center',
    gap: 8,
  },
  ring: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 7,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontFamily: fonts.bold,
    fontSize: 92,
    lineHeight: 100,
    color: colors.ink,
  },
  unit: {
    fontFamily: fonts.regular,
    fontSize: 22,
    color: colors.muted,
  },
  cancel: {
    height: 180,
    borderRadius: 22,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  cancelPressed: {
    backgroundColor: colors.dangerPressed,
  },
  cancelText: {
    fontFamily: fonts.bold,
    fontSize: 44,
    letterSpacing: 1,
    color: colors.onInk,
  },
  cancelHint: {
    fontFamily: fonts.regular,
    fontSize: 19,
    color: colors.onInk,
  },
});
