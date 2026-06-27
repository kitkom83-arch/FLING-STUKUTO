/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHEEL_API_MODE?: 'mock' | 'api';
  readonly VITE_WHEEL_API_BASE_URL?: string;
  readonly VITE_WHEEL_AUTH_TOKEN_STORAGE_KEY?: string;
  readonly VITE_WHEEL_SITE_CODE?: string;
  readonly VITE_WHEEL_DEMO_MEMBER_ENABLED?: string;
  readonly VITE_WHEEL_DEMO_MEMBER_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
