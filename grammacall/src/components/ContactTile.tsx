import { Pressable, StyleSheet, Text } from 'react-native';

import { Contact } from '../contacts';
import { colors, fonts, paletteFor } from '../theme';
import { Portrait } from './Portrait';

type Props = {
  contact: Contact;
  onPress: (contact: Contact) => void;
};

export function ContactTile({ contact, onPress }: Props) {
  return (
    <Pressable
      onPress={() => onPress(contact)}
      accessibilityRole="button"
      accessibilityLabel={`Ring ${contact.name}`}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <Portrait photoUri={contact.photoUri} palette={paletteFor(contact.position)} style={styles.portrait} />
      <Text style={styles.name} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.9}>
        {contact.name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.ink,
    borderRadius: 20,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  // Visible within the first frame of the touch: thicker dark frame, slight shrink.
  pressed: {
    borderWidth: 8,
    transform: [{ scale: 0.97 }],
  },
  portrait: {
    flex: 1,
  },
  name: {
    backgroundColor: colors.ink,
    color: colors.onInk,
    fontFamily: fonts.bold,
    fontSize: 31,
    paddingVertical: 15,
    paddingHorizontal: 8,
    textAlign: 'center',
  },
});
