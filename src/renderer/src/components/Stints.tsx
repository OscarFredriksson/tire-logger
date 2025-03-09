import {
  Accordion,
  AccordionControlProps,
  ActionIcon,
  Button,
  Center,
  Group,
  Table,
  Text,
  Title
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { Stint } from '@shared/model';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { FC, useEffect, useState } from 'react';

function AccordionControl(props: AccordionControlProps) {
  return (
    <Center>
      <Accordion.Control {...props} />
      <ActionIcon className="mr-2" size="lg" variant="gradient">
        <IconArrowRight size={16} />
      </ActionIcon>
    </Center>
  );
}

export const Stints: FC = () => {
  const [stints, setStintData] = useState<Stint[]>();

  useEffect(() => {
    const getStintData = async () => {
      const data: Stint[] = await window.api.getStintData();
      setStintData(data);
    };
    getStintData();
  }, []);

  const addStint = () =>
    modals.openConfirmModal({
      title: 'Add stint',
      children: <Text size="sm">Add stint form here</Text>,
      labels: { confirm: 'Add', cancel: 'Cancel' },
      onCancel: () => console.log('Cancel'),
      onConfirm: () => console.log('Add')
    });

  return (
    <>
      <Group justify="space-between">
        <Title>Stints</Title>
        <Button variant="gradient" rightSection={<IconPlus />} onClick={addStint}>
          Add stint
        </Button>
      </Group>
      {stints?.map((stint) => (
        <Accordion key={stint.stintId} chevronPosition="left" variant="separated" className="mt-2">
          <Accordion.Item value="value1" key="key1">
            <AccordionControl>
              {stint.trackName} {stint.date.toISOString()} {stint.laps} laps
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
      ))}
    </>
  );
};
