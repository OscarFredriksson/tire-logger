import { Alert, Button, Center, ScrollAreaAutosize, Stack, Title } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { FC, PropsWithChildren } from 'react';
import { FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const FallbackComponent: FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <ScrollAreaAutosize h="100vh">
      <Center>
        <Stack w="80%" mt={50}>
          <Title ta="center">Something unexpected went wrong</Title>
          <Alert
            icon={<IconInfoCircle />}
            color="red"
            title={
              error instanceof Error
                ? error.message
                : typeof error === 'string'
                  ? error
                  : 'Unknown error'
            }
          >
            {error instanceof Error && error.stack}
          </Alert>
          <Button onClick={resetErrorBoundary}>Reload app</Button>
        </Stack>
      </Center>
    </ScrollAreaAutosize>
  );
};

export const ErrorBoundary: FC<PropsWithChildren> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onReset={() => window.location.reload()}
    >
      {children}
    </ReactErrorBoundary>
  );
};
