/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_NFL_YEAR: string;
  readonly VITE_NFL_SEASON_START: string;
  readonly VITE_DEFAULT_LEAGUE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.scss' {
  const content: string;
  export default content;
}
