import { Group, Title, Button, TitleOrder } from '@mantine/core';
import { FC, PropsWithChildren } from 'react';

export interface TitleWithButtonProps {
  titleOrder?: TitleOrder;
  buttonIcon?: React.ReactNode;
  buttonText: string;
  onButtonClick: () => void;
}

export const TitleWithButton: FC<PropsWithChildren<TitleWithButtonProps>> = ({
  children,
  titleOrder,
  buttonIcon,
  buttonText,
  onButtonClick
}) => {
  return (
    <Group justify="space-between">
      <Title order={titleOrder}>{children}</Title>
      <Button variant="gradient" rightSection={buttonIcon} onClick={onButtonClick}>
        {buttonText}
      </Button>
    </Group>
  );
};
