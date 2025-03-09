import { Button, Table, Title } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { FC } from 'react';
import { generatePath, useNavigate } from 'react-router';
import { Tire } from '@shared/model';
import { routes } from '@renderer/routes';

interface TiresProps {
  tires?: Tire[];
}

export const Tires: FC<TiresProps> = ({ tires }) => {
  const navigate = useNavigate();

  return (
    <>
      <Title>Tires</Title>
      <Table className="mt-8">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>id</Table.Th>
            <Table.Th>Total laps</Table.Th>
            <Table.Th>Last used</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tires?.map(({ tireId, stints }) => (
            <Table.Tr key={tireId}>
              <Table.Td>{tireId}</Table.Td>
              <Table.Td>{stints.reduce((total, { laps }) => total + laps, 0)}</Table.Td>
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
    </>
  );
};
