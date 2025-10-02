import { defineConfig, loadEnv } from 'vite';
import solid from 'vite-plugin-solid';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  // 空文字列をプレフィックスにすることですべての環境変数を読み込む
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [solid(), tailwindcss()],
    define: {
      'import.meta.env.AWS_ACCESS_KEY_ID': JSON.stringify(env.AWS_ACCESS_KEY_ID),
      'import.meta.env.AWS_SECRET_ACCESS_KEY': JSON.stringify(env.AWS_SECRET_ACCESS_KEY),
      'import.meta.env.AWS_SESSION_TOKEN': JSON.stringify(env.AWS_SESSION_TOKEN),
      'import.meta.env.AWS_REGION': JSON.stringify(env.AWS_REGION),
    },
  };
});
