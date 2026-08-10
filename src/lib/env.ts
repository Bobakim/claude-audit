import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_ENFORCE_PUBLISH_GATE: z
    .string()
    .optional()
    .transform(value => value === 'true'),
})

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_ENFORCE_PUBLISH_GATE:
    process.env.NEXT_PUBLIC_ENFORCE_PUBLISH_GATE,
})

export type Env = z.infer<typeof envSchema>
