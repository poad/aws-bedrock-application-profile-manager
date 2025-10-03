/**
 * アプリケーションのエントリーポイント。
 * @remarks
 * - ルート要素（id='root'）に App コンポーネントを Solid.js の render 関数でマウントします。
 * - root 要素が存在する場合のみ描画処理を実行します。
 * - グローバルCSS（index.css）を読み込みます。
 */
/* @refresh reload */
import { render } from 'solid-js/web';
import './index.css';
import App from './App.tsx';

const root = document.getElementById('root');
if (root) {
  render(() => <App />, root);
}
