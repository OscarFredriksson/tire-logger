import { Group, SegmentedControl, Text } from '@mantine/core';
import { IconArchive, IconBolt } from '@tabler/icons-react';

type SegmentValue = 'active' | 'archived';

interface SegmentToggleProps {
  value: SegmentValue;
  onChange: (value: SegmentValue) => void;
  showText?: boolean;
  compact?: boolean;
}

export default function SegmentToggle({
  value,
  onChange,
  showText = true,
  compact = false
}: SegmentToggleProps) {
  const iconSize = compact ? 16 : 18;

  const segmentLabel = (segment: SegmentValue, text: string) => (
    <Group gap={6} wrap="nowrap">
      {segment === 'active' ? <IconBolt size={iconSize} /> : <IconArchive size={iconSize} />}
      {showText && (
        <Text
          size="sm"
          style={{
            opacity: value === segment ? 1 : 0.45,
            transition: 'opacity 200ms ease'
          }}
        >
          {text}
        </Text>
      )}
    </Group>
  );

  return (
    <SegmentedControl
      transitionDuration={220}
      transitionTimingFunction="ease"
      value={value}
      onChange={(next) => onChange(next as SegmentValue)}
      data={[
        { label: segmentLabel('active', 'Active'), value: 'active' },
        { label: segmentLabel('archived', 'Archived'), value: 'archived' }
      ]}
      size="xs"
      mr="auto"
      ml="lg"
    />
  );
}
