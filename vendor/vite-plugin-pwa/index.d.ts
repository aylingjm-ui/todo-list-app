import type { Plugin } from 'vite';

export type ManifestIcon = {
  src: string;
  sizes: string;
  type: string;
  purpose?: string;
};

export type PwaOptions = {
  manifest: {
    name: string;
    short_name: string;
    description?: string;
    theme_color: string;
    background_color: string;
    display: string;
    scope?: string;
    start_url?: string;
    icons: ManifestIcon[];
  };
  includeAssets?: string[];
};

export function VitePWA(options: PwaOptions): Plugin;
