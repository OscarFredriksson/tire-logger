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
  Menu,
  SegmentedControl
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconArrowRight,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconTrash
} from '@tabler/icons-react';
import { FC, PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import { AddStint, StintProps } from './AddStint';
import { themeConstants } from '@renderer/theme';
import { useActiveStints, useArchivedStints } from '@renderer/hooks/useStints';
import { TitleWithButton } from '../common/TitleWithButton';
import { useActiveTracks } from '@renderer/hooks/useTracks';
import { useActiveTires } from '@renderer/hooks/useTires';
import { generatePath, useNavigate, useParams, useSearchParams } from 'react-router';
import { routes } from '@renderer/routes';
import { formatDistance } from '@renderer/utils/distanceUtils';

const AccordionControl: FC<
  PropsWithChildren<{
    stintId: string;
    carId: string;
    openStintModal: () => void;
    archived?: boolean;
  }>
> = ({ stintId, carId, openStintModal, archived, ...props }) => {
  const [opened, setOpened] = useState<boolean>(false);
  const { archiveStint } = useActiveStints({ carId });
  const { restoreStint } = useArchivedStints({ carId });

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
          <Menu.Item leftSection={<IconEdit size={14} />} onClick={openStintModal}>
            Edit stint
          </Menu.Item>
          {(archived && (
            <Menu.Item leftSection={<IconTrash size={14} />} onClick={() => restoreStint(stintId)}>
              Restore stint
            </Menu.Item>
          )) || (
            <Menu.Item leftSection={<IconTrash size={14} />} onClick={() => archiveStint(stintId)}>
              Archive stint
            </Menu.Item>
          )}
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
  const { carId } = useParams();
  const { getActiveTire, loadingActiveTires } = useActiveTires({ carId });
  const { loadingActiveStints, getTireStints } = useActiveStints({ carId });
  const { loadingActiveTracks, getTrack } = useActiveTracks();
  const navigate = useNavigate();

  const tireStints = useMemo(
    () => !loadingActiveStints && tireId && getTireStints(tireId),
    [loadingActiveStints, tireId, getTireStints]
  );

  return (
    <Table.Tr>
      <Table.Td>{title}</Table.Td>
      <Table.Td>
        {!loadingActiveTires && tireId ? (
          getActiveTire(tireId)?.name
        ) : (
          <Skeleton height={8} width="50%" />
        )}
      </Table.Td>
      <Table.Td>
        {loadingActiveStints || loadingActiveTracks ? (
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
              onClick={() => navigate(generatePath(routes.TIRE_tireId, { tireId, carId }))}
            />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
};

export const Stints: FC = () => {
  const { carId } = useParams();
  const [searchParams] = useSearchParams();
  const openStintId = searchParams.get('stintId');
  const scrollToRef = useRef<HTMLDivElement>(null);

  useEffect(() => scrollToRef.current?.scrollIntoView({ behavior: 'smooth' }), [scrollToRef]);

  const [showArchived, setShowArchived] = useState<boolean>(false);
  const { loadingActiveStints, activeStints } = useActiveStints({ carId, archived: showArchived });
  const { loadingArchivedStints, archivedStints } = useArchivedStints({ carId });
  const { getTrack } = useActiveTracks();

  const openStintModal = (props?: StintProps) => {
    if (!carId) throw new Error('CarId is undefined.');

    modals.open({
      children: <AddStint {...props} carId={carId} />,
      withCloseButton: false
    });
  };

  return (
    <>
      <TitleWithButton
        buttonIcon={<IconPlus />}
        buttonText="Add stint"
        onButtonClick={() => openStintModal()}
        centerElement={
          <SegmentedControl
            value={showArchived ? 'archived' : 'active'}
            onChange={(v) => setShowArchived(v === 'archived')}
            data={[
              { label: 'Active', value: 'active' },
              { label: 'Archived', value: 'archived' }
            ]}
            mr="auto"
            ml="lg"
          />
        }
      >
        Stints
      </TitleWithButton>
      {showArchived ? (
        loadingArchivedStints ? (
          <Loader className="mt-8" />
        ) : !archivedStints || archivedStints.length === 0 ? (
          <div className="mt-4">No archived stints found</div>
        ) : (
          <Accordion
            defaultValue={openStintId}
            chevronPosition="left"
            variant="separated"
            className="mt-4"
          >
            {archivedStints?.map(
              ({
                stintId,
                trackId,
                carId,
                date,
                laps,
                leftFront,
                leftRear,
                rightFront,
                rightRear,
                note
              }) => {
                const track = getTrack(trackId);
                return (
                  <Accordion.Item
                    value={stintId}
                    key={stintId}
                    {...(openStintId === stintId && { ref: scrollToRef })}
                  >
                    <AccordionControl
                      stintId={stintId}
                      carId={carId}
                      openStintModal={() => openStintModal({ stintId, carId })}
                      archived={showArchived}
                    >
                      {track?.name} - {date.toISOString().substring(0, 10)} - {laps} laps{' '}
                      <i>{track && '(' + formatDistance(track.length * laps) + ')'}</i>
                    </AccordionControl>
                    <Accordion.Panel>
                      {note && (
                        <Text size="sm" c="dimmed" fw={400}>
                          Notes: {note}
                        </Text>
                      )}
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
                          <TireTableRow title="Left Front" tireId={leftFront} />
                          <TireTableRow title="Right Front" tireId={rightFront} />
                          <TireTableRow title="Left Rear" tireId={leftRear} />
                          <TireTableRow title="Right Rear" tireId={rightRear} />
                        </Table.Tbody>
                      </Table>
                      <Divider />
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              }
            )}
          </Accordion>
        )
      ) : loadingActiveStints ? (
        <Loader />
      ) : !activeStints || activeStints.length === 0 ? (
        <div className="mt-4">No stints added yet</div>
      ) : (
        <Accordion
          defaultValue={openStintId}
          chevronPosition="left"
          variant="separated"
          className="mt-4"
        >
          {activeStints?.map(
            ({
              stintId,
              trackId,
              carId,
              date,
              laps,
              leftFront,
              leftRear,
              rightFront,
              rightRear,
              note
            }) => {
              const track = getTrack(trackId);
              return (
                <Accordion.Item
                  value={stintId}
                  key={stintId}
                  {...(openStintId === stintId && { ref: scrollToRef })}
                >
                  <AccordionControl
                    stintId={stintId}
                    carId={carId}
                    openStintModal={() => openStintModal({ stintId, carId })}
                    archived={showArchived}
                  >
                    {track?.name} - {date.toISOString().substring(0, 10)} - {laps} laps{' '}
                    <i>{track && '(' + formatDistance(track.length * laps) + ')'}</i>
                  </AccordionControl>
                  <Accordion.Panel>
                    {note && (
                      <Text size="sm" c="dimmed" fw={400}>
                        Notes: {note}
                      </Text>
                    )}
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
                        <TireTableRow title="Left Front" tireId={leftFront} />
                        <TireTableRow title="Right Front" tireId={rightFront} />
                        <TireTableRow title="Left Rear" tireId={leftRear} />
                        <TireTableRow title="Right Rear" tireId={rightRear} />
                      </Table.Tbody>
                    </Table>
                    <Divider />
                  </Accordion.Panel>
                </Accordion.Item>
              );
            }
          )}
        </Accordion>
      )}
    </>
  );
};
