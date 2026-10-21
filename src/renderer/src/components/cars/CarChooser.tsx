import { Button, Card, Flex, Group, ThemeIcon, Title } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { Car } from '@shared/model';
import { AddCar } from './AddCar';
import { useState } from 'react';
import { CarManagement } from './CarManagement';
import SegmentToggle from '../common/SegmentToggle';

interface CarChooserProps {
  cars: Car[];
  onSelectCar: (carId: string) => void;
}

export function CarChooser({ cars, onSelectCar }: CarChooserProps) {
  const [managing, setManaging] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const addCar = () => modals.open({ children: <AddCar />, withCloseButton: false });

  return (
    <section className="car-chooser" aria-label="Choose a car">
      <Group justify="space-between" gap={0} align="center">
        <Title order={1}>Cars</Title>
        <div
          style={{ visibility: managing ? 'visible' : 'hidden' }}
          aria-hidden={!managing}
          inert={!managing}
        >
          <SegmentToggle
            value={showArchived ? 'archived' : 'active'}
            onChange={(value) => setShowArchived(value === 'archived')}
          />
        </div>
        <Group gap="xs">
          <Button
            variant="default"
            color="gray"
            miw={132}
            onClick={() => {
              setManaging(!managing);
              setShowArchived(false);
            }}
          >
            {managing ? 'Done' : 'Manage cars'}
          </Button>
          <Button variant="gradient" size="sm" rightSection={<IconPlus />} onClick={addCar}>
            Add car
          </Button>
        </Group>
      </Group>
      {managing ? (
        <CarManagement showArchived={showArchived} />
      ) : cars.length === 0 ? (
        <div className="mt-4">No cars added yet</div>
      ) : (
        <Flex className="mt-2" direction="column" gap={10}>
          {cars.map((car) => (
            <Card
              component="button"
              type="button"
              padding={12}
              className="car-selection-card"
              key={car.carId}
              onClick={() => onSelectCar(car.carId)}
            >
              <Group wrap="nowrap">
                <Title order={5} component="span" className="car-card-name">
                  {car.name}
                </Title>
                <ThemeIcon size="md" variant="transparent" color="gray" aria-hidden="true">
                  <IconArrowRight size={20} />
                </ThemeIcon>
              </Group>
            </Card>
          ))}
        </Flex>
      )}
    </section>
  );
}
