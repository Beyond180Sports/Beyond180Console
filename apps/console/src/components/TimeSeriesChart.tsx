import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

export type TimeSeriesLine = {
  name: string;
  data: (number | null)[];
  role?: 'for' | 'against' | 'other';
};

type ChartSeries = TimeSeriesLine & {
  type?: 'bar' | 'line';
  smooth?: boolean;
  showSymbol?: boolean;
  z?: number;
  lineStyle?: { width?: number; type?: 'solid' | 'dashed' };
  itemStyle?: { color?: string };
};

type TimeSeriesChartProps = {
  title: string;
  categories: string[];
  series: TimeSeriesLine[];
  height?: number;
  highlighted?: boolean;
  dragging?: boolean;
  asFunctionOfActive?: boolean;
  asFunctionOfPickTarget?: boolean;
  onToggleHighlight?: () => void;
  onRemove?: () => void;
  onAsFunctionOfPress?: () => void;
  onSelectAsFunctionOfTarget?: () => void;
  onDragHandlePointerDown?: (event: {
    clientY: number;
    pointerId: number;
    target: unknown;
  }) => void;
};

const ROLLING_AVG_COLOR = '#EA580C';

function cumulativeAverage(data: (number | null)[]): (number | null)[] {
  let sum = 0;
  let count = 0;
  return data.map((value) => {
    if (value == null) {
      return count === 0 ? null : Math.round((sum / count) * 10) / 10;
    }
    sum += value;
    count += 1;
    return Math.round((sum / count) * 10) / 10;
  });
}

function seriesForAverage(series: TimeSeriesLine[]): TimeSeriesLine[] {
  const forSeries = series.filter((line) => line.role === 'for');
  if (forSeries.length > 0) {
    return forSeries;
  }
  return series.filter((line) => line.role !== 'against');
}

function averageSeriesName(line: TimeSeriesLine): string {
  if (line.name === 'For' || line.name === 'For %') {
    return 'Average';
  }
  if (/ — For %?$/.test(line.name)) {
    return `${line.name.replace(/ — For %?$/, '')} — Average`;
  }
  if (line.name.includes(' — ')) {
    return `${line.name.split(' — ')[0]} — Average`;
  }
  return 'Average';
}

function averageOverlaySeries(series: TimeSeriesLine[]): ChartSeries[] {
  return seriesForAverage(series).map((line) => ({
    name: averageSeriesName(line),
    data: cumulativeAverage(line.data),
    type: 'line' as const,
    smooth: true,
    showSymbol: true,
    z: 10,
    lineStyle: { width: 2.5, type: 'solid' as const },
    itemStyle: { color: ROLLING_AVG_COLOR },
  }));
}

type HoleRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function EyeIcon({ active }: { active: boolean }) {
  const color = active ? '#1E6FE8' : '#6B7280';
  return (
    <View accessibilityElementsHidden style={styles.highlightIcon}>
      {/* RN Web supports inline SVG host elements */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M2.5 12s3.6-7 9.5-7 9.5 7 9.5 7-3.6 7-9.5 7-9.5-7-9.5-7Z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" stroke={color} strokeWidth={1.8} />
      </svg>
    </View>
  );
}

function TrashIcon() {
  const color = '#6B7280';
  return (
    <View accessibilityElementsHidden style={styles.highlightIcon}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 7h16"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M10 11v6M14 11v6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </svg>
    </View>
  );
}

function GripIcon() {
  const color = '#6B7280';
  return (
    <View accessibilityElementsHidden style={styles.highlightIcon}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="9" cy="7" r="1.5" fill={color} />
        <circle cx="15" cy="7" r="1.5" fill={color} />
        <circle cx="9" cy="12" r="1.5" fill={color} />
        <circle cx="15" cy="12" r="1.5" fill={color} />
        <circle cx="9" cy="17" r="1.5" fill={color} />
        <circle cx="15" cy="17" r="1.5" fill={color} />
      </svg>
    </View>
  );
}

function TrendIcon({ active }: { active: boolean }) {
  const color = active ? '#EA580C' : '#6B7280';
  return (
    <View accessibilityElementsHidden style={styles.highlightIcon}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 18V6"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M4 18h16"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
        />
        <path
          d="M7 14l4-4 3 2.5 5-6"
          stroke={color}
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </View>
  );
}

function FunctionOfIcon({ active }: { active: boolean }) {
  return (
    <Text
      accessibilityElementsHidden
      style={[styles.functionOfIconText, active && styles.functionOfIconTextActive]}
    >
      f(x)
    </Text>
  );
}

function buildOption(categories: string[], series: ChartSeries[]): EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      top: 4,
      type: 'scroll',
      textStyle: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#374151',
      },
    },
    grid: {
      left: 40,
      right: 16,
      top: 44,
      bottom: 64,
    },
    xAxis: {
      type: 'category',
      data: categories,
      boundaryGap: true,
      axisLabel: {
        hideOverlap: true,
        interval: 0,
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
        lineHeight: 16,
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: '#E5E7EB',
        },
      },
      axisLabel: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
      },
    },
    series: series.map((line) => ({
      name: line.name,
      type: line.type ?? 'bar',
      data: line.data,
      smooth: line.smooth,
      showSymbol: line.showSymbol,
      z: line.z,
      lineStyle: line.lineStyle,
      itemStyle: line.itemStyle,
    })),
  };
}

function HighlightOverlay({
  hole,
  onDismiss,
}: {
  hole: HoleRect;
  onDismiss: () => void;
}) {
  if (typeof document === 'undefined') {
    return null;
  }

  const { top, left, width, height } = hole;
  const clipPath = [
    'polygon(evenodd,',
    '0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,',
    `${left}px ${top}px,`,
    `${left}px ${top + height}px,`,
    `${left + width}px ${top + height}px,`,
    `${left + width}px ${top}px,`,
    `${left}px ${top}px)`,
  ].join(' ');

  return createPortal(
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Dismiss graph highlight"
      onPress={onDismiss}
      style={[
        styles.overlay,
        {
          // @ts-expect-error web-only CSS
          clipPath,
        },
      ]}
    />,
    document.body,
  );
}

