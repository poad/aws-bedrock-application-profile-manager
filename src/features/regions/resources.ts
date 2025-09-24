import { AccountClient, ListRegionsCommand, RegionOptStatus, type Region } from '@aws-sdk/client-account';
import { createResource } from 'solid-js';
import { env } from '../../utils';

export const createRegionsResource = (defaultRegion: string) => {
  const listRegion = async (props: { client: AccountClient, regions: string[], nextToken?: string }) => {
    const resp = await props.client.send(new ListRegionsCommand({ NextToken: props.nextToken }));

    const isValidRegion = (r: Region) =>
      r.RegionName !== '' &&
      r.RegionOptStatus !== RegionOptStatus.DISABLED &&
      r.RegionOptStatus !== RegionOptStatus.DISABLING;

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
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
      sessionToken: env.AWS_SESSION_TOKEN ?? '',
    },
  });
  return createResource(async () => await listRegion({ client, regions: [] }));
};
