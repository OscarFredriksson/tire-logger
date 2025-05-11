import { Button, Group, Stack, TextInput, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { useCars } from '@renderer/hooks/useCars';
import { queryClient } from '@renderer/main';
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
    mode: 'uncontrolled'
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

  const save = () => {
    const car = form.getValues();
    console.log('saving car', { car });
    window.api.putCar(car);
    queryClient.invalidateQueries({ queryKey: ['cars'] });
    modals.closeAll();
  };

  return (
    <>
      <Title>{carId ? 'Edit Car' : 'Add Car'}</Title>
      <Stack className="mt-5">
        <TextInput label="Car Name" placeholder="Enter car name" {...form.getInputProps('name')} />
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
