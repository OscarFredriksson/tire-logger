import {
  IconAlertCircle,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { TitleWithButton } from './common/TitleWithButton';
import { useCars } from '@renderer/hooks/useCars';
import { ActionIcon, Card, Flex, Group, Loader, Menu, Stack, Text, Title } from '@mantine/core';
import { AddCar, AddCarProps } from './AddCar';
import { modals } from '@mantine/modals';
import { queryClient } from '@renderer/main';
import { FC, useState } from 'react';

interface CarMenuProps {
  carId: string;
  carName: string;
  openCarModal: (props?: AddCarProps) => void;
}

const CarMenu: FC<CarMenuProps> = ({ carId, carName, openCarModal }) => {
  const [opened, setOpened] = useState<boolean>(false);

  const onDelete = () => {
    modals.openConfirmModal({
      title: 'Delete car',
      children: (
        <Stack justify="center">
          <Group>
            <IconAlertCircle />
            <Text>Deleting a car will also delete all its tires and stints.</Text>
          </Group>
          <Text fw={500}>
            Are you sure you want to delete the car{' '}
            <Text span fw={800} inherit>
              {carName}
            </Text>
            ?
          </Text>
        </Stack>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => onConfirmDelete(),
      onAbort: () => modals.closeAll()
    });
  };

  const onConfirmDelete = () => {
    window.api.deleteCar(carId);
    queryClient.invalidateQueries({ queryKey: ['cars'] });
    modals.closeAll();
  };

  return (
    <Menu opened={opened} onChange={setOpened}>
      <Menu.Target>
        <ActionIcon className="ml-auto" variant="subtle" color="gray">
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openCarModal({ carId })}>
          Edit car
        </Menu.Item>
        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={onDelete}>
          Delete car
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export const Cars = () => {
  const { loading, cars } = useCars();

  const openCarModal = (props?: AddCarProps) => {
    modals.open({
      children: <AddCar {...props} />,
      withCloseButton: false
    });
  };

  return (
    <>
      <TitleWithButton buttonIcon={<IconPlus />} buttonText="Add car" onButtonClick={openCarModal}>
        Cars
      </TitleWithButton>
      {loading ? (
        <Loader className="mt-8" />
      ) : !cars || cars.length === 0 ? (
        <div className="mt-8">No cars added yet</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {cars.map(({ carId, name }) => (
            <Card key={'car-' + carId} padding={12}>
              <Group>
                <Title order={5}>{name}</Title>
                <CarMenu carId={carId} carName={name} openCarModal={openCarModal} />
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
