import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Portrait } from '../components/Portrait';
import { answersAutomatically, Contact, MAX_CONTACTS } from '../contacts';
import { Config } from '../store';
import { colors, fonts, paletteFor, settingsColors } from '../theme';

export type PhoneStatus = { dialer: boolean; home: boolean; battery: boolean };
export type SystemAction = 'dialer' | 'home' | 'battery' | 'leave';

type Props = {
  config: Config;
  phoneStatus: PhoneStatus;
  arabicVoice: boolean | null;
  onAdd: () => void;
  onEdit: (contact: Contact) => void;
  onMove: (contact: Contact, delta: -1 | 1) => void;
  onAutoAnswer: (enabled: boolean) => void;
  onSpeaker: (enabled: boolean) => void;
  onSystemAction: (action: SystemAction) => void;
  onChangePin: () => void;
  onLock: () => void;
};


export function SettingsScreen(props: Props) {
  const { config } = props;
  const [showTestHelp, setShowTestHelp] = useState(false);
  const contacts = [...config.contacts].sort((a, b) => a.position - b.position);
  const updated = config.updatedAt ? new Date(config.updatedAt).toLocaleDateString('sv-SE') : '–';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Inställningar</Text>
        <Pressable onPress={props.onLock} style={styles.lockButton}>
          <Text style={styles.lockText}>Lås</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.section}>
          HEMSKÄRMEN · {contacts.length} AV {MAX_CONTACTS} PLATSER
        </Text>
        <View style={styles.card}>
          {contacts.length === 0 && <Text style={styles.note}>Inga kontakter ännu.</Text>}
          {contacts.map((contact, i) => (
            <View key={contact.id} style={[styles.row, i < contacts.length - 1 && styles.rowDivider]}>
              <Portrait photoUri={contact.photoUri} palette={paletteFor(contact.position)} style={styles.thumb} />
              <View style={styles.rowText}>
                <Text style={styles.rowName} numberOfLines={1}>{contact.name}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  plats {i + 1} · {answersAutomatically(contact) && config.autoAnswer ? 'svarar själv' : 'ringer'} · {contact.phone}
                </Text>
              </View>
              <SmallButton label="▲" disabled={i === 0} onPress={() => props.onMove(contact, -1)} />
              <SmallButton label="▼" disabled={i === contacts.length - 1} onPress={() => props.onMove(contact, 1)} />
              <SmallButton label="Byt" onPress={() => props.onEdit(contact)} />
            </View>
          ))}
        </View>
        {contacts.length < MAX_CONTACTS && (
          <Pressable onPress={props.onAdd} style={styles.outlineButton}>
            <Text style={styles.outlineText}>+ Lägg till kontakt</Text>
          </Pressable>
        )}

        <Text style={styles.section}>AUTOSVAR</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Autosvar på (för personer där det är valt)"
            value={config.autoAnswer}
            onChange={props.onAutoAnswer}
            divider
          />
          <ToggleRow label="Högtalare och max volym i alla samtal" value={config.speaker} onChange={props.onSpeaker} divider />
          <Text style={styles.note}>
            Okända nummer ringer som vanligt och besvaras aldrig automatiskt. Gäller endast vanliga samtal, inte imo.
          </Text>
        </View>
        <Pressable onPress={() => setShowTestHelp((v) => !v)} style={styles.outlineButton}>
          <Text style={styles.outlineText}>Testa autosvar</Text>
        </Pressable>
        {showTestHelp && (
          <Text style={styles.help}>
            Ring den här telefonen från ett av numren ovan. Den ska svara efter 2 sekunder, på högtalare. Ring sedan
            från ett annat nummer – då ska den bara ringa.
          </Text>
        )}

        <Text style={styles.section}>TELEFONEN</Text>
        <View style={styles.card}>
          <StatusRow
            label="Standardapp för telefon"
            ok={props.phoneStatus.dialer}
            hint="Utan detta svarar appen inte och kan inte ringa. Öppna aldrig Samsungs Telefon-app på den här telefonen."
            divider
          />
          <StatusRow
            label="Hemskärm (startar efter omstart)"
            ok={props.phoneStatus.home}
            hint="Hemknappen ska alltid leda tillbaka till brickorna."
            divider
          />
          <StatusRow
            label="Undantagen från batterisparläge"
            ok={props.phoneStatus.battery}
            hint="Annars kan Android stänga appen i bakgrunden."
            divider
          />
          <StatusRow
            label="Arabisk röst för uppläsning"
            ok={props.arabicVoice}
            hint="Installera arabiska under Inställningar › Allmän hantering › Text till tal."
          />
        </View>
        {!props.phoneStatus.dialer && <ActionButton label="Gör till standardapp för telefon" onPress={() => props.onSystemAction('dialer')} />}
        {!props.phoneStatus.home && <ActionButton label="Gör till hemskärm" onPress={() => props.onSystemAction('home')} />}
        {!props.phoneStatus.battery && <ActionButton label="Stäng av batterisparläge för appen" onPress={() => props.onSystemAction('battery')} />}
        <ActionButton label="Byt PIN-kod" onPress={props.onChangePin} />
        {props.phoneStatus.home && (
          <ActionButton label="Byt till telefonens vanliga hemskärm" onPress={() => props.onSystemAction('leave')} />
        )}

        <Pressable onPress={props.onLock} style={styles.darkButton}>
          <Text style={styles.darkText}>Lås och återgå till hemskärmen</Text>
        </Pressable>
        <Text style={styles.footer}>v1.0 · senast ändrad {updated}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.outlineButton}>
      <Text style={styles.outlineText}>{label}</Text>
    </Pressable>
  );
}

function SmallButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.smallButton, disabled && styles.disabled]}>
      <Text style={styles.smallText}>{label}</Text>
    </Pressable>
  );
}

function ToggleRow(props: { label: string; value: boolean; onChange: (v: boolean) => void; divider?: boolean }) {
  return (
    <View style={[styles.toggleRow, props.divider && styles.rowDivider]}>
      <Text style={styles.toggleLabel}>{props.label}</Text>
      <Switch
        value={props.value}
        onValueChange={props.onChange}
        trackColor={{ true: colors.success, false: settingsColors.buttonBorder }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function StatusRow(props: { label: string; ok: boolean | null; hint?: string; divider?: boolean }) {
  const text = props.ok === null ? 'Kontrollerar…' : props.ok ? 'Ja' : 'Nej';
  return (
    <View style={[styles.statusRow, props.divider && styles.rowDivider]}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>{props.label}</Text>
        <Text style={[styles.status, props.ok === false && styles.statusBad]}>{text}</Text>
      </View>
      {props.ok === false && props.hint && <Text style={styles.hint}>{props.hint}</Text>}
    </View>
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
  lockButton: {
    borderWidth: 1,
    borderColor: colors.muted,
    borderRadius: 9,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  lockText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingTop: 18,
    gap: 14,
  },
  section: {
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: settingsColors.subtle,
    marginTop: 4,
  },
  card: {
    backgroundColor: settingsColors.card,
    borderWidth: 1,
    borderColor: settingsColors.border,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: settingsColors.divider,
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 4,
  },
  rowText: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.ink,
  },
  rowSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: settingsColors.subtle,
  },
  smallButton: {
    borderWidth: 1,
    borderColor: settingsColors.buttonBorder,
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 11,
    backgroundColor: '#FFFFFF',
  },
  disabled: {
    opacity: 0.3,
  },
  smallText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.ink,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  toggleLabel: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.ink,
  },
  statusRow: {
    paddingBottom: 2,
  },
  status: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.success,
  },
  statusBad: {
    color: colors.danger,
  },
  hint: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: settingsColors.subtle,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  note: {
    fontFamily: fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    color: settingsColors.subtle,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  help: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.ink,
  },
  outlineButton: {
    height: 46,
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: colors.ink,
  },
  darkButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  darkText: {
    fontFamily: fonts.bold,
    fontSize: 15,
    color: '#FFFFFF',
  },
  footer: {
    textAlign: 'center',
    fontFamily: fonts.regular,
    fontSize: 12,
    color: settingsColors.faint,
  },
});
