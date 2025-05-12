import { Tooltip, Pill, PillProps } from '@mantine/core';
import { themeConstants } from '@renderer/theme';
import { FC } from 'react';

interface PillWithTooltipProps extends PillProps {
  tip?: string;
}

export const PillWithTooltip: FC<PillWithTooltipProps> = ({ tip, children, ...props }) => {
  const pill = <Pill {...props}>{children}</Pill>;

  return !tip ? (
    pill
  ) : (
    <Tooltip label={tip} withArrow openDelay={themeConstants.TOOLTIP_OPEN_DELAY}>
      {pill}
    </Tooltip>
  );
};
