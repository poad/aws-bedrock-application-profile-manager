export const env = import.meta.env as Record<string, string | undefined>;
const validateCredentials = () => {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS認証情報が設定されていません。AWS_ACCESS_KEY_IDとAWS_SECRET_ACCESS_KEYを設定してください。');
  }
};

export const credentials = (() => {
  validateCredentials();
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: env.AWS_SESSION_TOKEN,
  };
})();
