import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Portrait } from '../components/Portrait';
import { answersAutomatically, Contact } from '../contacts';
import { pickDeviceContact, pickPhoto } from '../pickers';
import { speakCalling } from '../speech';
import { colors, fonts, paletteFor, settingsColors } from '../theme';

export type EditorDraft = {
  contact: Contact;
  phones: string[];
  isNew: boolean;
  // A freshly picked photo, not yet copied into the app's folder.
  newPhotoSource?: string;
};

type Props = {
  draft: EditorDraft;
  onSave: (draft: EditorDraft) => void;
  onDelete: (contact: Contact) => void;
  onCancel: () => void;
  // Pickers leave the app; tell the parent so it doesn't lock settings.
  onExternal: (busy: boolean) => void;
};

export function ContactEditorScreen({ draft: initial, onSave, onDelete, onCancel, onExternal }: Props) {
  const [draft, setDraft] = useState(initial);
  const { contact } = draft;
  const set = (patch: Partial<Contact>) => setDraft((d) => ({ ...d, contact: { ...d.contact, ...patch } }));
  const photoUri = draft.newPhotoSource ?? contact.photoUri;
  const canSave = contact.name.trim() !== '' && contact.phone.trim() !== '';

  const external = async <T,>(action: () => Promise<T>) => {
    onExternal(true);
    try {
      return await action();
    } finally {
      onExternal(false);
    }
  };

  const replaceContact = async () => {
    const picked = await external(pickDeviceContact);
    if (!picked) return;
    setDraft((d) => ({
      ...d,
      phones: picked.phones,
      newPhotoSource: picked.imageUri ?? d.newPhotoSource,
      contact: { ...d.contact, name: picked.name, phone: picked.phones[0] ?? '' },
    }));
  };

  const choosePhoto = async () => {
    const uri = await external(pickPhoto);
    if (uri) setDraft((d) => ({ ...d, newPhotoSource: uri }));
  };

  const phoneChoices = [...new Set([contact.phone, ...draft.phones].filter(Boolean))];

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>{draft.isNew ? 'Ny kontakt' : 'Ändra kontakt'}</Text>
        <Pressable onPress={onCancel} style={styles.topButton}>
          <Text style={styles.topButtonText}>Avbryt</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          <Portrait photoUri={photoUri} palette={paletteFor(contact.position)} style={styles.photo} />
          <View style={styles.photoButtons}>
            <Button label="Välj foto" onPress={choosePhoto} />
            <Button label="Välj annan kontakt" onPress={replaceContact} />
          </View>
        </View>

        <Text style={styles.label}>Namn på hemskärmen</Text>
        <TextInput
          value={contact.name}
          onChangeText={(name) => set({ name })}
          style={styles.input}
          maxLength={14}
          placeholder="t.ex. Fatima"
        />

        <Text style={styles.label}>Namn på arabiska (för uppläsning)</Text>
        <TextInput
          value={contact.spokenName ?? ''}
          onChangeText={(spokenName) => set({ spokenName: spokenName || undefined })}
          style={[styles.input, styles.arabic]}
          placeholder="t.ex. فاطمة"
        />
        <Button label="▶ Lyssna" onPress={() => speakCalling(contact)} />

        <Text style={styles.label}>Nummer</Text>
        {phoneChoices.map((phone) => (
          <Pressable
            key={phone}
            onPress={() => set({ phone })}
            style={[styles.choice, phone === contact.phone && styles.choiceSelected]}
          >
            <Text style={styles.choiceText}>
              {phone === contact.phone ? '● ' : '○ '}
              {phone}
            </Text>
          </Pressable>
        ))}
        {phoneChoices.length === 0 && <Text style={styles.hint}>Kontakten har inget telefonnummer.</Text>}

        <Text style={styles.label}>När personen ringer</Text>
        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Svara automatiskt efter 2 sekunder</Text>
          <Switch
            value={answersAutomatically(contact)}
            onValueChange={(autoAnswer) => set({ autoAnswer })}
            trackColor={{ true: colors.success, false: settingsColors.buttonBorder }}
            thumbColor="#FFFFFF"
          />
        </View>
        <Text style={styles.switchHint}>
          {answersAutomatically(contact)
            ? 'Telefonen svarar själv på högtalare.'
            : 'Telefonen ringer som vanligt med SVARA och AVVISA.'}
        </Text>

        <Pressable
          onPress={() => onSave(draft)}
          disabled={!canSave}
          style={[styles.saveButton, !canSave && styles.disabled]}
        >
          <Text style={styles.saveText}>Spara</Text>
        </Pressable>
        {!draft.isNew && (
          <Pressable onPress={() => onDelete(contact)} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Ta bort från hemskärmen</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Button({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: settingsColors.background,
  },
  topBar: {
    backgroundColor: colors.ink,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topTitle: {
    fontFamily: fonts.bold,
    fontSize: 19,
    color: '#FFFFFF',
  },
  topButton: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  topButtonText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  photo: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: colors.ink,
  },
  photoButtons: {
    flex: 1,
    gap: 10,
  },
  label: {
    fontFamily: fonts.bold,
    fontSize: 13,
    letterSpacing: 0.5,
    color: settingsColors.subtle,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: settingsColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: fonts.regular,
    fontSize: 18,
    color: colors.ink,
  },
  arabic: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  choice: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: settingsColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  choiceSelected: {
    borderColor: colors.ink,
    borderWidth: 2,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: settingsColors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  switchLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  switchHint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: settingsColors.subtle,
  },
  choiceText: {
    fontFamily: fonts.regular,
    fontSize: 16,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.danger,
  },
  button: {
    height: 44,
    borderWidth: 1,
    borderColor: settingsColors.buttonBorder,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  disabled: {
    opacity: 0.4,
  },
  saveText: {
    fontFamily: fonts.bold,
    fontSize: 17,
    color: '#FFFFFF',
  },
  deleteButton: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.danger,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deleteText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.danger,
  },
});
