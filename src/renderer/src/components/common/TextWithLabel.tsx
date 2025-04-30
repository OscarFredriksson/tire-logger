import { Group, Text } from '@mantine/core';
import { FC, PropsWithChildren } from 'react';

export interface TextWithLabelProps {
  label: string;
}

export const TextWithLabel: FC<PropsWithChildren<TextWithLabelProps>> = ({ label, children }) => {
  return (
    <Group justify="left" gap="xs">
      <Text fw={800} className="mr-0">
        {label}
      </Text>
      {children}
    </Group>
  );
};
