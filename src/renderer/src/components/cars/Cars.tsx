import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { TitleWithButton } from '../common/TitleWithButton';
import { useCars } from '@renderer/hooks/useCars';
import { ActionIcon, Card, Flex, Group, Loader, Menu, Title } from '@mantine/core';
import { AddCar, AddCarProps } from './AddCar';
import { modals } from '@mantine/modals';
import { FC, useState } from 'react';

interface CarMenuProps {
  carId: string;
  openCarModal: (props?: AddCarProps) => void;
}

const CarMenu: FC<CarMenuProps> = ({ carId, openCarModal }) => {
  const { deleteCar } = useCars();
  const [opened, setOpened] = useState<boolean>(false);

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
        <Menu.Item
          color="red"
          leftSection={<IconTrash size={14} />}
          onClick={() => deleteCar(carId)}
        >
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
        <div className="mt-4">No cars added yet</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {cars.map(({ carId, name }) => (
            <Card key={'car-' + carId} padding={12}>
              <Group>
                <Title order={5}>{name}</Title>
                <CarMenu carId={carId} openCarModal={openCarModal} />
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
