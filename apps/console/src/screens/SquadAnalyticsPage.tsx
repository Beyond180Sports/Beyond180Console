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
import FunctionOfChart, { buildScatterSeries } from '../components/FunctionOfChart';
import TimeSeriesChart, { type TimeSeriesLine } from '../components/TimeSeriesChart';
import {
  chartRowsEqual,
  flattenChartRows,
  getChartsByIds,
  moveChartInRows,
  reconcileChartRows,
  removeChartFromRows,
  type ChartDropTarget,
  type ChartRows,
  type MetricChartDef,
} from '../lib/metricCategories';

type SquadAnalyticsPageProps = {
  squad: SquadRecord;
  onBack: () => void;
};

type AnalyticsSection = 'time-series' | 'plots';

type FunctionPlotSpec = {
  id: string;
  yChartId: string;
  xChartId: string;
};

const ANALYTICS_TABS: { id: AnalyticsSection; label: string }[] = [
  { id: 'time-series', label: 'Time series' },
  { id: 'plots', label: 'Plots' },
];

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

function readChartRect(
  chartItemRefs: Map<string, View>,
  chartId: string,
): DOMRect | null {
  const node = chartItemRefs.get(chartId) as unknown as {
    getBoundingClientRect?: () => DOMRect;
  };
  if (!node || typeof node.getBoundingClientRect !== 'function') {
    return null;
  }
  return node.getBoundingClientRect();
}

