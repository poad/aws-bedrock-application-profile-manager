import {
  BedrockClient,
  type FoundationModelSummary,
  ListFoundationModelsCommand,
} from '@aws-sdk/client-bedrock';
import { createResource } from 'solid-js';
import { createBedrockClient } from '../bedrock/client';

/**
 * 指定したリージョンのBedrock Foundation Models一覧を取得するリソースを生成します。
 * @param {string} selectedRegion - AWSリージョン名
 * @returns {ReturnType<typeof createResource>} Solid.jsのリソース（FoundationModelSummary[]）
 */
export const createFoundationModelsResource = (selectedRegion: string) => {
  /**
   * BedrockClientを使ってFoundation Models一覧を取得します。
   * @param {object} props - クライアント情報
   * @param {BedrockClient} props.client - Bedrockクライアント
   * @returns {Promise<FoundationModelSummary[]>} Foundation Modelsのサマリー配列
   */
  const listFoundationModels = async (props: {
    client: BedrockClient,
  }): Promise<FoundationModelSummary[]> => {
    const response = await props.client.send(new ListFoundationModelsCommand({
      byInferenceType: 'ON_DEMAND',
    }));
    return response.modelSummaries ?? [];
  };

  return createResource(selectedRegion, async () => {
    if (!selectedRegion) {
      return [];
    }
    const client = createBedrockClient(selectedRegion);
    return await listFoundationModels({ client });
  });
};
