import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';
import type { PlayerPosition } from './types';

const STACK_OFFSET = 4;

type GridViewProps = {
  gridSize: number;
  playerPositions: PlayerPosition[];
  gridToSvg: (x: number, y: number) => { svgX: number; svgY: number };
  handleGridTap: (event: unknown) => void;
  historyPlayerId: string | null;
};

export default function GridView({
  gridSize,
  playerPositions,
  gridToSvg,
  handleGridTap,
  historyPlayerId,
}: GridViewProps) {
  if (gridSize <= 0) {
    return null;
  }

  const renderedSize = gridSize - 8;
  const isHistoryView = Boolean(historyPlayerId);

  const clusterMap = new Map<string, PlayerPosition[]>();
  if (!isHistoryView) {
    playerPositions.forEach((pos) => {
      const key = `${pos.x},${pos.y}`;
      if (!clusterMap.has(key)) {
        clusterMap.set(key, []);
      }
      clusterMap.get(key)!.push(pos);
    });
  }

  return (
    <View style={styles.root}>
      <View style={styles.center}>
        <Pressable
          onPress={handleGridTap}
          style={{ width: renderedSize, height: renderedSize }}
        >
          <Svg
            width={renderedSize}
            height={renderedSize}
            viewBox={`0 0 ${gridSize} ${gridSize}`}
            preserveAspectRatio="xMidYMid meet"
          >
            <Line
              x1={2}
              y1={gridSize - 2}
              x2={gridSize - 2}
              y2={gridSize - 2}
              stroke="#123A7A"
              strokeWidth="2"
            />
            <Line
              x1={2}
              y1={2}
              x2={2}
              y2={gridSize - 2}
              stroke="#123A7A"
              strokeWidth="2"
            />
            <Line
              x1={2}
              y1={2}
              x2={gridSize - 2}
              y2={2}
              stroke="#123A7A"
              strokeWidth="2"
            />
            <Line
              x1={gridSize - 2}
              y1={2}
              x2={gridSize - 2}
              y2={gridSize - 2}
              stroke="#123A7A"
              strokeWidth="2"
            />

            {Array.from({ length: 9 }).map((_, i) => {
              const yPos = 2 + (i + 1) * ((gridSize - 4) / 10);
              const isMiddleLine = i === 4;
              return (
                <Line
                  key={`h-${i}`}
                  x1={3.5}
                  y1={yPos}
                  x2={gridSize - 3.5}
                  y2={yPos}
                  stroke={isMiddleLine ? '#123A7A' : '#D6E8FF'}
                  strokeWidth={isMiddleLine ? '1.5' : '1'}
                />
              );
            })}

            {Array.from({ length: 9 }).map((_, i) => {
              const xPos = 2 + (i + 1) * ((gridSize - 4) / 10);
              const isMiddleLine = i === 4;
              return (
                <Line
                  key={`v-${i}`}
                  x1={xPos}
                  y1={3.5}
                  x2={xPos}
                  y2={gridSize - 3.5}
                  stroke={isMiddleLine ? '#123A7A' : '#D6E8FF'}
                  strokeWidth={isMiddleLine ? '1.5' : '1'}
                />
              );
            })}

            <SvgText
              x={gridSize - 15}
              y={gridSize - 15}
              fontSize="14"
              fill="#123A7A"
              fontWeight="bold"
              textAnchor="end"
            >
              Aptitude
            </SvgText>

            <SvgText
              x={18}
              y={52}
              fontSize="14"
              fill="#123A7A"
              fontWeight="bold"
              textAnchor="middle"
              transform="rotate(-90, 18, 52)"
            >
              Attitude
            </SvgText>

            {isHistoryView &&
              playerPositions.length > 1 &&
              playerPositions.slice(0, -1).map((position, index) => {
                const nextPosition = playerPositions[index + 1];
                if (!nextPosition) {
                  return null;
                }
                const { svgX: x1, svgY: y1 } = gridToSvg(position.x, position.y);
                const { svgX: x2, svgY: y2 } = gridToSvg(
                  nextPosition.x,
                  nextPosition.y,
                );
                return (
                  <Line
                    key={`line-${position.id}-${nextPosition.id}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#1E6FE8"
                    strokeWidth="1.5"
                  />
                );
              })}

            {isHistoryView &&
              playerPositions.map((position) => {
                const { svgX, svgY } = gridToSvg(position.x, position.y);
                return (
                  <G key={position.id}>
                    <Circle
                      cx={svgX}
                      cy={svgY}
                      r={10}
                      fill={position.color}
                      opacity={position.opacity || 1}
                    />
                    <SvgText
                      x={svgX}
                      y={svgY + 4}
                      fontSize={10}
                      fill="white"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {position.initial}
                    </SvgText>
                  </G>
                );
              })}

            {!isHistoryView &&
              Array.from(clusterMap.entries()).map(([key, cluster]) => {
                const { svgX, svgY } = gridToSvg(cluster[0].x, cluster[0].y);

                if (cluster.length === 1) {
                  const pos = cluster[0];
                  return (
                    <G key={pos.id}>
                      <Circle
                        cx={svgX}
                        cy={svgY}
                        r={12}
                        fill={pos.color}
                        opacity={pos.opacity || 1}
                      />
                      <SvgText
                        x={svgX}
                        y={svgY + 4}
                        fontSize={12}
                        fill="white"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {pos.initial}
                      </SvgText>
                    </G>
                  );
                }

                const visibleCards = cluster.slice(0, 3);
                const hiddenCount = cluster.length - visibleCards.length;
                return (
                  <G key={`cluster-${key}`}>
                    {[...visibleCards].reverse().map((pos, reversedIdx) => {
                      const stackIdx = visibleCards.length - 1 - reversedIdx;
                      const dx = stackIdx * STACK_OFFSET;
                      const dy = -(stackIdx * STACK_OFFSET);
                      return (
                        <G key={pos.id}>
                          <Circle
                            cx={svgX + dx}
                            cy={svgY + dy}
                            r={12}
                            fill={pos.color}
                            opacity={pos.opacity || 1}
                          />
                          <SvgText
                            x={svgX + dx}
                            y={svgY + dy + 4}
                            fontSize={12}
                            fill="white"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pos.initial}
                          </SvgText>
                        </G>
                      );
                    })}
                    {hiddenCount > 0 && (
                      <G>
                        <Circle
                          cx={svgX + 2 * STACK_OFFSET + 14}
                          cy={svgY - 2 * STACK_OFFSET - 14}
                          r={9}
                          fill="#123A7A"
                        />
                        <SvgText
                          x={svgX + 2 * STACK_OFFSET + 14}
                          y={svgY - 2 * STACK_OFFSET - 10}
                          fontSize={9}
                          fill="white"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          {`+${hiddenCount}`}
                        </SvgText>
                      </G>
                    )}
                  </G>
                );
              })}
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  center: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 0,
  },
});
