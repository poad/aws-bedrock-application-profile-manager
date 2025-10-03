/**
 * Viteの環境変数を取得します。
 * @remarks
 * AWS認証情報（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKENなど）を含みます。
 */
export const env = import.meta.env as Record<string, string | undefined>;
/**
 * AWS認証情報が設定されているか検証します。
 * @throws {Error} 認証情報が不足している場合に例外を投げます。
 */
const validateCredentials = () => {
  if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS認証情報が設定されていません。AWS_ACCESS_KEY_IDとAWS_SECRET_ACCESS_KEYを設定してください。');
  }
};

/**
 * AWS認証情報オブジェクトを返します。
 * @remarks
 * 認証情報が不足している場合は例外を投げます。
 * @property {string} accessKeyId - AWSアクセスキーID
 * @property {string} secretAccessKey - AWSシークレットアクセスキー
 * @property {string | undefined} sessionToken - AWSセッショントークン（オプション）
 */
export const credentials = (() => {
  validateCredentials();
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
    sessionToken: env.AWS_SESSION_TOKEN,
  };
})();
