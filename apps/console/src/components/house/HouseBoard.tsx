import { useEffect, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  deleteHouseMarker,
  fetchSquadSubTeams,
  fetchTeamPlayers,
  getTeamHouseMarkers,
  isOnOrBeforeFilterDate,
  normalizeFilterDate,
  saveHouseMarker,
  updateHouseMarker,
  type HouseMarker,
  type HouseMarkerInsert,
  type PlayerRecord,
  type SubTeamOption,
} from '@beyond180/shared';
import AddPlayerDropdown from './AddPlayerDropdown';
import ConfirmDialog from './ConfirmDialog';
import FilterDropdown from './FilterDropdown';
import GridView from './GridView';
import HouseDateFilterButton from './HouseDateFilterButton';
import ListView from './ListView';
import MarkerActionModal from './MarkerActionModal';
import MarkerModal from './MarkerModal';
import PlayerSearchDropdown from './PlayerSearchDropdown';
import type { HouseBoardProps, PlayerPosition } from './types';

const roundToStep = (value: number): number => Math.round(value / 5) * 5;

const getPlayerInitials = (firstName: string, lastName: string) =>
  `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

const PLAYER_COLORS = [
  '#EF4444',
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#8B5CF6',
  '#EC4899',
];

export default function HouseBoard({ teamId, header }: HouseBoardProps) {
  const [selectedSubteam, setSelectedSubteam] = useState<string | null>(null);
  const [selectedPlayerFilter, setSelectedPlayerFilter] = useState<string | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [players, setPlayers] = useState<PlayerRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const [deleteMarkerDialog, setDeleteMarkerDialog] = useState<{
    visible: boolean;
    markerId: string | null;
  }>({ visible: false, markerId: null });
  const [markerActionDialog, setMarkerActionDialog] = useState<{
    visible: boolean;
    markers: HouseMarker[];
    x: number;
    y: number;
    showAddNew: boolean;
    mode: 'edit' | 'filter';
  }>({
    visible: false,
    markers: [],
    x: 0,
    y: 0,
    showAddNew: true,
    mode: 'edit',
  });

  const [gridAreaSize, setGridAreaSize] = useState({ width: 0, height: 0 });
  const [playerPositions, setPlayerPositions] = useState<PlayerPosition[]>([]);
  const [teamMarkers, setTeamMarkers] = useState<HouseMarker[]>([]);
  const [subteams, setSubteams] = useState<SubTeamOption[]>([]);

  const [markerModalVisible, setMarkerModalVisible] = useState(false);
  const [newMarker, setNewMarker] = useState<HouseMarkerInsert | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingMarkerId, setEditingMarkerId] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [aptitudeValue, setAptitudeValue] = useState(0);
  const [attitudeValue, setAttitudeValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(() =>
    normalizeFilterDate(new Date()),
  );
  const [markerDate, setMarkerDate] = useState<Date>(new Date());

  const handleDateFilterChange = (date: Date | null) => {
    setSelectedDate(date ? normalizeFilterDate(date) : null);
  };

  const getPlayersInSelectedTeams = () => {
    if (!selectedSubteam) {
      return [...players].sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
    }

    const subteam = subteams.find((team) => team.id === selectedSubteam);
    const playerIdSet = new Set(subteam?.playerIds ?? []);

    return players
      .filter((player) => playerIdSet.has(player.id))
      .sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`,
        ),
      );
  };

  const getVisiblePlayers = () => {
    const teamPlayers = getPlayersInSelectedTeams();
    if (!selectedPlayerFilter) {
      return teamPlayers;
    }
    return teamPlayers.filter((player) => player.id === selectedPlayerFilter);
  };

  const getVisiblePlayerIds = () => getVisiblePlayers().map((player) => player.id);
  const getHistoryPlayerId = () => selectedPlayerFilter;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      try {
        const [markers, teamPlayers, teamSubteams] = await Promise.all([
          getTeamHouseMarkers(teamId),
          fetchTeamPlayers(teamId),
          fetchSquadSubTeams(teamId),
        ]);
        if (cancelled) {
          return;
        }
        setTeamMarkers(markers);
        setPlayers(teamPlayers);
        setSubteams(teamSubteams);
      } catch (error) {
        console.error('Error loading house data:', error);
        if (!cancelled) {
          Alert.alert('Error', 'Failed to load house board');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [teamId]);

  useEffect(() => {
    if (!players.length) {
      return;
    }
    const validPlayerIds = new Set(
      getPlayersInSelectedTeams().map((player) => player.id),
    );
    setSelectedPlayerFilter((current) => {
      if (!current || validPlayerIds.has(current)) {
        return current;
      }
      return null;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSubteam, subteams, players]);

  useEffect(() => {
    syncGridFromMarkers(teamMarkers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    teamMarkers,
    selectedSubteam,
    selectedPlayerFilter,
    selectedDate,
    players,
    subteams,
  ]);

  const syncGridFromMarkers = (markers: HouseMarker[]) => {
    if (!markers.length) {
      setPlayerPositions((prev) => (prev.length === 0 ? prev : []));
      return;
    }

    const historyPlayerId = getHistoryPlayerId();

    if (historyPlayerId) {
      const player = players.find((p) => p.id === historyPlayerId);
      if (!player) {
        setPlayerPositions([]);
        return;
      }

      const playerName = `${player.firstName} ${player.lastName}`;
      const playerMarkers = markers
        .filter((marker) => marker.playerRecordId === historyPlayerId)
        .filter((marker) =>
          isOnOrBeforeFilterDate(marker.createdAt, selectedDate),
        )
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

      if (!playerMarkers.length) {
        setPlayerPositions([]);
        return;
      }

      setPlayerPositions(
        playerMarkers.map((marker, index) => ({
          id: marker.id || `${marker.playerRecordId}-${index}`,
          name: playerName,
          x: marker.x,
          y: marker.y,
          color: index === 0 ? '#EF4444' : '#3B82F6',
          date: new Date(marker.createdAt),
          opacity: Math.max(
            0.3,
            1 - index * (0.7 / Math.min(playerMarkers.length, 10)),
          ),
          initial: getPlayerInitials(player.firstName, player.lastName),
          playerRecordId: marker.playerRecordId,
        })),
      );
      return;
    }

    const visiblePlayerIds = new Set(getVisiblePlayerIds());
    const latestMarkerByPlayer = new Map<string, HouseMarker>();

    markers.forEach((marker) => {
      if (!visiblePlayerIds.has(marker.playerRecordId)) {
        return;
      }
      if (!isOnOrBeforeFilterDate(marker.createdAt, selectedDate)) {
        return;
      }

      const existingMarker = latestMarkerByPlayer.get(marker.playerRecordId);
      if (
        !existingMarker ||
        new Date(marker.createdAt) > new Date(existingMarker.createdAt)
      ) {
        latestMarkerByPlayer.set(marker.playerRecordId, marker);
      }
    });

    const positions = Array.from(latestMarkerByPlayer.entries())
      .map(([playerRecordId, marker]) => {
        const player = players.find((p) => p.id === playerRecordId);
        if (!player) {
          return null;
        }

        const playerName = `${player.firstName} ${player.lastName}`;

        return {
          id: marker.id || marker.playerRecordId,
          name: playerName,
          x: marker.x,
          y: marker.y,
          color: PLAYER_COLORS[playerName.length % PLAYER_COLORS.length],
          date: new Date(marker.createdAt),
          initial: getPlayerInitials(player.firstName, player.lastName),
          playerRecordId: marker.playerRecordId,
        } as PlayerPosition;
      })
      .filter((position): position is PlayerPosition => position !== null);

    setPlayerPositions(positions);
  };

  const getGridSize = () => {
    const { width, height } = gridAreaSize;
    if (width > 0 && height > 0) {
      return Math.min(width, height);
    }
    return 0;
  };

  const gridToSvg = (x: number, y: number) => {
    const gridSize = getGridSize();
    const svgX = (x / 100) * (gridSize - 8);
    const svgY = gridSize - 8 - (y / 100) * (gridSize - 8);
    return { svgX, svgY };
  };

  const svgToGrid = (svgX: number, svgY: number) => {
    const gridSize = getGridSize();
    let x = (svgX / gridSize) * 100;
    let y = ((gridSize - svgY) / gridSize) * 100;
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    return { x: roundToStep(x), y: roundToStep(y) };
  };

  const getMarkersAtPosition = (
    x: number,
    y: number,
    playerRecordId: string,
  ): HouseMarker[] => {
    return teamMarkers
      .filter(
        (marker) =>
          marker.playerRecordId === playerRecordId &&
          marker.x === x &&
          marker.y === y,
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  };

  const closeMarkerActionDialog = () => {
    setMarkerActionDialog({
      visible: false,
      markers: [],
      x: 0,
      y: 0,
      showAddNew: true,
      mode: 'edit',
    });
  };

  const getPositionsNearTap = (x: number, y: number, tolerance = 5) => {
    const visiblePlayerIds = new Set(getVisiblePlayerIds());
    return playerPositions.filter(
      (position) =>
        visiblePlayerIds.has(position.playerRecordId) &&
        Math.abs(position.x - x) <= tolerance &&
        Math.abs(position.y - y) <= tolerance,
    );
  };

  const openNewMarkerAt = (
    x: number,
    y: number,
    preferredPlayerId?: string,
  ) => {
    const modalPlayers = getVisiblePlayers();
    const defaultPlayer =
      modalPlayers.find((player) => player.id === preferredPlayerId) ||
      modalPlayers[0];
    if (!defaultPlayer) {
      Alert.alert(
        'No players available',
        'Adjust your team or player filters to include at least one player.',
      );
      return;
    }

    setIsEditMode(false);
    setEditingMarkerId(null);
    setAptitudeValue(x);
    setAttitudeValue(y);
    setNewMarker({
      playerRecordId: defaultPlayer.id,
      teamId,
      x,
      y,
      comment: '',
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    });
    setComment('');
    setMarkerDate(new Date());
    setMarkerModalVisible(true);
  };

  const getMarkersNearPosition = (
    x: number,
    y: number,
    playerRecordId?: string,
    tolerance = 5,
  ): { markers: HouseMarker[]; x: number; y: number } | null => {
    if (playerRecordId) {
      const exact = getMarkersAtPosition(x, y, playerRecordId);
      if (exact.length > 0) {
        return { markers: exact, x, y };
      }

      const nearPosition = playerPositions.find(
        (position) =>
          position.playerRecordId === playerRecordId &&
          Math.abs(position.x - x) <= tolerance &&
          Math.abs(position.y - y) <= tolerance,
      );
      if (!nearPosition) {
        return null;
      }

      const markers = getMarkersAtPosition(
        nearPosition.x,
        nearPosition.y,
        playerRecordId,
      );
      if (markers.length === 0) {
        return null;
      }

      return { markers, x: nearPosition.x, y: nearPosition.y };
    }

    const visiblePlayerIds = new Set(getVisiblePlayerIds());
    const nearbyPositions = playerPositions.filter(
      (position) =>
        visiblePlayerIds.has(position.playerRecordId) &&
        Math.abs(position.x - x) <= tolerance &&
        Math.abs(position.y - y) <= tolerance,
    );
    if (nearbyPositions.length === 0) {
      return null;
    }

    const spotX = nearbyPositions[0].x;
    const spotY = nearbyPositions[0].y;
    const allMarkers: HouseMarker[] = [];
    const seenMarkerIds = new Set<string>();

    nearbyPositions.forEach((position) => {
      getMarkersAtPosition(
        position.x,
        position.y,
        position.playerRecordId,
      ).forEach((marker) => {
        if (!seenMarkerIds.has(marker.id)) {
          seenMarkerIds.add(marker.id);
          allMarkers.push(marker);
        }
      });
    });

    if (allMarkers.length === 0) {
      return null;
    }

    return {
      markers: allMarkers.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
      x: spotX,
      y: spotY,
    };
  };

  const showMarkerActionDialog = (
    x: number,
    y: number,
    playerRecordId?: string,
    options?: { showAddNew?: boolean; mode?: 'edit' | 'filter' },
  ) => {
    const result = getMarkersNearPosition(x, y, playerRecordId);
    if (!result) {
      return false;
    }

    const { markers: markersAtSpot, x: spotX, y: spotY } = result;

    setMarkerActionDialog({
      visible: true,
      markers: markersAtSpot,
      x: spotX,
      y: spotY,
      showAddNew: options?.showAddNew ?? true,
      mode: options?.mode ?? 'edit',
    });
    return true;
  };

  const handleEditMarker = (marker: HouseMarker) => {
    setIsEditMode(true);
    setEditingMarkerId(marker.id);
    setAptitudeValue(marker.x);
    setAttitudeValue(marker.y);
    setComment(marker.comment || '');
    setMarkerDate(new Date(marker.createdAt));
    setNewMarker({
      playerRecordId: marker.playerRecordId,
      teamId,
      x: marker.x,
      y: marker.y,
      comment: marker.comment || '',
      createdAt: marker.createdAt,
      updatedAt: new Date().toISOString(),
    });
    setMarkerModalVisible(true);
  };

  const handleEditFromActionDialog = (marker: HouseMarker) => {
    const { mode } = markerActionDialog;
    closeMarkerActionDialog();
    if (mode === 'filter') {
      setSelectedPlayerFilter(marker.playerRecordId);
      return;
    }
    handleEditMarker(marker);
  };

  const handleAddNewFromActionDialog = () => {
    const { x, y, markers } = markerActionDialog;
    closeMarkerActionDialog();
    openNewMarkerAt(x, y, markers[0]?.playerRecordId);
  };

  const handleGridTap = (event: unknown) => {
    if (getVisiblePlayers().length === 0) {
      Alert.alert(
        'No players available',
        'Adjust your team or player filters to include at least one player.',
      );
      return;
    }

    const gridSize = getGridSize();
    if (gridSize <= 0) {
      return;
    }

    const renderedSize = gridSize - 8;
    const nativeEvent = (event as { nativeEvent?: Record<string, number> })
      ?.nativeEvent;

    let clickX: number | undefined;
    let clickY: number | undefined;

    if (nativeEvent?.locationX !== undefined) {
      clickX = nativeEvent.locationX;
      clickY = nativeEvent.locationY;
    } else if (nativeEvent?.offsetX !== undefined) {
      clickX = nativeEvent.offsetX;
      clickY = nativeEvent.offsetY;
    } else {
      return;
    }

    const svgX = (clickX / renderedSize) * gridSize;
    const svgY = ((clickY ?? 0) / renderedSize) * gridSize;
    const { x, y } = svgToGrid(svgX, svgY);
    const isMultiPlayerView = !getHistoryPlayerId();

    if (isMultiPlayerView) {
      const nearbyPositions = getPositionsNearTap(x, y);
      if (nearbyPositions.length === 0) {
        return;
      }

      const uniquePlayerIds = new Set(
        nearbyPositions.map((position) => position.playerRecordId),
      );

      if (uniquePlayerIds.size === 1) {
        setSelectedPlayerFilter(nearbyPositions[0].playerRecordId);
        return;
      }

      const markersForDialog = nearbyPositions
        .map(
          (position) =>
            teamMarkers
              .filter(
                (marker) =>
                  marker.playerRecordId === position.playerRecordId &&
                  marker.x === position.x &&
                  marker.y === position.y,
              )
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime(),
              )[0],
        )
        .filter((marker): marker is HouseMarker => marker !== undefined);

      setMarkerActionDialog({
        visible: true,
        markers: markersForDialog,
        x: nearbyPositions[0].x,
        y: nearbyPositions[0].y,
        showAddNew: false,
        mode: 'filter',
      });
      return;
    }

    if (showMarkerActionDialog(x, y, getHistoryPlayerId() ?? undefined)) {
      return;
    }

    openNewMarkerAt(x, y);
  };

  const submitMarker = async () => {
    if (!newMarker) {
      return;
    }

    try {
      setIsSubmitting(true);
      const markerData = {
        ...newMarker,
        x: aptitudeValue,
        y: attitudeValue,
        comment,
        createdAt: markerDate.toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (isEditMode && editingMarkerId) {
        await updateHouseMarker(editingMarkerId, markerData);
        Alert.alert('Success', 'Player marker updated successfully');
      } else {
        await saveHouseMarker(markerData);
        Alert.alert('Success', 'Player marker added successfully');
      }

      setMarkerModalVisible(false);
      setIsEditMode(false);
      setEditingMarkerId(null);

      const markers = await getTeamHouseMarkers(teamId);
      setTeamMarkers(markers);
    } catch (error) {
      console.error('Error saving marker:', error);
      Alert.alert('Error', 'Failed to save player marker');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalPlayerChange = (playerId: string) => {
    setNewMarker((current) =>
      current ? { ...current, playerRecordId: playerId } : current,
    );
  };

  const closeModal = () => {
    if (!isSubmitting) {
      setMarkerModalVisible(false);
      setIsEditMode(false);
      setEditingMarkerId(null);
    }
  };

  const handleDeleteFromModal = () => {
    if (!editingMarkerId) {
      return;
    }
    setMarkerModalVisible(false);
    setDeleteMarkerDialog({ visible: true, markerId: editingMarkerId });
  };

  const confirmDeleteMarker = async () => {
    const markerId = deleteMarkerDialog.markerId;
    if (!markerId) {
      return;
    }
    setDeleteMarkerDialog({ visible: false, markerId: null });
    try {
      setIsLoading(true);
      await deleteHouseMarker(markerId);
      const markers = await getTeamHouseMarkers(teamId);
      setTeamMarkers(markers);
      setIsEditMode(false);
      setEditingMarkerId(null);
    } catch (error) {
      console.error('Error deleting marker:', error);
      Alert.alert('Error', 'Failed to delete marker');
    } finally {
      setIsLoading(false);
    }
  };

  const getModalPlayers = () => {
    const visiblePlayers = getVisiblePlayers();
    if (!newMarker?.playerRecordId) {
      return visiblePlayers;
    }
    if (visiblePlayers.some((player) => player.id === newMarker.playerRecordId)) {
      return visiblePlayers;
    }
    const markerPlayer = players.find(
      (player) => player.id === newMarker.playerRecordId,
    );
    return markerPlayer ? [...visiblePlayers, markerPlayer] : visiblePlayers;
  };

  const visiblePlayerIds = getVisiblePlayerIds();
  const playersInSelectedTeams = getPlayersInSelectedTeams();
  const historyPlayerId = getHistoryPlayerId();

  const teamFilterOptions = subteams.map((subteam) => ({
    id: subteam.id,
    label: `${subteam.name} (${subteam.playerIds?.length || 0})`,
  }));

  const playerFilterOptions = playersInSelectedTeams.map((player) => ({
    id: player.id,
    label: `${player.firstName} ${player.lastName}`,
    subtitle: player.jerseyNumber
      ? `Jersey #${player.jerseyNumber}`
      : undefined,
  }));

  const playersWithMarkers = new Set(
    teamMarkers.map((marker) => marker.playerRecordId),
  );
  const addPlayerOptions = playersInSelectedTeams
    .filter((player) => !playersWithMarkers.has(player.id))
    .map((player) => ({
      id: player.id,
      label: `${player.firstName} ${player.lastName}`,
      subtitle: player.jerseyNumber
        ? `Jersey #${player.jerseyNumber}`
        : undefined,
    }));

  const handleAddPlayerToHouse = (playerId: string) => {
    setSelectedPlayerFilter(playerId);
    setActiveTab('grid');
  };

  const gridSize = getGridSize();

  return (
    <View style={styles.root}>
      <View style={styles.sidebar}>
        {header}

        <View style={styles.filters}>
          {subteams.length > 0 ? (
            <FilterDropdown
              options={teamFilterOptions}
              selectedId={selectedSubteam}
              onSelect={setSelectedSubteam}
              placeholder="All Teams"
              style={styles.filterControl}
            />
          ) : null}
          <PlayerSearchDropdown
            options={playerFilterOptions}
            selectedId={selectedPlayerFilter}
            onSelect={setSelectedPlayerFilter}
            placeholder="All Players"
            style={styles.filterControl}
          />
          <HouseDateFilterButton
            value={selectedDate}
            onChange={handleDateFilterChange}
          />
          <AddPlayerDropdown
            options={addPlayerOptions}
            onSelect={handleAddPlayerToHouse}
          />
          <Text style={styles.hint}>
            {isLoading
              ? 'Loading player markers...'
              : historyPlayerId
                ? 'Showing player marker history. Tap marker to edit or free space to add new.'
                : 'Tap a marker to view that player\'s history'}
          </Text>
        </View>
      </View>

      <View style={styles.main}>
        <View
          style={[
            styles.tabs,
            gridSize > 0 ? { width: gridSize - 8 } : null,
          ]}
        >
          <Pressable
            onPress={() => setActiveTab('grid')}
            style={[styles.tab, activeTab === 'grid' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'grid' && styles.tabTextActive,
              ]}
            >
              Grid
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('list')}
            style={[styles.tab, activeTab === 'list' && styles.tabActive]}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'list' && styles.tabTextActive,
              ]}
            >
              List
            </Text>
          </Pressable>
        </View>

        {activeTab === 'grid' ? (
          <View
            style={styles.gridArea}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setGridAreaSize((prev) =>
                prev.width === width && prev.height === height
                  ? prev
                  : { width, height },
              );
            }}
          >
            <GridView
              gridSize={gridSize}
              playerPositions={playerPositions}
              gridToSvg={gridToSvg}
              handleGridTap={handleGridTap}
              historyPlayerId={historyPlayerId}
            />
          </View>
        ) : (
          <View style={styles.listArea}>
            <ListView
              isLoading={isLoading}
              teamMarkers={teamMarkers}
              players={players}
              visiblePlayerIds={visiblePlayerIds}
              selectedDate={selectedDate}
              handleEditMarker={handleEditMarker}
            />
          </View>
        )}
      </View>

      <MarkerModal
        markerModalVisible={markerModalVisible}
        isEditMode={isEditMode}
        isSubmitting={isSubmitting}
        newMarker={newMarker}
        aptitudeValue={aptitudeValue}
        attitudeValue={attitudeValue}
        comment={comment}
        setAptitudeValue={setAptitudeValue}
        setAttitudeValue={setAttitudeValue}
        setComment={setComment}
        closeModal={closeModal}
        submitMarker={submitMarker}
        handleDeleteFromModal={handleDeleteFromModal}
        modalPlayers={getModalPlayers()}
        onPlayerChange={handleModalPlayerChange}
        roundToStep={roundToStep}
        markerDate={markerDate}
        setMarkerDate={setMarkerDate}
      />

      <MarkerActionModal
        visible={markerActionDialog.visible}
        markers={markerActionDialog.markers}
        x={markerActionDialog.x}
        y={markerActionDialog.y}
        players={players}
        showAddNew={markerActionDialog.showAddNew}
        selectMode={markerActionDialog.mode === 'filter'}
        onEdit={handleEditFromActionDialog}
        onAddNew={handleAddNewFromActionDialog}
        onClose={closeMarkerActionDialog}
      />

      <ConfirmDialog
        visible={deleteMarkerDialog.visible}
        title="Delete Marker"
        message="Are you sure you want to delete this marker?"
        confirmLabel="Delete"
        cancelLabel="Cancel"
        destructive
        loading={isLoading}
        onConfirm={confirmDeleteMarker}
        onCancel={() =>
          setDeleteMarkerDialog({ visible: false, markerId: null })
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
    gap: 20,
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    zIndex: 10,
  },
  filters: {
    marginTop: 16,
    gap: 8,
    zIndex: 10,
  },
  filterControl: {
    flexGrow: 0,
    flexShrink: 0,
    width: '100%',
  },
  hint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    color: 'rgba(18, 58, 122, 0.65)',
    marginTop: 4,
  },
  main: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
  },
  tabs: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 111, 232, 0.15)',
    marginBottom: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#1E6FE8',
  },
  tabText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: 'rgba(18, 58, 122, 0.5)',
  },
  tabTextActive: {
    color: '#1E6FE8',
  },
  gridArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
  },
  listArea: {
    flex: 1,
    minHeight: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
  },
});
