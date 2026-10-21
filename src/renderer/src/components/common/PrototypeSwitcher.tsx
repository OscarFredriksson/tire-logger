import { ActionIcon, Group, Paper, Text } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

const prototypeVariants = [
  { key: 'A', name: 'Garage cards' },
  { key: 'B', name: 'Pit wall roster' },
  { key: 'C', name: 'Race ledger' }
];

export function PrototypeSwitcher() {
  const [params, setParams] = useSearchParams();
  const index = Math.max(
    0,
    prototypeVariants.findIndex(({ key }) => key === params.get('variant'))
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        (event.target instanceof Element &&
          event.target.closest('input, textarea, select, [contenteditable], [role="menu"]'))
      )
        return;
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      const step = event.key === 'ArrowRight' ? 1 : -1;
      const next = new URLSearchParams(params);
      next.set(
        'variant',
        prototypeVariants[(index + step + prototypeVariants.length) % prototypeVariants.length].key
      );
      setParams(next, { replace: true });
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [index, params, setParams]);

  if (!import.meta.env.DEV) return null;

  const cycle = (step: number) => {
    const next = new URLSearchParams(params);
    next.set(
      'variant',
      prototypeVariants[(index + step + prototypeVariants.length) % prototypeVariants.length].key
    );
    setParams(next, { replace: true });
  };

  return (
    <Paper
      component="aside"
      aria-label="Prototype variant switcher"
      shadow="xl"
      radius="xl"
      p="xs"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 200,
        background: '#f1f3f5',
        color: '#16191d',
        border: '2px solid #fff'
      }}
    >
      <Group gap="sm" wrap="nowrap">
        <ActionIcon
          variant="subtle"
          color="dark"
          aria-label="Previous variant"
          onClick={() => cycle(-1)}
        >
          <IconArrowLeft size={18} />
        </ActionIcon>
        <Text size="sm" fw={700} style={{ whiteSpace: 'nowrap' }} aria-live="polite">
          {prototypeVariants[index].key} · {prototypeVariants[index].name}
        </Text>
        <ActionIcon
          variant="subtle"
          color="dark"
          aria-label="Next variant"
          onClick={() => cycle(1)}
        >
          <IconArrowRight size={18} />
        </ActionIcon>
      </Group>
    </Paper>
  );
}
