/**
 * Viteの環境変数を取得します。
 * @remarks
 * AWS認証情報（AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_SESSION_TOKENなど）を含みます。
 *
 * 利用例：
 *   env.AWS_ACCESS_KEY_ID でアクセスキーIDを取得できます。
 * 注意：Viteのimport.meta.envはビルド時に静的展開されるため、動的な値は利用できません。
 */
export const env = import.meta.env as Record<string, string | undefined>;
/**
 * AWS認証情報が設定されているか検証します。
 * @throws {Error} 認証情報が不足している場合に例外を投げます。
 * @remarks
 * この関数は副作用として、認証情報が不足している場合に処理を中断します。
 * 利用例：APIクライアント生成前に呼び出してください。
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
 * AWS SDKのクライアント生成時に利用します。
 *
 * 利用例：
 *   new BedrockClient({ region, credentials })
 *
 * @property {string} accessKeyId - AWSアクセスキーID
 * @property {string} secretAccessKey - AWSシークレットアクセスキー
 * @property {string | undefined} sessionToken - AWSセッショントークン（オプション）
 */
export const credentials = (() => {
  validateCredentials();
  return {
    accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
    sessionToken: env.AWS_SESSION_TOKEN,
  };
})();
