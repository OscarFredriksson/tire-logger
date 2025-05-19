import {
  ActionIcon,
  Card,
  Flex,
  Loader,
  Menu,
  PillGroup,
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
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from '../common/TitleWithButton';
import { useStints } from '@renderer/hooks/useStints';
import { Stint, Tire } from '@shared/model';
import { useTracks } from '@renderer/hooks/useTracks';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { TireFilters } from './TireFilters';
import { formatDate } from '@renderer/utils/dateUtils';
import { ThSortable } from '../common/ThSortable';
import { PillWithTooltip } from '../common/PillWithTooltip';

interface TireMenuProps {
  tireId: string;
  openTireModal: (props?: AddTireProps) => void;
}

const TireMenu: FC<TireMenuProps> = ({ tireId, openTireModal }) => {
  const { carId } = useParams();
  const { deleteTire } = useTires({ carId });
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
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={() => deleteTire(tireId)}
        >
          Delete tire
        </Menu.Item>
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
                            <TireMenu tireId={tireId} openTireModal={openTireModal} />
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
                    {!tires || tires.length === 0
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
