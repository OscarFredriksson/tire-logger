import { Table, Group, Center, Text, TableThProps } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { FC } from 'react';

interface ThProps extends TableThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort: () => void;
}

export const ThSortable: FC<ThProps> = ({ children, reversed, sorted, onSort, ...props }) => {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th
      {...props}
      className="p-0 cursor-pointer hover:bg-[var(--mantine-color-dark-4)]"
      onClick={onSort}
    >
      <Group>
        <Text fw={500} fz="sm">
          {children}
        </Text>
        <Center className="icon">
          <Icon size={16} stroke={1.5} />
        </Center>
      </Group>
    </Table.Th>
  );
};
