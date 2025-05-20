import { z } from 'zod';

export const trackSchema = z.object({
  name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' }),
  length: z
    .number({ message: 'Length is required' })
    .positive({ message: 'Length must be a positive number' })
});
