'use strict'

const fs = require('node:fs')
const path = require('node:path')

const repoRoot = path.join(__dirname, '..', '..')
const docsDir = path.join(__dirname, '..', 'docs')
const repoUrl = 'https://github.com/nearform/fast-jwt/blob/master'

const targets = [
  {
    source: path.join(repoRoot, 'README.md'),
    destination: path.join(docsDir, 'index.md'),
    title: 'fast-jwt',
    slug: '/',
    rewriteLinks: relativePath => {
      if (relativePath === 'benchmarks/README.md') {
        return '/benchmarks'
      }
      return `${repoUrl}/${relativePath}`
    }
  },
  {
    source: path.join(repoRoot, 'benchmarks', 'README.md'),
    destination: path.join(docsDir, 'benchmarks.md'),
    title: 'Benchmarks',
    slug: '/benchmarks',
    rewriteLinks: relativePath => `${repoUrl}/${relativePath}`
  }
]

for (const { source, destination, title, slug, rewriteLinks } of targets) {
  if (!fs.existsSync(source)) {
    continue
  }

  const content = fs.readFileSync(source, 'utf8')
  const stripped = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\]\(\.\/([^)\s]+)\)/g, (_, relativePath) => `](${rewriteLinks(relativePath)})`)

  const lines = stripped.split('\n')
  let startIdx = 0

  if (lines[0].startsWith('# ')) {
    startIdx = 1
    while (startIdx < lines.length && lines[startIdx].trim() === '') {
      startIdx++
    }
  }

  const body = lines.slice(startIdx).join('\n').trimStart()
  const frontmatter = `---\ntitle: ${title}\nslug: ${slug}\n---\n\n`
  fs.writeFileSync(destination, frontmatter + body)

  console.log(`Copied ${source} → ${destination}`)
}
