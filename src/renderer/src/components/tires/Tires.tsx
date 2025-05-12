import {
  ActionIcon,
  Card,
  Center,
  Flex,
  Group,
  Loader,
  Menu,
  Pill,
  PillGroup,
  Skeleton,
  Stack,
  Table,
  Text
} from '@mantine/core';
import {
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSelector,
  IconTrash
} from '@tabler/icons-react';
import { FC, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire, AddTireProps } from './AddTire';
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from '../common/TitleWithButton';
import { useStints } from '@renderer/hooks/useStints';
import { Stint, Tire } from '@shared/model';
import { useTracks } from '@renderer/hooks/useTracks';
import { queryClient } from '@renderer/main';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { TireFilters } from './TireFilters';
import { formatDate } from '@renderer/utils/dateUtils';

interface TireMenuProps {
  tireId: string;
  tireName: string;
  openTireModal: (props?: AddTireProps) => void;
}

const TireMenu: FC<TireMenuProps> = ({ tireId, tireName, openTireModal }) => {
  const { carId } = useParams();
  const [opened, setOpened] = useState<boolean>(false);

  const onDelete = () => {
    modals.openConfirmModal({
      title: 'Delete tire',
      children: (
        <Stack justify="center">
          <Text>
            Are you sure you want to delete the tire{' '}
            <Text span fw={800} inherit>
              {tireName}
            </Text>
            ?
          </Text>
          <Text c="red">This will also delete all stints where this tire is used.</Text>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmDelete(),
      onAbort: () => modals.closeAll()
    });
  };

  const onConfirmDelete = () => {
    window.api.deleteTire(tireId);
    queryClient.invalidateQueries({ queryKey: ['tires', carId] });
    modals.closeAll();
  };

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
        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
          Delete tire
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};
interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

const Th: FC<ThProps> = ({ children, reversed, sorted, onSort }) => {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th
      className="p-0 cursor-pointer hover:bg-[var(--mantine-color-dark-4)]"
      onClick={onSort}
    >
      <Group>
        <Text fw={500} fz="sm">
          {children}
        </Text>
        <Center className="icon">
          <Icon size={16} stroke={1.5} />
        </Center>
      </Group>
    </Table.Th>
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

export const Tires: FC = () => {
  const { carId } = useParams();

  const navigate = useNavigate();

  const { loading, tires } = useTires({ carId });
  const { loading: loadingStints, getTireStints } = useStints({ carId });
  const { getTrack } = useTracks();

  const openTireModal = (props?: AddTireProps) => {
    modals.open({
      children: <AddTire {...props} carId={carId!} />,
      withCloseButton: false
    });
  };

  const [filters, setFilters] = useState<TireFilters>();

  const enrichedTires = useMemo(
    () =>
      loadingStints
        ? undefined
        : tires?.map((tire) => {
            const tireStints = getTireStints(tire.tireId);

            const lastUsedStint = tireStints?.reduce(
              (latest, stint) => {
                if (!latest || stint.date > latest.date) {
                  return stint;
                }
                return latest;
              },
              undefined as Stint | undefined
            );
            const distance = tireStints.reduce(
              (total, { laps, trackId }) => total + laps * (getTrack(trackId)?.length || 0),
              0
            );

            return { ...tire, distance, lastUsedStint };
          }),
    [tires, loadingStints, getTireStints, getTrack]
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
            (distance < totalDistance[0] * 1000 || distance > totalDistance[1] * 1000)
          )
            return false;

          if (tirePosition?.includes('Left') && !allowedLf && !allowedLr) return false;
          if (tirePosition?.includes('Right') && !allowedRf && !allowedRr) return false;
          if (tirePosition?.includes('Front') && !allowedLf && !allowedRf) return false;
          if (tirePosition?.includes('Rear') && !allowedLr && !allowedRr) return false;
          return true;
        });
  }, [enrichedTires, filters]);

  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'date' | undefined>(undefined);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [sortedTires, setSortedTires] = useState<typeof filteredTires>();

  const setSorting = (field: 'name' | 'distance' | 'date' | undefined) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedTires(sortData(filteredTires || [], field, reversed));
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add tire"
        onButtonClick={openTireModal}
      >
        Tires
      </TitleWithButton>
      {loading || filteredTires === undefined || enrichedTires === undefined ? (
        <Loader className="mt-8" />
      ) : (
        <Stack className="mt-4">
          <TireFilters
            itemCount={tires?.length || 0}
            shownItemCount={filteredTires !== undefined ? filteredTires.length : 0}
            distMax={
              enrichedTires?.reduce((max, { distance }) => Math.max(max, distance / 1000), 0) || 0
            }
            onFilterChange={setFilters}
          />
          <Card padding="xs">
            <Table className="p-0 m-0" highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Th
                    sorted={sortBy === 'name'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('name')}
                  >
                    Name
                  </Th>
                  <Th sorted={false} reversed={reverseSortDirection} onSort={() => {}}>
                    Allowed positions
                  </Th>

                  <Th
                    sorted={sortBy === 'distance'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('distance')}
                  >
                    Total distance
                  </Th>
                  <Th
                    sorted={sortBy === 'date'}
                    reversed={reverseSortDirection}
                    onSort={() => setSorting('date')}
                  >
                    Last used
                  </Th>
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
                          <Group>
                            <PillGroup size="sm" gap={2}>
                              {allowedLf ? <Pill>LF</Pill> : null}
                              {allowedRf ? <Pill>RF</Pill> : null}
                              {allowedLr ? <Pill>LR</Pill> : null}
                              {allowedRr ? <Pill>RR</Pill> : null}
                            </PillGroup>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          {!loadingStints ? formatDistance(distance) : <Skeleton height={8} />}
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
                              tireName={name}
                              openTireModal={openTireModal}
                            />
                          </Flex>
                        </Table.Td>
                      </Table.Tr>
                    );
                  }
                )}
              </Table.Tbody>
              {filteredTires?.length === 0 && (
                <Table.Tfoot>
                  <Text p={10} c="dimmed">
                    {!tires || tires.length === 0
                      ? 'No tires added yet'
                      : 'No tires found with the current filters'}
                  </Text>
                </Table.Tfoot>
              )}
            </Table>
          </Card>
        </Stack>
      )}
    </>
  );
};
