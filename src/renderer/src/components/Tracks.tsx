import { FC } from 'react';
import { TitleWithButton } from './common/TitleWithButton';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { useTracks } from '@renderer/hooks/useTracks';
import { ActionIcon, Loader, Table } from '@mantine/core';
import { formatDistance } from '@renderer/utils/distanceUtils';

export const Tracks: FC = () => {
  const { Thead, Tbody, Tr, Th, Td } = Table;

  const { loading, tracks } = useTracks();

  return (
    <>
      <TitleWithButton
        title="Tracks"
        buttonIcon={<IconPlus />}
        buttonText="Add track"
        onButtonClick={() => console.log('Add track')}
      />
      {loading ? (
        <Loader className="mt-8" />
      ) : (
        <Table className="mt-8">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Length</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tracks?.map(({ trackId, name, length }) => (
              <Tr key={trackId}>
                <Td>{name}</Td>
                <Td>{formatDistance(length)}</Td>
                <Td>
                  <ActionIcon className="mr-2" size="lg" variant="light">
                    <IconEdit size={20} onClick={() => {}} />
                  </ActionIcon>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
    </>
  );
};
