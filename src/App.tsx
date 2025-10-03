import './App.css';
import { batch, createEffect, createSignal, Index, Show } from 'solid-js';
import { createRegionsResource } from './features/regions/resources';
import { createApplicationInferenceProfilesResource, createDeleteInferenceProfileResource, createNewInferenceProfileResource } from './features/inference-profiles/resources';
import { env } from './features/utils';
import { Loading } from './features/ui/loading';
import { createTagsForResourceResource } from './features/tags-for-resource/resources';
import { Modal } from './features/ui/modal';
import { SiGithub } from 'solid-icons/si';
import NewInferenceProfileForm, { type FormFields } from './features/inference-profiles/component';
import { FaSolidTrash } from 'solid-icons/fa';
import { ConfirmDelete } from './features/ui/confirm-delete';

const region: string = env.AWS_REGION ?? 'us-east-1';

function App() {
  const [selectedRegion, setSelectedRegion] = createSignal<string>(region);
  const [selectedTarget, setSelectedTarget] = createSignal<{
    region?: string,
    arn?: string,
    open: boolean,
  }>({ open: false });

  const [regionsResource] = createRegionsResource(selectedRegion());

  const [inferenceProfilesResource, { refetch }] = createApplicationInferenceProfilesResource(selectedRegion);

  const [tagsResource] = createTagsForResourceResource(selectedTarget);

  const closeModal = () => setSelectedTarget((prev) => ({ ...prev, open: false }));
  const [isOpenCreateModal, setIsOpenCreateModal] = createSignal<boolean>(false);
  const [formData, setFormData] = createSignal<FormFields>();
  const [createInferenceProfileResult] = createNewInferenceProfileResource(selectedRegion(), formData);

  const [deleteInferenceProfileIdentifier, setDeleteInferenceProfileIdentifier] = createSignal<{
    arn?: string,
    name?: string
  }>();
  const [deleteConfiemedInferenceProfileIdentifier, setDeleteConfiemedInferenceProfileIdentifier] = createSignal<string>();
  const [deleteInferenceProfileResult] = createDeleteInferenceProfileResource(
    selectedRegion(), deleteConfiemedInferenceProfileIdentifier);
  const [error, setError] = createSignal<Error>();

  createEffect(() => {
    if (!createInferenceProfileResult.loading) {
      // Profileの作成が完了(エラーも含む)したら
      if (createInferenceProfileResult.error) {
        setError(createInferenceProfileResult.error as unknown as Error);
      } else {
        refetch();
        setIsOpenCreateModal(false);
      }
    }

    if (!deleteInferenceProfileResult.loading) {
      // Profileの削除が完了したら(エラーも含む)
      if (deleteInferenceProfileResult.error) {
        setError(createInferenceProfileResult.error as unknown as Error);
      } else {
        refetch();
        setIsOpenCreateModal(false);
      }
    }
  });

  return (
    <>
      <h1>AWS Bedrock Application Profile Manager</h1>
      <Show
        when={!regionsResource.error}
        fallback={
          <p style={{ color: 'red' }}>{(regionsResource.error as unknown as Error).message}</p>
        }>
        <Show when={!regionsResource.loading} fallback={<Loading />}>
          <div style={{
            display: 'flex',
            'align-items': 'center',
            'justify-content': 'space-between',
          }}>
            <select
              style={{
                'margin-left': 'auto',
                'margin-right': 'auto',
              }}
              on:change={(e: Event & {
                currentTarget: HTMLSelectElement;
                target: HTMLSelectElement;
              }) => {
                setSelectedRegion(e.currentTarget.value);
              }}
            >
              <Index each={regionsResource()}>
                {(item) => (
                  <option selected={selectedRegion() === item()} value={item()}>{item()}</option>
                )}
              </Index>
            </select>
            <button style={{
              'margin-right': 0,
            }} on:click={() => setIsOpenCreateModal(true)}>New</button>
          </div>

          <Modal isOpen={isOpenCreateModal()} on:close={() => setIsOpenCreateModal(false)}>
            <NewInferenceProfileForm
              region={selectedRegion()}
              on:submit={(data: FormFields) => {
                setFormData(data);
              }}
              on:cancel={() => {
                setIsOpenCreateModal(false);
              }} />
          </Modal>

          <Show
            when={!inferenceProfilesResource.error}
            fallback={
              <p style={{ color: 'red' }}>{(inferenceProfilesResource.error as unknown as Error).message}</p>
            }>
            <Show when={!inferenceProfilesResource.loading} fallback={<Loading />}>
              <table class="profiles-table">
                <tbody>
                  <tr>
                    <th>Inference Profile Name</th>
                    <th>Inference Profile ARN</th>
                    <th>Models</th>
                    <th>Tags</th>
                    <th />
                  </tr>
                  <Index each={inferenceProfilesResource()}>
                    {(item) => (
                      <tr>
                        <td>{item().inferenceProfileName}</td>
                        <td>{item().inferenceProfileArn}</td>
                        <td>
                          <ul>
                            {item().models?.map((model) => (<li>{model.modelArn}</li>))}
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
                                  arn: item().inferenceProfileArn ?? '',
                                  open: true,
                                });
                              });
                            }}>tags</button>
                        </td>
                        <td>
                          <button
                            class="icon cancel"
                            disabled={
                              // モーダルが開いているときは全てのボタンを無効化
                              selectedTarget().open
                            }
                            aria-label="Delete profile"

                            on:click={() => setDeleteInferenceProfileIdentifier(
                              {arn: item().inferenceProfileArn, name: item().inferenceProfileName})}
                          >
                            <FaSolidTrash />
                          </button>
                        </td>
                      </tr>
                    )}
                  </Index>
                </tbody>
              </table>
              <Modal isOpen={selectedTarget().open} on:close={closeModal}>
                <div class="w-[400px]">
                  <Show
                    when={!tagsResource.error}
                    fallback={
                      <p style={{ color: 'red' }}>{(tagsResource.error as unknown as Error).message}</p>
                    }>
                    <Show when={!tagsResource.loading} fallback={<Loading />}>
                      <div>
                        <h4>Tags for {selectedTarget().arn}</h4>
                      </div>
                      <Show when={tagsResource()?.length !== 0} fallback={<p>タグは設定されていません。</p>}>
                        <p
                          style={{
                            color: 'var(--modal-text, #666)',
                            'margin-bottom': '24px',
                            'line-height': '1.5',
                          }}
                        >
                          リソースに付与されているタグの一覧です。
                        </p>
                        <table style={{ 'margin-bottom': '24px', width: '100%' }} class="tag-table">
                          <thead>
                            <tr>
                              <th>
                                Key
                              </th>
                              <th>
                                Value
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <Index each={tagsResource()}>
                              {(tag) => (
                                <tr>
                                  <td
                                    style={{ padding: '8px', 'border-bottom': '1px solid #ddd' }}
                                  >
                                    {tag().key}
                                  </td>
                                  <td
                                    style={{ padding: '8px', 'border-bottom': '1px solid #ddd' }}
                                  >
                                    {tag().value}
                                  </td>
                                </tr>
                              )}
                            </Index>
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
                </div>
              </Modal>
            </Show>
          </Show>
        </Show>
      </Show>
      <Modal
        isOpen={deleteInferenceProfileIdentifier() !== undefined && deleteInferenceProfileIdentifier()?.arn !== ''}
        on:close={() => setDeleteInferenceProfileIdentifier(undefined)}
      >
        <ConfirmDelete
          arn={deleteInferenceProfileIdentifier()?.arn ?? ''}
          name={deleteInferenceProfileIdentifier()?.name ?? ''}
          on:delete={() => {
            setDeleteConfiemedInferenceProfileIdentifier(deleteInferenceProfileIdentifier()?.arn ?? '');
            setDeleteInferenceProfileIdentifier(undefined);
          }}
          on:cancel={() => setDeleteInferenceProfileIdentifier(undefined)}
        />
      </Modal>
      <Modal isOpen={error() !== undefined} on:close={() => setError(undefined)}>
        <div class="w-[400px]">
          <p style={{ color: 'red' }}>{(error() as unknown as Error).message}</p>
        </div>
      </Modal>
      <div style={{
        'padding-top': '1rem',
      }}>
        <a
          href="https://github.com/poad/aws-bedrock-application-profile-manager"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
        >
          <SiGithub class='github-icon' size={24} />
        </a>
      </div>
    </>
  );
}

export default App;
