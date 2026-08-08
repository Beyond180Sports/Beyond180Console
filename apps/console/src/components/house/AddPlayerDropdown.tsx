import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { FilterOption } from './types';

type AddPlayerDropdownProps = {
  options: FilterOption[];
  onSelect: (playerId: string) => void;
};

export default function AddPlayerDropdown({
  options,
  onSelect,
}: AddPlayerDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  if (options.length === 0) {
    return null;
  }

  const filtered = options.filter((option) =>
    option.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ hovered, pressed }) => [
          styles.trigger,
          (hovered || pressed) && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerText}>+ Add player to board</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.sheetTitle}>Add Player</Text>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search players..."
              placeholderTextColor="rgba(18, 58, 122, 0.4)"
              style={styles.search}
              autoFocus
            />
            <ScrollView style={styles.list}>
              {filtered.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => {
                    onSelect(option.id);
                    setOpen(false);
                    setQuery('');
                  }}
                  style={({ hovered, pressed }) => [
                    styles.option,
                    (hovered || pressed) && styles.optionPressed,
                  ]}
                >
                  <Text style={styles.optionLabel}>{option.label}</Text>
                  {option.subtitle ? (
                    <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                  ) : null}
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  trigger: {
    width: '100%',
    backgroundColor: '#EAF2FF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 42,
    justifyContent: 'center',
  },
  triggerPressed: {
    backgroundColor: '#D6E8FF',
  },
  triggerText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1E6FE8',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11, 31, 64, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    maxHeight: '70%',
    padding: 16,
  },
  sheetTitle: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 24,
    letterSpacing: 1,
    color: '#123A7A',
    marginBottom: 12,
  },
  search: {
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
    marginBottom: 8,
  },
  list: {
    maxHeight: 360,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.08)',
  },
  optionPressed: {
    backgroundColor: '#F7FAFF',
  },
  optionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#123A7A',
  },
  optionSubtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(18, 58, 122, 0.6)',
    marginTop: 2,
  },
});
