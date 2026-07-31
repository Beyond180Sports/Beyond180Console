import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  fetchGameStatTimeSeries,
  fetchSquadSubTeams,
  squadColorHex,
  type GameStatTimePoint,
  type SquadRecord,
  type SubTeamOption,
} from '@beyond180/shared';
import MetricChartsCombobox from '../components/MetricChartsCombobox';
import SubTeamCombobox from '../components/SubTeamCombobox';
import TimeSeriesChart, { type TimeSeriesLine } from '../components/TimeSeriesChart';
import {
  getChartsByIds,
  moveChartId,
  type MetricChartDef,
} from '../lib/metricCategories';

type SquadAnalyticsPageProps = {
  squad: SquadRecord;
  onBack: () => void;
};

function PieChartIcon({ color }: { color: string }) {
  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.pieIcon,
        Platform.OS === 'web'
          ? ({
              backgroundImage: `conic-gradient(${color} 0 38%, ${color}99 0 70%, ${color}33 0)`,
            } as object)
          : { borderColor: color, borderWidth: 3, backgroundColor: `${color}22` },
      ]}
    />
  );
}

function formatEventDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
  });
}

function formatCategoryLabel(iso: string, opponent: string | null | undefined): string {
  const date = formatEventDate(iso);
  const name = opponent?.trim();
  return name ? `${date}\nvs ${name}` : date;
}

function opponentForDate(rows: GameStatTimePoint[], dateKey: string): string | null {
  const opponents = [
    ...new Set(
      rows
        .filter((row) => row.Event.startDateTime === dateKey)
        .map((row) => row.Event.opponent?.trim())
        .filter((value): value is string => Boolean(value)),
    ),
  ];
  return opponents.length > 0 ? opponents.join(', ') : null;
}

