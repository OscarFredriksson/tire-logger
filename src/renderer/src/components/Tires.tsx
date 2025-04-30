import { Button, Loader, Skeleton, Table } from '@mantine/core';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire } from './AddTire';
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from './common/TitleWithButton';
import { useStints } from '@renderer/hooks/useStints';
import { Stint } from '@shared/model';
import { useTracks } from '@renderer/hooks/useTracks';

// TODO: sortable table

export const Tires: FC = () => {
  const navigate = useNavigate();

  const { loading, tires } = useTires();
  const { loading: loadingStints, getTireStints } = useStints();
  const { getTrack } = useTracks();

  const addTire = () => {
    modals.open({
      children: <AddTire />,
      withCloseButton: false
    });
  };

  return (
    <>
      <TitleWithButton buttonIcon={<IconPlus />} buttonText="Add tire" onButtonClick={addTire}>
        Tires
      </TitleWithButton>
      {loading ? (
        <Loader className="mt-8" />
      ) : (
        <Table className="mt-8">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Total laps</Table.Th>
              <Table.Th>Last used</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tires?.map(({ tireId, name }) => {
              const tireStints = getTireStints(tireId);
              const lastUsedStint = tireStints?.reduce(
                (latest, stint) => {
                  if (!latest || stint.date > latest.date) {
                    return stint;
                  }
                  return latest;
                },
                undefined as Stint | undefined
              );

              const lastUsedTrack = lastUsedStint && getTrack(lastUsedStint.trackId)?.name;

              const lastUsedString = lastUsedStint
                ? lastUsedStint.date.toLocaleDateString() +
                  (lastUsedTrack ? ' at ' + lastUsedTrack : '')
                : 'Never';

              return (
                <Table.Tr key={tireId}>
                  <Table.Td>{name}</Table.Td>
                  <Table.Td>
                    {!loadingStints ? (
                      tireStints.reduce((total, { laps }) => total + laps, 0)
                    ) : (
                      <Skeleton height={8} />
                    )}
                  </Table.Td>
                  <Table.Td>{lastUsedString}</Table.Td>
                  <Table.Td align="right">
                    <Button
                      variant="gradient"
                      onClick={() => navigate(generatePath(routes.TIRE_tireId, { tireId }))}
                      rightSection={<IconArrowRight />}
                    >
                      Go to tire
                    </Button>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
};
