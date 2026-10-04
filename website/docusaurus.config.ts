import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'fast-jwt',
  tagline: 'Fast JSON Web Token implementation',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://nearform.github.io',
  baseUrl: '/fast-jwt/',

  organizationName: 'nearform',
  projectName: 'fast-jwt',

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
          editUrl:
            'https://github.com/nearform/fast-jwt/tree/master/website/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'fast-jwt',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docs',
          position: 'left',
          label: 'Docs',
        },
        {
          to: '/api/',
          label: 'API',
          position: 'left',
        },
        {
          href: 'https://github.com/nearform/fast-jwt',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Introduction', to: '/'},
            {label: 'API', to: '/api/'},
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/nearform/fast-jwt',
            },
            {
              label: 'npm',
              href: 'https://www.npmjs.com/package/fast-jwt',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NearForm Ltd. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;