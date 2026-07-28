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

Only RS512 was measured for decoding.

These decoding numbers are not a like-for-like comparison. \`createDecoder()\` also decodes and parses
the header, which it needs for the \`checkTyp\` option and for the \`complete\` form, and it rejects any
of the three segments containing characters outside the base64url alphabet, so that a non canonical
token cannot be silently accepted. \`jose\`'s \`decodeJwt\` does neither: it reads the payload only. The
alphabet check also scans the signature, so the cost grows with signature length, and RS512 has the
longest signature of the algorithms benchmarked here. A separate off-line run over the other
algorithms, which \`decode.mjs\` does not cover and which therefore cannot be reproduced from the rows
above, put the gap between 1.66x for HS256 and 3.06x for PS512. The \`(complete)\` rows are the closest
to an equal comparison, since only there does \`jose\` decode the header as well.

## Verifying

${verifyBenchmark.map(printDetail).join('\n')}
`

await writeFile(join(import.meta.dirname, 'README.md'), pageMarkdownContent, 'utf8')