function buildChartSeries(
  chart: MetricChartDef,
  rows: GameStatTimePoint[],
  subTeams: SubTeamOption[],
  selectedIds: string[],
): { categories: string[]; series: TimeSeriesLine[] } {
  const selectedTeams = subTeams.filter((team) => selectedIds.includes(team.id));
  const dateKeys = [
    ...new Set(rows.map((row) => row.Event.startDateTime)),
  ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const categories = dateKeys.map((dateKey) =>
    formatCategoryLabel(dateKey, opponentForDate(rows, dateKey)),
  );
  const series: TimeSeriesLine[] = [];

  for (const team of selectedTeams) {
    const teamRows = rows.filter((row) => row.Event.subTeamId === team.id);
    const byDate = new Map(teamRows.map((row) => [row.Event.startDateTime, row]));

    for (const metric of chart.series) {
      const name =
        selectedTeams.length === 1
          ? metric.label
          : `${team.name} — ${metric.label}`;

      series.push({
        name,
        data: dateKeys.map((dateKey) => {
          const row = byDate.get(dateKey);
          return row ? metric.getValue(row) : null;
        }),
        role: metric.label.startsWith('For')
          ? 'for'
          : metric.label.startsWith('Against')
            ? 'against'
            : 'other',
      });
    }
  }

  return { categories, series };
}

export default function SquadAnalyticsPage({ squad, onBack }: SquadAnalyticsPageProps) {
  const [subTeams, setSubTeams] = useState<SubTeamOption[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedChartIds, setSelectedChartIds] = useState<string[]>([]);
  const [stats, setStats] = useState<GameStatTimePoint[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [highlightedChartId, setHighlightedChartId] = useState<string | null>(null);
  const [draggingChartId, setDraggingChartId] = useState<string | null>(null);
  const chartItemRefs = useRef(new Map<string, View>());
  const draggingChartIdRef = useRef<string | null>(null);
  const selectedChartIdsRef = useRef(selectedChartIds);
  selectedChartIdsRef.current = selectedChartIds;
  const { width: windowWidth } = useWindowDimensions();
  const twoColumnCharts = windowWidth >= 900;
  const accent = squadColorHex(squad.color);
  const showEmptyState =
    !loadingTeams && !teamsError && (selectedIds.length === 0 || selectedChartIds.length === 0);
  const canLoadCharts = selectedIds.length > 0 && selectedChartIds.length > 0;

  useEffect(() => {
    let cancelled = false;

    async function loadSubTeams() {
      setLoadingTeams(true);
      setTeamsError(null);
      try {
        const data = await fetchSquadSubTeams(squad.id);
        if (!cancelled) {
          setSubTeams(data);
          setSelectedIds([]);
          setSelectedChartIds([]);
        }
      } catch (err) {
        if (!cancelled) {
          setTeamsError(err instanceof Error ? err.message : 'Failed to load teams');
        }
      } finally {
        if (!cancelled) {
          setLoadingTeams(false);
        }
      }
    }

    void loadSubTeams();
    return () => {
      cancelled = true;
    };
  }, [squad.id]);

  useEffect(() => {
    setHighlightedChartId(null);
  }, [selectedIds, selectedChartIds, squad.id]);

  useEffect(() => {
    draggingChartIdRef.current = draggingChartId;
  }, [draggingChartId]);

  useEffect(() => {
    if (!draggingChartId || Platform.OS !== 'web') {
      return;
    }

    function measureTargetIndex(clientX: number, clientY: number): number {
      const orderedIds = selectedChartIdsRef.current.filter((id) =>
        chartItemRefs.current.has(id),
      );
      if (orderedIds.length === 0) {
        return 0;
      }

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      for (let index = 0; index < orderedIds.length; index += 1) {
        const node = chartItemRefs.current.get(orderedIds[index]) as unknown as {
          getBoundingClientRect?: () => DOMRect;
        };

        if (!node || typeof node.getBoundingClientRect !== 'function') {
          continue;
        }

        const rect = node.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance =
          (clientX - centerX) * (clientX - centerX) +
          (clientY - centerY) * (clientY - centerY);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      }

      return bestIndex;
    }

    function onPointerMove(event: PointerEvent) {
      const activeId = draggingChartIdRef.current;
      if (!activeId) {
        return;
      }
      event.preventDefault();
      const targetIndex = measureTargetIndex(event.clientX, event.clientY);
      setSelectedChartIds((current) => moveChartId(current, activeId, targetIndex));
    }

    function onPointerUp() {
      setDraggingChartId(null);
    }

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [draggingChartId]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!canLoadCharts) {
        setStats([]);
        setStatsError(null);
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);
      setStatsError(null);
      try {
        const data = await fetchGameStatTimeSeries(squad.id, selectedIds);
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setStats([]);
          setStatsError(err instanceof Error ? err.message : 'Failed to load game stats');
        }
      } finally {
        if (!cancelled) {
          setLoadingStats(false);
        }
      }
    }

    void loadStats();
    return () => {
      cancelled = true;
    };
  }, [canLoadCharts, selectedIds, squad.id]);

  const chartModels = useMemo(() => {
    return getChartsByIds(selectedChartIds).map((chart) => ({
      id: chart.id,
      title: chart.title,
      ...buildChartSeries(chart, stats, subTeams, selectedIds),
    }));
  }, [selectedChartIds, stats, subTeams, selectedIds]);

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>← Sports Analytics</Text>
        </Pressable>
      </View>

      <LinearGradient
        colors={[accent, `${accent}99`, `${accent}22`, '#FFFFFF']}
        locations={[0, 0.22, 0.55, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.titleBar}
      >
        <Text style={styles.title}>{squad.name} Analytics</Text>
      </LinearGradient>

      <View style={styles.content}>
        {loadingTeams && (
          <View style={styles.loadingRow}>
            <ActivityIndicator color="#1E6FE8" />
            <Text style={styles.loadingText}>Loading teams…</Text>
          </View>
        )}

        {!loadingTeams && teamsError && <Text style={styles.errorText}>{teamsError}</Text>}

        {!loadingTeams && !teamsError && (
          <>
            <View style={styles.filters}>
              <SubTeamCombobox
                options={subTeams}
                selectedIds={selectedIds}
                onChange={setSelectedIds}
              />
              <MetricChartsCombobox
                selectedChartIds={selectedChartIds}
                onChange={setSelectedChartIds}
              />
            </View>

            {showEmptyState && (
              <View style={styles.emptyState} accessibilityRole="text">
                <PieChartIcon color="#1E6FE8" />
                <Text style={styles.emptyStateText}>
                  Select team(s) and graphs to analyze
                </Text>
              </View>
            )}

            {canLoadCharts && loadingStats && (
              <View style={styles.loadingRow}>
                <ActivityIndicator color="#1E6FE8" />
                <Text style={styles.loadingText}>Loading game stats…</Text>
              </View>
            )}

            {canLoadCharts && !loadingStats && statsError && (
              <Text style={styles.errorText}>{statsError}</Text>
            )}

            {canLoadCharts && !loadingStats && !statsError && stats.length === 0 && (
              <Text style={styles.emptyStatsText}>
                No game stats found for the selected teams
              </Text>
            )}

            {canLoadCharts && !loadingStats && !statsError && stats.length > 0 && (
              <ScrollView
                style={styles.chartsScroll}
                contentContainerStyle={styles.chartsContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={draggingChartId == null}
              >
                {chartModels.map((chart) => (
                  <View
                    key={chart.id}
                    ref={(node) => {
                      if (node) {
                        chartItemRefs.current.set(chart.id, node);
                      } else {
                        chartItemRefs.current.delete(chart.id);
                      }
                    }}
                    style={[
                      styles.chartItem,
                      twoColumnCharts && styles.chartItemHalf,
                      draggingChartId === chart.id && styles.chartItemDragging,
                    ]}
                  >
                    <TimeSeriesChart
                      title={chart.title}
                      categories={chart.categories}
                      series={chart.series}
                      height={280}
                      highlighted={highlightedChartId === chart.id}
                      dragging={draggingChartId === chart.id}
                      onToggleHighlight={() =>
                        setHighlightedChartId((current) =>
                          current === chart.id ? null : chart.id,
                        )
                      }
                      onRemove={() =>
                        setSelectedChartIds((current) =>
                          current.filter((id) => id !== chart.id),
                        )
                      }
                      onDragHandlePointerDown={({ pointerId, target }) => {
                        if (
                          Platform.OS === 'web' &&
                          target &&
                          typeof (target as HTMLElement).setPointerCapture === 'function'
                        ) {
                          try {
                            (target as HTMLElement).setPointerCapture(pointerId);
                          } catch {
                            // Ignore capture failures on unsupported targets.
                          }
                        }
                        setHighlightedChartId(null);
                        setDraggingChartId(chart.id);
                      }}
                    />
                  </View>
                ))}
              </ScrollView>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 8,
  },
  back: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 4,
    cursor: 'pointer',
  },
  backText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    letterSpacing: 0.6,
    color: '#1E6FE8',
  },
  titleBar: {
    paddingHorizontal: 28,
    paddingVertical: 22,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontFamily: 'BebasNeue_400Regular',
    fontSize: 48,
    letterSpacing: 1.5,
    color: '#111827',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
    zIndex: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  loadingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: 'rgba(18, 58, 122, 0.65)',
  },
  errorText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: '#C62828',
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
    gap: 18,
  },
  emptyStateText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: 'rgba(18, 58, 122, 0.55)',
    textAlign: 'center',
    maxWidth: 280,
  },
  emptyStatsText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    color: 'rgba(18, 58, 122, 0.65)',
    marginTop: 24,
  },
  chartsScroll: {
    flex: 1,
    marginTop: 16,
  },
  chartsContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 40,
    alignItems: 'stretch',
  },
  chartItem: {
    width: '100%',
  },
  chartItemHalf: {
    width: '48.5%',
    maxWidth: '48.5%',
  },
  chartItemDragging: {
    zIndex: 5,
    opacity: 0.95,
  },
  pieIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    opacity: 0.85,
  },
});
