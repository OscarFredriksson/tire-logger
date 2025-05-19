import {
  UseMutationOptions,
  UseMutationResult,
  useMutation as useTanStackMutation
} from '@tanstack/react-query';
import { DefaultError } from '@tanstack/query-core';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { queryClient } from '@renderer/main';

interface UseMutationProps<TData, TError, TVariables, TContext>
  extends UseMutationOptions<TData, TError, TVariables, TContext> {
  operationType: 'create' | 'update' | 'delete';
  entityName: string;
  queryKey?: (string | undefined)[];
}

const capitalizeFirstLetter = (val: string) => {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
};

export const useMutation = <
  TData = unknown,
  TError = DefaultError,
  TVariables = void,
  TContext = unknown
>({
  onSuccess,
  onError,
  operationType,
  entityName,
  queryKey,
  ...props
}: UseMutationProps<TData, TError, TVariables, TContext>): UseMutationResult<
  TData,
  TError,
  TVariables,
  TContext
> => {
  return useTanStackMutation({
    ...props,
    onSuccess: (data, variables, context) => {
      modals.closeAll();
      notifications.show({
        color: 'teal',
        message: `${capitalizeFirstLetter(operationType)}d ${entityName}`,
        icon: <IconCheck size={18} />,
        loading: false,
        autoClose: 2000,
        withCloseButton: false
      });
      queryClient.invalidateQueries({ queryKey });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      console.log('onError called with:', error);
      notifications.show({
        color: 'red',
        title: `Error ${operationType?.slice(0, -1)}ing ${entityName}`,
        message: error instanceof Error ? error?.message : 'An unexpected error occurred',
        icon: <IconX size={18} />,
        position: 'bottom-center',
        loading: false,
        autoClose: 2000
      });
      if (onError) onError(error, variables, context);
    }
  });
};
