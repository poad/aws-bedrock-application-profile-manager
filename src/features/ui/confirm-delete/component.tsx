/**
 * 削除確認ダイアログコンポーネント。
 * @param {object} props - コンポーネントのプロパティ
 * @param {string} props.name - 削除対象名
 * @param {string} props.arn - 削除対象ARN
 * @param {() => void} props['on:delete'] - 削除実行時のコールバック
 * @param {() => void} props['on:cancel'] - キャンセル時のコールバック
 * @remarks
 * 利用例：リソース削除時の確認ダイアログとして利用します。
 * 注意：on:delete, on:cancelは必須です。アクセシビリティ対応のため、フォーカス管理やキーボード操作も考慮してください。
 */
export function ConfirmDelete(props: {
  name: string;
  arn: string;
  'on:delete': () => void;
  'on:cancel': () => void;
}) {

  return (
    <>
      <div class='flex flex-col w-[50vw]'>
        <div class="flex flex-col">
          <p class="pb-6"><span class="font-bold">{props.name}</span> ({props.arn}) を削除します。問題がなければ「Delete」ボタンを押してください。</p>
          <div class="flex flex-row ml-auto mr-auto">
            <div class="pr-2">
              <button class="cancel" on:click={props['on:cancel']}>Cancel</button>
            </div>
            <div>
              <button on:click={props['on:delete']}>Delete</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
