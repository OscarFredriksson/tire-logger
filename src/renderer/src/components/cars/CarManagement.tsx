import { IconArrowBackUp, IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { useArchivedCars, useActiveCar } from '@renderer/hooks/useCars';
import { ActionIcon, Card, Flex, Group, Loader, Menu, Title } from '@mantine/core';
import { AddCar, AddCarProps } from './AddCar';
import { modals } from '@mantine/modals';
import { FC, useState } from 'react';

interface CarMenuProps {
  carId: string;
  carName: string;
  openCarModal: (props?: AddCarProps) => void;
  archived: boolean;
}

const CarMenu: FC<CarMenuProps> = ({ carId, carName, openCarModal, archived }) => {
  const { archiveCar } = useActiveCar();
  const { restoreCar } = useArchivedCars();
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <Menu opened={opened} onChange={setOpened}>
      <Menu.Target>
        <ActionIcon
          className="ml-auto"
          size="md"
          variant="subtle"
          color="gray"
          aria-label={`Manage ${carName}`}
        >
          <IconDotsVertical />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item leftSection={<IconEdit size={14} />} onClick={() => openCarModal({ carId })}>
          Edit car
        </Menu.Item>
        {(archived && (
          <Menu.Item leftSection={<IconArrowBackUp size={14} />} onClick={() => restoreCar(carId)}>
            Restore car
          </Menu.Item>
        )) || (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={14} />}
            onClick={() => archiveCar(carId)}
          >
            Archive car
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
};

const carsTableTextMap = (archived: boolean) => ({
  empty: archived ? 'No archived cars found' : 'No cars added yet'
});

export const CarManagement = ({ showArchived }: { showArchived: boolean }) => {
  const { loadingActiveCars, activeCars } = useActiveCar();
  const { loadingArchivedCars, archivedCars, archivedCarsError } = useArchivedCars();

  const openCarModal = (props?: AddCarProps) => {
    modals.open({
      children: <AddCar {...props} />,
      withCloseButton: false
    });
  };

  if (showArchived && archivedCarsError) throw archivedCarsError;

  return (
    <Flex className="mt-2" direction="column" gap={10}>
      {showArchived ? (
        loadingArchivedCars ? (
          <Loader className="mt-8" />
        ) : !archivedCars || archivedCars.length === 0 ? (
          <div className="mt-4">{carsTableTextMap(true).empty}</div>
        ) : (
          <>
            {archivedCars.map(({ carId, name }) => (
              <Card key={carId} padding={12}>
                <Group wrap="nowrap">
                  <Title order={5} className="car-card-name">
                    {name}
                  </Title>
                  <CarMenu
                    carId={carId}
                    carName={name}
                    openCarModal={openCarModal}
                    archived={true}
                  />
                </Group>
              </Card>
            ))}
          </>
        )
      ) : loadingActiveCars ? (
        <Loader className="mt-8" />
      ) : !activeCars || activeCars.length === 0 ? (
        <div className="mt-4">{carsTableTextMap(false).empty}</div>
      ) : (
        <>
          {activeCars.map(({ carId, name }) => (
            <Card key={carId} padding={12}>
              <Group wrap="nowrap">
                <Title order={5} className="car-card-name">
                  {name}
                </Title>
                <CarMenu
                  carId={carId}
                  carName={name}
                  openCarModal={openCarModal}
                  archived={false}
                />
              </Group>
            </Card>
          ))}
        </>
      )}
    </Flex>
  );
};
