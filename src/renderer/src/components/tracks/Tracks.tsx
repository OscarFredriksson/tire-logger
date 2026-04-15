import { FC, useState } from 'react';
import { TitleWithButton } from '../common/TitleWithButton';
import {
  IconDotsVertical,
  IconEdit,
  IconInfoCircle,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { useActiveTracks, useArchivedTracks } from '@renderer/hooks/useTracks';
import {
  ActionIcon,
  Alert,
  Card,
  Flex,
  Group,
  Loader,
  Menu,
  Stack,
  Text,
  Title
} from '@mantine/core';
import { AddTrack, AddTrackProps } from './AddTrack';
import { modals } from '@mantine/modals';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { queryClient } from '@renderer/main';
import SegmentToggle from '../common/SegmentToggle';

interface TrackMenuProps {
  trackId: string;
  trackName: string;
  openTrackModal: (props?: AddTrackProps) => void;
  archived?: boolean;
}

const TrackMenu: FC<TrackMenuProps> = ({ trackId, trackName, openTrackModal, archived }) => {
  const [opened, setOpened] = useState<boolean>(false);

  const onDelete = () => {
    modals.openConfirmModal({
      title: 'Archive track',
      children: (
        <Stack justify="center">
          <Text>
            Are you sure you want to archive the track{' '}
            <Text span inherit fw={800}>
              {trackName}
            </Text>
            ?
          </Text>

          <Alert variant="light" color="red" icon={<IconInfoCircle />}>
            This will also archive all stints where this track is used.
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Archive', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmArchive(),
      onAbort: () => modals.closeAll()
    });
  };

  const onRestore = () => {
    modals.openConfirmModal({
      title: 'Restore track',
      children: (
        <Stack justify="center">
          <Text>
            Are you sure you want to restore the track{' '}
            <Text span inherit fw={800}>
              {trackName}
            </Text>
            ?
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Restore', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmRestore(),
      onAbort: () => modals.closeAll()
    });
  };

  const onConfirmArchive = () => {
    window.api.archiveTrack(trackId);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
    modals.closeAll();
  };

  const onConfirmRestore = () => {
    window.api.restoreTrack(trackId);
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
        {(archived && (
          <Menu.Item leftSection={<IconTrash size={14} />} onClick={onRestore}>
            Restore track
          </Menu.Item>
        )) || (
          <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
            Archive track
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

export const Tracks: FC = () => {
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { loadingActiveTracks, activeTracks } = useActiveTracks();
  const { loadingArchivedTracks, archivedTracks } = useArchivedTracks();

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
        centerElement={
          <SegmentToggle
            value={showArchived ? 'archived' : 'active'}
            onChange={(v) => setShowArchived(v === 'archived')}
          />
        }
      >
        Tracks
      </TitleWithButton>
      {showArchived ? (
        loadingArchivedTracks ? (
          <Loader className="mt-8" />
        ) : !archivedTracks || archivedTracks.length === 0 ? (
          <div className="mt-4">No archived tracks found</div>
        ) : (
          <Flex className="mt-2" direction="column" gap={10}>
            {archivedTracks?.map(({ trackId, name, length }) => (
              <Card key={'track-' + trackId} padding={12}>
                <Group>
                  <Title order={5}>{name}</Title>
                  <Text c="dimmed">Length: {formatDistance(length)}</Text>
                  <TrackMenu
                    trackId={trackId}
                    trackName={name}
                    openTrackModal={openTrackModal}
                    archived={showArchived}
                  />
                </Group>
              </Card>
            ))}
          </Flex>
        )
      ) : loadingActiveTracks ? (
        <Loader className="mt-8" />
      ) : !activeTracks || activeTracks.length === 0 ? (
        <div className="mt-4">No tracks added yet</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {activeTracks?.map(({ trackId, name, length }) => (
            <Card key={'track-' + trackId} padding={12}>
              <Group>
                <Title order={5}>{name}</Title>
                <Text c="dimmed">Length: {formatDistance(length)}</Text>
                <TrackMenu
                  trackId={trackId}
                  trackName={name}
                  openTrackModal={openTrackModal}
                  archived={showArchived}
                />
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
