import {
  Accordion,
  ActionIcon,
  Center,
  Divider,
  Loader,
  Skeleton,
  Table,
  Tooltip,
  Text,
  Menu
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconArrowRight,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { Stint, StintProps } from './Stint';
import { themeConstants } from '@renderer/theme';
import { useStints } from '@renderer/hooks/useStints';
import { TitleWithButton } from './common/TitleWithButton';
import { useTracks } from '@renderer/hooks/useTracks';
import { useTires } from '@renderer/hooks/useTires';
import { generatePath, useNavigate } from 'react-router';
import { routes } from '@renderer/routes';
import { formatDistance } from '@renderer/utils/distanceUtils';

const AccordionControl: FC<
  PropsWithChildren<{ stintId: string; openStintModal: (props?: StintProps) => void }>
> = ({ stintId, openStintModal, ...props }) => {
  const [opened, setOpened] = useState<boolean>(false);

  return (
    <Center>
      <Accordion.Control {...props} />
      <Menu opened={opened} onChange={setOpened}>
        <Menu.Target>
          <ActionIcon className="mr-2" variant="subtle" color="gray">
            <IconDotsVertical />
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconEdit size={14} />}
            onClick={() => openStintModal({ stintId })}
          >
            Edit stint
          </Menu.Item>
          <Menu.Item color="red" leftSection={<IconTrash size={14} />}>
            Delete stint
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Center>
  );
};

interface TireTableRowProps {
  title: string;
  tireId?: string;
}

const TireTableRow: FC<TireTableRowProps> = ({ title, tireId }) => {
  const { getTire, loading } = useTires();
  const { loading: loadingStints, getTireStints } = useStints();
  const { loading: loadingTracks, getTrack } = useTracks();
  const navigate = useNavigate();

  const tireStints = useMemo(
    () => !loadingStints && tireId && getTireStints(tireId),
    [loadingStints, tireId, getTireStints]
  );

  return (
    <Table.Tr>
      <Table.Td>{title}</Table.Td>
      <Table.Td>
        {!loading && tireId ? getTire(tireId)?.name : <Skeleton height={8} width="50%" />}
      </Table.Td>
      <Table.Td>
        {loadingStints || loadingTracks ? (
          <Skeleton height={8} width="40%" />
        ) : tireStints ? (
          tireStints.reduce((total, { laps }) => total + laps, 0) +
          ' laps - ' +
          formatDistance(
            tireStints.reduce(
              (total, { trackId, laps }) => total + laps * (getTrack(trackId)?.length || 0),
              0
            )
          )
        ) : (
          '-'
        )}
      </Table.Td>
      <Table.Td align="right">
        <Tooltip withArrow label="Go to tire" openDelay={themeConstants.TOOLTIP_OPEN_DELAY}>
          <ActionIcon size="md" variant="gradient">
            <IconArrowRight
              size={20}
              onClick={() => navigate(generatePath(routes.TIRE_tireId, { tireId }))}
            />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
};

export const Stints: FC = () => {
  const { loading: loadingStints, stints } = useStints();
  const { getTrack, loading: loadingTracks } = useTracks();

  const openStintModal = (props?: StintProps) =>
    modals.open({
      children: <Stint {...props} />,
      withCloseButton: false
    });

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add stint"
        onButtonClick={() => openStintModal()}
      >
        Stints
      </TitleWithButton>
      {loadingStints || loadingTracks ? (
        <Loader />
      ) : (
        stints?.map((stint) => {
          const track = getTrack(stint.trackId);

          return (
            <Accordion
              key={stint.stintId}
              chevronPosition="left"
              variant="separated"
              className="mt-2"
            >
              <Accordion.Item value={stint.stintId} key={stint.stintId}>
                <AccordionControl
                  stintId={stint.stintId}
                  openStintModal={() => openStintModal({ stintId: stint.stintId })}
                >
                  {track?.name} - {stint.date.toISOString().substring(0, 10)} - {stint.laps} laps{' '}
                  <i>{track && '(' + formatDistance(track.length * stint.laps) + ')'}</i>
                </AccordionControl>
                <Accordion.Panel>
                  <Table>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Tire position</Table.Th>
                        <Table.Th>Tire name</Table.Th>
                        <Table.Th>Total tire usage</Table.Th>
                        <Table.Th></Table.Th>
                      </Table.Tr>
                    </Table.Thead>

                    <Table.Tbody>
                      <TireTableRow title="Left Front" tireId={stint.leftFront} />
                      <TireTableRow title="Right Front" tireId={stint.rightFront} />
                      <TireTableRow title="Left Rear" tireId={stint.leftRear} />
                      <TireTableRow title="Right Rear" tireId={stint.rightRear} />
                    </Table.Tbody>
                  </Table>
                  <Divider />
                  <div className="pl-5 pt-5">
                    <Text size="sm" c="dimmed" fw={400}>
                      Notes: {stint.note}
                    </Text>
                  </div>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          );
        })
      )}
    </>
  );
};
