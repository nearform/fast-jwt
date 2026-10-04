# fast-jwt website

This folder contains the [Docusaurus](https://docusaurus.io/) source for the
GitHub Pages site served at https://nearform.github.io/fast-jwt/.

## Local development

```bash
cd website
npm install
npm start
```

The dev server builds and serves the site at http://localhost:3000/fast-jwt/.

## Build

```bash
cd website
npm run build
```

The build regenerates `docs/index.md` from the project `README.md` and the API
reference from `src/index.d.ts`, then writes the static site to
`website/build/`.

## Deployment

The site is deployed automatically by the
[`deploy-docs`](../../.github/workflows/deploy-docs.yml) workflow whenever a
GitHub Release is published, or manually via the Actions tab.