import { z } from 'zod';

// Define minimal required fields for import
const importStintSchema = z
  .object({
    id: z.string(),
    date: z.string(), // Make date optional for import
    archived: z.coerce.boolean().optional()
    // Add other minimal required fields
  })
  .passthrough(); // Allow additional fields

const importTireSchema = z
  .object({
    id: z.string(),
    archived: z.coerce.boolean().optional()
    // Other minimal fields
  })
  .passthrough();

const importCarSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    archived: z.coerce.boolean().optional()
    // Other minimal fields
  })
  .passthrough();

const importTrackSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    archived: z.coerce.boolean().optional()
    // Other minimal fields
  })
  .passthrough();

export const importSchema = z.object({
  exportDate: z.string().datetime().optional(),
  version: z.string().optional(),
  appName: z.literal('tire-logger').optional(),
  data: z.object({
    tracks: z.array(importTrackSchema.partial()),
    cars: z.array(importCarSchema.partial()),
    tires: z.array(importTireSchema.partial()),
    stints: z.array(importStintSchema.partial())
  })
});
