import { createSignal, Index, Show, type Resource } from 'solid-js';
import './component.module.css';
import { FaSolidTrash } from 'solid-icons/fa';
import { IoAddCircleSharp } from 'solid-icons/io';
import { Loading } from '../loading';

// AWS リソースタグのキーの命名規則チェック用正規表現
const keyPattern = /^[a-zA-Z0-9+\-=._:/@]{1,128}$/;
// AWS リソースタグの値の命名規則チェック用正規表現
const valuePattern = /^(?:[a-zA-Z0-9+\-=._:/@][a-zA-Z0-9+\-=._:/@\s]{0,254}[a-zA-Z0-9+\-=._:/@]|[a-zA-Z0-9+\-=._:/@])?$/;

/**
 * タグ入力フォームコンポーネント。
 * @param {object} props - コンポーネントのプロパティ
 * @param {(data: { key: string, value: string }[], validator: () => boolean) => void} props['on:change'] - 入力変更時のコールバック
 * @remarks
 * 利用例：AWSリソースのタグ編集UIとして利用します。
 * 注意：キー・値のバリデーション、重複チェック、空欄チェックを内部で行います。アクセシビリティ対応のため、ラベルやエラーメッセージ表示も考慮してください。
 */
export function NewTagsForm(props: {
  'on:change': (data: { key: string, value: string }[], validator: () => boolean) => void
}) {
  const [items, setItems] = createSignal<{ id: number, key: string, value: string, error?: string }[]>(
    [],
  );

  const validator = (): boolean => {
    const keys = items().map(({ key }) => key);

    // 空のタグキーが存在するか否かのチェック
    if (keys.includes('')) {
      setItems(items().map(item =>
        !item.key.length ? { ...item, error: 'タグキーを指定する必要があります' } : item,
      ));
      return false;
    }

    // 重複したキーの存在チェック
    if (new Set(keys).size !== keys.length) {
      setItems(items().map(item =>
        keys.filter((key) => key === item.key).length > 1 ? { ...item, error: 'タグキーが重複しています' } : item,
      ));
      return false;
    }

    // キーのパターンチェック
    if (keys.some((key) => !keyPattern.test(key))) {
      setItems((prev) => prev.map(item =>
        !keyPattern.test(item.key) ? { ...item, error: 'キーに使用できない文字が含まれています' } : item,
      ));
      return false;
    }

    // 値のパターンチェック
    if (items().map(({ value }) => value).some((value) => !valuePattern.test(value))) {
      setItems((prev) => prev.map(item =>
        !valuePattern.test(item.value) ? { ...item, error: '値に使用できない文字が含まれています' } : item,
      ));
      return false;

    }

    return true;
  };

  const addRow = () => {
    setItems((prev) => {
      const id = prev.length > 0 ? prev.map(({ id }) => id).reduce((a, b) => Math.max(a, b)) + 1 : 0;
      return [...prev, { id, key: '', value: '' }];
    });
    props['on:change'](items().map(({ key, value }) => ({ key, value })), validator);
  };

  const updateKey = (id: number, newKey: string) => {
    const keys = items().map(({ key }) => key);
    if (!keyPattern.test(newKey)) {
      setItems((prev) => prev.map(item =>
        item.id === id ? { ...item, key: newKey, error: 'キーに使用できない文字が含まれています' } : item,
      ));
      return;
    }
    const error = keys.includes(newKey) ? 'キーが重複しています' : undefined;
    setItems((prev) => prev.map(item =>
      item.id === id ? { ...item, key: newKey, error } : item,
    ));
    props['on:change'](items().map(({ key, value }) => ({ key, value })), validator);
  };

  const updateValue = (id: number, newValue: string) => {
    if (!valuePattern.test(newValue)) {
      setItems(items().map(item =>
        item.id === id ? { ...item, value: newValue, error: '値に使用できない文字が含まれています' } : item,
      ));
      return;
    }
    setItems(items().map(item =>
      item.id === id ? { ...item, value: newValue } : item,
    ));
    props['on:change'](items().map(({ key, value }) => ({ key, value })), validator);
  };

  const deleteRow = (id: number) => {
    setItems(items().filter(item => item.id !== id));
    props['on:change'](items().map(({ key, value }) => ({ key, value })), validator);
  };

  const validate = (id: number) => {
    const target = items().find((item) => item.id === id);
    if (target?.key.length === 0) {
      setItems(items().map(item =>
        item.id === id ? { ...item, error: 'タグキーを指定する必要があります' } : item,
      ));
    }
  };

  return (
    <table class="table-fixed w-full">
      <thead>
        <tr>
          <th class="text-left w-[22vw]">キー</th>
          <th class="text-left w-[22vw]">値 - オプション</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <Index each={items()}>
          {(item) => (
            <>
              <tr>
                <td class="align-top pr-[1rem]">
                  <div class="min-w-full w-full max-w-full">
                    <input
                      type="text"
                      value={item().key}
                      on:input={(e) => updateKey(item().id, e.target.value)}
                      on:focusout={() => validate(item().id)}
                      placeholder="キーを入力"
                      class="min-w-full w-full max-w-full py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </td>
                <td class="align-top">
                  <input
                    type="text"
                    value={item().value}
                    on:focus={() => validate(item().id)}
                    on:input={(e) => updateValue(item().id, e.target.value)}
                    placeholder="値を入力"
                    class="w-[100%] py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td class="align-top">
                  <button
                    class="icon cancel"
                    on:click={() => deleteRow(item().id)}
                  >
                    <FaSolidTrash />
                  </button>
                </td>
              </tr>
              <tr>
                <td colspan={3}>
                  <Show when={item().error}>
                    <div class="text-left">
                      <span class="text-red-500">{item().error}</span>
                    </div>
                  </Show>
                </td>
              </tr>
            </>
          )}
        </Index>
        <tr>
          <td colspan={3} class="h-[5rem] ml-0 mr-auto text-left">
            <button
              class="icon"
              onClick={addRow}
            >
              <div class="flex flex-row">
                <IoAddCircleSharp class="align-bottom mr-2 mt-1" /><div class="align-top">新しいタグを追加する</div>
              </div>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

/**
 * タグ一覧表示テーブルコンポーネント。
 * @param {object} props - コンポーネントのプロパティ
 * @param {string} [props.targetProfileArn] - 対象プロファイルのARN（タグ一覧のタイトルに表示）
 * @param {Resource<{ key?: string; value?: string; }[]>} props.tagsResource - タグ情報のリソース。エラー・ローディング・データを管理。
 * @remarks
 * - AWSリソースに付与されているタグの一覧を表示します。
 * - タグの編集はできません。編集はAWS CLI等で行ってください。
 * - 読み込み中はローディング表示、エラー時はエラーメッセージを表示します。
 * - タグが未設定の場合はその旨を表示します。
 */
export function TagListTable(props: {
  readonly targetProfileArn?: string
  readonly tagsResource: Resource<{
    key?: string;
    value?: string;
  }[]>
}) {
  return (<div class="w-[400px]">
    <Show
      when={!props.tagsResource.error}
      fallback={
        <p style={{ color: 'red' }}>{(props.tagsResource.error as unknown as Error).message}</p>
      }>
      <Show when={!props.tagsResource.loading} fallback={<Loading />}>
        <div>
          <h4>Tags for {props.targetProfileArn}</h4>
        </div>
        <Show when={props.tagsResource()?.length !== 0} fallback={<p>タグは設定されていません。</p>}>
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
              <Index each={props.tagsResource()}>
                {(tag) => (
                  <tr>
                    <td
                      class="p-[8px] border-b border-b-solid border-b-[#ddd]"
                    >
                      {tag().key}
                    </td>
                    <td
                      class="p-[8px] border-b border-b-solid border-b-[#ddd]"
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
  );
}

export function ViewTagsButton(props: {
  disabled: boolean,
  'on:click': () => void,
}) {
  return (
    <button
      type="button"
      disabled={props.disabled}
      aria-label="View Tags"
      on:click={props['on:click']}>tags</button>
  );
}
