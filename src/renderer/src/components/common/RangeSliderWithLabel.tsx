import { Group, RangeSlider, RangeSliderProps, Stack, Text } from '@mantine/core';
import { FC } from 'react';

interface RangeSliderWithLabelProps extends RangeSliderProps {
  min: number;
  max: number;
}

export const RangeSliderWithLabel: FC<RangeSliderWithLabelProps> = ({ min, max, ...props }) => {
  const isChanged = props.value && (props.value[0] !== min || props.value[1] !== max);

  return (
    <Stack h={45}>
      <Group justify="space-between">
        <Text size="xs" className="p-0">
          Total distance
        </Text>
        <Text size="xs" {...(!isChanged && { c: 'dimmed' })} className="p-0">
          {props.value ? props.value[0] : min}km - {props.value ? props.value[1] : max}km
        </Text>
      </Group>
      <RangeSlider
        className="w-50"
        size="sm"
        color={isChanged ? 'blue' : 'dimmed'}
        label={null}
        min={min}
        max={max}
        minRange={0}
        {...props}
      />
    </Stack>
  );
};
