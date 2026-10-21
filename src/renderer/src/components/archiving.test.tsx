import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import React, { ReactElement, ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { useMutation } from '../hooks/useMutation';
import { Car, Stint, Tire as TireModel, Track } from '@shared/model';
import { AddCar } from './cars/AddCar';
import { AddTrack } from './tracks/AddTrack';
import { AddTire } from './tires/AddTire';
import { AddStint } from './stints/AddStint';
import { Tire } from './tires/Tire';
import { ActiveTiresProps, Tires } from './tires/Tires';
import { Stints } from './stints/Stints';
import { Header } from './Header';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual<typeof import('@tanstack/react-query')>('@tanstack/react-query'),
  useQuery: jest.fn()
}));
jest.mock('../hooks/useMutation', () => ({ useMutation: jest.fn() }));
jest.mock('@renderer/main', () => ({ queryClient: { invalidateQueries: jest.fn() } }));
jest.mock('react-error-boundary', () => ({
  useErrorBoundary: () => ({ showBoundary: jest.fn() })
}));
jest.mock('./import-export/ImportExportMenu', () => ({ DataActionsMenu: () => null }));

const records: { cars: Car[]; tracks: Track[]; tires: TireModel[]; stints: Stint[] } = {
  cars: [],
  tracks: [],
  tires: [],
  stints: []
};

function render(view: ReactNode, route = '/') {
  return renderToStaticMarkup(
    <QueryClientProvider client={new QueryClient()}>
      <MantineProvider>
        <MemoryRouter initialEntries={[route]}>
          <ModalsProvider>
            <Routes>
              <Route path="/car/:carId/tires/:tireId" element={view} />
              <Route path="/car/:carId/stints" element={view} />
              <Route path="*" element={view} />
            </Routes>
          </ModalsProvider>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      api: {
        putCar: jest.fn(),
        putTrack: jest.fn(),
        putTire: jest.fn(),
        putStint: jest.fn()
      }
    }
  });
  records.cars = [{ carId: 'car', name: 'Retired car', archived: true }];
  records.tracks = [{ trackId: 'track', name: 'Retired track', length: 1000, archived: true }];
  records.tires = ['lf', 'rf', 'lr', 'rr'].map((tireId) => ({
    tireId,
    carId: 'car',
    name: `Retired tire ${tireId}`,
    archived: true,
    allowedLf: true,
    allowedRf: true,
    allowedLr: true,
    allowedRr: true
  }));
  records.stints = [
    {
      stintId: 'stint',
      carId: 'car',
      trackId: 'track',
      archived: true,
      date: new Date('2026-09-27T12:00:00.000Z'),
      laps: 10,
      leftFront: 'lf',
      rightFront: 'rf',
      leftRear: 'lr',
      rightRear: 'rr',
      note: 'Historical stint'
    }
  ];
  jest.mocked(useQuery).mockImplementation(
    ({ queryKey }) =>
      ({
        data: records[queryKey![0] as keyof typeof records].filter(
          (record) => Boolean(record.archived) === (queryKey!.at(-1) === true)
        ),
        isLoading: false
      }) as never
  );
  jest
    .mocked(useMutation)
    .mockReturnValue({ mutate: jest.fn() } as unknown as ReturnType<typeof useMutation>);
});

describe('Archived editors and history', () => {
  it.each([
    { view: <AddCar carId="car" />, method: 'putCar' as const, id: { carId: 'car' } },
    { view: <AddTrack trackId="track" />, method: 'putTrack' as const, id: { trackId: 'track' } },
    { view: <AddTire carId="car" tireId="lf" />, method: 'putTire' as const, id: { tireId: 'lf' } },
    {
      view: <AddStint carId="car" stintId="stint" />,
      method: 'putStint' as const,
      id: { stintId: 'stint' }
    }
  ])(
    'preserves identity and archive state when saving through $method',
    async ({ view, method, id }) => {
      render(view);
      const mutation = jest.mocked(useMutation).mock.calls.at(-1)![0];
      await Reflect.apply(mutation.mutationFn!, undefined, []);
      expect(window.api[method]).toHaveBeenCalledWith(
        expect.objectContaining({ ...id, archived: true })
      );
    }
  );

  it('opens archived car and track editors', () => {
    expect(render(<AddCar carId="car" />)).toContain('Retired car');
    expect(render(<AddTrack trackId="track" />)).toContain('Retired track');
  });

  it('opens an archived tire editor', () => {
    expect(render(<AddTire carId="car" tireId="lf" />)).toContain('Retired tire lf');
  });

  it('keeps archived dependencies visible when editing a stint', () => {
    const html = render(<AddStint carId="car" stintId="stint" />);
    expect(html).toContain('Historical stint');
    expect(html).toContain('Retired track');
    expect(html).toContain('Retired tire lf');
  });

  it('opens archived tire details with their track and stint history', () => {
    const html = render(<Tire />, '/car/car/tires/lf');
    expect(html).toContain('Retired tire lf');
    expect(html).toContain('Retired track');
    expect(html).toContain('Historical stint');
    expect(html).not.toContain('Tire not found');
  });

  it('opens linked archived stints with archived track and tire names', () => {
    const html = render(<Stints />, '/car/car/stints?stintId=stint&archived=true');
    expect(html).toContain('Retired track');
    expect(html).toContain('Retired tire lf');
    expect(html).toContain('Historical stint');
  });
});

