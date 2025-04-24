import { Button, Center, Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { IconArrowLeft, IconPlus } from '@tabler/icons-react';
import { FC, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { useTires } from '@renderer/hooks/useTires';

export const Tire: FC = () => {
  const { tireId } = useParams();
  const navigate = useNavigate();

  const { loading, getTire } = useTires();

  const tire = useMemo(() => tireId && getTire(tireId), [getTire, tireId]);

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
      {loading || !tire ? (
        <Center className="mt-5">
          <Loader />
        </Center>
      ) : (
        <>
          <Stack className="mt-10 mb-10">
            <Text>Tire name: {tire?.name}</Text>
            <Text>Total laps: {[].reduce((total, { laps }) => total + laps, 0)}</Text>
            <Text>
              {/* TODO: handle undefined better here. distance should always be defined */}
              Total distance: {[].reduce((total, { distance }) => total + (distance || 0), 0)} meter
            </Text>
            <Text>
              Used at:{' '}
              {[]
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
            {/* <Table.Tbody>
              {[].map(({ stintId, date, laps, distance }) => (
                <Table.Tr key={stintId}>
                  <Table.Td>{date?.toString()}</Table.Td>
                  <Table.Td>{position}</Table.Td>
                  <Table.Td>{laps}</Table.Td>
                  <Table.Td>{distance}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody> */}
          </Table>
        </>
      )}
    </>
  );
};
