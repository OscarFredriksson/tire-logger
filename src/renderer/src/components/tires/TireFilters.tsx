import { Group, TextInput, MultiSelect, Text } from '@mantine/core';
import { IconFilter, IconSearch } from '@tabler/icons-react';
import { RangeSliderWithLabel } from '../common/RangeSliderWithLabel';
import { useForm } from '@mantine/form';
import { FC, useEffect } from 'react';

export interface TireFilters {
  nameSearch?: string;
  tirePosition: string[];
  totalDistance: [number, number];
}

interface TireFiltersProps {
  distMax: number;
  itemCount: number;
  shownItemCount: number;
  onFilterChange: (filters: TireFilters) => void;
}

export const TireFilters: FC<TireFiltersProps> = ({
  onFilterChange,
  distMax,
  itemCount,
  shownItemCount
}) => {
  const form = useForm<TireFilters>({
    initialValues: {
      nameSearch: '',
      tirePosition: [],
      totalDistance: [0, distMax]
    }
  });

  useEffect(() => {
    onFilterChange(form.values);
  }, [form.values, onFilterChange]);

  return (
    <Group>
      <IconFilter size={22} className="ml-2 mb-1 mt-auto" />
      <Text mt="auto" mb="5" miw={150} size="sm">
        {shownItemCount == itemCount
          ? 'Showing all tires'
          : shownItemCount > 0
            ? `Showing ${shownItemCount} of ${itemCount} tires`
            : 'No tires found'}
      </Text>
      <TextInput
        className="min-w-[200px]"
        size="xs"
        label="Name"
        placeholder="Search"
        leftSection={<IconSearch size={16} />}
        {...form.getInputProps('nameSearch')}
      />
      <MultiSelect
        className="min-w-[200px]"
        size="xs"
        label="Tire position"
        data={['Left', 'Right', 'Front', 'Rear']}
        {...(!form.getValues().tirePosition.length && { placeholder: 'Select tire position' })}
        {...form.getInputProps('tirePosition')}
        clearable
        styles={{
          pill: {
            backgroundColor: 'var(--mantine-color-blue-8)',
            color: 'white'
          }
        }}
      />
      <RangeSliderWithLabel min={0} max={distMax} {...form.getInputProps('totalDistance')} />
    </Group>
  );
};
