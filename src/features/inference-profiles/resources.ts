import { BedrockClient, type InferenceProfileSummary, ListInferenceProfilesCommand } from '@aws-sdk/client-bedrock';
import { createResource, type Accessor } from 'solid-js';
import { env } from '../../utils';

export const createInferenceProfilesResource = (selectedRegion: Accessor<string>) => {
  const listInferenceProfiles = async (props: {
    client: BedrockClient,
    inferenceProfileSummaries: InferenceProfileSummary[],
    nextToken?: string
  }): Promise<InferenceProfileSummary[]> => {
    const response = await props.client.send(new ListInferenceProfilesCommand({
      typeEquals: 'APPLICATION',
      nextToken: props.nextToken,
    }));
    const inferenceProfileSummaries = props.inferenceProfileSummaries.concat(response.inferenceProfileSummaries ?? []);
    if (response.nextToken) {
      return await listInferenceProfiles({
        client: props.client,
        inferenceProfileSummaries: inferenceProfileSummaries,
        nextToken: response.nextToken,
      });
    }
    return inferenceProfileSummaries;
  };

  return createResource(selectedRegion, async () => {
    if (!selectedRegion()) {
      return [];
    }
    const client = new BedrockClient({
      region: selectedRegion(),
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY ?? '',
        sessionToken: env.AWS_SESSION_TOKEN ?? '',
      },
    });
    return await listInferenceProfiles({ client, inferenceProfileSummaries: [] });
  });

};
