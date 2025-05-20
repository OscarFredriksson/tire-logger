import { z } from 'zod';

export const stintSchema = z.object({
  trackId: z.string({ message: 'trackId is required' }).min(1, { message: 'trackId is required' }),
  carId: z.string({ message: 'carId is required' }).min(1, { message: 'carId is required' }),
  date: z.date({ message: 'Date is required' }),
  laps: z
    .number({ message: 'Laps is required' })
    .positive({ message: 'Laps must be a positive number' }),
  leftFront: z
    .string({ message: 'Left Front tire is required' })
    .min(1, { message: 'Left Front tire is required' }),
  rightFront: z
    .string({ message: 'Right Front tire is required' })
    .min(1, { message: 'Right Front tire is required' }),
  leftRear: z
    .string({ message: 'Left Rear tire is required' })
    .min(1, { message: 'Left Rear tire is required' }),
  rightRear: z
    .string({ message: 'Right Rear tire is required' })
    .min(1, { message: 'Right Rear tire is required' }),
  note: z.string().optional()
});
