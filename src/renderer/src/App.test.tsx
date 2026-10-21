/** @jest-environment jsdom */
import { afterEach, beforeAll, beforeEach, expect, it, jest } from '@jest/globals';
import { TextDecoder, TextEncoder } from 'node:util';

Object.assign(globalThis, { TextDecoder, TextEncoder });

import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, NavigateFunction, useNavigate } from 'react-router';
import { Car, Stint } from '@shared/model';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

const getCars = jest.fn<typeof window.api.getCars>();
const getStints = jest.fn<typeof window.api.getStints>();
const getTires = jest.fn<typeof window.api.getTires>();
const getTracks = jest.fn<typeof window.api.getTracks>();
const clients: QueryClient[] = [];
const roster: Car[] = [
  { carId: 'mazda', name: 'Mazda MX-5', archived: false },
  { carId: 'bmw', name: 'BMW M3', archived: false }
];

function launch(route = '/') {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } }
  });
  clients.push(client);
  let navigate!: NavigateFunction;
  function RoutedApp() {
    navigate = useNavigate();
    return <App />;
  }
  return {
    client,
    navigate: (path: string) => navigate(path),
    ...render(
      <QueryClientProvider client={client}>
        <MantineProvider env="test">
          <ErrorBoundary>
            <MemoryRouter initialEntries={[route]}>
              <ModalsProvider>
                <RoutedApp />
              </ModalsProvider>
            </MemoryRouter>
          </ErrorBoundary>
        </MantineProvider>
      </QueryClientProvider>
    )
  };
}

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    }))
  });
  globalThis.ResizeObserver = class {
    observe = jest.fn();
    unobserve = jest.fn();
    disconnect = jest.fn();
  };
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'api', {
    configurable: true,
    value: {
      getCars,
      getStints,
      getTires,
      getTracks,
      putCar: jest.fn<typeof window.api.putCar>().mockResolvedValue(undefined),
      archiveCar: jest.fn<typeof window.api.archiveCar>().mockResolvedValue(undefined),
      restoreCar: jest.fn<typeof window.api.restoreCar>().mockResolvedValue(undefined)
    }
  });
  getCars.mockResolvedValue([]);
  getStints.mockResolvedValue([]);
  getTires.mockResolvedValue([]);
  getTracks.mockResolvedValue([]);
});

afterEach(() => {
  cleanup();
  clients.splice(0).forEach((client) => client.clear());
});

it('shows the empty landing page when no unarchived cars exist', async () => {
  launch();
  expect(await screen.findByText('No cars added yet')).toBeTruthy();
  expect(screen.getByRole('heading', { level: 1, name: 'Cars' })).toBeTruthy();
  expect(screen.getAllByRole('button', { name: 'Add car' })).toHaveLength(1);
  expect(screen.queryByRole('button', { name: 'Add your first car' })).toBeNull();
  expect(screen.queryByRole('banner')).toBeNull();
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Data actions' })).toBeNull();
  expect(getStints).not.toHaveBeenCalled();
});

