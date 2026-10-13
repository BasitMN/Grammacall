import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, fonts } from '../theme';

const HOLD_SECONDS = 5;

type Props = {
  onOpen: () => void;
};

// Settings entry for the nephew: a faint gear in the top-right corner. A tap
// does nothing; holding it counts down 5…1 so it's obvious it's working, then
// the PIN screen opens. Too faint and slow to be found by accident.
export function SettingsCorner({ onOpen }: Props) {
  const [left, setLeft] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setLeft(null);
  };

  const start = () => {
    stop();
    const startedAt = Date.now();
    setLeft(HOLD_SECONDS);
    timer.current = setInterval(() => {
      const remaining = HOLD_SECONDS - Math.floor((Date.now() - startedAt) / 1000);
      if (remaining > 0) {
        setLeft(remaining);
      } else {
        stop();
        onOpen();
      }
    }, 100);
  };

  useEffect(() => stop, []);

  return (
    <Pressable onPressIn={start} onPressOut={stop} style={styles.area} accessible={false}>
      {left === null ? (
        <Text style={styles.gear}>{'⚙︎'}</Text>
      ) : (
        <View style={styles.ring}>
          <Text style={styles.count}>{left}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  area: {
    width: 96,
    height: 96,
    marginRight: -16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gear: {
    fontSize: 30,
    color: '#A9AEB6',
  },
  ring: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    fontFamily: fonts.bold,
    fontSize: 26,
    color: colors.ink,
  },
});
