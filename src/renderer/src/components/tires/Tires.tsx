import {
  ActionIcon,
  Card,
  Flex,
  Loader,
  Menu,
  PillGroup,
  SegmentedControl,
  Skeleton,
  Stack,
  Table,
  Text
} from '@mantine/core';
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { FC, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire, AddTireProps } from './AddTire';
import { useArchivedTires, useActiveTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from '../common/TitleWithButton';
import { useActiveStints } from '@renderer/hooks/useStints';
import { Stint, Tire } from '@shared/model';
import { useActiveTracks } from '@renderer/hooks/useTracks';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { TireFilters } from './TireFilters';
import { formatDate } from '@renderer/utils/dateUtils';
import { ThSortable } from '../common/ThSortable';
import { PillWithTooltip } from '../common/PillWithTooltip';

interface TireMenuProps {
  tireId: string;
  openTireModal: (props?: AddTireProps) => void;
  archived?: boolean;
}

type EnrichedTire = Tire & {
  distance: number;
  lastUsedStint: Stint | undefined;
};

const TireMenu: FC<TireMenuProps> = ({ tireId, openTireModal, archived }) => {
  const { carId } = useParams();
  const { archiveTire } = useActiveTires({ carId });
  const { restoreTire } = useArchivedTires({ carId });
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <Menu opened={opened} onChange={setOpened}>
      <Menu.Target>
        <ActionIcon variant="subtle" color="gray">
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconEdit size={14} />}
          disabled={!carId}
          onClick={() => openTireModal({ carId: carId!, tireId })}
        >
          Edit tire
        </Menu.Item>
        {(archived && (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => restoreTire(tireId)}
          >
            Restore tire
          </Menu.Item>
        )) || (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => archiveTire(tireId)}
          >
            Archive tire
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

const sortData = (
  data: (Tire & { distance: number; lastUsedStint: Stint | undefined })[],
  sortBy: 'name' | 'distance' | 'date' | undefined,
  reversed: boolean
) => {
  if (!sortBy) {
    return data;
  }

  const sortFn = (a: (typeof data)[0], b: (typeof data)[0]) =>
    sortBy === 'name'
      ? a[sortBy].localeCompare(b[sortBy])
      : sortBy === 'date'
        ? (b.lastUsedStint?.date.getTime() || 0) - (a.lastUsedStint?.date.getTime() || 0)
        : b[sortBy] - a[sortBy];

  return data.sort((a, b) => (reversed ? sortFn(b, a) : sortFn(a, b)));
};
export interface ActiveTiresProps {
  activeTires: EnrichedTire[] | undefined;
  loadingActiveTires: boolean;
  loadingActiveStints: boolean;
  getTireStints: (tireId: string) => Stint[];
  getTrack: (trackId: string) => { name: string; length: number } | undefined;
  filters: TireFilters | undefined;
  setFilters: (filters: TireFilters) => void;
  sortBy: 'name' | 'distance' | 'date' | undefined;
  reverseSortDirection: boolean;
  setSorting: (field: 'name' | 'distance' | 'date' | undefined) => void;
  sortedTires: (Tire & { distance: number; lastUsedStint: Stint | undefined })[] | undefined;
  filteredTires: (Tire & { distance: number; lastUsedStint: Stint | undefined })[] | undefined;
  openTireModal: (props?: AddTireProps) => void;
  navigate: ReturnType<typeof useNavigate>;
  carId: string | undefined;
  showArchived: boolean;
}

export const ActiveTires: FC<ActiveTiresProps> = ({
  activeTires,
  loadingActiveTires,
  loadingActiveStints,
  getTrack,
  setFilters,
  sortBy,
  reverseSortDirection,
  setSorting,
  sortedTires,
  filteredTires,
  openTireModal,
  navigate,
  carId,
  showArchived
}) => {
  return (
    <>
      {loadingActiveTires || filteredTires === undefined || activeTires === undefined ? (
        <Loader className="mt-8" />
      ) : (
        <Stack className="mt-4">
          <TireFilters
            itemCount={activeTires?.length || 0}
            shownItemCount={filteredTires !== undefined ? filteredTires.length : 0}
            distMax={
              activeTires?.reduce((max, { distance }) => Math.max(max, distance / 1000), 0) || 0
            }
            onFilterChange={setFilters}
          />
          <Card padding="xs">
            <Table className="p-0 m-0" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <ThSortable
                    sorted={sortBy === 'name'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('name')}
                  >
                    Name
                  </ThSortable>
                  <ThSortable sorted={false} reversed={reverseSortDirection} onSort={() => {}}>
                    Allowed positions
                  </ThSortable>
                  <ThSortable
                    sorted={sortBy === 'distance'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('distance')}
                  >
                    Distance
                  </ThSortable>
                  <ThSortable
                    sorted={sortBy === 'date'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('date')}
                  >
                    Last used
                  </ThSortable>
                  <Table.Th className="w-0"></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(sortedTires || filteredTires)?.map(
                  ({
                    tireId,
                    name,
                    distance,
                    allowedLf,
                    allowedLr,
                    allowedRf,
                    allowedRr,
                    lastUsedStint
                  }) => {
                    const lastUsedTrack = lastUsedStint && getTrack(lastUsedStint.trackId)?.name;
                    return (
                      <Table.Tr
                        key={tireId}
                        onClick={() =>
                          navigate(generatePath(routes.TIRE_tireId, { carId, tireId }))
                        }
                        className="cursor-pointer"
                      >
                        <Table.Td w={200}>{name}</Table.Td>
                        <Table.Td>
                          <PillGroup size="sm" gap={2}>
                            {allowedLf ? (
                              <PillWithTooltip tip="Left Front">LF</PillWithTooltip>
                            ) : null}
                            {allowedRf ? (
                              <PillWithTooltip tip="Right Front">RF</PillWithTooltip>
                            ) : null}
                            {allowedLr ? (
                              <PillWithTooltip tip="Left Rear">LR</PillWithTooltip>
                            ) : null}
                            {allowedRr ? (
                              <PillWithTooltip tip="Right Rear">RR</PillWithTooltip>
                            ) : null}
                          </PillGroup>
                        </Table.Td>
                        <Table.Td>
                          {!loadingActiveStints ? (
                            formatDistance(distance)
                          ) : (
                            <Skeleton height={8} />
                          )}
                        </Table.Td>
                        <Table.Td>
                          {lastUsedStint ? (
                            <>
                              {formatDate(lastUsedStint.date)}
                              {lastUsedTrack ? ` • ${lastUsedTrack}` : ''}
                            </>
                          ) : (
                            'Never'
                          )}
                        </Table.Td>
                        <Table.Td
                          align="right"
                          className="p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Flex justify="flex-end">
                            <TireMenu
                              tireId={tireId}
                              openTireModal={openTireModal}
                              archived={showArchived}
                            />
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }
                )}
              </Table.Tbody>
              {filteredTires?.length === 0 && (
                <Table.Caption>
                  <Text p={10} c="dimmed">
                    {!activeTires || activeTires.length === 0
                      ? 'No tires added yet'
                      : 'No tires found with the current filters'}
                  </Text>
                </Table.Caption>
              )}
            </Table>
          </Card>
        </Stack>
      )}
    </>
  );
};

export interface ArchivedTiresProps {
  archivedTires: EnrichedTire[] | undefined;
  loadingArchivedTires: boolean;
  loadingActiveStints: boolean;
  getTireStints: (tireId: string) => Stint[];
  getTrack: (trackId: string) => { name: string; length: number } | undefined;
  filters: TireFilters | undefined;
  setFilters: (filters: TireFilters) => void;
  sortBy: 'name' | 'distance' | 'date' | undefined;
  reverseSortDirection: boolean;
  setSorting: (field: 'name' | 'distance' | 'date' | undefined) => void;
  sortedTires: (Tire & { distance: number; lastUsedStint: Stint | undefined })[] | undefined;
  filteredTires: (Tire & { distance: number; lastUsedStint: Stint | undefined })[] | undefined;
  openTireModal: (props?: AddTireProps) => void;
  navigate: ReturnType<typeof useNavigate>;
  carId: string | undefined;
  showArchived: boolean;
}

export const ArchivedTires: FC<ArchivedTiresProps> = ({
  archivedTires,
  loadingArchivedTires,
  loadingActiveStints,
  getTrack,
  setFilters,
  sortBy,
  reverseSortDirection,
  setSorting,
  sortedTires,
  filteredTires,
  openTireModal,
  navigate,
  carId,
  showArchived
}) => {
  return (
    <>
      {loadingArchivedTires || filteredTires === undefined || archivedTires === undefined ? (
        <Loader className="mt-8" />
      ) : (
        <Stack className="mt-4">
          <TireFilters
            itemCount={archivedTires?.length || 0}
            shownItemCount={filteredTires !== undefined ? filteredTires.length : 0}
            distMax={
              archivedTires?.reduce((max, { distance }) => Math.max(max, distance / 1000), 0) || 0
            }
            onFilterChange={setFilters}
          />
          <Card padding="xs">
            <Table className="p-0 m-0" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <ThSortable
                    sorted={sortBy === 'name'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('name')}
                  >
                    Name
                  </ThSortable>
                  <ThSortable sorted={false} reversed={reverseSortDirection} onSort={() => {}}>
                    Allowed positions
                  </ThSortable>
                  <ThSortable
                    sorted={sortBy === 'distance'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('distance')}
                  >
                    Distance
                  </ThSortable>
                  <ThSortable
                    sorted={sortBy === 'date'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('date')}
                  >
                    Last used
                  </ThSortable>
                  <Table.Th className="w-0"></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {(sortedTires || filteredTires)?.map(
                  ({
                    tireId,
                    name,
                    distance,
                    allowedLf,
                    allowedLr,
                    allowedRf,
                    allowedRr,
                    lastUsedStint
                  }) => {
                    const lastUsedTrack = lastUsedStint && getTrack(lastUsedStint.trackId)?.name;
                    return (
                      <Table.Tr
                        key={tireId}
                        onClick={() =>
                          navigate(generatePath(routes.TIRE_tireId, { carId, tireId }))
                        }
                        className="cursor-pointer"
                      >
                        <Table.Td w={200}>{name}</Table.Td>
                        <Table.Td>
                          <PillGroup size="sm" gap={2}>
                            {allowedLf ? (
                              <PillWithTooltip tip="Left Front">LF</PillWithTooltip>
                            ) : null}
                            {allowedRf ? (
                              <PillWithTooltip tip="Right Front">RF</PillWithTooltip>
                            ) : null}
                            {allowedLr ? (
                              <PillWithTooltip tip="Left Rear">LR</PillWithTooltip>
                            ) : null}
                            {allowedRr ? (
                              <PillWithTooltip tip="Right Rear">RR</PillWithTooltip>
                            ) : null}
                          </PillGroup>
                        </Table.Td>
                        <Table.Td>
                          {!loadingActiveStints ? (
                            formatDistance(distance)
                          ) : (
                            <Skeleton height={8} />
                          )}
                        </Table.Td>
                        <Table.Td>
                          {lastUsedStint ? (
                            <>
                              {formatDate(lastUsedStint.date)}
                              {lastUsedTrack ? ` • ${lastUsedTrack}` : ''}
                            </>
                          ) : (
                            'Never'
                          )}
                        </Table.Td>
                        <Table.Td
                          align="right"
                          className="p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Flex justify="flex-end">
                            <TireMenu
                              tireId={tireId}
                              openTireModal={openTireModal}
                              archived={showArchived}
                            />
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }
                )}
              </Table.Tbody>
              {filteredTires?.length === 0 && (
                <Table.Caption>
                  <Text p={10} c="dimmed">
                    {!archivedTires || archivedTires.length === 0
                      ? 'No archived tires'
                      : 'No archived tires found with the current filters'}
                  </Text>
                </Table.Caption>
              )}
            </Table>
          </Card>
        </Stack>
      )}
    </>
  );
};
// Removed broken/unused ActiveTires component as its logic is handled in the main Tires component.
export const TiresTable: FC<ActiveTiresProps> = (props) => <ActiveTires {...props} />;
export const ArchivedTiresTable: FC<ArchivedTiresProps> = (props) => <ArchivedTires {...props} />;
export const Tires: FC = () => {
  const { carId } = useParams();
  const navigate = useNavigate();

  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { loadingActiveTires, activeTires } = useActiveTires({ carId });
  const { loadingArchivedTires, archivedTires } = useArchivedTires({ carId });
  const { loadingActiveStints, getTireStints } = useActiveStints({ carId });
  const { getTrack } = useActiveTracks();

  const openTireModal = (props?: AddTireProps) => {
    modals.open({
      children: <AddTire {...props} carId={carId!} />,
      withCloseButton: false
    });
  };

  const [filters, setFilters] = useState<TireFilters>();
  const [archivedFilters, setArchivedFilters] = useState<TireFilters>();
  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'date' | undefined>(undefined);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [sortedTires, setSortedTires] = useState<typeof filteredTires>();
  const [sortedArchivedTires, setSortedArchivedTires] = useState<typeof filteredArchivedTires>();

  const enrichedTires = useMemo<EnrichedTire[] | undefined>(
    () =>
      loadingActiveStints
        ? undefined
        : activeTires?.map((tire) => {
            const tireStints = getTireStints(tire.tireId);
            const lastUsedStint = tireStints?.reduce(
              (latest, stint) => (!latest || stint.date > latest.date ? stint : latest),
              undefined as Stint | undefined
            );
            const distance = tireStints.reduce(
              (total, { laps, trackId }) => total + laps * (getTrack(trackId)?.length || 0),
              0
            );
            return { ...tire, distance, lastUsedStint };
          }),
    [activeTires, loadingActiveStints, getTireStints, getTrack]
  );

  const enrichedArchivedTires = useMemo<EnrichedTire[] | undefined>(
    () =>
      loadingArchivedTires
        ? undefined
        : archivedTires?.map((tire) => {
            const tireStints = getTireStints(tire.tireId);
            const lastUsedStint = tireStints?.reduce(
              (latest, stint) => (!latest || stint.date > latest.date ? stint : latest),
              undefined as Stint | undefined
            );
            const distance = tireStints.reduce(
              (total, { laps, trackId }) => total + laps * (getTrack(trackId)?.length || 0),
              0
            );
            return { ...tire, distance, lastUsedStint };
          }),
    [archivedTires, loadingArchivedTires, getTireStints, getTrack]
  );

  const filteredTires = useMemo(() => {
    const { tirePosition, nameSearch, totalDistance } = filters || {};
    if (!tirePosition && !nameSearch && !totalDistance) return enrichedTires;
    return !enrichedTires
      ? undefined
      : enrichedTires.filter(({ allowedLf, allowedRf, allowedLr, allowedRr, distance, name }) => {
          if (nameSearch && !name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
          if (
            totalDistance &&
            (distance / 1000 < totalDistance[0] || distance / 1000 > totalDistance[1])
          )
            return false;
          if (tirePosition?.includes('Left') && !allowedLf && !allowedLr) return false;
          if (tirePosition?.includes('Right') && !allowedRf && !allowedRr) return false;
          if (tirePosition?.includes('Front') && !allowedLf && !allowedRf) return false;
          if (tirePosition?.includes('Rear') && !allowedLr && !allowedRr) return false;
          return true;
        });
  }, [enrichedTires, filters]);

  const filteredArchivedTires = useMemo(() => {
    const { tirePosition, nameSearch, totalDistance } = archivedFilters || {};
    if (!tirePosition && !nameSearch && !totalDistance) return enrichedArchivedTires;
    return !enrichedArchivedTires
      ? undefined
      : enrichedArchivedTires.filter(
          ({ allowedLf, allowedRf, allowedLr, allowedRr, distance, name }) => {
            if (nameSearch && !name.toLowerCase().includes(nameSearch.toLowerCase())) return false;
            if (
              totalDistance &&
              (distance / 1000 < totalDistance[0] || distance / 1000 > totalDistance[1])
            )
              return false;
            if (tirePosition?.includes('Left') && !allowedLf && !allowedLr) return false;
            if (tirePosition?.includes('Right') && !allowedRf && !allowedRr) return false;
            if (tirePosition?.includes('Front') && !allowedLf && !allowedRf) return false;
            if (tirePosition?.includes('Rear') && !allowedLr && !allowedRr) return false;
            return true;
          }
        );
  }, [enrichedArchivedTires, archivedFilters]);

  const setSorting = (field: 'name' | 'distance' | 'date' | undefined) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    if (!showArchived) {
      setSortedTires(sortData(filteredTires || [], field, reversed));
    } else {
      setSortedArchivedTires(sortData(filteredArchivedTires || [], field, reversed));
    }
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add tire"
        onButtonClick={openTireModal}
        centerElement={
          <SegmentedControl
            value={showArchived ? 'archived' : 'active'}
            onChange={(v) => setShowArchived(v === 'archived')}
            data={[
              { label: 'Active', value: 'active' },
              { label: 'Archived', value: 'archived' }
            ]}
            mr="auto"
            ml="lg"
          />
        }
      >
        Tires
      </TitleWithButton>
      {!showArchived ? (
        <TiresTable
          activeTires={enrichedTires}
          loadingActiveTires={loadingActiveTires}
          loadingActiveStints={loadingActiveStints}
          getTireStints={getTireStints}
          getTrack={getTrack}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          reverseSortDirection={reverseSortDirection}
          setSorting={setSorting}
          sortedTires={sortedTires}
          filteredTires={filteredTires}
          openTireModal={openTireModal}
          navigate={navigate}
          carId={carId}
          showArchived={false}
        />
      ) : (
        <ArchivedTiresTable
          archivedTires={enrichedArchivedTires}
          loadingArchivedTires={loadingArchivedTires}
          loadingActiveStints={loadingActiveStints}
          getTireStints={getTireStints}
          getTrack={getTrack}
          filters={archivedFilters}
          setFilters={setArchivedFilters}
          sortBy={sortBy}
          reverseSortDirection={reverseSortDirection}
          setSorting={setSorting}
          sortedTires={sortedArchivedTires}
          filteredTires={filteredArchivedTires}
          openTireModal={openTireModal}
          navigate={navigate}
          carId={carId}
          showArchived={true}
        />
      )}
    </>
  );
};
