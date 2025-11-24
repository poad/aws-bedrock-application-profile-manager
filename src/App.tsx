import './App.css';
import { batch, createEffect, createSignal, Index, Show } from 'solid-js';
import { SiGithub } from 'solid-icons/si';
import { FaSolidTrash } from 'solid-icons/fa';
import type { InferenceProfileSummary } from '@aws-sdk/client-bedrock';
import { createRegionsResource } from './features/regions/resources.js';
import { createApplicationInferenceProfilesResource, createDeleteInferenceProfileResource, createNewInferenceProfileResource } from './features/inference-profiles/resources.js';
import { env } from './features/utils.js';
import { Loading } from './features/ui/loading/index.js';
import { createTagsForResourceResource } from './features/tags-for-resource/resources.js';
import { Modal } from './features/ui/modal/index.js';
import NewInferenceProfileForm, { type FormFields } from './features/inference-profiles/component.js';
import { ConfirmDelete } from './features/ui/confirm-delete/index.js';
import { TagListTable, ViewTagsButton } from './features/ui/tags/index.js';

const region: string = env.AWS_REGION ?? 'us-east-1';

/**
 * AWS Bedrock Application Profile Manager のメインUIコンポーネント。
 * @remarks
 * - リージョン選択、プロファイル一覧表示・新規作成・削除、タグ表示などの機能を提供します。
 * - 各種リソース（リージョン、プロファイル、タグ等）の取得・管理を行い、ローディング・エラー表示も対応しています。
 * - プロファイル作成・削除・タグ表示はモーダルUIで実装されています。
 * - 状態管理はSolid.jsのSignalを活用し、UIの状態遷移・バリデーション・エラー処理を行います。
 * - GitHubリポジトリへのリンクも含まれています。
 */
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
        const error = createInferenceProfileResult.error;
        const errorMessage = error instanceof Error ? error.message : 'プロファイル作成中にエラーが発生しました';
        setError(new Error(errorMessage));
      } else {
        refetch();
        setIsOpenCreateModal(false);
      }
    }

    if (!deleteInferenceProfileResult.loading) {
      // Profileの削除が完了したら(エラーも含む)
      if (deleteInferenceProfileResult.error) {
        const error = deleteInferenceProfileResult.error;
        const errorMessage = error instanceof Error ? error.message : String(error);
        setError(new Error(`プロファイル削除エラー: ${errorMessage}`));
      } else {
        refetch();
        setDeleteInferenceProfileIdentifier(undefined);
      }
    }
  });

  const handleOnChangeRegion = (e: Event & {
    currentTarget: HTMLSelectElement;
    target: HTMLSelectElement;
  }) => {
    setSelectedRegion(e.currentTarget.value);
  };

  const handleClickViewTags = (item: () => InferenceProfileSummary) => {
    {
      batch(() => {
        setSelectedTarget({
          region: selectedRegion(),
          arn: item().inferenceProfileArn ?? '',
          open: true,
        });
      });
    }
  };

  return (
    <>
      <h1>AWS Bedrock Application Profile Manager</h1>
      <Show
        when={!regionsResource.error}
        fallback={
          <p style={{ color: 'red' }}>{(regionsResource.error as unknown as Error).message}</p>
        }>
        <Show when={!regionsResource.loading} fallback={<Loading />}>
          <div class="flex items-center justify-between">
            <select
              class="ml-auto mr-auto"
              on:change={handleOnChangeRegion}
            >
              <Index each={regionsResource()}>
                {(item) => (
                  <option selected={selectedRegion() === item()} value={item()}>{item()}</option>
                )}
              </Index>
            </select>
            <button class="mr-0" on:click={() => setIsOpenCreateModal(true)}>New</button>
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
                    <th>Inference Profile Name</th><th>Inference Profile ARN</th><th>Models</th><th>Tags</th><th />
                  </tr>
                  <Index each={inferenceProfilesResource()}>
                    {(item) => (
                      <tr>
                        <td>{item().inferenceProfileName}</td>
                        <td>{item().inferenceProfileArn}</td>
                        <td><ul>{item().models?.map((model) => (<li>{model.modelArn}</li>))}</ul></td>
                        <td>
                          <ViewTagsButton
                            disabled={
                              // モーダルが開いているときは全てのボタンを無効化
                              selectedTarget().open
                            }
                            on:click={() => handleClickViewTags(item)}
                          />
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
                              { arn: item().inferenceProfileArn, name: item().inferenceProfileName })}
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
                <TagListTable targetProfileArn={selectedTarget().arn} tagsResource={tagsResource} />
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
      <div class="pt-[1rem]">
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
