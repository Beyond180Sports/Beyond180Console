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

type FilterDropdownProps = {
  options: FilterOption[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  placeholder: string;
  enableSearch?: boolean;
  style?: object;
};

export default function FilterDropdown({
  options,
  selectedId,
  onSelect,
  placeholder,
  enableSearch = false,
  style,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((option) => option.id === selectedId);
  const filtered = enableSearch
    ? options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ hovered, pressed }) => [
          styles.trigger,
          (hovered || pressed) && styles.triggerPressed,
        ]}
      >
        <Text style={styles.triggerText} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation?.()}>
            <Text style={styles.sheetTitle}>{placeholder}</Text>
            {enableSearch ? (
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search..."
                placeholderTextColor="rgba(18, 58, 122, 0.4)"
                style={styles.search}
                autoFocus
              />
            ) : null}
            <ScrollView style={styles.list}>
              <Pressable
                onPress={() => {
                  onSelect(null);
                  setOpen(false);
                  setQuery('');
                }}
                style={({ hovered, pressed }) => [
                  styles.option,
                  (hovered || pressed) && styles.optionPressed,
                  !selectedId && styles.optionSelected,
                ]}
              >
                <Text style={styles.optionLabel}>{placeholder}</Text>
              </Pressable>
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
                    selectedId === option.id && styles.optionSelected,
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
    minWidth: 0,
    width: '100%',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F7FF',
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 42,
  },
  triggerPressed: {
    backgroundColor: '#E5EEFF',
  },
  triggerText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
  },
  chevron: {
    marginLeft: 8,
    color: '#1E6FE8',
    fontSize: 12,
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
  optionSelected: {
    backgroundColor: '#EAF2FF',
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
