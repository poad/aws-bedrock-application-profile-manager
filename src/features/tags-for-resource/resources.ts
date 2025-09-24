import { BedrockClient, ListTagsForResourceCommand } from '@aws-sdk/client-bedrock';
import { createResource, type Accessor } from 'solid-js';
import { env } from '../../utils';

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
    const client = new BedrockClient({
      region: target.region,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
        sessionToken: env.AWS_SESSION_TOKEN ?? '',
      },
    });
    return await listTagsForResource({ client, arn: target.arn });
  });

};
