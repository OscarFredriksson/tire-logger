import {
  ActionIcon,
  Center,
  Group,
  Loader,
  Menu,
  Skeleton,
  Stack,
  Table,
  Text,
  Tooltip,
  UnstyledButton
} from '@mantine/core';
import {
  IconArrowRight,
  IconChevronDown,
  IconChevronUp,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconSelector,
  IconTrash
} from '@tabler/icons-react';
import { FC, useEffect, useMemo, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire, AddTireProps } from './AddTire';
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from './common/TitleWithButton';
import { useStints } from '@renderer/hooks/useStints';
import { Stint, Tire } from '@shared/model';
import { useTracks } from '@renderer/hooks/useTracks';
import { queryClient } from '@renderer/main';
import { themeConstants } from '@renderer/theme';
import { formatDistance } from '@renderer/utils/distanceUtils';

// TODO: sortable table

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
    <Table.Th className="p-0">
      <UnstyledButton onClick={onSort} className="control">
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center className="icon">
            <Icon size={16} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
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

  console.log('Tires', tires);

  const enrichedTires = useMemo(
    () =>
      tires?.map((tire) => {
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
    [tires, getTireStints, getTrack]
  );

  const [sortBy, setSortBy] = useState<'name' | 'distance' | 'date' | undefined>(undefined);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);
  const [sortedData, setSortedData] = useState(enrichedTires);

  useEffect(() => {
    console.log('setting enrichedTires', enrichedTires);
    setSortedData(enrichedTires);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tires]);

  const setSorting = (field: 'name' | 'distance' | 'date' | undefined) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(sortData(enrichedTires || [], field, reversed));
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
      {loading ? (
        <Loader className="mt-8" />
      ) : !tires || tires.length === 0 ? (
        <div className="mt-4">No tires added yet</div>
      ) : (
        <Table className="mt-4">
          <Table.Thead>
            <Table.Tr>
              <Th
                sorted={sortBy === 'name'}
                reversed={reverseSortDirection}
                onSort={() => setSorting('name')}
              >
                Name
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
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sortedData?.map(({ tireId, name, distance, lastUsedStint }) => {
              const lastUsedTrack = lastUsedStint && getTrack(lastUsedStint.trackId)?.name;

              const lastUsedString = lastUsedStint
                ? lastUsedStint.date.toLocaleDateString() +
                  ' ' +
                  lastUsedStint.date.toLocaleTimeString() +
                  (lastUsedTrack ? ' at ' + lastUsedTrack : '')
                : 'Never';

              return (
                <Table.Tr key={tireId}>
                  <Table.Td>{name}</Table.Td>
                  <Table.Td>
                    {!loadingStints ? formatDistance(distance) : <Skeleton height={8} />}
                  </Table.Td>
                  <Table.Td>{lastUsedString}</Table.Td>
                  <Table.Td align="right">
                    <TireMenu tireId={tireId} tireName={name} openTireModal={openTireModal} />
                    <Tooltip
                      withArrow
                      label="Go to tire"
                      openDelay={themeConstants.TOOLTIP_OPEN_DELAY}
                    >
                      <ActionIcon size="md" variant="gradient">
                        <IconArrowRight
                          size={20}
                          onClick={() =>
                            navigate(generatePath(routes.TIRE_tireId, { carId, tireId }))
                          }
                        />
                      </ActionIcon>
                    </Tooltip>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
};
