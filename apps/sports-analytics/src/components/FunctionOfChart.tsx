import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { TimeSeriesLine } from './TimeSeriesChart';

export type ScatterPoint = {
  value: [number, number];
  opponent: string | null;
};

export type ScatterSeries = {
  name: string;
  data: ScatterPoint[];
  role?: 'for' | 'against' | 'other';
};

type FunctionOfChartProps = {
  title: string;
  xAxisName: string;
  yAxisName: string;
  series: ScatterSeries[];
  height?: number;
  highlighted?: boolean;
  dragging?: boolean;
  onToggleHighlight?: () => void;
  onRemove?: () => void;
  onDragHandlePointerDown?: (event: {
    clientY: number;
    pointerId: number;
    target: unknown;
  }) => void;
};

type HoleRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function EyeIcon({ active }: { active: boolean }) {
  const color = active ? '#1E6FE8' : '#6B7280';
  return (
    <View accessibilityElementsHidden style={styles.icon}>
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
    <View accessibilityElementsHidden style={styles.icon}>
      <svg width={15} height={15} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 7h16" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
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
    <View accessibilityElementsHidden style={styles.icon}>
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
      accessibilityLabel="Exit highlight"
      onPress={onDismiss}
      style={[styles.overlay, { clipPath } as object]}
    />,
    document.body,
  );
}

function buildOption(
  xAxisName: string,
  yAxisName: string,
  series: ScatterSeries[],
): EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      formatter: (params: unknown) => {
        const point = params as {
          seriesName?: string;
          data?: ScatterPoint | [number, number];
          value?: [number, number];
        };
        const data = point.data;
        const value = Array.isArray(data)
          ? data
          : data && 'value' in data
            ? data.value
            : point.value;
        const [x, y] = value ?? [null, null];
        const opponent =
          data && !Array.isArray(data) && data.opponent ? data.opponent : null;
        const lines = [
          opponent ? `versus ${opponent}` : null,
          point.seriesName && point.seriesName !== 'For' ? point.seriesName : null,
          `${xAxisName}: ${x}`,
          `${yAxisName}: ${y}`,
        ].filter(Boolean);
        return lines.join('<br/>');
      },
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
      left: 48,
      right: 16,
      top: 44,
      bottom: 56,
    },
    xAxis: {
      type: 'value',
      name: xAxisName,
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
      },
      splitLine: {
        lineStyle: { color: '#E5E7EB' },
      },
      axisLabel: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
      },
    },
    yAxis: {
      type: 'value',
      name: yAxisName,
      nameLocation: 'middle',
      nameGap: 36,
      nameTextStyle: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
      },
      splitLine: {
        lineStyle: { color: '#E5E7EB' },
      },
      axisLabel: {
        fontFamily: 'DM Sans, sans-serif',
        color: '#6B7280',
      },
    },
    series: series.map((line) => ({
      name: line.name,
      type: 'scatter' as const,
      data: line.data,
      symbolSize: 10,
    })),
  };
}

export function buildScatterSeries(
  xSeries: TimeSeriesLine[],
  ySeries: TimeSeriesLine[],
  opponentsByIndex: (string | null)[],
): ScatterSeries[] {
  const yForSeries = ySeries.filter((line) => line.role === 'for');
  const xForSeries = xSeries.filter((line) => line.role === 'for');
  const result: ScatterSeries[] = [];

  for (const yLine of yForSeries) {
    const xLine =
      xForSeries.find((line) => line.name === yLine.name) ?? xForSeries[0];
    if (!xLine) {
      continue;
    }

    const data: ScatterPoint[] = [];
    const length = Math.min(xLine.data.length, yLine.data.length);
    for (let i = 0; i < length; i += 1) {
      const x = xLine.data[i];
      const y = yLine.data[i];
      if (x == null || y == null) {
        continue;
      }
      data.push({
        value: [x, y],
        opponent: opponentsByIndex[i] ?? null,
      });
    }

    if (data.length > 0) {
      result.push({
        name: yLine.name,
        data,
        role: 'for',
      });
    }
  }

  return result;
}

export default function FunctionOfChart({
  title,
  xAxisName,
  yAxisName,
  series,
  height = 280,
  highlighted = false,
  dragging = false,
  onToggleHighlight,
  onRemove,
  onDragHandlePointerDown,
}: FunctionOfChartProps) {
  const cardRef = useRef<View>(null);
  const [hole, setHole] = useState<HoleRect | null>(null);
  const [hoverHighlight, setHoverHighlight] = useState(false);
  const [hoverRemove, setHoverRemove] = useState(false);
  const [hoverDrag, setHoverDrag] = useState(false);
  const onToggleHighlightRef = useRef(onToggleHighlight);
  onToggleHighlightRef.current = onToggleHighlight;

  const option = useMemo(
    () => buildOption(xAxisName, yAxisName, series),
    [xAxisName, yAxisName, series],
  );

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
        <Text style={styles.fallbackText}>Charts are available on web.</Text>
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
        ]}
      >
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

            {onDragHandlePointerDown && (
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
    top: 2,
    backgroundColor: '#111827',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    whiteSpace: 'nowrap',
  } as object,
  tooltipText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  icon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'fixed' as unknown as 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(17, 24, 39, 0.55)',
    zIndex: 1000,
    cursor: 'pointer',
  } as object,
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 24,
  },
  fallbackText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    color: '#6B7280',
  },
});
