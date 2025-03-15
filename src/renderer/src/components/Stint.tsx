import {
  Divider,
  Grid,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  Textarea,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { FC, useMemo } from 'react';
import { useTires } from '@renderer/hooks/useTires';
import { useTracks } from '@renderer/hooks/useTracks';

export interface StintProps {
  stintId?: string;
}

export const Stint: FC<StintProps> = ({ stintId }) => {
  const { tracks } = useTracks();
  const { tires } = useTires();

  const form = useForm({
    initialValues: {
      date: new Date(),
      trackId: undefined,
      laps: undefined,
      leftFront: undefined,
      rightFront: undefined,
      leftRear: undefined,
      rightRear: undefined,
      note: undefined
    }
  });

  const getDistanceProps = () => {
    const track = tracks?.find((track) => track.trackId === form.getValues().trackId);
    const laps = form.getValues().laps;

    if (!track) return { placeholder: 'Select track...' };
    if (!laps) return { placeholder: 'Enter number of laps...' };

    return { value: `${track.length * laps} m` };
  };

  const { leftFront, rightFront, leftRear, rightRear } = form.getValues();

  const tireSelections = useMemo(() => {
    return tires
      ?.map(({ tireId, name }) => ({ value: tireId, label: name }))
      .filter(({ value }) =>
        [leftFront, rightFront, leftRear, rightRear].every((tire) => tire !== value)
      );
  }, [tires, leftFront, rightFront, leftRear, rightRear]);

  return (
    <div>
      <Title>{stintId ? 'Edit Stint' : 'New Stint'}</Title>
      {!tracks || !tireSelections ? (
        <Loader />
      ) : (
        <Stack className="mt-5">
          <DateTimePicker
            label="Stint time"
            key={form.key('date')}
            {...form.getInputProps('date')}
          />
          <Select
            label="Track"
            placeholder="Select track"
            allowDeselect={false}
            key={form.key('trackId')}
            data={tracks.map(({ trackId, name }) => ({ value: trackId, label: name }))}
            {...form.getInputProps('trackId')}
            searchable
          />

          <Group grow>
            <NumberInput
              label="Laps"
              placeholder="Number of laps"
              min={1}
              key={form.key('laps')}
              {...form.getInputProps('laps')}
            />
            <TextInput disabled label="Distance" {...getDistanceProps()} />
          </Group>
          <Divider className="mt-2" label="Tires" />
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Left Front"
                placeholder="Select left front"
                data={tireSelections}
                searchable
                key={form.key('leftFront')}
                {...form.getInputProps('leftFront')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Right Front"
                placeholder="Select right front"
                data={tireSelections}
                searchable
                key={form.key('rightFront')}
                {...form.getInputProps('rightFront')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Left Rear"
                placeholder="Select left rear"
                data={tireSelections}
                searchable
                key={form.key('leftRear')}
                {...form.getInputProps('leftRear')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Right Rear"
                placeholder="Select right rear"
                data={tireSelections}
                searchable
                key={form.key('rightRear')}
                {...form.getInputProps('rightRear')}
              />
            </Grid.Col>
          </Grid>
          <Divider />
          <Textarea
            label="Additional notes"
            placeholder="You can add additional notes here..."
            key={form.key('note')}
            {...form.getInputProps('note')}
          />
        </Stack>
      )}
    </div>
  );
};
