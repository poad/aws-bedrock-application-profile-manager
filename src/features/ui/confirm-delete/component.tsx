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
          <p><span class="font-bold">{props.name}</span> ({props.arn}) を削除します。問題がなければ「Delete」ボタンを押してください。</p>
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
