import { FC, useState } from 'react';
import { TitleWithButton } from './common/TitleWithButton';
import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTracks } from '@renderer/hooks/useTracks';
import { ActionIcon, Card, Flex, Group, Loader, Menu, Text, Title } from '@mantine/core';
import { AddTrack, AddTrackProps } from './AddTrack';
import { modals } from '@mantine/modals';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { queryClient } from '@renderer/main';

interface TrackMenuProps {
  trackId: string;
  trackName: string;
  openTrackModal: (props?: AddTrackProps) => void;
}

const TrackMenu: FC<TrackMenuProps> = ({ trackId, trackName, openTrackModal }) => {
  const [opened, setOpened] = useState<boolean>(false);

  const onDelete = () => {
    modals.openConfirmModal({
      title: 'Delete track',
      children: (
        <Text>
          Are you sure you want to delete the track <i>{trackName}</i>?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmDelete(),
      onAbort: () => modals.closeAll()
    });
  };

  const onConfirmDelete = () => {
    window.api.deleteTrack(trackId);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
    modals.closeAll();
  };

  return (
    <Menu opened={opened} onChange={setOpened}>
      <Menu.Target>
        <ActionIcon className="ml-auto" variant="subtle" color="gray">
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openTrackModal({ trackId })}>
          Edit track
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
          Delete track
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const Tracks: FC = () => {
  const { loading, tracks } = useTracks();

  const openTrackModal = (props?: AddTrackProps) => {
    modals.open({
      children: <AddTrack {...props} />,
      withCloseButton: false
    });
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add track"
        onButtonClick={openTrackModal}
      >
        Tracks
      </TitleWithButton>
      {loading ? (
        <Loader className="mt-8" />
      ) : !tracks || tracks.length === 0 ? (
        <div className="mt-8">No tracks found</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {tracks?.map(({ trackId, name, length }) => (
            <Card key={'track-' + trackId} padding={12}>
              <Group>
                <Title order={5}>{name}</Title>
                <Text c="dimmed">Length: {formatDistance(length)}</Text>
                <TrackMenu trackId={trackId} trackName={name} openTrackModal={openTrackModal} />
                {/* <Tooltip
                  className="ml-auto"
                  withArrow
                  label="Edit track"
                  openDelay={themeConstants.TOOLTIP_OPEN_DELAY}
                >
                  <ActionIcon size="lg" variant="light">
                    <IconEdit onClick={() => onEdit(trackId)} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip
                  withArrow
                  label="Delete track"
                  openDelay={themeConstants.TOOLTIP_OPEN_DELAY}
                >
                  <ActionIcon size="lg" color="red" variant="light">
                    <IconTrash onClick={() => onDelete(trackId, name)} />
                  </ActionIcon>
                </Tooltip> */}
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
