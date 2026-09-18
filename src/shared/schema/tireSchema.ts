import { z } from 'zod';

export const tireSchema = z
  .object({
    name: z.string({ message: 'Name is required' }).min(1, { message: 'Name is required' }),
    allowedLf: z.coerce.boolean().default(false),
    allowedRf: z.coerce.boolean().default(false),
    allowedLr: z.coerce.boolean().default(false),
    allowedRr: z.coerce.boolean().default(false)
  })
  .refine((data) => data.allowedLf || data.allowedRf || data.allowedLr || data.allowedRr, {
    message: 'At least one tire position must be selected',
    path: ['allowedLf']
  });
