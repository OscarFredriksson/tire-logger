import { Button, Center, Group, Loader, Skeleton, Stack, Table, Text, Title } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import { FC, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { routes } from '@renderer/routes';
import { useTires } from '@renderer/hooks/useTires';
import { useStints } from '@renderer/hooks/useStints';
import { useTracks } from '@renderer/hooks/useTracks';
import { formatDistance } from '@renderer/utils/distanceUtils';
import { TextWithLabel } from './common/TextWithLabel';

export const Tire: FC = () => {
  const { carId, tireId } = useParams();
  const navigate = useNavigate();

  const { loading, getTire } = useTires({ carId });
  const { loading: loadingStints, getTireStints } = useStints();
  const { loading: loadingTracks, getTrack } = useTracks();

  const tire = useMemo(() => tireId && getTire(tireId), [getTire, tireId]);

  const tireStints = useMemo(
    () => tireId && !loadingStints && getTireStints(tireId),
    [getTireStints, tireId, loadingStints]
  );

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
            <TextWithLabel label="Tire name:">
              <Text>{tire?.name}</Text>
            </TextWithLabel>
            <TextWithLabel label="Total laps:">
              <Text>
                {tireStints ? (
                  tireStints.reduce((total, { laps }) => total + laps, 0)
                ) : (
                  <Skeleton />
                )}
              </Text>
            </TextWithLabel>
            <TextWithLabel label="Total distance:">
              {tireStints && !loadingTracks ? (
                formatDistance(
                  tireStints.reduce(
                    (total, { trackId, laps }) => total + laps * (getTrack(trackId)?.length || 0),
                    0
                  )
                )
              ) : (
                <Skeleton height={8} width="5rem" />
              )}
            </TextWithLabel>
            <TextWithLabel label="Used at:">
              {tireStints && !loadingTracks ? (
                <Text>
                  {tireStints
                    .map(({ trackId }) => getTrack(trackId)?.name)
                    .filter((trackName) => trackName !== undefined)
                    .filter((value, index, array) => array.indexOf(value) === index)
                    .join(', ')}
                </Text>
              ) : (
                <Skeleton height={8} width="20rem" />
              )}
            </TextWithLabel>
          </Stack>
          <Group>
            <Title className="mt-10" order={2}>
              Stints
            </Title>
          </Group>
          {!tireStints ? (
            <div>No stints yet</div>
          ) : (
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Track</Table.Th>
                  <Table.Th>Position</Table.Th>
                  <Table.Th>Laps</Table.Th>
                  <Table.Th>Distance</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tireStints.map(({ stintId, trackId, date, laps, position }) => (
                  <Table.Tr key={stintId}>
                    <Table.Td>{date?.toLocaleDateString()}</Table.Td>
                    <Table.Td>{getTrack(trackId)?.name || 'Unknown'}</Table.Td>
                    <Table.Td>{position}</Table.Td>
                    <Table.Td>{laps}</Table.Td>
                    <Table.Td>
                      {!loadingTracks ? (
                        formatDistance(laps * (getTrack(trackId)?.length || 0))
                      ) : (
                        <Skeleton height={8} width="5rem" />
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
};
