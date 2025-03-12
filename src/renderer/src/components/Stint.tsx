import {
  Divider,
  Grid,
  Group,
  Loader,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Title
} from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { Track } from '@shared/model';
import { FC, useEffect, useMemo, useState } from 'react';
import { Tire as ITire } from '@shared/model';

export const Stint: FC = () => {
  const [tracks, setTracks] = useState<Track[]>();
  const [tires, setTires] = useState<ITire[]>();

  useEffect(() => {
    const getTrackData = async () => {
      const tracks = await window.api.getTracks();
      setTracks(tracks);
    };
    const getTireData = async () => {
      const data: ITire[] = await window.api.getTireData();
      console.log(data);
      setTires(data);
    };
    getTrackData();
    getTireData();
  }, []);

  const form = useForm({
    initialValues: {
      date: new Date(),
      track: undefined,
      laps: undefined,
      leftFront: undefined,
      rightFront: undefined,
      leftRear: undefined,
      rightRear: undefined
    }
  });

  const getDistanceProps = () => {
    const track = tracks?.find((track) => track.trackId === form.getValues().track);
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
      <Title>New Stint</Title>
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
            key={form.key('track')}
            data={tracks.map(({ trackId, name }) => ({ value: trackId, label: name }))}
            {...form.getInputProps('track')}
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
                key={form.key('leftFront')}
                {...form.getInputProps('leftFront')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Right Front"
                placeholder="Select right front"
                data={tireSelections}
                key={form.key('rightFront')}
                {...form.getInputProps('rightFront')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Left Rear"
                placeholder="Select left rear"
                data={tireSelections}
                key={form.key('leftRear')}
                {...form.getInputProps('leftRear')}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Right Rear"
                placeholder="Select right rear"
                data={tireSelections}
                key={form.key('rightRear')}
                {...form.getInputProps('rightRear')}
              />
            </Grid.Col>
          </Grid>
          <Divider />
        </Stack>
      )}
    </div>
  );
};
