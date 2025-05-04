import { ActionIcon, Loader, Menu, Skeleton, Table, Text, Tooltip } from '@mantine/core';
import {
  IconArrowRight,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { FC, useState } from 'react';
import { generatePath, useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire, AddTireProps } from './AddTire';
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from './common/TitleWithButton';
import { useStints } from '@renderer/hooks/useStints';
import { Stint } from '@shared/model';
import { useTracks } from '@renderer/hooks/useTracks';
import { queryClient } from '@renderer/main';
import { themeConstants } from '@renderer/theme';

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
        <Text>
          Are you sure you want to delete the tire <i>{tireName}</i>?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmDelete(),
      onAbort: () => modals.closeAll()
    });
  };

  const onConfirmDelete = () => {
    // window.api.deleteTire(tireId);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
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
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openTireModal({ tireId })}>
          Edit tire
        </Menu.Item>
        <Menu.Item disabled color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
          Delete tire
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const Tires: FC = () => {
  const { carId } = useParams();

  const navigate = useNavigate();

  const { loading, tires } = useTires({ carId });
  const { loading: loadingStints, getTireStints } = useStints();
  const { getTrack } = useTracks();

  const openTireModal = (props?: AddTireProps) => {
    modals.open({
      children: <AddTire {...props} carId={carId!} />,
      withCloseButton: false
    });
  };

  console.log('Tires', tires);

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
        <div>No tires added yet</div>
      ) : (
        <Table className="mt-8">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Total laps</Table.Th>
              <Table.Th>Last used</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tires?.map(({ tireId, name }) => {
              const tireStints = getTireStints(tireId);
              const lastUsedStint = tireStints?.reduce(
                (latest, stint) => {
                  if (!latest || stint.date > latest.date) {
                    return stint;
                  }
                  return latest;
                },
                undefined as Stint | undefined
              );

              const lastUsedTrack = lastUsedStint && getTrack(lastUsedStint.trackId)?.name;

              const lastUsedString = lastUsedStint
                ? lastUsedStint.date.toLocaleDateString() +
                  (lastUsedTrack ? ' at ' + lastUsedTrack : '')
                : 'Never';

              return (
                <Table.Tr key={tireId}>
                  <Table.Td>{name}</Table.Td>
                  <Table.Td>
                    {!loadingStints ? (
                      tireStints.reduce((total, { laps }) => total + laps, 0)
                    ) : (
                      <Skeleton height={8} />
                    )}
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
                          onClick={() => navigate(generatePath(routes.TIRE_tireId, { tireId }))}
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
