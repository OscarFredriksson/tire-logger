import { Checkbox, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { FC } from 'react';

export const AddTire: FC = () => {
  const form = useForm({
    initialValues: {
      name: undefined,
      allowedPositions: {
        leftFront: false,
        rightFront: false,
        leftRear: false,
        rightRear: false
      }
    }
  });

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
            key={form.key('allowedPositions.leftFront')}
            {...form.getInputProps('allowedPositions.leftFront', { type: 'checkbox' })}
          />
          <Checkbox
            label="Right Front"
            key={form.key('allowedPositions.rightFront')}
            {...form.getInputProps('allowedPositions.rightFront', { type: 'checkbox' })}
          />
        </Group>
        <Group justify="center">
          <Checkbox
            label="Left Rear"
            labelPosition="left"
            key={form.key('allowedPositions.leftRear')}
            {...form.getInputProps('allowedPositions.leftRear', { type: 'checkbox' })}
          />
          <Checkbox
            label="Right Rear"
            key={form.key('allowedPositions.rightRear')}
            {...form.getInputProps('allowedPositions.rightRear', { type: 'checkbox' })}
          />
        </Group>
      </Stack>
    </>
  );
};
