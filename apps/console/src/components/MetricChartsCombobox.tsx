import { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  METRIC_CATEGORIES,
  type MetricCategoryDef,
  type MetricCategoryId,
} from '../lib/metricCategories';

type MetricChartsComboboxProps = {
  selectedChartIds: string[];
  onChange: (selectedChartIds: string[]) => void;
  disabled?: boolean;
};

function categoryChartIds(category: MetricCategoryDef) {
  return category.charts.map((chart) => chart.id);
}

const ALL_CHART_IDS = METRIC_CATEGORIES.flatMap((category) => categoryChartIds(category));

export default function MetricChartsCombobox({
  selectedChartIds,
  onChange,
  disabled = false,
}: MetricChartsComboboxProps) {
  const [open, setOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<MetricCategoryId | null>(null);

  const summary = useMemo(() => {
    if (ALL_CHART_IDS.length === 0) {
      return 'No plots available';
    }
    if (selectedChartIds.length === 0) {
      return 'Select plots';
    }
    if (selectedChartIds.length === ALL_CHART_IDS.length) {
      return 'All plots';
    }

    const selectedTitles = METRIC_CATEGORIES.flatMap((category) =>
      category.charts
        .filter((chart) => selectedChartIds.includes(chart.id))
        .map((chart) => chart.title),
    );
    if (selectedTitles.length <= 2) {
      return selectedTitles.join(', ');
    }
    return `${selectedTitles.length} plots selected`;
  }, [selectedChartIds]);

  function close() {
    setOpen(false);
    setExpandedCategoryId(null);
  }

  function toggleOpen() {
    setOpen((current) => {
      if (current) {
        setExpandedCategoryId(null);
        return false;
      }
      return true;
    });
  }

  function toggleCategory(categoryId: MetricCategoryId) {
    setExpandedCategoryId((current) => (current === categoryId ? null : categoryId));
  }

  function toggleChart(chartId: string) {
    if (selectedChartIds.includes(chartId)) {
      onChange(selectedChartIds.filter((id) => id !== chartId));
      return;
    }
    onChange([...selectedChartIds, chartId]);
  }

  function selectAllInCategory(category: MetricCategoryDef) {
    const chartIds = categoryChartIds(category);
    onChange([...new Set([...selectedChartIds, ...chartIds])]);
  }

  function clearCategory(category: MetricCategoryDef) {
    const chartIds = new Set(categoryChartIds(category));
    onChange(selectedChartIds.filter((id) => !chartIds.has(id)));
  }

  function selectedCountInCategory(category: MetricCategoryDef) {
    const chartIds = categoryChartIds(category);
    return selectedChartIds.filter((id) => chartIds.includes(id)).length;
  }

  return (
    <>
      {open && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss plots menu"
          onPress={close}
          style={[styles.backdrop, Platform.OS === 'web' && styles.backdropWeb]}
        />
      )}

      <View style={styles.root}>
        <Text style={styles.label}>Plots</Text>
        <Pressable
          accessibilityRole="button"
          disabled={disabled || ALL_CHART_IDS.length === 0}
          onPress={toggleOpen}
          style={({ pressed }) => [
            styles.trigger,
            (disabled || ALL_CHART_IDS.length === 0) && styles.triggerDisabled,
            pressed && styles.triggerPressed,
          ]}
        >
          <Text
            style={[
              styles.triggerText,
              selectedChartIds.length === 0 && styles.triggerPlaceholder,
            ]}
            numberOfLines={1}
          >
            {summary}
          </Text>
          <Text style={styles.chevron}>{open ? '▴' : '▾'}</Text>
        </Pressable>

        {open && (
          <View style={styles.menu}>
            {METRIC_CATEGORIES.map((category) => {
              const expanded = expandedCategoryId === category.id;
              const selectedCount = selectedCountInCategory(category);

              return (
                <View key={category.id} style={styles.categoryBlock}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded }}
                    onPress={() => toggleCategory(category.id)}
                    style={({ pressed }) => [
                      styles.categoryRow,
                      (expanded || selectedCount > 0) && styles.categoryRowActive,
                      pressed && styles.optionPressed,
                    ]}
                  >
                    <View style={styles.categoryLabelWrap}>
                      <Text style={styles.categoryLabel}>{category.label}</Text>
                      {selectedCount > 0 && (
                        <Text style={styles.categoryCount}>
                          {selectedCount}/{category.charts.length}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.chevron}>{expanded ? '▴' : '▾'}</Text>
                  </Pressable>

                  {expanded && (
                    <View style={styles.submenu}>
                      <View style={styles.menuActions}>
                        <Pressable
                          onPress={() => selectAllInCategory(category)}
                          style={styles.menuAction}
                        >
                          <Text style={styles.menuActionText}>Select all</Text>
                        </Pressable>
                        <Pressable
                          onPress={() => clearCategory(category)}
                          style={styles.menuAction}
                        >
                          <Text style={styles.menuActionText}>Clear</Text>
                        </Pressable>
                      </View>
                      {category.charts.map((chart) => {
                        const selected = selectedChartIds.includes(chart.id);
                        return (
                          <Pressable
                            key={chart.id}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: selected }}
                            onPress={() => toggleChart(chart.id)}
                            style={({ pressed }) => [
                              styles.option,
                              selected && styles.optionSelected,
                              pressed && styles.optionPressed,
                            ]}
                          >
                            <View
                              style={[styles.checkbox, selected && styles.checkboxSelected]}
                            >
                              {selected && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.optionText}>{chart.title}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    zIndex: 9,
  },
  backdropWeb: {
    // @ts-expect-error web-only CSS position
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  root: {
    width: '100%',
    maxWidth: 320,
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
  categoryBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    cursor: 'pointer',
  },
  categoryRowActive: {
    backgroundColor: '#F8FAFC',
  },
  categoryLabelWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#111827',
  },
  categoryCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#1E6FE8',
  },
  submenu: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    backgroundColor: '#FAFBFC',
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
