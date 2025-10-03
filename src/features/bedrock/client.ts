import { BedrockClient } from '@aws-sdk/client-bedrock';
import { credentials } from '../utils';

/**
 * 指定したリージョンでBedrockClientインスタンスを生成します。
 * @param {string} region - AWSリージョン名（例: 'ap-northeast-1'）
 * @returns {BedrockClient} BedrockClientインスタンス
 */
export const createBedrockClient = (region: string) => {
  return new BedrockClient({
    region,
    credentials,
  });
};
