// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github')
const darkCodeTheme = require('prism-react-renderer/themes/dracula')

const repoName = 'fast-jwt'
const repoUrl = `https://github.com/nearform/${repoName}`

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: repoName,
  tagline: 'Fast JSON Web Token implementation',
  url: 'https://nearform.github.io',
  baseUrl: `/${repoName}/`,
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'nearform',
  projectName: repoName,

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: `${repoUrl}/tree/master/docs`
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        watch: process.env.TYPEDOC_WATCH
      }
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: repoName,
        logo: {
          alt: 'NearForm Logo',
          src: 'img/logo.png'
        },
        items: [
          {
            type: 'doc',
            docId: 'api/index',
            position: 'left',
            label: 'API'
          },
          {
            href: repoUrl,
            label: 'GitHub',
            position: 'right'
          }
        ]
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'API',
                to: '/docs/api'
              }
            ]
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: repoUrl
              }
            ]
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} NearForm.`
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme
      }
    })
}

module.exports = config
