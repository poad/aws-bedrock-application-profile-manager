import { BedrockClient } from '@aws-sdk/client-bedrock';
import { credentials } from '../utils';

export const createBedrockClient = (region: string) => {
  return new BedrockClient({
    region,
    credentials,
  });
};
