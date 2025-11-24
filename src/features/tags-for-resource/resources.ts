import { BedrockClient, ListTagsForResourceCommand } from '@aws-sdk/client-bedrock';
import { createResource, type Accessor } from 'solid-js';
import { createBedrockClient } from '../bedrock/client.js';

/**
 * Bedrockリソース（ARN指定）のタグ一覧を取得するリソースを生成します。
 * @param {Accessor<{region?: string, arn?: string}>} selected - リージョン・ARN情報のアクセサ
 * @returns {ReturnType<typeof createResource>} Solid.jsのリソース（{key?: string, value?: string}[]）
 * @remarks
 * 利用例：リソース詳細画面でタグ一覧を表示する際に利用します。
 * 注意：ARNやリージョンが未指定の場合は空配列を返します。APIエラー時は例外が発生します。
 * 副作用：AWS Bedrock APIへのリクエストが発生します。
 */
export const createTagsForResourceResource = (selected: Accessor<{
  region?: string,
  arn?: string,
}>) => {
  const listTagsForResource = async (props: {
    client: BedrockClient,
    arn: string,
  }): Promise<{key?: string, value?: string}[]> => {
    const response = await props.client.send(new ListTagsForResourceCommand({
      resourceARN: props.arn,
    }));
    return response.tags ?? [];
  };

  return createResource(selected, async () => {
    const target = selected();
    if (!target.arn || !target.region) {
      return [];
    }
    const client = createBedrockClient(target.region);
    return await listTagsForResource({ client, arn: target.arn });
  });

};
