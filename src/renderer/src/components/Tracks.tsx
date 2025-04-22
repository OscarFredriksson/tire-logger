import { FC } from 'react';
import { TitleWithButton } from './common/TitleWithButton';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { useTracks } from '@renderer/hooks/useTracks';
import { Card, Flex, Loader } from '@mantine/core';
import { AddTrack, AddTrackProps } from './AddTrack';
import { modals } from '@mantine/modals';

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
        <Flex className="mt-5" direction="column" gap={10}>
          {tracks?.map(({ trackId, name, length }) => (
            <Card key={'track-' + trackId}>
              <TitleWithButton
                titleOrder={3}
                buttonText="Edit"
                buttonIcon={<IconEdit />}
                onButtonClick={() => {}}
              >
                {name}
              </TitleWithButton>
              Length: {length}
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
