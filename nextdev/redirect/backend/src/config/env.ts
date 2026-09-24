import { z } from 'zod';

const envSchema = z.object({
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET wajib diisi'),
  DB_HOST: z.string().min(1, 'DB_HOST wajib diisi'),
  DB_USER: z.string().min(1, 'DB_USER wajib diisi'),
  DB_NAME: z.string().min(1, 'DB_NAME wajib diisi'),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

export function validateEnv(): ValidatedEnv {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const messages = result.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
    console.error('Konfigurasi environment tidak valid:\n' + messages.join('\n'));
    process.exit(1);
  }

  return result.data;
}
