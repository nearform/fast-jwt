import { runSuites as runSignSuites } from './sign.mjs'
import { runSuites as runVerifySuites } from './verify.mjs'
import { runSuites as runDecodeSuites } from './decode.mjs'
import { writeFile } from 'fs/promises'

const signBenchmark = await runSignSuites().catch(console.error)
const decodeBenchmark = await runDecodeSuites().catch(console.error)
const verifyBenchmark = await runVerifySuites().catch(console.error)

const printDetail = ({ algorithm, result }) =>
  `<details>
        <summary>${algorithm}</summary>
        \`\`\`
            ${result}
        \`\`\`
    </details>
    `

const pageMarkdownContent = `# Benchmarks

## Signing

${signBenchmark.map(printDetail).join('\n')}

## Decoding

${decodeBenchmark.map(printDetail).join('\n')}

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

${verifyBenchmark.map(printDetail).join('\n')}
`

await writeFile(new URL('README.md', import.meta.url), pageMarkdownContent, 'utf8')
