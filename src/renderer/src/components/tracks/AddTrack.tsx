import { Button, Group, LoadingOverlay, NumberInput, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useMutation } from '@renderer/hooks/useMutation';
import { useTracks } from '@renderer/hooks/useTracks';
import { trackSchema } from '../../../../shared/schema/trackSchema';
import { FC } from 'react';

export interface AddTrackProps {
  trackId?: string;
}

interface TrackForm {
  trackId?: string;
  name?: string;
  length?: number;
}

export const AddTrack: FC<AddTrackProps> = ({ trackId }) => {
  const { getTrack, loading } = useTracks();

  const form = useForm<TrackForm>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    validate: zodResolver(trackSchema)
  });

  if (!form.initialized) {
    if (!trackId) {
      form.initialize({});
    } else if (!loading) {
      const track = getTrack(trackId);
      if (track) {
        form.initialize(track);
      } else {
        throw new Error(`Track with id ${trackId} not found`);
      }
    }
  }

  const { mutate: save } = useMutation({
    operationType: trackId ? 'update' : 'create',
    entityName: 'track',
    queryKey: ['tracks'],
    mutationFn: async () => {
      form.setSubmitting(true);
      const track = form.getValues();
      await window.api.putTrack(track);
    },
    onError: () => form.setSubmitting(false)
  });

  return (
    <form onSubmit={form.onSubmit(() => save())}>
      <LoadingOverlay visible={!form.initialized || form.submitting} />
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
          <Button type="submit" disabled={!form.isValid()}>
            Save
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
