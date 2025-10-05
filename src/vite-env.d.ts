/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GA_MEASUREMENT_ID: string;
  readonly VITE_GA_ENABLED: string;
  readonly VITE_GA_DEBUG: string;
  readonly VITE_GA_RESPECT_DNT: string;
  readonly VITE_GA_FORCE_OPT_OUT: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}