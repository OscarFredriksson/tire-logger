import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { useForm, zodResolver } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useCars } from '@renderer/hooks/useCars';
import { useMutation } from '@renderer/hooks/useMutation';
import { carSchema } from '../../../../shared/schema/carSchema';
import { FC } from 'react';

export interface AddCarProps {
  carId?: string;
}

interface CarForm {
  name?: string;
}

export const AddCar: FC<AddCarProps> = ({ carId }) => {
  const { loading, getCar } = useCars();

  const form = useForm<CarForm>({
    mode: 'uncontrolled',
    validateInputOnChange: true,
    validate: zodResolver(carSchema)
  });

  if (!form.initialized) {
    if (!carId) {
      form.initialize({});
    } else if (!loading) {
      const car = getCar(carId);
      if (car) {
        form.initialize(car);
      } else {
        throw new Error(`Car with id ${carId} not found`);
      }
    }
  }

  const { mutate: save } = useMutation({
    operationType: carId ? 'update' : 'create',
    entityName: 'car',
    queryKey: ['cars'],
    mutationFn: async () => {
      form.setSubmitting(true);
      const car = form.getValues();
      await window.api.putCar(car);
    },
    onError: () => form.setSubmitting(false)
  });

  return (
    <form onSubmit={form.onSubmit(() => save())}>
      <Title>{carId ? 'Edit Car' : 'Add Car'}</Title>
      <Stack className="mt-5">
        <TextInput label="Car Name" placeholder="Enter car name" {...form.getInputProps('name')} />
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
