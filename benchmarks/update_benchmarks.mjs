import { runSuites as runSignSuites } from './sign.mjs'
import { runSuites as runVerifySuites } from './verify.mjs'
import { runSuites as runDecodeSuites } from './decode.mjs'
import { writeFile } from 'fs/promises'

const signBenchmark = await runSignSuites().catch(console.error)
const decodeBenchmark = await runDecodeSuites().catch(console.error)
const verifyBenchmark = await runVerifySuites().catch(console.error)

const pageMarkdownContent = `# Benchmarks

## Signing

\`\`\`
${signBenchmark}
\`\`\`

## Decoding

\`\`\`
${decodeBenchmark}
\`\`\`

Note that for decoding the algorithm is irrelevant, so only one was measured.

## Verifying

\`\`\`
${verifyBenchmark}
\`\`\`
`

await writeFile(new URL('BENCHMARKS.md', import.meta.url), pageMarkdownContent, 'utf8')
