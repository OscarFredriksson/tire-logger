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
import { useTires } from '@renderer/hooks/useTires';
import { useTracks } from '@renderer/hooks/useTracks';
import { useStints } from '@renderer/hooks/useStints';
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
  const { tracks } = useTracks();
  const { tires } = useTires({ carId });
  const { getStint, loading: loadingStints } = useStints({ carId });

  const form = useForm<Partial<Stint>>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    validate: zodResolver(stintSchema)
  });

  if (!form.initialized) {
    if (!stintId) {
      form.initialize({ carId, date: new Date() });
    } else if (!loadingStints) {
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
    const track = tracks?.find((track) => track.trackId === trackId);

    if (!track) return { placeholder: 'Select track...' };
    if (!laps) return { placeholder: 'Enter number of laps...' };

    return { value: formatDistance(track.length * laps) };
  };

  const { leftFront, rightFront, leftRear, rightRear } = form.getValues();

  const tireSelections = useMemo(
    () =>
      tires
        ?.map(({ tireId, name }) => ({ value: tireId, label: name }))
        .filter(({ value }) =>
          [leftFront, rightFront, leftRear, rightRear].every((tire) => tire !== value)
        ),
    [tires, leftFront, rightFront, leftRear, rightRear]
  );

  const allowedLfTires = useMemo(
    () =>
      tires
        ?.filter(
          ({ tireId, allowedLf }) =>
            allowedLf && [rightFront, leftRear, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [rightFront, leftRear, rightRear, tires]
  );

  const allowedRfTires = useMemo(
    () =>
      tires
        ?.filter(
          ({ tireId, allowedRf }) =>
            allowedRf && [leftFront, leftRear, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, leftRear, rightRear, tires]
  );

  const allowedLrTires = useMemo(
    () =>
      tires
        ?.filter(
          ({ tireId, allowedLr }) =>
            allowedLr && [leftFront, rightFront, rightRear].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, rightFront, rightRear, tires]
  );

  const allowedRrTires = useMemo(
    () =>
      tires
        ?.filter(
          ({ tireId, allowedRr }) =>
            allowedRr && [leftFront, leftRear, rightFront].every((tire) => tire !== tireId)
        )
        .map(({ tireId, name }) => ({ value: tireId, label: name })),
    [leftFront, leftRear, rightFront, tires]
  );

  const { mutate: save } = useMutation({
    operationType: stintId ? 'update' : 'create',
    entityName: 'stint',
    queryKey: ['stints', carId],
    mutationFn: async () => {
      form.setSubmitting(true);
      const { date, ...stint } = form.getValues();
      await window.api.putStint({ ...stint, date: new Date(date!) });
    },
    onError: () => form.setSubmitting(false)
  });

  return (
    <form onSubmit={form.onSubmit(() => save())}>
      <Title>{stintId ? 'Edit Stint' : 'New Stint'}</Title>
      <LoadingOverlay visible={!form.initialized || form.submitting} />
      {!tracks || !tireSelections ? (
        <Loader />
      ) : (
        <Stack className="mt-5">
          <DateTimePicker label="Stint time" {...form.getInputProps('date')} />
          <Select
            label="Track"
            placeholder="Select track"
            allowDeselect={false}
            data={tracks.map(({ trackId, name }) => ({ value: trackId, label: name }))}
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
