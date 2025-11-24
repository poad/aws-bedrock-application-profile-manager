import {
  BedrockClient,
  type FoundationModelSummary,
  ListFoundationModelsCommand,
} from '@aws-sdk/client-bedrock';
import { createResource } from 'solid-js';
import { createBedrockClient } from '../bedrock/client.js';

/**
 * 指定したリージョンのBedrock Foundation Models一覧を取得するリソースを生成します。
 * @param {string} selectedRegion - AWSリージョン名
 * @returns {ReturnType<typeof createResource>} Solid.jsのリソース（FoundationModelSummary[]）
 * @remarks
 * 利用例：UIでリージョンを選択した際にモデル一覧を取得する用途で利用します。
 * 注意：APIレスポンスが空の場合は空配列を返します。AWSの権限設定やリージョン指定ミスに注意してください。
 * 副作用：AWS Bedrock APIへのリクエストが発生します。
 */
export const createFoundationModelsResource = (selectedRegion: string) => {
  /**
   * BedrockClientを使ってFoundation Models一覧を取得します。
   * @param {object} props - クライアント情報
   * @param {BedrockClient} props.client - Bedrockクライアント
   * @returns {Promise<FoundationModelSummary[]>} Foundation Modelsのサマリー配列
   * @remarks
   * API制限：byInferenceType='ON_DEMAND'のみ取得します。
   * 返り値：モデルが存在しない場合は空配列を返します。
   * エラー時：APIリクエスト失敗時は例外が発生します。
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