describe('Car navigation', () => {
  it('disables car tabs when the last car is archived', () => {
    const html = render(<Header onChangeCar={jest.fn()} />, '/car/car/stints');
    const carTabs = html
      .match(/<button\b[^>]*>[\s\S]*?<\/button>/g)!
      .filter((button) => button.includes('Stints') || button.includes('Tires'));
    expect(carTabs).toHaveLength(2);
    for (const button of carTabs) expect(button).toContain('disabled=""');
  });

  it('does not silently select another car when no car is selected', () => {
    const html = render(<Header onChangeCar={jest.fn()} />, '/car/car/stints');
    const carTabs = html
      .match(/<button\b[^>]*>[\s\S]*?<\/button>/g)!
      .filter((button) => button.includes('Stints') || button.includes('Tires'));
    expect(carTabs).toHaveLength(2);
    for (const button of carTabs) expect(button).toContain('disabled=""');
  });
});

describe('Tire sorting', () => {
  function tableRenderer(archived: boolean) {
    const state: unknown[] = [];
    return () => {
      let table: ActiveTiresProps | undefined;
      function Probe() {
        let cursor = 0;
        const stateSpy = jest.spyOn(React, 'useState').mockImplementation(((initial: unknown) => {
          const index = cursor++;
          if (!(index in state)) {
            state[index] = typeof initial === 'function' ? initial() : initial;
          }
          return [
            state[index],
            (next: unknown) => {
              state[index] = typeof next === 'function' ? next(state[index]) : next;
            }
          ];
        }) as typeof React.useState);
        try {
          const view = Tires({}) as ReactElement<{ children: ReactElement<ActiveTiresProps>[] }>;
          table = view.props.children[1].props;
        } finally {
          stateSpy.mockRestore();
        }
        return null;
      }
      render(<Probe />, `/car/car/tires?archived=${archived}`);
      return table!;
    };
  }

  it.each([false, true])('updates sorted rows when data changes (archived=%s)', (archived) => {
    records.tires = records.tires.map((tire) => ({ ...tire, archived }));
    const readTable = tableRenderer(archived);
    readTable().setSorting('name');
    const sorted = readTable();
    expect(sorted.sortedTires?.map((tire) => tire.tireId)).toEqual(['lf', 'lr', 'rf', 'rr']);
    expect(sorted.filteredTires?.map((tire) => tire.tireId)).toEqual(['lf', 'rf', 'lr', 'rr']);

    records.tires = records.tires.map((tire) =>
      tire.tireId === 'lf' ? { ...tire, archived: !archived } : tire
    );
    expect(readTable().sortedTires?.map((tire) => tire.tireId)).toEqual(['lr', 'rf', 'rr']);
    records.tires = [];
    expect(readTable().sortedTires).toEqual([]);
  });

  it.each([false, true])(
    'reapplies filters and direction to sorted rows (archived=%s)',
    (archived) => {
      records.tires = records.tires.map((tire) => ({ ...tire, archived }));
      const readTable = tableRenderer(archived);
      readTable().setSorting('name');
      readTable().setFilters({
        nameSearch: 'tire r',
        tirePosition: [],
        totalDistance: [0, Infinity]
      });
      expect(readTable().sortedTires?.map((tire) => tire.tireId)).toEqual(['rf', 'rr']);
      readTable().setSorting('name');
      expect(readTable().sortedTires?.map((tire) => tire.tireId)).toEqual(['rr', 'rf']);
      readTable().setFilters({
        nameSearch: 'no match',
        tirePosition: [],
        totalDistance: [0, Infinity]
      });
      expect(readTable().sortedTires).toEqual([]);
    }
  );
});
