import './App.css';
import { batch, createSignal, Show } from 'solid-js';
import { createRegionsResource } from './features/regions/resources';
import { createInferenceProfilesResource } from './features/inference-profiles/resources';
import { env } from './utils';
import { Loading } from './features/ui/loading';
import { createTagsForResourceResource } from './features/tags-for-resource/resources';
import { Modal } from './features/ui/modal';
import { SiGithub } from 'solid-icons/si';

const region: string = env.AWS_REGION ?? 'us-east-1';

function App() {
  const [selectedRegion, setSelectedRegion] = createSignal<string>(region);
  const [selectedTarget, setSelectedTarget] = createSignal<{
    region?: string,
    arn?: string,
    open: boolean,
  }>({ open: false });

  const [regionsResource] = createRegionsResource(selectedRegion());

  const [inferenceProfilesResource] = createInferenceProfilesResource(selectedRegion);

  const [tagsResource] = createTagsForResourceResource(selectedTarget);

  const closeModal = () => setSelectedTarget((prev) => ({...prev, open: false}));

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

          <Show when={inferenceProfilesResource.error as unknown as Error}>
            <p style={{ color: 'red' }}>{(inferenceProfilesResource.error as unknown as Error).message}</p>
          </Show>
          <Show when={!inferenceProfilesResource.error}>
            <Show when={inferenceProfilesResource.loading}>
              <Loading />
            </Show>
            <Show when={!inferenceProfilesResource.loading}>
              <table>
                <tbody>
                  <tr>
                    <th>Inference Profile Name</th>
                    <th>Inference Profile ARN</th>
                    <th>Models</th>
                    <th>Tags</th>
                  </tr>
                  {inferenceProfilesResource()?.map((item) => (
                    <tr>
                      <td>{item.inferenceProfileName}</td>
                      <td>{item.inferenceProfileArn}</td>
                      <td>
                        <ul>
                          {item.models?.map((model) => (<li>{model.modelArn}</li>))}
                        </ul>
                      </td>
                      <td>
                        <button
                          type="button"
                          disabled={
                            // モーダルが開いているときは全てのボタンを無効化
                            selectedTarget().open
                          }
                          aria-label="View Tags"
                          on:click={() => {
                            batch(() => {
                              setSelectedTarget({
                                region: selectedRegion(),
                                arn: item.inferenceProfileArn ?? '',
                                open: true,
                              });
                            });
                          }}>tags</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <Modal isOpen={selectedTarget().open} onClose={closeModal}>
                <Show when={tagsResource.error as unknown as Error}>
                  <p style={{ color: 'red' }}>{(tagsResource.error as unknown as Error).message}</p>
                </Show>
                <Show when={!tagsResource.error}>
                  <Show when={tagsResource.loading}>
                    <Loading />
                  </Show>
                  <Show when={!tagsResource.loading}>
                    <div>
                      <h4>Tags for {selectedTarget().arn}</h4>
                    </div>
                    <Show when={tagsResource()?.length === 0}>
                      <p>タグは設定されていません。</p>
                    </Show>
                    <Show when={tagsResource()?.length !== 0}>
                      <p
                        style={{
                          color: 'var(--modal-text, #666)',
                          'margin-bottom': '24px',
                          'line-height': '1.5',
                        }}
                      >
                        リソースに付与されているタグの一覧です。
                      </p>
                      <table style={{ 'margin-bottom': '24px', width: '100%' }}>
                        <thead>
                          <tr>
                            <th
                              style={{
                                'text-align': 'left',
                                'border-bottom': '1px solid #ddd',
                                padding: '8px',
                              }}
                            >
                              Key
                            </th>
                            <th
                              style={{
                                'text-align': 'left',
                                'border-bottom': '1px solid #ddd',
                                padding: '8px',
                              }}
                            >
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {tagsResource()?.map((tag) => (
                            <tr>
                              <td
                                style={{ padding: '8px', 'border-bottom': '1px solid #ddd' }}
                              >
                                {tag.key}
                              </td>
                              <td
                                style={{ padding: '8px', 'border-bottom': '1px solid #ddd' }}
                              >
                                {tag.value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Show>
                    <p
                      style={{
                        color: 'var(--modal-text, #666)',
                        'margin-bottom': '24px',
                        'line-height': '1.5',
                      }}
                    >
                      タグの編集は、AWS CLI から行ってください。
                    </p>
                  </Show>
                </Show>
              </Modal>
            </Show>
          </Show>
        </Show>
      </Show>
      <p>
        <a
          href="https://github.com/poad/aws-bedrock-application-profile-manager"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
        >
          <SiGithub class='github-icon' size={24} />
        </a>
      </p>
    </>
  );
}

export default App;
