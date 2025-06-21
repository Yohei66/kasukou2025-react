// global.d.ts

/// <reference types="vite/client" />

// File-imports:
declare module '*.module.css';
declare module '*.css';
declare module '*.pdf';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';

// Vite import.meta.glob:
interface ImportMeta {
  glob(pattern: string | string[]): Record<string, () => Promise<any>>;
}

// Ensure you still pick up React’s types:
import 'react';
declare module 'react' {
  interface CSSProperties {
    [key: string]: string | number;
  }
}

// Provide a minimal JSX namespace so TS knows what JSX.Element is:
declare global {
  namespace JSX {
    // React が返す要素
    type Element = import('react').ReactElement | null;
    // どんなタグも許可（MUI やカスタムコンポーネント用）
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}
