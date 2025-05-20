import { Button, Checkbox, Group, LoadingOverlay, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useMutation } from '@renderer/hooks/useMutation';
import { useTires } from '@renderer/hooks/useTires';
import { Tire } from '@shared/model';
import { tireSchema } from '../../../../shared/schema/tireSchema';
import { FC } from 'react';

export interface AddTireProps {
  carId: string;
  tireId?: string;
}

export const AddTire: FC<AddTireProps> = ({ carId, tireId }) => {
  const { getTire, loading } = useTires({ carId });

  const form = useForm<Partial<Tire>>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    validate: zodResolver(tireSchema)
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

  const getActivePositions = () => {
    const positions: string[] = [];
    const { allowedLf, allowedRf, allowedLr, allowedRr } = form.getValues();
    if (allowedLf) positions.push('LF');
    if (allowedRf) positions.push('RF');
    if (allowedLr) positions.push('LR');
    if (allowedRr) positions.push('RR');
    return positions;
  };

  const { mutate: save } = useMutation({
    operationType: tireId ? 'update' : 'create',
    entityName: 'tire',
    queryKey: ['tires', carId],
    mutationFn: async () => {
      form.setSubmitting(true);
      const tire = form.getValues();
      await window.api.putTire({ ...tire, carId });
    },
    onError: () => form.setSubmitting(false)
  });

  return (
    <form onSubmit={form.onSubmit(() => save())}>
      <LoadingOverlay visible={!form.initialized || form.submitting} />
      <Title>{tireId ? 'Edit' : 'Add'} Tire</Title>
      <Stack className="mt-5">
        <TextInput
          label="Name"
          key={form.key('name')}
          {...form.getInputProps('name')}
          withAsterisk
        />
        <Checkbox.Group
          value={getActivePositions()}
          error={form.errors.allowedLf}
          onChange={(positions) =>
            form.setValues({
              ...form.values,
              allowedLf: positions.includes('LF'),
              allowedRf: positions.includes('RF'),
              allowedLr: positions.includes('LR'),
              allowedRr: positions.includes('RR')
            })
          }
          label="Allowed tire positions"
          withAsterisk
        >
          <Group justify="center" gap="sm" mt="sm">
            <Checkbox value="LF" label="Left Front" labelPosition="left" />
            <Checkbox value="RF" label="Right Front" />
          </Group>
          <Group justify="center" mt="sm" mb="sm" gap="sm">
            <Checkbox value="LR" label="Left Rear" labelPosition="left" />
            <Checkbox value="RR" label="Right Rear" />
          </Group>
        </Checkbox.Group>
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
