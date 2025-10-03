/**
 * ローディング表示用コンポーネント。
 * @returns {JSX.Element} ローディングメッセージ
 * @remarks
 * 利用例：APIリクエスト中や非同期処理中のインジケーターとして利用します。
 * 注意：アクセシビリティ対応のため、aria属性やロール指定を追加することが推奨されます。
 */
export const Loading = () => {
  return <p>Loading...</p>;
};
