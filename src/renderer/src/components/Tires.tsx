import { Button, Loader, Table } from '@mantine/core';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { FC } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { routes } from '@renderer/routes';
import { modals } from '@mantine/modals';
import { AddTire } from './AddTire';
import { useTires } from '@renderer/hooks/useTires';
import { TitleWithButton } from './common/TitleWithButton';

export const Tires: FC = () => {
  const navigate = useNavigate();

  const { loading, tires } = useTires();

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
              <Table.Th>name</Table.Th>
              <Table.Th>Total laps</Table.Th>
              <Table.Th>Last used</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tires?.map(({ tireId, name }) => (
              <Table.Tr key={tireId}>
                <Table.Td>{name}</Table.Td>
                <Table.Td>
                  {/* {stints?.reduce((total, { laps }) => total + laps, 0)} */}
                  15
                </Table.Td>
                <Table.Td>-</Table.Td>
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
            ))}
          </Table.Tbody>
        </Table>
      )}
    </>
  );
};
