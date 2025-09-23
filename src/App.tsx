import './App.css';
import { createSignal, Show } from 'solid-js';
import { createRegionsResource } from './features/regions/resources';
import { createInferenceProfilesResource } from './features/inference-profiles/resources';
import { env } from './utils';
import { Loading } from './features/ui/loading';

const region: string = env.AWS_REGION ?? 'us-east-1';

function App() {
  const [selectedRegion, setSelectedRegion] = createSignal<string>(region);

  const [regionsResource] = createRegionsResource(selectedRegion());

  const [resource] = createInferenceProfilesResource(selectedRegion);

  return (
    <>
      <h1>AWS Bedrock Application Profile Manager</h1>
      <Show when={regionsResource.error as unknown as Error}>
        <p style={{ color: 'red' }}>{(regionsResource.error as unknown as Error).message}</p>
      </Show>
      <Show when={!regionsResource.error}>
        <Show when={regionsResource.loading}>
          <Loading />
        </Show>
        <Show when={!regionsResource.loading}>
          <select on:change={(e: Event & {
            currentTarget: HTMLSelectElement;
            target: HTMLSelectElement;
          }) => {
            setSelectedRegion(e.currentTarget.value);
          }}>
            {regionsResource()?.map((item) => (
              <option selected={selectedRegion() === item} value={item}>{item}</option>
            ))}
          </select>

          <Show when={resource.error as unknown as Error}>
            <p style={{ color: 'red' }}>{(resource.error as unknown as Error).message}</p>
          </Show>
          <Show when={!resource.error}>
            <Show when={resource.loading}>
              <Loading />
            </Show>
            <Show when={!resource.loading}>
              <table>
                <tbody>
                  <tr>
                    <th>Inference Profile Name</th>
                    <th>Inference Profile ARN</th>
                    <th>Models</th>
                  </tr>
                  {resource()?.map((item) => (
                    <tr>
                      <td>{item.inferenceProfileName}</td>
                      <td>{item.inferenceProfileArn}</td>
                      <td>
                        <ul>
                          {item.models?.map((model) => (<li>{model.modelArn}</li>))}
                        </ul>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Show>
          </Show>
        </Show>
      </Show>
    </>
  );
}

export default App;
