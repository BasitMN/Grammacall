import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ContactTile } from '../components/ContactTile';
import { SettingsCorner } from '../components/SettingsCorner';
import { Contact } from '../contacts';
import { colors, fonts } from '../theme';
import { useClock } from '../useClock';

type Props = {
  contacts: Contact[];
  onCall: (contact: Contact) => void;
  onOpenSettings: () => void;
};

// 1–3 → one column, 4 → 2×2, 5–6 → 2×3, 7–9 → 3×3.
// Tiles always fill the screen; no scrolling.
function columnsFor(count: number) {
  if (count <= 3) return 1;
  return count <= 6 ? 2 : 3;
}

export function HomeScreen({ contacts, onCall, onOpenSettings }: Props) {
  const { time, date } = useClock();
  const sorted = [...contacts].sort((a, b) => a.position - b.position);
  const columns = columnsFor(sorted.length);
  const rows: (Contact | null)[][] = [];
  for (let i = 0; i < sorted.length; i += columns) {
    const row: (Contact | null)[] = sorted.slice(i, i + columns);
    while (row.length < columns) row.push(null);
    rows.push(row);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.time}>{time}</Text>
          <Text style={styles.date}>{date}</Text>
        </View>
        <SettingsCorner onOpen={onOpenSettings} />
      </View>
      {sorted.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Inga kontakter ännu.</Text>
          <Text style={styles.emptyHint}>Håll fingret på kugghjulet uppe till höger i 5 sekunder för inställningar.</Text>
        </View>
      )}
      <View style={styles.grid}>
        {rows.map((row, r) => (
          <View key={r} style={styles.row}>
            {row.map((contact, c) =>
              contact ? (
                <ContactTile key={contact.id} contact={contact} onPress={onCall} />
              ) : (
                <View key={`empty-${c}`} style={styles.empty} />
              ),
            )}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const GAP = 14;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  header: {
    height: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontFamily: fonts.bold,
    fontSize: 28,
    color: colors.ink,
  },
  emptyHint: {
    fontFamily: fonts.regular,
    fontSize: 19,
    color: colors.muted,
  },
  time: {
    fontFamily: fonts.bold,
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -1,
    color: colors.ink,
  },
  date: {
    fontFamily: fonts.regular,
    fontSize: 19,
    color: colors.muted,
  },
  grid: {
    flex: 1,
    gap: GAP,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: GAP,
  },
  empty: {
    flex: 1,
  },
});
