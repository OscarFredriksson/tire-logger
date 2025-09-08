import {
  Button,
  Divider,
  Grid,
  Group,
  Loader,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm, zodResolver } from '@mantine/form';
import { FC, useMemo } from 'react';
import { useActiveTires } from '@renderer/hooks/useTires';
import { useActiveTracks } from '@renderer/hooks/useTracks';
import { useActiveStints } from '@renderer/hooks/useStints';
import { modals } from '@mantine/modals';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { Stint } from '@shared/model';
import { useMutation } from '@renderer/hooks/useMutation';
import { stintSchema } from '../../../../shared/schema/stintSchema';

export interface StintProps {
  carId: string;
  stintId?: string;
}

export const AddStint: FC<StintProps> = ({ carId, stintId }) => {
  const { activeTracks } = useActiveTracks();
  const { activeTires } = useActiveTires({ carId });
  const { getStint, loadingActiveStints } = useActiveStints({ carId });

  const form = useForm<Partial<Stint>>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    validate: zodResolver(stintSchema)
  });

  if (!form.initialized) {
    if (!stintId) {
      form.initialize({ carId, date: new Date() });
    } else if (!loadingActiveStints) {
      const stint = getStint(stintId);
      if (stint) {
        form.initialize(stint);
      } else {
        throw new Error(`Stint with id ${stintId} not found`);
      }
    }
  }

  const getDistanceProps = () => {
    const { trackId, laps } = form.getValues();
    const track = activeTracks?.find((track) => track.trackId === trackId);

    if (!track) return { placeholder: 'Select track...' };
    if (!laps) return { placeholder: 'Enter number of laps...' };

    return { value: formatDistance(track.length * laps) };
  };

  const { leftFront, rightFront, leftRear, rightRear } = form.getValues();

  const tireSelections = useMemo(
    () =>
      activeTires
        ?.map(({ tireId, name }) => ({ value: tireId, label: name }))
        .filter(({ value }) =>
          [leftFront, rightFront, leftRear, rightRear].every((tire) => tire !== value)
        ),
    [activeTires, leftFront, rightFront, leftRear, rightRear]
  );

  const allowedLfTires = useMemo(
    () =>
      activeTires
        ?.filter(
          ({ tireId, allowedLf }) =>
            allowedLf && [rightFront, leftRear, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [rightFront, leftRear, rightRear, activeTires]
  );

  const allowedRfTires = useMemo(
    () =>
      activeTires
        ?.filter(
          ({ tireId, allowedRf }) =>
            allowedRf && [leftFront, leftRear, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, leftRear, rightRear, activeTires]
  );

  const allowedLrTires = useMemo(
    () =>
      activeTires
        ?.filter(
          ({ tireId, allowedLr }) =>
            allowedLr && [leftFront, rightFront, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, rightFront, rightRear, activeTires]
  );

  const allowedRrTires = useMemo(
    () =>
      activeTires
        ?.filter(
          ({ tireId, allowedRr }) =>
            allowedRr && [leftFront, leftRear, rightFront].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, leftRear, rightFront, activeTires]
  );

  const { mutate: save } = useMutation({
    operationType: stintId ? 'update' : 'create',
    entityName: 'stint',
    queryKey: ['stints', carId],
    mutationFn: async () => {
      form.setSubmitting(true);
      const { date, trackId, laps, leftFront, rightFront, leftRear, rightRear, note, archived } =
        form.getValues();
      if (!trackId) throw new Error('Track is required');
      if (!laps) throw new Error('Laps is required');
      await window.api.putStint({
        carId,
        date: new Date(date!),
        trackId,
        laps,
        leftFront: leftFront ?? '',
        rightFront: rightFront ?? '',
        leftRear: leftRear ?? '',
        rightRear: rightRear ?? '',
        note: note ?? '',
        archived: archived ?? false
      });
    },
    onError: () => form.setSubmitting(false)
  });

  return (
    <form onSubmit={form.onSubmit(() => save())}>
      <Title>{stintId ? 'Edit Stint' : 'New Stint'}</Title>
      <LoadingOverlay visible={!form.initialized || form.submitting} />
      {!activeTracks || !tireSelections ? (
        <Loader />
      ) : (
        <Stack className="mt-5">
          <DateTimePicker label="Stint time" {...form.getInputProps('date')} />
          <Select
            label="Track"
            placeholder="Select track"
            allowDeselect={false}
            data={activeTracks.map(({ trackId, name }) => ({ value: trackId, label: name }))}
            {...form.getInputProps('trackId')}
            searchable
          />

          <Group grow>
            <NumberInput
              {...form.getInputProps('laps')}
              label="Laps"
              placeholder="Number of laps"
              min={1}
            />
            <TextInput disabled label="Distance" {...getDistanceProps()} />
          </Group>
          <Divider className="mt-2" label="Tires" />
          <Grid>
            <Grid.Col span={6}>
              <Select
                {...form.getInputProps('leftFront')}
                label="Left Front"
                placeholder="Select left front"
                data={allowedLfTires}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                {...form.getInputProps('rightFront')}
                label="Right Front"
                placeholder="Select right front"
                data={allowedRfTires}
                searchable
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Left Rear"
                placeholder="Select left rear"
                data={allowedLrTires}
                searchable
                {...form.getInputProps('leftRear')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Right Rear"
                placeholder="Select right rear"
                data={allowedRrTires}
                searchable
                {...form.getInputProps('rightRear')}
              />
            </Grid.Col>
          </Grid>
          <Divider />
          <Textarea
            label="Additional notes"
            placeholder="You can add additional notes here..."
            {...form.getInputProps('note')}
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
      )}
    </form>
  );
};
