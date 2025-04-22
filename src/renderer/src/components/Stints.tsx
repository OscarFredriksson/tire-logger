import { Accordion, ActionIcon, Center, Loader, Table, Tooltip } from '@mantine/core';
import { modals } from '@mantine/modals';
import { IconEdit, IconPlus } from '@tabler/icons-react';
import { FC, PropsWithChildren } from 'react';
import { Stint, StintProps } from './Stint';
import { themeConstants } from '@renderer/theme';
import { useStints } from '@renderer/hooks/useStints';
import { TitleWithButton } from './common/TitleWithButton';

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

  const openStintModal = (props?: StintProps) =>
    modals.openConfirmModal({
      children: <Stint {...props} />,
      labels: { confirm: 'Add', cancel: 'Cancel' },
      withCloseButton: false,
      onConfirm: () => console.log('Add'),
      onCancel: () => console.log('Cancel')
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
                {stint.trackName} - {stint.date.toISOString().substring(0, 10)} - {stint.laps} laps
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
                    {stint.tires?.map(({ tireId, position }) => (
                      <Table.Tr key={tireId}>
                        <Table.Td>{position}</Table.Td>
                        <Table.Td>{tireId}</Table.Td>
                      </Table.Tr>
                    ))}
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
