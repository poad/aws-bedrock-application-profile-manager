import {
  BedrockClient,
  CreateInferenceProfileCommand,
  DeleteInferenceProfileCommand,
  type InferenceProfileSummary,
  ListInferenceProfilesCommand,
} from '@aws-sdk/client-bedrock';
import { createResource, type Accessor } from 'solid-js';
import { createBedrockClient } from '../bedrock/client';
import type { FormFields } from './component';

export const createApplicationInferenceProfilesResource = (selectedRegion: Accessor<string>) => {
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
    const client = createBedrockClient(selectedRegion());
    return await listInferenceProfiles({ client, inferenceProfileSummaries: [] });
  });
};

export const createSystemDefinedInferenceProfilesResource = (selectedRegion: string) => {
  const listInferenceProfiles = async (props: {
    client: BedrockClient,
    inferenceProfileSummaries: InferenceProfileSummary[],
    nextToken?: string
  }): Promise<InferenceProfileSummary[]> => {
    const response = await props.client.send(new ListInferenceProfilesCommand({
      typeEquals: 'SYSTEM_DEFINED',
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
    if (!selectedRegion) {
      return [];
    }
    const client = createBedrockClient(selectedRegion);
    return await listInferenceProfiles({ client, inferenceProfileSummaries: [] });
  });
};

export const createNewInferenceProfileResource = (
  region: string,
  data: Accessor<FormFields | undefined>,
) => {
  return createResource(data, async () => {
    const formData = data();
    if (!formData) {
      return [];
    }
    if (!region) {
      return [];
    }
    const client = createBedrockClient(region);
    return await client.send(new CreateInferenceProfileCommand({
      ...formData,
      modelSource: { copyFrom: formData.copyFrom },
    }));
  });
};

export const createDeleteInferenceProfileResource = (region: string, target:  Accessor<string | undefined>) => {
  return createResource(target, async () => {
    const inferenceProfileIdentifier = target();
    if (!inferenceProfileIdentifier) {
      return [];
    }
    const client = createBedrockClient(region);
    return await client.send(new DeleteInferenceProfileCommand({
      inferenceProfileIdentifier,
    }));
  });
};
