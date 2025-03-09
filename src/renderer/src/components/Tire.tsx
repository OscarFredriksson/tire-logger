import { Button, Group, Stack, Table, Text, Title } from '@mantine/core';
import { Tire as ITire } from '../../../shared/model';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';

interface TireProps {
  tires?: ITire[];
}

export const Tire: FC<TireProps> = ({ tires }) => {
  const { tireId } = useParams();
  const navigate = useNavigate();

  const [tire, setTire] = useState<ITire | undefined>();

  useEffect(() => {
    setTire(tires?.find((tire) => tire.tireId === tireId));
  }, [tires, tireId]);

  return (
    <>
      <Group>
        <Button
          leftSection={<IconArrowLeft />}
          variant="gradient"
          onClick={() => navigate(routes.TIRES)}
        >
          Back
        </Button>
        <Title>Tire</Title>
      </Group>
      <Stack className="mt-10 mb-10">
        <Text>Tire id: {tire?.tireId}</Text>
        <Text>Total laps: {tire?.stints.reduce((total, { laps }) => total + laps, 0)}</Text>
        <Text>
          {/* TODO: handle undefined better here. distance should always be defined */}
          Total distance: {tire?.stints.reduce(
            (total, { distance }) => total + (distance || 0),
            0
          )}{' '}
          meter
        </Text>
        <Text>
          Used at:{' '}
          {tire?.stints
            .map(({ trackName }) => trackName)
            .filter((value, index, array) => array.indexOf(value) === index)
            .join(', ')}
        </Text>
      </Stack>
      <Group>
        <Title className="mt-10" order={2}>
          Stints
        </Title>
        <Button variant="gradient" rightSection={<IconPlus />}>
          Add stint
        </Button>
      </Group>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Date</Table.Th>
            <Table.Th>Position</Table.Th>
            <Table.Th>Laps</Table.Th>
            <Table.Th>Distance (m)</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {tire?.stints.map(({ stintId, date, position, laps, distance }) => (
            <Table.Tr key={stintId}>
              <Table.Td>{date.toString()}</Table.Td>
              <Table.Td>{position}</Table.Td>
              <Table.Td>{laps}</Table.Td>
              <Table.Td>{distance}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
};
