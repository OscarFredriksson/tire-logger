import { z } from 'zod';

export const carSchema = z.object({
  name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' })
});
