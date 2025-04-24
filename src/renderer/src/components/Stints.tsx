import { Accordion, ActionIcon, Center, Loader, Table, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { FC, PropsWithChildren } from 'react';
import { Stint, StintProps } from './Stint';
import { themeConstants } from '@renderer/theme';
import { useStints } from '@renderer/hooks/useStints';
import { TitleWithButton } from './common/TitleWithButton';
import { useTracks } from '@renderer/hooks/useTracks';

const AccordionControl: FC<
  PropsWithChildren<{ stintId: string; openStintModal: (props?: StintProps) => void }>
> = ({ stintId, openStintModal, ...props }) => {
  return (
    <Center>
      <Accordion.Control {...props} />
      <Tooltip withArrow label="Edit stint" openDelay={themeConstants.TOOLTIP_OPEN_DELAY}>
        <ActionIcon className="mr-2" size="lg" variant="light">
          <IconEdit size={20} onClick={() => openStintModal({ stintId })} />
        </ActionIcon>
      </Tooltip>
    </Center>
  );
};

export const Stints: FC = () => {
  const { loading, stints } = useStints();
  const { getTrack } = useTracks();

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
      {loading ? (
        <Loader />
      ) : (
        stints?.map((stint) => (
          <Accordion
            key={stint.stintId}
            chevronPosition="left"
            variant="separated"
            className="mt-2"
          >
            <Accordion.Item value="value1" key="key1">
              <AccordionControl
                stintId={stint.stintId}
                openStintModal={() => openStintModal({ stintId: stint.stintId })}
              >
                {getTrack(stint.trackId)?.name} - {stint.date.toISOString().substring(0, 10)} -{' '}
                {stint.laps} laps
              </AccordionControl>
              <Accordion.Panel>
                <Table>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Position</Table.Th>
                      <Table.Th>Tire name</Table.Th>
                      <Table.Th>Total laps</Table.Th>
                    </Table.Tr>
                  </Table.Thead>

                  <Table.Tbody>
                    <Table.Tr>
                      <Table.Td>Left Front</Table.Td>
                      <Table.Td>{stint.leftFront}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Right Front</Table.Td>
                      <Table.Td>{stint.rightFront}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Left Rear</Table.Td>
                      <Table.Td>{stint.leftRear}</Table.Td>
                    </Table.Tr>
                    <Table.Tr>
                      <Table.Td>Right rear</Table.Td>
                      <Table.Td>{stint.rightRear}</Table.Td>
                    </Table.Tr>
                  </Table.Tbody>
                </Table>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        ))
      )}
    </>
  );
};