export default function TimeSeriesChart({
  title,
  categories,
  series,
  height = 280,
  highlighted = false,
  dragging = false,
  asFunctionOfActive = false,
  asFunctionOfPickTarget = false,
  onToggleHighlight,
  onRemove,
  onAsFunctionOfPress,
  onSelectAsFunctionOfTarget,
  onDragHandlePointerDown,
}: TimeSeriesChartProps) {
  const cardRef = useRef<View>(null);
  const [hole, setHole] = useState<HoleRect | null>(null);
  const [hoverHighlight, setHoverHighlight] = useState(false);
  const [hoverRollingAvg, setHoverRollingAvg] = useState(false);
  const [hoverRemove, setHoverRemove] = useState(false);
  const [hoverDrag, setHoverDrag] = useState(false);
  const [hoverAsFunctionOf, setHoverAsFunctionOf] = useState(false);
  const [showRollingAverage, setShowRollingAverage] = useState(false);
  const onToggleHighlightRef = useRef(onToggleHighlight);
  onToggleHighlightRef.current = onToggleHighlight;
  const canShowAverage = seriesForAverage(series).length > 0;
  const option = useMemo(() => {
    const chartSeries: ChartSeries[] = [...series];
    if (showRollingAverage) {
      chartSeries.push(...averageOverlaySeries(series));
    }
    return buildOption(categories, chartSeries);
  }, [categories, series, showRollingAverage]);

  useEffect(() => {
    if (!highlighted || Platform.OS !== 'web') {
      setHole(null);
      return;
    }

    function measure() {
      const node = cardRef.current as unknown as {
        measureInWindow?: (
          callback: (x: number, y: number, w: number, h: number) => void,
        ) => void;
        getBoundingClientRect?: () => DOMRect;
      } | null;

      if (!node) {
        return;
      }

      if (typeof node.measureInWindow === 'function') {
        node.measureInWindow((x, y, w, h) => {
          setHole({ top: y, left: x, width: w, height: h });
        });
        return;
      }

      if (typeof node.getBoundingClientRect === 'function') {
        const rect = node.getBoundingClientRect();
        setHole({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onToggleHighlightRef.current?.();
      }
    }

    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [highlighted]);

  if (Platform.OS !== 'web') {
    return (
      <View style={[styles.fallback, { minHeight: height }]}>
        <Text style={styles.fallbackText}>
          Charts are available on web.
        </Text>
      </View>
    );
  }

  return (
    <>
      {highlighted && hole && onToggleHighlight && (
        <HighlightOverlay hole={hole} onDismiss={onToggleHighlight} />
      )}

      <View
        ref={cardRef}
        style={[
          styles.card,
          highlighted && styles.cardHighlighted,
          dragging && styles.cardDragging,
          asFunctionOfActive && styles.cardAsFunctionOfSource,
          asFunctionOfPickTarget && styles.cardAsFunctionOfTarget,
        ]}
      >
        {asFunctionOfPickTarget && onSelectAsFunctionOfTarget && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Use ${title} as x-axis`}
            onPress={onSelectAsFunctionOfTarget}
            style={styles.pickTargetOverlay}
          />
        )}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <View style={styles.toolbar}>
            <View style={styles.toolButtonWrap}>
              {hoverHighlight && (
                <View style={styles.tooltip} pointerEvents="none">
                  <Text style={styles.tooltipText}>Highlight graph</Text>
                </View>
              )}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={highlighted ? 'Exit highlight' : 'Highlight graph'}
                accessibilityState={{ selected: highlighted }}
                onPress={onToggleHighlight}
                onHoverIn={() => setHoverHighlight(true)}
                onHoverOut={() => setHoverHighlight(false)}
                style={({ pressed }) => [
                  styles.toolButton,
                  highlighted && styles.toolButtonActive,
                  pressed && styles.toolButtonPressed,
                ]}
              >
                <EyeIcon active={highlighted} />
              </Pressable>
            </View>

            {canShowAverage && (
              <View style={styles.toolButtonWrap}>
                {hoverRollingAvg && (
                  <View style={styles.tooltip} pointerEvents="none">
                    <Text style={styles.tooltipText}>
                      {showRollingAverage
                        ? 'Hide average'
                        : 'Average (all games)'}
                    </Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showRollingAverage
                      ? 'Hide average'
                      : 'Show average across all games'
                  }
                  accessibilityState={{ selected: showRollingAverage }}
                  onPress={() => setShowRollingAverage((current) => !current)}
                  onHoverIn={() => setHoverRollingAvg(true)}
                  onHoverOut={() => setHoverRollingAvg(false)}
                  style={({ pressed }) => [
                    styles.toolButton,
                    showRollingAverage && styles.toolButtonRollingActive,
                    pressed && styles.toolButtonPressed,
                  ]}
                >
                  <TrendIcon active={showRollingAverage} />
                </Pressable>
              </View>
            )}

            {onAsFunctionOfPress && (
              <View style={styles.toolButtonWrap}>
                {hoverAsFunctionOf && (
                  <View style={styles.tooltip} pointerEvents="none">
                    <Text style={styles.tooltipText}>
                      {asFunctionOfActive
                        ? 'Cancel as a function of'
                        : 'As a function of'}
                    </Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    asFunctionOfActive
                      ? 'Cancel as a function of'
                      : 'As a function of'
                  }
                  accessibilityState={{ selected: asFunctionOfActive }}
                  onPress={onAsFunctionOfPress}
                  onHoverIn={() => setHoverAsFunctionOf(true)}
                  onHoverOut={() => setHoverAsFunctionOf(false)}
                  style={({ pressed }) => [
                    styles.toolButton,
                    asFunctionOfActive && styles.toolButtonActive,
                    pressed && styles.toolButtonPressed,
                  ]}
                >
                  <FunctionOfIcon active={asFunctionOfActive} />
                </Pressable>
              </View>
            )}

            {onRemove && (
              <View style={styles.toolButtonWrap}>
                {hoverRemove && (
                  <View style={styles.tooltip} pointerEvents="none">
                    <Text style={styles.tooltipText}>Remove graph</Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove graph"
                  onPress={onRemove}
                  onHoverIn={() => setHoverRemove(true)}
                  onHoverOut={() => setHoverRemove(false)}
                  style={({ pressed }) => [
                    styles.toolButton,
                    pressed && styles.toolButtonPressed,
                  ]}
                >
                  <TrashIcon />
                </Pressable>
              </View>
            )}

            {onDragHandlePointerDown && !asFunctionOfPickTarget && (
              <View style={styles.toolButtonWrap}>
                {hoverDrag && !dragging && (
                  <View style={styles.tooltip} pointerEvents="none">
                    <Text style={styles.tooltipText}>Drag to reorder</Text>
                  </View>
                )}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Drag to reorder"
                  onHoverIn={() => setHoverDrag(true)}
                  onHoverOut={() => setHoverDrag(false)}
                  onPointerDown={(event) => {
                    const native = event.nativeEvent as {
                      clientY?: number;
                      pageY?: number;
                      pointerId?: number;
                    };
                    onDragHandlePointerDown({
                      clientY: native.clientY ?? native.pageY ?? 0,
                      pointerId: native.pointerId ?? 0,
                      target: event.currentTarget,
                    });
                  }}
                  style={({ pressed }) => [
                    styles.toolButton,
                    styles.dragHandle,
                    dragging && styles.toolButtonActive,
                    pressed && styles.toolButtonPressed,
                  ]}
                >
                  <GripIcon />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <ReactECharts
          option={option}
          style={{ height, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge
          lazyUpdate
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingTop: 12,
    paddingHorizontal: 8,
    paddingBottom: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHighlighted: {
    borderColor: '#1E6FE8',
    boxShadow: '0 12px 40px rgba(18, 58, 122, 0.22)',
  } as object,
  cardDragging: {
    opacity: 0.72,
    borderColor: '#1E6FE8',
    boxShadow: '0 16px 36px rgba(18, 58, 122, 0.2)',
  } as object,
  cardAsFunctionOfSource: {
    borderColor: '#1E6FE8',
    boxShadow: '0 0 0 1px rgba(30, 111, 232, 0.35)',
  } as object,
  cardAsFunctionOfTarget: {
    borderColor: '#93C5FD',
    cursor: 'pointer',
  } as object,
  pickTargetOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    cursor: 'pointer',
  } as object,
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 8,
    marginBottom: 4,
    zIndex: 2,
  },
  title: {
    flex: 1,
    fontFamily: 'DMSans_700Bold',
    fontSize: 16,
    color: '#123A7A',
    paddingTop: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolButtonWrap: {
    position: 'relative',
    zIndex: 3,
  },
  toolButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
  } as object,
  toolButtonActive: {
    borderColor: '#1E6FE8',
    backgroundColor: 'rgba(30, 111, 232, 0.08)',
  },
  toolButtonRollingActive: {
    borderColor: '#EA580C',
    backgroundColor: 'rgba(234, 88, 12, 0.1)',
  },
  toolButtonPressed: {
    opacity: 0.75,
  },
  dragHandle: {
    cursor: 'grab',
    // @ts-expect-error web-only
    touchAction: 'none',
    userSelect: 'none',
  } as object,
  tooltip: {
    position: 'absolute',
    right: 40,
    top: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#111827',
  },
  tooltipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  highlightIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  functionOfIconText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    letterSpacing: -0.2,
    color: '#6B7280',
  },
  functionOfIconTextActive: {
    color: '#1E6FE8',
  },
  overlay: {
    position: 'fixed' as unknown as 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(8, 12, 22, 0.84)',
    zIndex: 1000,
    cursor: 'pointer',
  } as object,
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
  },
  fallbackText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.65)',
  },
});
