import { Stack, Text } from '@mantine/core';
import { FC } from 'react';

interface DeleteTireConfirmProps {
  tireName: string;
}

export const DeleteTireConfirm: FC<DeleteTireConfirmProps> = ({ tireName }) => {
  return (
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
  );
};
