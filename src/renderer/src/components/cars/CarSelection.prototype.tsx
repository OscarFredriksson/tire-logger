// Three throwaway car-selection layouts on /cars?variant=A|B|C; sample data only.
import {
  Alert,
  Badge,
  Button,
  Group,
  Menu,
  Modal,
  Stack,
  Table,
  Text,
  TextInput
} from '@mantine/core';
import { IconArrowRight, IconCar, IconCheck, IconChevronDown, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { PrototypeSwitcher } from '../common/PrototypeSwitcher';
import './CarSelection.prototype.css';

type Section = 'Stints' | 'Tires' | 'Tracks' | 'Cars';
type Screen = Section | 'Tire detail';
type SampleCar = { id: string; name: string; note: string; archived: boolean };
const sections: Section[] = ['Stints', 'Tires', 'Tracks', 'Cars'];
const seedCars: SampleCar[] = [
  { id: 'mx5', name: 'Mazda MX-5', note: 'Club racing / #27', archived: false },
  { id: 'm3', name: 'BMW M3', note: 'Track days / #46', archived: false },
  { id: 'civic', name: 'Honda Civic', note: 'Endurance / #81', archived: false },
  { id: 'clio', name: 'Renault Clio', note: 'Previous season / #12', archived: true }
];
const sampleStints = [
  { date: '18 Oct 2026', track: 'Mantorp Park', laps: 14, distance: '43.5 km' },
  { date: '11 Oct 2026', track: 'Gelleråsen', laps: 22, distance: '51.7 km' },
  { date: '04 Oct 2026', track: 'Mantorp Park', laps: 18, distance: '55.9 km' }
];

interface LandingProps {
  cars: SampleCar[];
  choose: (car: SampleCar) => void;
  add: () => void;
}

function EmptyGarage({ add }: Pick<LandingProps, 'add'>) {
  return (
    <div className="prototype-empty">
      <IconCar size={46} stroke={1.2} />
      <h2>Your garage starts here.</h2>
      <p>Add your first car, restore an archived car, or import your data.</p>
      <Button leftSection={<IconPlus size={16} />} onClick={add}>
        Add your first car
      </Button>
    </div>
  );
}

export function VariantA({ cars, choose, add }: LandingProps) {
  return (
    <section className="prototype-landing-a">
      <div className="prototype-intro">
        <span className="prototype-eyebrow">Your garage</span>
        <h1>Which car are we running?</h1>
        <p>Choose a car to open its stints and tires.</p>
      </div>
      {!cars.length ? (
        <EmptyGarage add={add} />
      ) : (
        <div className="prototype-card-grid">
          {cars.map((car, index) => (
            <button className="prototype-car-card" key={car.id} onClick={() => choose(car)}>
              <div className="prototype-card-visual">
                <span>0{index + 1}</span>
                <IconCar size={100} stroke={0.8} />
                <Badge variant="light" color="teal">
                  Ready
                </Badge>
              </div>
              <h2>{car.name}</h2>
              <p>{car.note}</p>
              <div className="prototype-card-action">
                Open workspace <IconArrowRight size={20} />
              </div>
            </button>
          ))}
          <button className="prototype-add-card" onClick={add}>
            <IconPlus size={30} stroke={1.3} />
            Add a car
          </button>
        </div>
      )}
    </section>
  );
}

export function VariantB({ cars, choose, add }: LandingProps) {
  return (
    <section className="prototype-landing-b">
      <div className="prototype-pit-intro">
        <span className="prototype-eyebrow">Tire logger / pit wall</span>
        <h1>
          Pick your
          <br />
          next drive.
        </h1>
        <p>One car. Every tire. Every stint.</p>
        <div className="prototype-pit-mark" aria-hidden="true">
          <IconCar size={160} stroke={0.7} />
        </div>
        <Text size="xs" c="dimmed">
          Select a car from the roster to enter its workspace.
        </Text>
      </div>
      <div className="prototype-roster">
        <Group justify="space-between" mb="lg">
          <span className="prototype-eyebrow">Car roster / {cars.length}</span>
          <Button variant="subtle" leftSection={<IconPlus size={16} />} onClick={add}>
            Add car
          </Button>
        </Group>
        {!cars.length ? (
          <EmptyGarage add={add} />
        ) : (
          cars.map((car, index) => (
            <button className="prototype-roster-row" key={car.id} onClick={() => choose(car)}>
              <span className="prototype-roster-number">0{index + 1}</span>
              <div>
                <h2>{car.name}</h2>
                <p>{car.note}</p>
              </div>
              <IconArrowRight size={24} />
            </button>
          ))
        )}
      </div>
    </section>
  );
}

export function VariantC({ cars, choose, add }: LandingProps) {
  return (
    <section className="prototype-landing-c">
      <header className="prototype-ledger-intro">
        <div>
          <span className="prototype-eyebrow">Vehicle register</span>
          <h1>Select a car.</h1>
          <p>Your workshop, one car at a time.</p>
        </div>
        <Button color="gray" leftSection={<IconPlus size={16} />} onClick={add}>
          Add car
        </Button>
      </header>
      {!cars.length ? (
        <EmptyGarage add={add} />
      ) : (
        <Table className="prototype-ledger-table" verticalSpacing="xl" horizontalSpacing="lg">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Entry</Table.Th>
              <Table.Th>Car</Table.Th>
              <Table.Th>Program</Table.Th>
              <Table.Th>Workspace</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {cars.map((car, index) => (
              <Table.Tr key={car.id}>
                <Table.Td className="prototype-ledger-index">/{index + 1}</Table.Td>
                <Table.Td>
                  <button className="prototype-ledger-name" onClick={() => choose(car)}>
                    {car.name}
                  </button>
                </Table.Td>
                <Table.Td>{car.note}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="gray"
                    rightSection={<IconArrowRight size={16} />}
                    onClick={() => choose(car)}
                    aria-label={`Open ${car.name}`}
                  >
                    Open
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
      <p className="prototype-ledger-footnote">Tires and stints stay with their car.</p>
    </section>
  );
}

export function CarSelectionPrototype() {
  const [params] = useSearchParams();
  const requestedVariant = params.get('variant');
  const variant = requestedVariant === 'B' || requestedVariant === 'C' ? requestedVariant : 'A';
  const [cars, setCars] = useState<SampleCar[]>(() => seedCars.map((car) => ({ ...car })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [screen, setScreen] = useState<Screen>('Stints');
  const [addOpened, setAddOpened] = useState(false);
  const [restoreOpened, setRestoreOpened] = useState(false);
  const [name, setName] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const activeCars = cars.filter((car) => !car.archived);
  const archivedCars = cars.filter((car) => car.archived);
  const selected = activeCars.find((car) => car.id === selectedId);
  const landing = !selected;

  const choose = (car: SampleCar) => {
    setSelectedId(car.id);
    setScreen(landing ? 'Stints' : screen === 'Tire detail' ? 'Tires' : screen);
    setNotice(null);
  };

  const reset = (count: number) => {
    const next = seedCars.map((car, index) => ({ ...car, archived: index >= count }));
    setCars(next);
    setSelectedId(count === 1 ? next[0].id : null);
    setScreen('Stints');
    setNotice(null);
    setAddOpened(false);
    setRestoreOpened(false);
  };

  const archive = (id: string) => {
    setCars((previous) =>
      previous.map((car) => (car.id === id ? { ...car, archived: true } : car))
    );
    if (selectedId === id) {
      setSelectedId(null);
      setNotice('Selected car archived. Choose a car to continue, even if only one remains.');
    }
  };

  const addCar = () => {
    const car = { id: crypto.randomUUID(), name: name.trim(), note: 'New car', archived: false };
    setCars((previous) => [...previous, car]);
    if (landing) {
      setSelectedId(car.id);
      setScreen('Stints');
    }
    setName('');
    setAddOpened(false);
    setNotice('Car added in memory only.');
  };

  const dataActions = (
    <Menu position="bottom-end">
      <Menu.Target>
        <Button variant="default" rightSection={<IconChevronDown size={14} />}>
          Import / export
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          onClick={() => {
            setCars((previous) => [
              ...previous,
              {
                id: crypto.randomUUID(),
                name: 'Imported Porsche 944',
                note: 'Sample import',
                archived: false
              }
            ]);
            setNotice('Simulated import added a sample car. No file or database was read.');
          }}
        >
          Simulate import
        </Menu.Item>
        <Menu.Item
          onClick={() =>
            setNotice(
              'Simulated export of all sample cars, tracks, tires, and stints. No file written.'
            )
          }
        >
          Simulate export (all cars)
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const carHeading = selected && (
    <Menu position="bottom-start" width={300}>
      <Menu.Target>
        <button className="prototype-car-heading" aria-label={`Switch car: ${selected.name}`}>
          <span>{selected.name}</span>
          <IconChevronDown size={28} stroke={1.5} />
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Select a car</Menu.Label>
        {activeCars.map((car) => (
          <Menu.Item
            key={car.id}
            rightSection={selected.id === car.id ? <IconCheck size={16} /> : undefined}
            onClick={() => choose(car)}
          >
            {car.name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item onClick={() => setSelectedId(null)}>Back to car chooser</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const navigation = (
    <nav className="prototype-navigation" aria-label="Workspace">
      {sections.map((section) => (
        <button
          key={section}
          className={
            screen === section || (section === 'Tires' && screen === 'Tire detail')
              ? 'selected'
              : ''
          }
          onClick={() => setScreen(section)}
          aria-current={
            screen === section || (section === 'Tires' && screen === 'Tire detail')
              ? 'page'
              : undefined
          }
        >
          {section}
          {(section === 'Tracks' || section === 'Cars') && <small>Shared</small>}
        </button>
      ))}
    </nav>
  );

  const landingProps = { cars: activeCars, choose, add: () => setAddOpened(true) };

  return (
    <div className={`car-selection-prototype prototype-variant-${variant.toLowerCase()}`}>
      <div className="prototype-topline">
        <Group gap="xs">
          <IconCar size={21} />
          <strong>TIRE LOGGER</strong>
          <Badge variant="outline" color="yellow" size="sm">
            Throwaway / sample data
          </Badge>
        </Group>
        {dataActions}
      </div>
      <main className="prototype-main">
        {notice && (
          <Alert mb="lg" withCloseButton onClose={() => setNotice(null)}>
            {notice}
          </Alert>
        )}
        {landing ? (
          <>
            {variant === 'A' && <VariantA {...landingProps} />}
            {variant === 'B' && <VariantB {...landingProps} />}
            {variant === 'C' && <VariantC {...landingProps} />}
            <div className="prototype-landing-footer">
              <Text size="sm" c="dimmed">
                Looking for a previous car?
              </Text>
              <Button variant="subtle" color="gray" onClick={() => setRestoreOpened(true)}>
                Restore archived cars ({archivedCars.length})
              </Button>
            </div>
          </>
        ) : (
          <>
            <header className="prototype-workspace-header">
              <div className="prototype-identity">
                <span className="prototype-eyebrow">
                  {variant === 'B' ? 'In the pit / selected car' : 'Selected car'}
                </span>
                {carHeading}
                <p>{selected.note}</p>
              </div>
              {variant === 'B' && (
                <div className="prototype-context-note">
                  <IconCar size={64} stroke={0.8} />
                  <Text size="sm" c="dimmed">
                    Every tire. Every stint.
                    <br />
                    One car in focus.
                  </Text>
                </div>
              )}
            </header>
            {navigation}
            <section className="prototype-workspace-body">
              <Group justify="space-between" mb="lg">
                <div>
                  <h2>{screen === 'Cars' ? 'Cars · shared garage' : screen}</h2>
                  <Text size="sm" c="dimmed">
                    {screen === 'Tracks' || screen === 'Cars'
                      ? 'Application-wide · changing cars does not filter this screen'
                      : `${selected.name} · illustrative sample records`}
                  </Text>
                </div>
                {screen === 'Cars' && (
                  <Button leftSection={<IconPlus size={16} />} onClick={() => setAddOpened(true)}>
                    Add car
                  </Button>
                )}
              </Group>
              {screen === 'Stints' && (
                <div className="prototype-stints">
                  {sampleStints.map((stint, index) => (
                    <div className="prototype-stint" key={stint.date}>
                      <span className="prototype-stint-index">0{index + 1}</span>
                      <div>
                        <strong>{stint.track}</strong>
                        <Text size="sm" c="dimmed">
                          {stint.date}
                        </Text>
                      </div>
                      <span>{stint.laps} laps</span>
                      <span>{stint.distance}</span>
                      <Badge variant="light" color="gray">
                        Sample
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
              {screen === 'Tires' && (
                <div className="prototype-tire-grid">
                  {['Left front', 'Right front', 'Left rear', 'Right rear'].map(
                    (position, index) => (
                      <button
                        className="prototype-tire-card"
                        key={position}
                        onClick={() => setScreen('Tire detail')}
                      >
                        <span className="prototype-tire-symbol" aria-hidden="true" />
                        <strong>
                          {selected.name} / Tire {index + 1}
                        </strong>
                        <span>{position}</span>
                        <span>View sample tire →</span>
                      </button>
                    )
                  )}
                </div>
              )}
              {screen === 'Tire detail' && (
                <Stack align="flex-start">
                  <Button variant="subtle" onClick={() => setScreen('Tires')}>
                    ← Back to tires
                  </Button>
                  <h3>{selected.name} / Tire 1</h3>
                  <p>Switch cars above to check that you return to the new car’s Tires list.</p>
                </Stack>
              )}
              {screen === 'Tracks' && (
                <Stack>
                  {[
                    'Mantorp Park · 3.106 km',
                    'Gelleråsen · 2.350 km',
                    'Kinnekulle · 2.072 km'
                  ].map((track) => (
                    <div className="prototype-shared-row" key={track}>
                      {track}
                      <Badge color="gray">Shared</Badge>
                    </div>
                  ))}
                </Stack>
              )}
              {screen === 'Cars' && (
                <Stack>
                  {activeCars.map((car) => (
                    <div className="prototype-shared-row" key={car.id}>
                      <Group>
                        <strong>{car.name}</strong>
                        {car.id === selectedId && <Badge>Selected</Badge>}
                      </Group>
                      <Button variant="subtle" color="red" onClick={() => archive(car.id)}>
                        Archive {car.id === selectedId ? 'selected car' : 'car'}
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => setRestoreOpened(true)}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Restore archived cars
                  </Button>
                </Stack>
              )}
            </section>
          </>
        )}
        <aside className="prototype-lab" aria-label="Prototype controls">
          <Group justify="space-between">
            <div>
              <strong>Prototype lab</strong>
              <Text size="xs" c="dimmed">
                Reset the sample garage to rehearse startup.
              </Text>
            </div>
            <Group gap="xs">
              <Button size="xs" variant="default" onClick={() => reset(3)}>
                Multiple cars
              </Button>
              <Button size="xs" variant="default" onClick={() => reset(1)}>
                One car
              </Button>
              <Button size="xs" variant="default" onClick={() => reset(0)}>
                No cars
              </Button>
              {selected && (
                <Button size="xs" variant="light" color="red" onClick={() => archive(selected.id)}>
                  Archive selected
                </Button>
              )}
            </Group>
          </Group>
          <pre aria-label="Prototype state">
            {JSON.stringify({
              variant,
              view: landing ? 'Car chooser' : screen,
              selectedCar: selected?.name ?? null,
              unarchivedCars: activeCars.map((car) => car.name),
              archivedCars: archivedCars.map((car) => car.name),
              persistence: 'none'
            })}
          </pre>
        </aside>
      </main>
      <Modal opened={addOpened} onClose={() => setAddOpened(false)} title="Add sample car" centered>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (name.trim()) addCar();
          }}
        >
          <Stack>
            <TextInput
              label="Car name"
              placeholder="e.g. Porsche 944"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              data-autofocus
              required
            />
            <Text size="xs" c="dimmed">
              In memory only. Reloading discards all changes.
            </Text>
            <Button type="submit" disabled={!name.trim()}>
              Add car
            </Button>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={restoreOpened}
        onClose={() => setRestoreOpened(false)}
        title="Restore archived cars"
        centered
      >
        <Stack>
          {!archivedCars.length && <Text>No archived cars.</Text>}
          {archivedCars.map((car) => (
            <Group key={car.id} justify="space-between">
              <Text>{car.name}</Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => {
                  setCars((previous) =>
                    previous.map((item) =>
                      item.id === car.id ? { ...item, archived: false } : item
                    )
                  );
                  setNotice(
                    `${car.name} restored in memory. Select it from the car chooser or menu.`
                  );
                }}
              >
                Restore
              </Button>
            </Group>
          ))}
        </Stack>
      </Modal>
      <PrototypeSwitcher />
    </div>
  );
}
