import type { ManifestOptions } from 'vite-plugin-pwa';

export const manifest: Partial<ManifestOptions> = {
  id: 'trakt-time-pwa',
  name: 'Trakt Time',
  short_name: 'Trakt Time',
  description:
    'Track the TV shows and movies you watch, never miss a new episode and find what to watch next. Coming from TV Time? Import your watch history in minutes.',
  dir: 'ltr',
  lang: 'en',
  prefer_related_applications: false,
  scope: '/',
  launch_handler: {
    client_mode: ['navigate-existing', 'auto'],
  },
  icons: [
    {
      src: 'pwa/android/icon_monochrome.svg',
      type: 'image/svg+xml',
      sizes: 'any',
      purpose: 'monochrome',
    },
    {
      src: 'pwa/android/icon_maskable.svg',
      type: 'image/svg+xml',
      sizes: 'any',
      purpose: 'maskable',
    },
    {
      src: 'pwa/android/icon_192.png',
      type: 'image/png',
      sizes: '192x192',
      purpose: 'any',
    },
    {
      src: 'pwa/android/icon_512.png',
      type: 'image/png',
      sizes: '512x512',
      purpose: 'any',
    },
  ],
  start_url: '/',
  display: 'standalone',
  theme_color: '#0c0b0b',
  background_color: '#0c0b0b',
  orientation: 'any',
  categories: ['entertainment'],
  shortcuts: [
    {
      name: 'Shows',
      short_name: 'Shows',
      description: 'Browse TV Shows',
      url: '/shows',
      icons: [
        {
          src: 'pwa/shortcuts/shows.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Movies',
      short_name: 'Movies',
      description: 'Browse Movies',
      url: '/movies',
      icons: [
        {
          src: 'pwa/shortcuts/movies.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
    {
      name: 'Profile',
      short_name: 'Profile',
      description: 'View Profile',
      url: '/profile/me',
      icons: [
        {
          src: 'pwa/shortcuts/profile.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
  ],
  screenshots: [
    // Captured by `deno task client:pwa:screenshots`. Always pulls from
    // unauth-friendly surfaces so the script doesn't need credentials.
    {
      type: 'image/webp',
      src: 'pwa/screenshots/discover-portrait.webp',
      sizes: '1556x3476',
    },
    {
      type: 'image/webp',
      src: 'pwa/screenshots/show-portrait.webp',
      sizes: '1556x3476',
    },
    {
      type: 'image/webp',
      src: 'pwa/screenshots/movie-portrait.webp',
      sizes: '1556x3476',
    },
    {
      type: 'image/webp',
      src: 'pwa/screenshots/discover-wide.webp',
      form_factor: 'wide',
      sizes: '2596x1804',
    },
    {
      type: 'image/webp',
      src: 'pwa/screenshots/show-wide.webp',
      form_factor: 'wide',
      sizes: '2596x1804',
    },
    {
      type: 'image/webp',
      src: 'pwa/screenshots/movie-wide.webp',
      form_factor: 'wide',
      sizes: '2596x1804',
    },
  ],
};
