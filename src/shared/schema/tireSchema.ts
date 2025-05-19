import { z } from 'zod';

export const tireSchema = z
  .object({
    name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' }),
    allowedLf: z.coerce.boolean(),
    allowedRf: z.coerce.boolean(),
    allowedLr: z.coerce.boolean(),
    allowedRr: z.coerce.boolean()
  })
  .refine((data) => data.allowedLf || data.allowedRf || data.allowedLr || data.allowedRr, {
    message: 'At least one tire position must be selected',
    path: ['allowedLf']
  });
