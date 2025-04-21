import { Group, Title, Button } from '@mantine/core';
import { FC } from 'react';

export interface TitleWithButtonProps {
  title: string;
  buttonIcon?: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}

export const TitleWithButton: FC<TitleWithButtonProps> = ({
  title,
  buttonIcon,
  buttonText,
  onButtonClick
}) => {
  return (
    <Group justify="space-between">
      <Title>{title}</Title>
      <Button variant="gradient" rightSection={buttonIcon} onClick={onButtonClick}>
        {buttonText}
      </Button>
    </Group>
  );
};
