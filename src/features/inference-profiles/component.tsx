import { createEffect, createSignal, For, Show } from 'solid-js';
import { createSystemDefinedInferenceProfilesResource } from './resources';
import { Loading } from '../ui/loading';
import NewTagsForm from '../ui/tags/component';
import { createFoundationModelsResource } from '../foundation-models/resources';

export interface FormFields {
  inferenceProfileName: string,
  description?: string,
  copyFrom: string,
  tags?: { key: string; value: string }[],
}

interface NewInferenceProfileFormProps {
  region: string,
  'on:submit': (data: FormFields) => void,
  'on:cancel': () => void,
}

const inferenceProfileNamePattern = /^[0-9a-zA-Z]([0-9a-zA-Z _-]*[0-9a-zA-Z])?$/;
const descriptionPattern = /^[0-9a-zA-Z:.][0-9a-zA-Z:. _-]*$/;
const defaultFormData = { inferenceProfileName: '', copyFrom: '' };

function NewInferenceProfileForm(props: NewInferenceProfileFormProps) {
  const [systemDefinedInferenceProfilesResource] = createSystemDefinedInferenceProfilesResource(props.region);
  const [faundationModelsResource] = createFoundationModelsResource(props.region);
  const [formData, setFormData] = createSignal<FormFields>(defaultFormData);
  const [validator, setValidator] = createSignal<() => boolean>();
  const [error, setError] = createSignal<string>();

  const handleNameChange = (e: Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
  }) => {
    if (e.target.value.match(inferenceProfileNamePattern)?.[0] !== e.target.value) {
      setError('Inference Profile Name は英数字と _ - のみ使用できます。');
      setValidator(() => () => false);
      return;
    }
    setFormData({ ...formData(), inferenceProfileName: e.target.value });
    setError(undefined);
  };

  const handleChangeDescription = (e: Event & {
    currentTarget: HTMLInputElement;
    target: HTMLInputElement;
  }) => {
    if (e.target.value.match(descriptionPattern)?.[0] !== e.target.value) {
      setError('Description は英数字と _ - : . のみ使用できます。');
      setValidator(() => () => false);
      return;
    }
    setFormData({ ...formData(), description: e.target.value });
    setError(undefined);
  };

  const handleSubmit = () => {
    const data = formData();
    if (!data.inferenceProfileName) {
      setError('Inference Profile Name は必須です。');
      return;
    }

    const validatorFn = validator();
    if (validatorFn && !validatorFn()) {
      // バリデーションエラーがある場合は送信しない
      return;
    }

    setFormData(defaultFormData);
    props['on:submit'](data);
  };

  createEffect(() => {
    if (!systemDefinedInferenceProfilesResource.loading && !systemDefinedInferenceProfilesResource.error) {
      const profiles = systemDefinedInferenceProfilesResource();
      if (profiles && profiles.length > 0) {
        setFormData({ ...formData(), copyFrom: profiles[0].inferenceProfileArn ?? '' });
      }
    }
  });

  return (
    <>
      <Show
        when={!systemDefinedInferenceProfilesResource.error}
        fallback={
          <p style={{ color: 'red' }}>{(systemDefinedInferenceProfilesResource.error as unknown as Error).message}</p>
        }>
        <Show
          when={!faundationModelsResource.error}
          fallback={
            <p style={{ color: 'red' }}>{(faundationModelsResource.error as unknown as Error).message}</p>
          }>
          <Show when={!systemDefinedInferenceProfilesResource.loading || !faundationModelsResource.loading}
            fallback={<Loading />}>
            <div class='flex flex-col w-[50vw]'>
              <div class="flex flex-col">
                <div class="pr-2 mr-auto pb-2">
                  <label for="name" class="font-bold">Inference Profile Name</label>
                </div>
                <div class="ml-2 mr-auto">
                  <input
                    class="border border-gray-300 rounded-md px-2 py-1 min-w-[50vw]"
                    type="text" placeholder="Inference Profile Name"
                    name="name" value={formData().inferenceProfileName}
                    on:change={handleNameChange} />
                </div>
                <div class="ml-2 mr-auto pb-[1rem]">
                  <span class="text-red-500">{error()}</span>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="pr-2 mr-auto pb-2">
                  <label for="description" class="font-bold">Inference Profile Description</label>
                </div>
                <div class="ml-2 mr-auto pb-[1rem]">
                  <input
                    class="border border-gray-300 rounded-md px-2 py-1 min-w-[50vw]"
                    type="text" placeholder="Inference Profile Description"
                    name="description" value={formData().description ?? ''}
                    on:change={handleChangeDescription} />
                </div>
              </div>
              <div class="flex flex-col">
                <div class="pr-2 mr-auto pb-2">
                  <label for="copyFrom" class="font-bold">Model Source</label>
                </div>
                <div class="ml-2 mr-auto pb-[1rem]">
                  <select
                    on:change={(e) => setFormData({ ...formData(), copyFrom: e.target.value })}
                    aria-placeholder='モデルソースを選択してください'
                  >
                    <For each={systemDefinedInferenceProfilesResource()}>
                      {(item) => <option
                        value={item.inferenceProfileArn}
                        selected={item.inferenceProfileArn === formData().copyFrom}>
                        {item.inferenceProfileName} ({item.inferenceProfileArn?.split('inference-profile/')[1]})
                      </option>}
                    </For>
                    <For each={faundationModelsResource()}>
                      {(item) => <option
                        value={item.modelArn}
                        selected={item.modelArn === formData().copyFrom}>
                        {item.providerName} {item.modelName} ({item.modelArn?.split('foundation-model/')[1]})
                      </option>}

                    </For>
                  </select>
                </div>
              </div>
              <div class="flex flex-col">
                <div class="pr-2 mr-auto pb-2">
                  <span class="font-bold">Tags</span>
                </div>
                <div class="ml-2 mr-auto pb-[1rem]">
                  <NewTagsForm on:change={(tags, validator) => {
                    setFormData({ ...formData(), tags });
                    setValidator(() => validator);
                  }} />
                </div>
              </div>
              <div class="flex flex-row ml-auto mr-auto">
                <div class="pr-2">
                  <button class="cancel" on:click={props['on:cancel']}>Cancel</button>
                </div>
                <div>
                  <button on:click={() => handleSubmit()}>Create</button>
                </div>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
    </>
  );
}
export default NewInferenceProfileForm;
