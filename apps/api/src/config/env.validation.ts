export function validateEnv(config: Record<string, unknown>) {
  if (!config.DATABASE_URL) throw new Error('Missing required environment variable: DATABASE_URL');
  const secret = config.JWT_SECRET;
  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error('JWT_SECRET must be set to a random string of at least 32 characters (see apps/api/.env.example).');
  }
  return config;
}
