import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Pill,
  Skeleton,
  Stack,
  Table,
  Text,
  Title,
  Tooltip
} from '@mantine/core';
import { IconArrowLeft, IconEdit, IconTrash } from '@tabler/icons-react';
import { FC, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { useTires } from '@renderer/hooks/useTires';
import { useStints } from '@renderer/hooks/useStints';
import { useTracks } from '@renderer/hooks/useTracks';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { TextWithLabel } from '../common/TextWithLabel';
import { formatDate } from '@renderer/utils/dateUtils';
import { ThSortable } from '../common/ThSortable';
import { themeConstants } from '@renderer/theme';
import { modals } from '@mantine/modals';
import { DeleteTireConfirm } from './DeleteTireConfirm';
import { AddTireProps, AddTire } from './AddTire';

const sortData = (data: any[], sortBy: string | undefined, reversed: boolean) => {
  if (!sortBy) {
    return data;
  }

  const sortFn = (a: (typeof data)[0], b: (typeof data)[0]) =>
    sortBy === 'laps' || sortBy === 'distance'
      ? b[sortBy] - a[sortBy]
      : sortBy === 'date'
        ? (b.date.getTime() || 0) - (a.date.getTime() || 0)
        : a[sortBy]?.localeCompare(b[sortBy]);

  return data.sort((a, b) => (reversed ? sortFn(b, a) : sortFn(a, b)));
};

export const Tire: FC = () => {
  const { carId, tireId } = useParams();
  const navigate = useNavigate();

  const { loading, getTire, deleteTire } = useTires({ carId });
  const { loading: loadingStints, getTireStints } = useStints({ carId });
  const { loading: loadingTracks, getTrack } = useTracks();

  const tire = useMemo(() => tireId && getTire(tireId), [getTire, tireId]);

  const tireStints = useMemo(
    () => tireId && !loadingStints && getTireStints(tireId),
    [getTireStints, tireId, loadingStints]
  );

  const enrichedStints = useMemo(
    () =>
      (tireStints &&
        !loadingTracks &&
        tireStints.map((stint) => {
          const track = getTrack(stint.trackId);
          return {
            ...stint,
            trackName: track?.name,
            distance: stint.laps * (track?.length || 0)
          };
        })) ||
      [],
    [tireStints, loadingTracks, getTrack]
  );

  const [sortBy, setSortBy] = useState<string>();
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [sortedStints, setSortedStints] = useState<typeof enrichedStints>();

  const setSorting = (field?: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedStints(sortData(enrichedStints || [], field, reversed));
  };

  const onDeleteTire = () => {
    if (tire)
      modals.openConfirmModal({
        title: 'Delete tire',
        children: <DeleteTireConfirm tireName={tire.name} />,
        labels: { confirm: 'Delete', cancel: 'Cancel' },
        withCloseButton: false,
        onConfirm: () => {
          deleteTire(tire.tireId);
          navigate(generatePath(routes.TIRES, { carId }));
        },
        onAbort: () => modals.closeAll()
      });
  };

  const openTireModal = (props?: AddTireProps) => {
    modals.open({
      children: <AddTire {...props} carId={carId!} />,
      withCloseButton: false
    });
  };

  return (
    <>
      <Group gap="xl">
        <Button
          leftSection={<IconArrowLeft />}
          onClick={() => navigate(generatePath(routes.TIRES, { carId }))}
        >
          Back
        </Button>
        <Title>{loading ? 'Loading Tire' : !tire ? 'Tire not found' : tire.name}</Title>
        {tire && (
          <Group gap="xs">
            <Tooltip label="Edit tire" withArrow openDelay={themeConstants.TOOLTIP_OPEN_DELAY}>
              <ActionIcon
                variant="gradient"
                size="lg"
                onClick={() => openTireModal({ carId: tire.carId, tireId: tire.tireId })}
              >
                <IconEdit size={22} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Delete tire" withArrow openDelay={themeConstants.TOOLTIP_OPEN_DELAY}>
              <ActionIcon variant="filled" color="red" size="lg" onClick={onDeleteTire}>
                <IconTrash size={22} />
              </ActionIcon>
            </Tooltip>
          </Group>
        )}
      </Group>
      {loading ? (
        <Center className="mt-5">
          <Loader />
        </Center>
      ) : !tire ? null : (
        <>
          <Group m="md" gap={10}>
            <Text fw={400} size="sm" pr="xs">
              Allowed positions:
            </Text>
            {tire.allowedLf ? (
              <Badge variant="default" size="sm">
                Left Front
              </Badge>
            ) : null}
            {tire.allowedRf ? (
              <Badge variant="default" size="sm">
                Right Front
              </Badge>
            ) : null}
            {tire.allowedLr ? (
              <Badge variant="default" size="sm">
                Left Rear
              </Badge>
            ) : null}
            {tire.allowedRr ? (
              <Badge variant="default" size="sm">
                Right Rear
              </Badge>
            ) : null}
          </Group>
          <Title mt="md" mb="xs" order={3}>
            Overview
          </Title>
          <Card>
            <Stack>
              <TextWithLabel label="Total laps:">
                <Text>
                  {tireStints ? (
                    tireStints.reduce((total, { laps }) => total + laps, 0)
                  ) : (
                    <Skeleton />
                  )}
                </Text>
              </TextWithLabel>
              <TextWithLabel label="Total distance:">
                {tireStints && !loadingTracks ? (
                  formatDistance(
                    tireStints.reduce(
                      (total, { trackId, laps }) => total + laps * (getTrack(trackId)?.length || 0),
                      0
                    )
                  )
                ) : (
                  <Skeleton height={8} width="5rem" />
                )}
              </TextWithLabel>
              <TextWithLabel label="Used at:">
                {tireStints && !loadingTracks ? (
                  <Text>
                    {tireStints
                      .map(({ trackId }) => getTrack(trackId)?.name)
                      .filter((trackName) => trackName !== undefined)
                      .filter((value, index, array) => array.indexOf(value) === index)
                      .join(', ')}
                  </Text>
                ) : (
                  <Skeleton height={8} width="20rem" />
                )}
              </TextWithLabel>
            </Stack>
          </Card>

          <Title mt="md" mb="xs" order={3}>
            Stints
          </Title>
          {!tireStints ? (
            <div>No stints yet</div>
          ) : (
            <Card padding="xs">
              <Table highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <ThSortable
                      sorted={sortBy === 'date'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('date')}
                    >
                      Date
                    </ThSortable>
                    <ThSortable
                      sorted={sortBy === 'track'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('track')}
                    >
                      Track
                    </ThSortable>
                    <ThSortable
                      sorted={sortBy === 'position'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('position')}
                      miw={110}
                    >
                      Position
                    </ThSortable>
                    <ThSortable
                      sorted={sortBy === 'laps'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('laps')}
                      miw={90}
                    >
                      Laps
                    </ThSortable>
                    <ThSortable
                      sorted={sortBy === 'distance'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('distance')}
                      miw={115}
                    >
                      Distance
                    </ThSortable>
                    <ThSortable
                      sorted={sortBy === 'notes'}
                      reversed={reverseSortDirection}
                      onSort={() => setSorting('notes')}
                    >
                      Stint notes
                    </ThSortable>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {(sortedStints || enrichedStints).map(
                    ({ stintId, trackName, distance, date, laps, position, note }) => (
                      <Table.Tr
                        key={stintId}
                        className="cursor-pointer"
                        onClick={() => navigate(generatePath(routes.STINTS, { carId }))}
                      >
                        <Table.Td>{formatDate(date)}</Table.Td>
                        <Table.Td>{trackName || 'Unknown'}</Table.Td>
                        <Table.Td>
                          <Pill>{position}</Pill>
                        </Table.Td>
                        <Table.Td>{laps}</Table.Td>
                        <Table.Td>{formatDistance(distance)}</Table.Td>
                        <Table.Td maw={250}>{note}</Table.Td>
                      </Table.Tr>
                    )
                  )}
                </Table.Tbody>
                {tireStints?.length === 0 && (
                  <Table.Tfoot>
                    <Text p={10} c="dimmed">
                      No stints added yet
                    </Text>
                  </Table.Tfoot>
                )}
              </Table>
            </Card>
          )}
        </>
      )}
    </>
  );
};
