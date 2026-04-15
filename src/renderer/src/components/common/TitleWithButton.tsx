import { Group, Title, Button, TitleOrder } from '@mantine/core';
import { FC, PropsWithChildren } from 'react';

export interface TitleWithButtonProps {
  titleOrder?: TitleOrder;
  buttonIcon?: React.ReactNode;
  buttonText: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  centerElement?: React.ReactNode;
  onButtonClick: () => void;
}

export const TitleWithButton: FC<PropsWithChildren<TitleWithButtonProps>> = ({
  children,
  titleOrder,
  buttonIcon,
  buttonText,
  buttonSize = 'sm',
  centerElement,
  onButtonClick
}) => {
  return (
    <Group justify="space-between" gap={0} align="center">
      <Title order={titleOrder}>{children}</Title>
      {centerElement}
      <Button
        variant="gradient"
        size={buttonSize}
        rightSection={buttonIcon}
        onClick={onButtonClick}
      >
        {buttonText}
      </Button>
    </Group>
  );
};
