import { Button, Group, NumberInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { queryClient } from '@renderer/main';
import { FC } from 'react';

export interface AddTrackProps {
  trackId?: string;
}

interface TrackForm {
  trackId?: string;
  name: string;
  length: number;
}

export const AddTrack: FC<AddTrackProps> = ({ trackId }) => {
  const form = useForm<TrackForm>({
    mode: 'uncontrolled'
  });

  const save = () => {
    const track = form.getValues();
    console.log('saving track', { track });
    window.api.putTrack(track);
    queryClient.invalidateQueries({ queryKey: ['tracks'] });
  };

  return (
    <>
      <Title>{trackId ? 'Edit Track' : 'Add Track'}</Title>
      <Stack className="mt-5">
        <TextInput
          label="Track Name"
          placeholder="Enter track name"
          {...form.getInputProps('name')}
        />
        <NumberInput
          label="Track Length"
          placeholder="Enter track length in meters"
          suffix=" m"
          allowNegative={false}
          allowDecimal={false}
          allowLeadingZeros={false}
          {...form.getInputProps('length')}
        />
        <Group justify="flex-end">
          <Button variant="default" onClick={modals.closeAll}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </Group>
      </Stack>
    </>
  );
};
