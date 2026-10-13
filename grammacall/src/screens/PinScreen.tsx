import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fonts, settingsColors } from '../theme';

const PIN_LENGTH = 4;
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

type Props =
  | { mode: 'unlock'; pin: string; onSuccess: () => void; onCancel: () => void }
  | { mode: 'create'; onCreate: (pin: string) => void; onCancel: () => void };

export function PinScreen(props: Props) {
  const [entry, setEntry] = useState('');
  const [firstEntry, setFirstEntry] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const title =
    props.mode === 'unlock' ? 'Inställningar' : firstEntry ? 'Upprepa den nya koden' : 'Välj en ny PIN-kod';

  const complete = (code: string) => {
    if (props.mode === 'unlock') {
      if (code === props.pin) props.onSuccess();
      else setMessage('Fel kod, försök igen');
    } else if (!firstEntry) {
      setFirstEntry(code);
      setMessage(null);
    } else if (code === firstEntry) {
      props.onCreate(code);
    } else {
      setFirstEntry(null);
      setMessage('Koderna matchade inte, börja om');
    }
    setEntry('');
  };

  const press = (key: string) => {
    if (key === '⌫') {
      setEntry((e) => e.slice(0, -1));
      return;
    }
    const next = entry + key;
    if (next.length === PIN_LENGTH) complete(next);
    else setEntry(next);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.heading}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{message ?? 'GrammaCall · endast för anhöriga'}</Text>
      </View>
      <View style={styles.dots}>
        {Array.from({ length: PIN_LENGTH }, (_, i) => (
          <View key={i} style={[styles.dot, i < entry.length && styles.dotFilled]} />
        ))}
      </View>
      <View style={styles.keypad}>
        {KEYS.map((key, i) =>
          key ? (
            <Pressable
              key={i}
              onPress={() => press(key)}
              accessibilityLabel={key === '⌫' ? 'Radera' : key}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              <Text style={styles.keyText}>{key}</Text>
            </Pressable>
          ) : (
            <View key={i} style={styles.keySpacer} />
          ),
        )}
      </View>
      <Pressable onPress={props.onCancel} style={styles.cancel}>
        <Text style={styles.cancelText}>Avbryt och gå tillbaka</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: settingsColors.pinBackground,
    padding: 32,
    justifyContent: 'center',
    gap: 32,
  },
  heading: {
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: 21,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: settingsColors.pinMuted,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: settingsColors.pinEmpty,
  },
  dotFilled: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  key: {
    width: '30%',
    flexGrow: 1,
    height: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: settingsColors.pinKeyBorder,
    backgroundColor: settingsColors.pinKey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: settingsColors.pinKeyBorder,
  },
  keySpacer: {
    width: '30%',
    flexGrow: 1,
    height: 74,
  },
  keyText: {
    fontFamily: fonts.bold,
    fontSize: 27,
    color: '#FFFFFF',
  },
  cancel: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontFamily: fonts.regular,
    fontSize: 17,
    color: settingsColors.pinMuted,
    textDecorationLine: 'underline',
  },
});
