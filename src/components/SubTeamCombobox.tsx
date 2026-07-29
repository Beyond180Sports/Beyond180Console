import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SubTeamOption } from '../lib/subteams';

type SubTeamComboboxProps = {
  options: SubTeamOption[];
  selectedIds: string[];
  onChange: (selectedIds: string[]) => void;
  disabled?: boolean;
};

function optionLabel(option: SubTeamOption) {
  if (option.leagueName?.trim()) {
    return `${option.name} (${option.leagueName})`;
  }
  return option.name;
}

export default function SubTeamCombobox({
  options,
  selectedIds,
  onChange,
  disabled = false,
}: SubTeamComboboxProps) {
  const [open, setOpen] = useState(false);

  const summary = useMemo(() => {
    if (options.length === 0) {
      return 'No teams available';
    }
    if (selectedIds.length === 0) {
      return 'Select teams';
    }
    if (selectedIds.length === options.length) {
      return 'All teams';
    }
    const selectedNames = options
      .filter((option) => selectedIds.includes(option.id))
      .map((option) => option.name);
    if (selectedNames.length <= 2) {
      return selectedNames.join(', ');
    }
    return `${selectedNames.length} teams selected`;
  }, [options, selectedIds]);

  function toggleOption(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
      return;
    }
    onChange([...selectedIds, id]);
  }

  function selectAll() {
    onChange(options.map((option) => option.id));
  }

  function clearAll() {
    onChange([]);
  }

  return (
    <View style={styles.root}>
      <Text style={styles.label}>Teams to include</Text>
      <Pressable
        accessibilityRole="button"
        disabled={disabled || options.length === 0}
        onPress={() => setOpen((value) => !value)}
        style={({ pressed }) => [
          styles.trigger,
          (disabled || options.length === 0) && styles.triggerDisabled,
          pressed && styles.triggerPressed,
        ]}
      >
        <Text
          style={[
            styles.triggerText,
            selectedIds.length === 0 && styles.triggerPlaceholder,
          ]}
          numberOfLines={1}
        >
          {summary}
        </Text>
        <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
      </Pressable>

      {open && options.length > 0 && (
        <View style={styles.menu}>
          <View style={styles.menuActions}>
            <Pressable onPress={selectAll} style={styles.menuAction}>
              <Text style={styles.menuActionText}>Select all</Text>
            </Pressable>
            <Pressable onPress={clearAll} style={styles.menuAction}>
              <Text style={styles.menuActionText}>Clear</Text>
            </Pressable>
          </View>
          {options.map((option) => {
            const selected = selectedIds.includes(option.id);
            return (
              <Pressable
                key={option.id}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                onPress={() => toggleOption(option.id)}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.optionPressed,
                ]}
              >
                <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.optionText}>{optionLabel(option)}</Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    maxWidth: 520,
    zIndex: 10,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: 'rgba(18, 58, 122, 0.7)',
    marginBottom: 8,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  },
  triggerPressed: {
    backgroundColor: '#F9FAFB',
  },
  triggerDisabled: {
    opacity: 0.6,
  },
  triggerText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#111827',
  },
  triggerPlaceholder: {
    color: '#6B7280',
  },
  chevron: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#1E6FE8',
  },
  menu: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  menuActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuAction: {
    cursor: 'pointer',
  },
  menuActionText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1E6FE8',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    cursor: 'pointer',
  },
  optionSelected: {
    backgroundColor: '#EFF6FF',
  },
  optionPressed: {
    backgroundColor: '#F3F4F6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxSelected: {
    borderColor: '#1E6FE8',
    backgroundColor: '#1E6FE8',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'DMSans_700Bold',
    lineHeight: 14,
  },
  optionText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: '#111827',
  },
});
