import { runSuites as runSignSuites } from './sign.mjs'
import { runSuites as runVerifySuites } from './verify.mjs'
import { runSuites as runDecodeSuites } from './decode.mjs'
import { writeFile } from 'fs/promises'
import { join } from 'path'

const signBenchmark = await runSignSuites().catch(console.error)
const decodeBenchmark = await runDecodeSuites().catch(console.error)
const verifyBenchmark = await runVerifySuites().catch(console.error)

const printDetail = ({ algorithm, result }) =>
  `
<details>
    <summary>${algorithm}</summary>

## ${algorithm}
\`\`\`
${result}
\`\`\`
</details>
`

const pageMarkdownContent = `# Benchmarks

Made with [mitata](https://github.com/evanwashere/mitata) library

Note that \`@node-rs/jsonwebtoken\` does not support ES512, so it is excluded from the ES512 comparisons,
and that \`jose\` has been promise based since v3, so it only appears in the asynchronous comparisons.

## Signing

${signBenchmark.map(printDetail).join('\n')}

## Decoding

${decodeBenchmark.map(printDetail).join('\n')}

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

${verifyBenchmark.map(printDetail).join('\n')}
`

await writeFile(join(import.meta.dirname, 'README.md'), pageMarkdownContent, 'utf8')
