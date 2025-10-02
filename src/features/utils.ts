export const env = import.meta.env as Record<string, string | undefined>;
export const credentials = {
  accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
  sessionToken: env.AWS_SESSION_TOKEN ?? '',
};
