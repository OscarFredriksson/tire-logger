import { IconDotsVertical, IconEdit, IconPlus, IconTrash } from '@tabler/icons-react';
import { TitleWithButton } from '../common/TitleWithButton';
import { useArchivedCars, useActiveCar } from '@renderer/hooks/useCars';
import {
  ActionIcon,
  Card,
  Flex,
  Group,
  Loader,
  Menu,
  SegmentedControl,
  Title
} from '@mantine/core';
import { AddCar, AddCarProps } from './AddCar';
import { modals } from '@mantine/modals';
import { FC, useState } from 'react';

interface CarMenuProps {
  carId: string;
  openCarModal: (props?: AddCarProps) => void;
  archived: boolean;
}

const CarMenu: FC<CarMenuProps> = ({ carId, openCarModal, archived }) => {
  const { archiveCar } = useActiveCar();
  const { restoreCar } = useArchivedCars();
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
        {(archived && (
          <Menu.Item leftSection={<IconTrash size={14} />} onClick={() => restoreCar(carId)}>
            Restore car
          </Menu.Item>
        )) || (
          <Menu.Item leftSection={<IconTrash size={14} />} onClick={() => archiveCar(carId)}>
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

export const Cars = () => {
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { loadingActiveCars, activeCars } = useActiveCar();
  const { loadingArchivedCars, archivedCars } = useArchivedCars();

  const openCarModal = (props?: AddCarProps) => {
    modals.open({
      children: <AddCar {...props} />,
      withCloseButton: false
    });
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add car"
        onButtonClick={openCarModal}
        centerElement={
          <SegmentedControl
            value={showArchived ? 'archived' : 'active'}
            onChange={(v) => setShowArchived(v === 'archived')}
            data={[
              { label: 'Active', value: 'active' },
              { label: 'Archived', value: 'archived' }
            ]}
            mr="auto"
            ml="lg"
          />
        }
      >
        Cars
      </TitleWithButton>
      {showArchived ? (
        loadingArchivedCars ? (
          <Loader className="mt-8" />
        ) : !archivedCars || archivedCars.length === 0 ? (
          <div className="mt-4">{carsTableTextMap(true).empty}</div>
        ) : (
          <Flex className="mt-2" direction="column" gap={10}>
            {archivedCars.map(({ carId, name }) => (
              <Card key={'car-' + carId} padding={12}>
                <Group>
                  <Title order={5}>{name}</Title>
                  <CarMenu carId={carId} openCarModal={openCarModal} archived={true} />
                </Group>
              </Card>
            ))}
          </Flex>
        )
      ) : loadingActiveCars ? (
        <Loader className="mt-8" />
      ) : !activeCars || activeCars.length === 0 ? (
        <div className="mt-4">{carsTableTextMap(false).empty}</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {activeCars.map(({ carId, name }) => (
            <Card key={'car-' + carId} padding={12}>
              <Group>
                <Title order={5}>{name}</Title>
                <CarMenu carId={carId} openCarModal={openCarModal} archived={false} />
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </>
  );
};