it('keeps the archive filter in the car header and resets it after management closes', async () => {
  getCars.mockImplementation(async (archived) =>
    archived ? [{ carId: 'retired', name: 'Retired car', archived: true }] : roster
  );
  const user = userEvent.setup();
  launch();
  await screen.findByRole('button', { name: 'BMW M3' });
  expect(screen.queryByRole('radio', { name: 'Archived' })).toBeNull();

  await user.click(screen.getByRole('button', { name: 'Manage cars' }));
  expect(screen.queryByRole('banner')).toBeNull();
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Data actions' })).toBeNull();
  const heading = screen.getByRole('heading', { name: 'Cars' });
  const archived = screen.getByRole('radio', { name: 'Archived' });
  const done = screen.getByRole('button', { name: 'Done' });
  const header = heading.parentElement!;
  expect(header.contains(archived)).toBe(true);
  expect(header.contains(done)).toBe(true);
  expect(header.contains(screen.getByRole('button', { name: 'Add car' }))).toBe(true);
  expect(heading.compareDocumentPosition(archived) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  expect(archived.compareDocumentPosition(done) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

  await user.click(archived);
  expect(await screen.findByText('Retired car')).toBeTruthy();
  expect(screen.queryByText('BMW M3')).toBeNull();
  await user.click(done);
  expect(screen.queryByRole('radio', { name: 'Archived' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Manage cars' }));
  expect(screen.getByRole<HTMLInputElement>('radio', { name: 'Active' }).checked).toBe(true);
  expect(await screen.findByText('BMW M3')).toBeTruthy();
  expect(screen.queryByText('Retired car')).toBeNull();
});

it('opens the only unarchived car at its Stints on startup', async () => {
  getCars.mockImplementation(async (archived) =>
    archived
      ? [{ carId: 'retired', name: 'Retired car', archived: true }]
      : [{ carId: 'mazda', name: 'Mazda MX-5', archived: false }]
  );
  launch();
  expect(await screen.findByRole('heading', { level: 1, name: 'Mazda MX-5' })).toBeTruthy();
  await waitFor(() =>
    expect(screen.getByRole('tab', { name: 'Stints' }).getAttribute('aria-selected')).toBe('true')
  );
  expect(await screen.findByText('No stints added yet')).toBeTruthy();
  expect(getStints).toHaveBeenCalledWith('mazda', false);
  expect(getStints).not.toHaveBeenCalledWith('retired', expect.anything());
});

it.each(['Tracks'])(
  'can return to car selection after opening %s without a selected car',
  async (section) => {
    getCars.mockImplementation(async (archived) => (archived ? [] : roster));
    const user = userEvent.setup();
    launch('/tracks');
    expect(await screen.findByRole('tab', { name: section })).toBeTruthy();
    expect(screen.getByRole('banner')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Data actions' })).toBeTruthy();
    await user.click(screen.getByRole('button', { name: 'Change car' }));
    await user.click(await screen.findByRole('button', { name: 'BMW M3' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'BMW M3' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Stints' }).getAttribute('aria-selected')).toBe('true');
  }
);

it('requires an explicit choice with multiple cars and keeps selection on Tracks', async () => {
  getCars.mockImplementation(async (archived) => (archived ? [] : roster));
  const user = userEvent.setup();
  launch();
  const carButton = await screen.findByRole('button', { name: 'BMW M3' });
  expect(screen.getByRole('heading', { level: 1, name: 'Cars' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Add car' })).toBeTruthy();
  expect(screen.queryByText('Tire logger / pit wall')).toBeNull();
  expect(screen.queryByText(/Pick your/)).toBeNull();
  expect(screen.queryByRole('combobox', { name: 'Selected car' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Change car' })).toBeNull();
  expect(screen.getByRole('button', { name: 'Mazda MX-5' })).toBeTruthy();
  expect(screen.queryByRole('banner')).toBeNull();
  expect(screen.queryByRole('tablist')).toBeNull();
  expect(screen.queryByRole('button', { name: 'Data actions' })).toBeNull();
  expect(getStints).not.toHaveBeenCalled();

  carButton.focus();
  await user.keyboard('{Enter}');
  const name = await screen.findByRole('heading', { level: 1, name: 'BMW M3' });
  expect(screen.getByRole('banner')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Data actions' })).toBeTruthy();
  expect(
    name.compareDocumentPosition(screen.getByRole('tablist')) & Node.DOCUMENT_POSITION_FOLLOWING
  ).toBeTruthy();
  expect(await screen.findByText('No stints added yet')).toBeTruthy();
  expect(getStints).toHaveBeenCalledWith('bmw', false);
  expect(getStints).not.toHaveBeenCalledWith('mazda', expect.anything());

  for (const section of ['Tracks', 'Stints']) {
    await user.click(screen.getByRole('tab', { name: section }));
    expect(screen.getByRole('heading', { level: 1, name: 'BMW M3' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: section }).getAttribute('aria-selected')).toBe('true');
    expect(screen.getByRole('button', { name: 'Change car, BMW M3' })).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Change car' })).toBeNull();
  }
});

it.each(['Stints', 'Tires', 'Tracks'])(
  'clears selection from %s through Change car until another car is chosen',
  async (section) => {
    getCars.mockImplementation(async (archived) => (archived ? [] : roster));
    const user = userEvent.setup();
    const { client, navigate } = launch();
    await user.click(await screen.findByRole('button', { name: 'BMW M3' }));
    await user.click(screen.getByRole('tab', { name: section }));
    await user.click(screen.getByRole('button', { name: 'Change car, BMW M3' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Cars' })).toBeTruthy();
    expect(screen.queryByRole('heading', { level: 1, name: 'BMW M3' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Change car' })).toBeNull();
    getStints.mockClear();
    getTires.mockClear();
    await act(async () => {
      await client.refetchQueries({ queryKey: ['cars'] });
    });
    expect(screen.queryByRole('banner')).toBeNull();
    for (const destination of ['Tracks']) {
      await act(async () => navigate(`/${destination.toLowerCase()}`));
      expect(screen.queryByRole('heading', { level: 1, name: 'BMW M3' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Change car' })).toBeTruthy();
      for (const tab of ['Stints', 'Tires']) {
        expect(screen.getByRole('tab', { name: tab }).hasAttribute('disabled')).toBe(true);
      }
    }
    expect(getStints).not.toHaveBeenCalled();
    expect(getTires).not.toHaveBeenCalled();

    await act(async () => navigate('/'));
    await user.click(await screen.findByRole('button', { name: 'Mazda MX-5' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'Mazda MX-5' })).toBeTruthy();
    expect(screen.getByRole('tab', { name: 'Stints' }).getAttribute('aria-selected')).toBe('true');
  }
);

it('returns to the one-car roster without bouncing, then reopens Stints on selection', async () => {
  getCars.mockImplementation(async (archived) => (archived ? [] : [roster[0]]));
  const user = userEvent.setup();
  const { client } = launch();
  await screen.findByRole('heading', { level: 1, name: 'Mazda MX-5' });
  await user.click(screen.getByRole('tab', { name: 'Tires' }));
  const switchCar = screen.getByRole('button', { name: 'Change car, Mazda MX-5' });
  switchCar.focus();
  await user.keyboard('{Enter}');
  expect(await screen.findByRole('heading', { level: 1, name: 'Cars' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Mazda MX-5' })).toBeNull();
  expect(screen.queryByRole('banner')).toBeNull();
  expect(screen.queryByRole('tablist')).toBeNull();
  await act(async () => {
    await client.refetchQueries({ queryKey: ['cars'] });
  });
  expect(screen.getByRole('heading', { level: 1, name: 'Cars' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Change car' })).toBeNull();
  await user.click(screen.getByRole('button', { name: 'Mazda MX-5' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'Mazda MX-5' })).toBeTruthy();
  expect(screen.getByRole('tab', { name: 'Stints' }).getAttribute('aria-selected')).toBe('true');
});

it('treats archived-only records as an empty roster and never selects them', async () => {
  getCars.mockResolvedValue([{ carId: 'retired', name: 'Retired car', archived: true }]);
  launch();
  expect(await screen.findByText('No cars added yet')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Retired car' })).toBeNull();
  expect(getStints).not.toHaveBeenCalled();
});

it('waits for the initial car query before showing empty content or selecting a car', async () => {
  let resolveCars!: (cars: Car[]) => void;
  getCars.mockReturnValue(new Promise<Car[]>((resolve) => (resolveCars = resolve)));
  launch();
  expect(screen.getByLabelText('Loading cars')).toBeTruthy();
  expect(screen.queryByText('No cars added yet')).toBeNull();
  expect(getStints).not.toHaveBeenCalled();

  await act(async () => resolveCars([roster[0]]));
  expect(await screen.findByRole('heading', { level: 1, name: 'Mazda MX-5' })).toBeTruthy();
  expect(await screen.findByText('No stints added yet')).toBeTruthy();
});

it('shows the existing error boundary rather than an empty garage when loading fails', async () => {
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    getCars.mockRejectedValue(new Error('Could not load cars'));
    launch();
    expect(
      await screen.findByRole('heading', { name: 'Something unexpected went wrong' })
    ).toBeTruthy();
    expect(screen.getAllByText(/Could not load cars/).length).toBeGreaterThan(0);
    expect(screen.queryByText('No cars added yet')).toBeNull();
    expect(getStints).not.toHaveBeenCalled();
  } finally {
    consoleError.mockRestore();
  }
});

it('shows only the chosen car stints using the car-scoped Electron API', async () => {
  const stints: Stint[] = [
    {
      stintId: 'mazda-stint',
      carId: 'mazda',
      trackId: 'mantorp',
      date: new Date('2026-10-18T12:00:00Z'),
      laps: 14,
      leftFront: 'lf',
      rightFront: 'rf',
      leftRear: 'lr',
      rightRear: 'rr',
      archived: false
    },
    {
      stintId: 'bmw-stint',
      carId: 'bmw',
      trackId: 'mantorp',
      date: new Date('2026-10-19T12:00:00Z'),
      laps: 33,
      leftFront: 'lf',
      rightFront: 'rf',
      leftRear: 'lr',
      rightRear: 'rr',
      archived: false
    }
  ];
  getCars.mockImplementation(async (archived) => (archived ? [] : roster));
  getStints.mockImplementation(async (carId, archived) =>
    stints.filter((stint) => stint.carId === carId && stint.archived === archived)
  );
  getTracks.mockImplementation(async (archived) =>
    archived ? [] : [{ trackId: 'mantorp', name: 'Mantorp Park', length: 3106, archived: false }]
  );
  launch();
  await userEvent.click(await screen.findByRole('button', { name: 'Mazda MX-5' }));
  expect(await screen.findByRole('button', { name: /Mantorp Park.*14 laps/ })).toBeTruthy();
  expect(screen.queryByRole('button', { name: /33 laps/ })).toBeNull();
});

it('does not remember selection in a fresh App instance', async () => {
  getCars.mockImplementation(async (archived) => (archived ? [] : roster));
  const first = launch();
  await userEvent.click(await screen.findByRole('button', { name: 'BMW M3' }));
  expect(await screen.findByText('No stints added yet')).toBeTruthy();
  first.unmount();
  getStints.mockClear();

  launch();
  expect(await screen.findByRole('button', { name: 'BMW M3' })).toBeTruthy();
  expect(screen.queryByRole('heading', { level: 1, name: 'BMW M3' })).toBeNull();
  expect(getStints).not.toHaveBeenCalled();
});

it('does not auto-select on refetch or when deliberately returning to the chooser', async () => {
  let cars: Car[] = [];
  getCars.mockImplementation(async (archived) => (archived ? [] : cars));
  const { client, navigate } = launch();
  expect(await screen.findByText('No cars added yet')).toBeTruthy();

  cars = [roster[0]];
  await act(async () => {
    await client.refetchQueries({ queryKey: ['cars'] });
  });
  await userEvent.click(await screen.findByRole('button', { name: 'Mazda MX-5' }));
  expect(await screen.findByText('No stints added yet')).toBeTruthy();
  await act(async () => {
    await navigate('/');
  });
  expect(await screen.findByRole('button', { name: 'Mazda MX-5' })).toBeTruthy();
  expect(screen.queryByRole('heading', { name: 'Mazda MX-5' })).toBeNull();
  expect(screen.queryByRole('banner')).toBeNull();
  await act(async () => navigate('/tracks'));
  expect(screen.queryByRole('heading', { name: 'Mazda MX-5' })).toBeNull();
  expect(screen.getByRole('tab', { name: 'Stints' }).hasAttribute('disabled')).toBe(true);
  await act(async () => navigate('/'));
  getStints.mockClear();
  await act(async () => {
    await client.refetchQueries({ queryKey: ['cars'] });
  });
  expect(screen.getByRole('button', { name: 'Mazda MX-5' })).toBeTruthy();
  expect(getStints).not.toHaveBeenCalled();
});

it('keeps the existing Add Car modal working without treating creation as fresh startup', async () => {
  let cars: Car[] = [];
  getCars.mockImplementation(async (archived) => (archived ? [] : cars));
  launch();
  const user = userEvent.setup();
  await user.click(await screen.findByRole('button', { name: 'Add car' }));
  expect(await screen.findByRole('heading', { name: 'Add Car' })).toBeTruthy();
  await user.type(screen.getByRole('textbox', { name: 'Car Name' }), 'New track car');
  jest.mocked(window.api.putCar).mockImplementation(async () => {
    cars = [{ carId: 'new', name: 'New track car', archived: false }];
  });
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('button', { name: 'New track car' })).toBeTruthy();
  expect(window.api.putCar).toHaveBeenCalledWith(
    expect.objectContaining({ name: 'New track car', archived: false })
  );
  expect(getStints).not.toHaveBeenCalled();
});

it('separates managing cars from selecting them and removes the Cars tab', async () => {
  getCars.mockImplementation(async (archived) => (archived ? [] : roster));
  const user = userEvent.setup();
  launch();
  await user.click(await screen.findByRole('button', { name: 'Manage cars' }));
  expect(screen.queryByRole('tab', { name: 'Cars' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'BMW M3' })).toBeNull();
  await user.click(screen.getByText('BMW M3'));
  expect(getStints).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Manage BMW M3' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Edit car' }));
  expect(await screen.findByDisplayValue('BMW M3')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await user.click(screen.getByRole('button', { name: 'Done' }));
  await user.click(await screen.findByRole('button', { name: 'BMW M3' }));
  expect(await screen.findByRole('heading', { level: 1, name: 'BMW M3' })).toBeTruthy();
});

it('archives the last car with confirmation and stays in management on the empty active list', async () => {
  let cars: Car[] = [roster[0]];
  getCars.mockImplementation(async (archived) => cars.filter((car) => car.archived === archived));
  jest.mocked(window.api.archiveCar).mockImplementation(async () => {
    cars = cars.map((car) => ({ ...car, archived: true }));
  });
  const user = userEvent.setup();
  launch();
  await user.click(await screen.findByRole('button', { name: 'Change car, Mazda MX-5' }));
  await user.click(screen.getByRole('button', { name: 'Manage cars' }));
  await user.click(screen.getByRole('button', { name: 'Manage Mazda MX-5' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Archive car' }));
  expect(window.api.archiveCar).not.toHaveBeenCalled();
  expect(
    await screen.findByText('This will also archive all tires and stints for this car.')
  ).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByText('No cars added yet')).toBeTruthy();
  expect(window.api.archiveCar).toHaveBeenCalledWith('mazda', true);
  expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
  expect(screen.getByRole('radio', { name: 'Active' }).getAttribute('checked')).not.toBeNull();
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(await screen.findByText('No cars added yet')).toBeTruthy();
});

it('edits and restores archived cars without selecting them or leaving the archived list', async () => {
  let cars: Car[] = [{ carId: 'retired', name: 'Retired car', archived: true }];
  getCars.mockImplementation(async (archived) => cars.filter((car) => car.archived === archived));
  jest.mocked(window.api.restoreCar).mockImplementation(async () => {
    cars = cars.map((car) => ({ ...car, archived: false }));
  });
  const user = userEvent.setup();
  launch();
  await user.click(await screen.findByRole('button', { name: 'Manage cars' }));
  await user.click(screen.getByRole('radio', { name: 'Archived' }));
  await user.click(await screen.findByRole('button', { name: 'Manage Retired car' }));
  expect(screen.queryByRole('menuitem', { name: 'Archive car' })).toBeNull();
  await user.click(await screen.findByRole('menuitem', { name: 'Edit car' }));
  expect(await screen.findByDisplayValue('Retired car')).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  await user.click(screen.getByRole('button', { name: 'Manage Retired car' }));
  await user.click(await screen.findByRole('menuitem', { name: 'Restore car' }));
  expect(window.api.restoreCar).not.toHaveBeenCalled();
  await user.click(await screen.findByRole('button', { name: 'Restore' }));
  expect(await screen.findByText('No archived cars found')).toBeTruthy();
  expect(window.api.restoreCar).toHaveBeenCalledWith('retired');
  expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(await screen.findByRole('button', { name: 'Retired car' })).toBeTruthy();
  expect(getStints).not.toHaveBeenCalled();
});

it('adds a car in management without selecting it or leaving management', async () => {
  let cars: Car[] = [];
  getCars.mockImplementation(async (archived) => (archived ? [] : cars));
  jest.mocked(window.api.putCar).mockImplementation(async () => {
    cars = [{ carId: 'new', name: 'New car', archived: false }];
  });
  const user = userEvent.setup();
  launch();
  await user.click(await screen.findByRole('button', { name: 'Manage cars' }));
  await user.click(screen.getByRole('button', { name: 'Add car' }));
  await user.type(await screen.findByRole('textbox', { name: 'Car Name' }), 'New car');
  await user.click(screen.getByRole('button', { name: 'Save' }));
  expect(await screen.findByRole('button', { name: 'Manage New car' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Done' })).toBeTruthy();
  await user.click(screen.getByRole('button', { name: 'Done' }));
  expect(await screen.findByRole('button', { name: 'New car' })).toBeTruthy();
  expect(getStints).not.toHaveBeenCalled();
});

it('shows an error instead of an empty archived list when loading archived cars fails', async () => {
  getCars.mockImplementation(async (archived) => {
    if (archived) throw new Error('Could not load archived cars');
    return [];
  });
  const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  try {
    const user = userEvent.setup();
    launch();
    await user.click(await screen.findByRole('button', { name: 'Manage cars' }));
    await user.click(screen.getByRole('radio', { name: 'Archived' }));
    expect(
      await screen.findByRole('heading', { name: 'Something unexpected went wrong' })
    ).toBeTruthy();
    expect(screen.queryByText('No archived cars found')).toBeNull();
  } finally {
    consoleError.mockRestore();
  }
});
