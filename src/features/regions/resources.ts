import { AccountClient, ListRegionsCommand, type Region } from '@aws-sdk/client-account';
import { createResource } from 'solid-js';
import { credentials } from '../utils.js';

/**
 * AWSアカウントの有効リージョン一覧を取得するリソースを生成します。
 * @param {string} defaultRegion - デフォルトリージョン名
 * @returns {ReturnType<typeof createResource>} Solid.jsのリソース（string[]）
 * @remarks
 * 利用例：UIでリージョン選択肢を表示する際に利用します。
 * 注意：APIレスポンスが空の場合は空配列を返します。AWS権限不足やリージョン指定ミスに注意。
 * 副作用：AWS Account APIへのリクエストが発生します。
 */
export const createRegionsResource = (defaultRegion: string) => {
  const listRegion = async (props: { client: AccountClient, regions: string[], nextToken?: string }) => {
    const resp = await props.client.send(new ListRegionsCommand({ NextToken: props.nextToken }));

    const isValidRegion = (r: Region) =>
      r.RegionName !== '' &&
      r.RegionOptStatus !== 'DISABLED' &&
      r.RegionOptStatus !== 'DISABLING';

    const regions = props.regions
      .concat((resp.Regions ?? [])
        .filter(isValidRegion)
        .map(r => r.RegionName ?? ''));
    if (resp.NextToken) {
      return await listRegion({ client: props.client, regions, nextToken: resp.NextToken });
    }
    return regions;
  };

  const client = new AccountClient({
    region: defaultRegion,
    credentials,
  });
  return createResource(async () => await listRegion({ client, regions: [] }));
};
