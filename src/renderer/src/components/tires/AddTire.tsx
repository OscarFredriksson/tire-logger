import { Button, Checkbox, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useTires } from '@renderer/hooks/useTires';
import { queryClient } from '@renderer/main';
import { Tire } from '@shared/model';
import { FC } from 'react';

export interface AddTireProps {
  carId: string;
  tireId?: string;
}

export const AddTire: FC<AddTireProps> = ({ carId, tireId }) => {
  const { getTire, loading } = useTires({ carId });

  const form = useForm<Partial<Tire>>({
    mode: 'uncontrolled'
  });

  if (!form.initialized) {
    if (!tireId) {
      form.initialize({});
    } else if (!loading) {
      const tire = getTire(tireId);
      if (tire) {
        form.initialize(tire);
      } else {
        throw new Error(`Tire with id ${tireId} not found`);
      }
    }
  }

  const save = () => {
    const tire = form.getValues();
    console.log('saving tire', { tire });
    window.api.putTire({ ...tire, carId });
    queryClient.invalidateQueries({ queryKey: ['tires'] });
    modals.closeAll();
  };

  return (
    <>
      <Title>Add Tire</Title>
      <Stack className="mt-5">
        <TextInput label="Name" key={form.key('name')} {...form.getInputProps('name')} />
        <Text size="sm">Allowed tire positions</Text>
        <Group justify="center">
          <Checkbox
            label="Left Front"
            labelPosition="left"
            key={form.key('allowedLf')}
            {...form.getInputProps('allowedLf', { type: 'checkbox' })}
          />
          <Checkbox
            label="Right Front"
            key={form.key('allowedRf')}
            {...form.getInputProps('allowedRf', { type: 'checkbox' })}
          />
        </Group>
        <Group justify="center">
          <Checkbox
            label="Left Rear"
            labelPosition="left"
            key={form.key('allowedLr')}
            {...form.getInputProps('allowedLr', { type: 'checkbox' })}
          />
          <Checkbox
            label="Right Rear"
            key={form.key('allowedRr')}
            {...form.getInputProps('allowedRr', { type: 'checkbox' })}
          />
        </Group>
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
