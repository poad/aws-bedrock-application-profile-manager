import { BedrockClient } from '@aws-sdk/client-bedrock';
import { credentials } from '../utils';

/**
 * 指定したリージョンでBedrockClientインスタンスを生成します。
 * @param {string} region - AWSリージョン名（例: 'ap-northeast-1'）
 * @returns {BedrockClient} BedrockClientインスタンス
 * @remarks
 * AWS認証情報はutils.tsのcredentialsを利用します。
 * 利用例：APIリクエスト前にBedrockClientを生成してください。
 * 注意：リージョンが正しくない場合、APIリクエストは失敗します。
 */
export const createBedrockClient = (region: string) => {
  return new BedrockClient({
    region,
    credentials,
  });
};
