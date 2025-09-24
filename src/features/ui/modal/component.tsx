import { createEffect, onCleanup, Show, type JSX } from 'solid-js';
import type { DOMElement } from 'solid-js/jsx-runtime';

// モーダルコンポーネント
export const Modal = (props: {
  isOpen: boolean,
  onClose: () => void,
  children: JSX.Element,
}) => {
  const handleBackdropClick = (e: MouseEvent & {
    currentTarget: HTMLDivElement;
    target: DOMElement;
  }) => {
    // クリックされた要素がbackdrop自体の場合のみ閉じる
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const handleCloseClick = () => {
    props.onClose();
  };

  // ESCキーでモーダルを閉じる
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      props.onClose();
    }
  };

  onCleanup(() => {
    if (props.isOpen) {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  createEffect(() => {
    if(props.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });


  return (
    <Show when={props.isOpen}>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          'background-color': 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          'align-items': 'center',
          'justify-content': 'center',
          'z-index': 1000,
        }}
        on:click={handleBackdropClick}
      >
        <div
          class='modal-fade-in'
          style={{
            'background-color': 'var(--modal-bg, white)',
            'color': 'var(--modal-text, black)',
            'border-radius': '8px',
            'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            'max-width': '400px',
            width: '90%',
            position: 'relative',
          }}
        >
          {/* 閉じるボタン */}
          <button
            on:click={handleCloseClick}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'none',
              border: 'none',
              'font-size': '24px',
              'font-weight': 'bold',
              color: 'var(--modal-close, #666)',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'center',
              'border-radius': '50%',
              transition: 'all 0.2s',
            }}
          >
            ×
          </button>

          {/* モーダルの内容 */}
          <div style={{ padding: '24px', color: 'var(--modal-text, black)' }}>
            {props.children}
          </div>
        </div>
      </div>
    </Show>
  );
};