function measureChartDropTarget(
  clientX: number,
  clientY: number,
  rows: ChartRows,
  chartItemRefs: Map<string, View>,
): ChartDropTarget {
  if (rows.length === 0) {
    return { kind: 'row', rowIndex: 0 };
  }

  const bounds = rows.map((row) => {
    let left = Number.POSITIVE_INFINITY;
    let top = Number.POSITIVE_INFINITY;
    let right = Number.NEGATIVE_INFINITY;
    let bottom = Number.NEGATIVE_INFINITY;
    let found = false;
    for (const id of row) {
      const rect = readChartRect(chartItemRefs, id);
      if (!rect) {
        continue;
      }
      found = true;
      left = Math.min(left, rect.left);
      top = Math.min(top, rect.top);
      right = Math.max(right, rect.right);
      bottom = Math.max(bottom, rect.bottom);
    }
    return found ? { left, top, right, bottom } : null;
  });

  for (let i = 0; i < bounds.length; i += 1) {
    const current = bounds[i];
    const next = bounds[i + 1];
    if (!current) {
      continue;
    }
    if (next) {
      if (clientY >= current.bottom && clientY <= next.top) {
        return { kind: 'row', rowIndex: i + 1 };
      }
    } else {
      const edge = Math.min(48, Math.max(24, (current.bottom - current.top) * 0.22));
      if (clientY >= current.bottom - edge) {
        return { kind: 'row', rowIndex: rows.length };
      }
    }
  }

  const first = bounds[0];
  if (first) {
    const edge = Math.min(48, Math.max(24, (first.bottom - first.top) * 0.22));
    if (clientY <= first.top + edge) {
      return { kind: 'row', rowIndex: 0 };
    }
  }

  let bestRow = 0;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let i = 0; i < bounds.length; i += 1) {
    const box = bounds[i];
    if (!box) {
      continue;
    }
    const centerY = (box.top + box.bottom) / 2;
    const distance = Math.abs(clientY - centerY);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestRow = i;
    }
  }

  const row = rows[bestRow];
  const box = bounds[bestRow];
  if (!row || !box) {
    return { kind: 'row', rowIndex: rows.length };
  }

  if (row.length === 1) {
    const midX = box.left + (box.right - box.left) * 0.58;
    return {
      kind: 'beside',
      rowIndex: bestRow,
      slotIndex: clientX > midX ? 1 : 0,
    };
  }

  let bestSlot: 0 | 1 = 0;
  let bestSlotDistance = Number.POSITIVE_INFINITY;
  for (let slot = 0; slot < row.length; slot += 1) {
    const rect = readChartRect(chartItemRefs, row[slot]);
    if (!rect) {
      continue;
    }
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance =
      (clientX - centerX) * (clientX - centerX) + (clientY - centerY) * (clientY - centerY);
    if (distance < bestSlotDistance) {
      bestSlotDistance = distance;
      bestSlot = slot as 0 | 1;
    }
  }

  return { kind: 'beside', rowIndex: bestRow, slotIndex: bestSlot };
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
  const [chartRows, setChartRows] = useState<ChartRows>([]);
  const [stats, setStats] = useState<GameStatTimePoint[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingStats, setLoadingStats] = useState(false);
  const [teamsError, setTeamsError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [highlightedChartId, setHighlightedChartId] = useState<string | null>(null);
  const [draggingChartId, setDraggingChartId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AnalyticsSection>('time-series');
  const [pickingAsFunctionOfId, setPickingAsFunctionOfId] = useState<string | null>(null);
  const [functionPlots, setFunctionPlots] = useState<FunctionPlotSpec[]>([]);
  const [functionPlotRows, setFunctionPlotRows] = useState<ChartRows>([]);
  const [highlightedFunctionPlotId, setHighlightedFunctionPlotId] = useState<string | null>(
    null,
  );
  const [draggingFunctionPlotId, setDraggingFunctionPlotId] = useState<string | null>(null);
  const chartItemRefs = useRef(new Map<string, View>());
  const functionPlotItemRefs = useRef(new Map<string, View>());
  const draggingChartIdRef = useRef<string | null>(null);
  const draggingFunctionPlotIdRef = useRef<string | null>(null);
  const chartRowsRef = useRef(chartRows);
  chartRowsRef.current = chartRows;
  const functionPlotRowsRef = useRef(functionPlotRows);
  functionPlotRowsRef.current = functionPlotRows;
  const selectedChartIds = useMemo(() => flattenChartRows(chartRows), [chartRows]);
  const { width: windowWidth } = useWindowDimensions();
  const twoColumnCharts = windowWidth >= 900;
  const accent = squadColorHex(squad.color);
  const showEmptyState =
    !loadingTeams && !teamsError && (selectedIds.length === 0 || selectedChartIds.length === 0);
  const canLoadCharts = selectedIds.length > 0 && selectedChartIds.length > 0;
  const canLoadStats = selectedIds.length > 0;

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
          setChartRows([]);
          setFunctionPlots([]);
          setFunctionPlotRows([]);
          setPickingAsFunctionOfId(null);
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
    if (activeSection !== 'time-series') {
      setDraggingChartId(null);
      setPickingAsFunctionOfId(null);
      setHighlightedChartId(null);
    }
    if (activeSection !== 'plots') {
      setDraggingFunctionPlotId(null);
      setHighlightedFunctionPlotId(null);
    }
  }, [activeSection]);

  useEffect(() => {
    setHighlightedChartId(null);
    setHighlightedFunctionPlotId(null);
  }, [selectedIds, selectedChartIds, squad.id]);

  useEffect(() => {
    draggingChartIdRef.current = draggingChartId;
  }, [draggingChartId]);

  useEffect(() => {
    draggingFunctionPlotIdRef.current = draggingFunctionPlotId;
  }, [draggingFunctionPlotId]);

  useEffect(() => {
    if (!pickingAsFunctionOfId || Platform.OS !== 'web') {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setPickingAsFunctionOfId(null);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [pickingAsFunctionOfId]);

  useEffect(() => {
    if (!draggingChartId || Platform.OS !== 'web') {
      return;
    }

    function onPointerMove(event: PointerEvent) {
      const activeId = draggingChartIdRef.current;
      if (!activeId) {
        return;
      }
      event.preventDefault();
      const rowsWithoutActive = removeChartFromRows(chartRowsRef.current, activeId);
      const target = measureChartDropTarget(
        event.clientX,
        event.clientY,
        rowsWithoutActive,
        chartItemRefs.current,
      );
      setChartRows((current) => {
        const next = moveChartInRows(current, activeId, target);
        return chartRowsEqual(current, next) ? current : next;
      });
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
    if (!draggingFunctionPlotId || Platform.OS !== 'web') {
      return;
    }

    function onPointerMove(event: PointerEvent) {
      const activeId = draggingFunctionPlotIdRef.current;
      if (!activeId) {
        return;
      }
      event.preventDefault();
      const rowsWithoutActive = removeChartFromRows(functionPlotRowsRef.current, activeId);
      const target = measureChartDropTarget(
        event.clientX,
        event.clientY,
        rowsWithoutActive,
        functionPlotItemRefs.current,
      );
      setFunctionPlotRows((current) => {
        const next = moveChartInRows(current, activeId, target);
        return chartRowsEqual(current, next) ? current : next;
      });
    }

    function onPointerUp() {
      setDraggingFunctionPlotId(null);
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
  }, [draggingFunctionPlotId]);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      if (!canLoadStats) {
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
  }, [canLoadStats, selectedIds, squad.id]);

  const chartModels = useMemo(() => {
    return getChartsByIds(selectedChartIds).map((chart) => ({
      id: chart.id,
      title: chart.title,
      ...buildChartSeries(chart, stats, subTeams, selectedIds),
    }));
  }, [selectedChartIds, stats, subTeams, selectedIds]);

  const chartModelsById = useMemo(() => {
    return new Map(chartModels.map((chart) => [chart.id, chart]));
  }, [chartModels]);

  const functionPlotModels = useMemo(() => {
    const dateKeys = [
      ...new Set(stats.map((row) => row.Event.startDateTime)),
    ].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const opponentsByIndex = dateKeys.map((dateKey) => opponentForDate(stats, dateKey));

    return functionPlots.flatMap((plot) => {
      const defs = getChartsByIds([plot.yChartId, plot.xChartId]);
      const yDef = defs.find((chart) => chart.id === plot.yChartId);
      const xDef = defs.find((chart) => chart.id === plot.xChartId);
      if (!yDef || !xDef) {
        return [];
      }
      const yBuilt = buildChartSeries(yDef, stats, subTeams, selectedIds);
      const xBuilt = buildChartSeries(xDef, stats, subTeams, selectedIds);
      return [
        {
          id: plot.id,
          title: `${yDef.title} as a function of ${xDef.title}`,
          xAxisName: xDef.title,
          yAxisName: yDef.title,
          series: buildScatterSeries(xBuilt.series, yBuilt.series, opponentsByIndex),
        },
      ];
    });
  }, [functionPlots, stats, subTeams, selectedIds]);

  const functionPlotModelsById = useMemo(() => {
    return new Map(functionPlotModels.map((plot) => [plot.id, plot]));
  }, [functionPlotModels]);

  function createFunctionPlot(yChartId: string, xChartId: string) {
    if (yChartId === xChartId) {
      return;
    }
    const id = `fn-${yChartId}__${xChartId}__${Date.now()}`;
    setFunctionPlots((current) => [...current, { id, yChartId, xChartId }]);
    setFunctionPlotRows((current) => {
      const next = current.map((row) => [...row]);
      const last = next[next.length - 1];
      if (last && last.length === 1) {
        last.push(id);
      } else {
        next.push([id]);
      }
      return next;
    });
    setPickingAsFunctionOfId(null);
    setHighlightedChartId(null);
    setActiveSection('plots');
  }

  function removeFunctionPlot(plotId: string) {
    setFunctionPlots((current) => current.filter((plot) => plot.id !== plotId));
    setFunctionPlotRows((current) => removeChartFromRows(current, plotId));
    setHighlightedFunctionPlotId((current) => (current === plotId ? null : current));
  }

  return (
    <View style={styles.root}>
      <View style={styles.topBar}>
        <Pressable accessibilityRole="button" onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>← Data Analytics Dashboard</Text>
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
            <View
              accessibilityRole="tablist"
              style={styles.tabBar}
            >
              {ANALYTICS_TABS.map((tab) => {
                const selected = activeSection === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected }}
                    onPress={() => setActiveSection(tab.id)}
                    style={[styles.tab, selected && styles.tabSelected]}
                  >
                    <Text style={[styles.tabText, selected && styles.tabTextSelected]}>
                      {tab.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={[
                styles.sectionPane,
                activeSection !== 'time-series' && styles.sectionPaneHidden,
              ]}
              pointerEvents={activeSection === 'time-series' ? 'auto' : 'none'}
            >
                <View style={styles.filters}>
                  <SubTeamCombobox
                    options={subTeams}
                    selectedIds={selectedIds}
                    onChange={setSelectedIds}
                  />
                  <MetricChartsCombobox
                    selectedChartIds={selectedChartIds}
                    onChange={(nextIds) =>
                      setChartRows((current) => reconcileChartRows(current, nextIds))
                    }
                  />
                </View>

                {pickingAsFunctionOfId && (
                  <View style={styles.pickBanner}>
                    <Text style={styles.pickBannerText}>
                      Click another graph to plot as a function of it
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setPickingAsFunctionOfId(null)}
                      style={styles.pickBannerCancel}
                    >
                      <Text style={styles.pickBannerCancelText}>Cancel</Text>
                    </Pressable>
                  </View>
                )}

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
                    {chartRows.map((row, rowIndex) => (
                      <View key={`chart-row-${rowIndex}`} style={styles.chartRow}>
                        {row.map((chartId) => {
                          const chart = chartModelsById.get(chartId);
                          if (!chart) {
                            return null;
                          }
                          const aloneInRow = !twoColumnCharts || row.length === 1;
                          return (
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
                                !aloneInRow && styles.chartItemHalf,
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
                                asFunctionOfActive={pickingAsFunctionOfId === chart.id}
                                asFunctionOfPickTarget={
                                  pickingAsFunctionOfId != null &&
                                  pickingAsFunctionOfId !== chart.id
                                }
                                onToggleHighlight={() =>
                                  setHighlightedChartId((current) =>
                                    current === chart.id ? null : chart.id,
                                  )
                                }
                                onAsFunctionOfPress={() => {
                                  setHighlightedChartId(null);
                                  setPickingAsFunctionOfId((current) =>
                                    current === chart.id ? null : chart.id,
                                  );
                                }}
                                onSelectAsFunctionOfTarget={() => {
                                  if (pickingAsFunctionOfId) {
                                    createFunctionPlot(pickingAsFunctionOfId, chart.id);
                                  }
                                }}
                                onRemove={() =>
                                  setChartRows((current) =>
                                    removeChartFromRows(current, chart.id),
                                  )
                                }
                                onDragHandlePointerDown={({ pointerId, target }) => {
                                  if (pickingAsFunctionOfId) {
                                    return;
                                  }
                                  if (
                                    Platform.OS === 'web' &&
                                    target &&
                                    typeof (target as HTMLElement).setPointerCapture ===
                                      'function'
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
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>
                )}
            </View>

            <View
              style={[
                styles.sectionPane,
                activeSection !== 'plots' && styles.sectionPaneHidden,
              ]}
              pointerEvents={activeSection === 'plots' ? 'auto' : 'none'}
            >
                {functionPlotRows.length === 0 && (
                  <View style={styles.emptyState} accessibilityRole="text">
                    <Text style={styles.emptyStateText}>
                      Use “As a function of” on a time series graph to create a plot
                    </Text>
                  </View>
                )}

                {functionPlotRows.length > 0 && (
                  <ScrollView
                    style={styles.chartsScroll}
                    contentContainerStyle={styles.chartsContent}
                    showsVerticalScrollIndicator={false}
                    scrollEnabled={draggingFunctionPlotId == null}
                  >
                    {functionPlotRows.map((row, rowIndex) => (
                      <View key={`function-row-${rowIndex}`} style={styles.chartRow}>
                        {row.map((plotId) => {
                          const plot = functionPlotModelsById.get(plotId);
                          if (!plot) {
                            return null;
                          }
                          const aloneInRow = !twoColumnCharts || row.length === 1;
                          return (
                            <View
                              key={plot.id}
                              ref={(node) => {
                                if (node) {
                                  functionPlotItemRefs.current.set(plot.id, node);
                                } else {
                                  functionPlotItemRefs.current.delete(plot.id);
                                }
                              }}
                              style={[
                                styles.chartItem,
                                !aloneInRow && styles.chartItemHalf,
                                draggingFunctionPlotId === plot.id &&
                                  styles.chartItemDragging,
                              ]}
                            >
                              <FunctionOfChart
                                title={plot.title}
                                xAxisName={plot.xAxisName}
                                yAxisName={plot.yAxisName}
                                series={plot.series}
                                height={280}
                                highlighted={highlightedFunctionPlotId === plot.id}
                                dragging={draggingFunctionPlotId === plot.id}
                                onToggleHighlight={() =>
                                  setHighlightedFunctionPlotId((current) =>
                                    current === plot.id ? null : plot.id,
                                  )
                                }
                                onRemove={() => removeFunctionPlot(plot.id)}
                                onDragHandlePointerDown={({ pointerId, target }) => {
                                  if (
                                    Platform.OS === 'web' &&
                                    target &&
                                    typeof (target as HTMLElement).setPointerCapture ===
                                      'function'
                                  ) {
                                    try {
                                      (target as HTMLElement).setPointerCapture(pointerId);
                                    } catch {
                                      // Ignore capture failures on unsupported targets.
                                    }
                                  }
                                  setHighlightedFunctionPlotId(null);
                                  setDraggingFunctionPlotId(plot.id);
                                }}
                              />
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </ScrollView>
                )}
            </View>
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
  tabBar: {
    flexDirection: 'row',
    gap: 28,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
    marginBottom: 20,
  },
  tab: {
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
    cursor: 'pointer',
  },
  tabSelected: {
    borderBottomColor: '#1E6FE8',
  },
  tabText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    letterSpacing: 0.2,
    color: 'rgba(18, 58, 122, 0.45)',
  },
  tabTextSelected: {
    fontFamily: 'DMSans_700Bold',
    color: '#1E6FE8',
  },
  sectionPane: {
    flex: 1,
  },
  sectionPaneHidden: {
    display: 'none',
  },
  pickBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 111, 232, 0.28)',
    backgroundColor: 'rgba(30, 111, 232, 0.06)',
    borderRadius: 10,
  },
  pickBannerText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#123A7A',
  },
  pickBannerCancel: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    cursor: 'pointer',
  },
  pickBannerCancelText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#1E6FE8',
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
    flexDirection: 'column',
    gap: 16,
    paddingBottom: 40,
  },
  chartRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    width: '100%',
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
