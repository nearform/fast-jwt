# AGENTS.md

Guidance for AI agents working in this repository. Humans are welcome to read it too.

## Before you file a security report

Read [SECURITY.md](./SECURITY.md) and the decisions log in [issue #687](https://github.com/nearform/fast-jwt/issues/687) before opening a GitHub security advisory. #687 records reports we have already assessed, together with the scope and threat model they were assessed against. A report that matches an entry is closed as a duplicate of that decision, unless it shows something the entry did not cover. If it does, say which entry you are building on and what is new.

The entry that comes up most often, and the reason this section is first:

- **fast-jwt does not support JWK or JWKS keys and does not own JWKS handling.** Convert keys to PEM, use [get-jwks](https://github.com/nearform/get-jwks) for JWKS, and pin `algorithms`.
- The check in `src/crypto.js` that rejects serialized asymmetric JWK/JWKS input is a guard against a common misconfiguration. It is deliberately not exhaustive.
- Reports that the check can be bypassed, including wrapping, decoration, control or zero-width bytes, unlisted key types, or "incomplete fix" reports, are out of scope. They are closed as duplicates of the decision in #687.

Do not open a public issue for an unfixed vulnerability. A non-vulnerability observation about hardening, validation or documentation can be a regular issue or pull request.

## Project

fast-jwt is a JSON Web Token implementation for Node.js, requiring Node 20 or later. The source is CommonJS in `src/`, tests are in `test/`, and the documentation site is in `website/`.

## Commands

```bash
npm install
npm run lint
npm test
npm run test:watch
npm run test:ci   # what CI runs
```

`npm test` runs the Node.js test runner with coverage over `test/**.spec.js`, then `tstyche` for the TypeScript types.

## Conventions

- Match the surrounding code. Prettier settings are in `prettier.config.js`: no semicolons, single quotes, 120 columns.
- Write the test first. Add or change the smallest test in the matching `test/*.spec.js` before changing `src/`.
- Public API or option changes need a README update and a matching update to `src/index.d.ts`.
- Keep keys as PEM. Do not broaden supported key formats without a documented reason; JWK and JWKS handling belongs in get-jwks.
- Do not add dependencies unless the task needs one. Ask a maintainer before adding a runtime dependency.
- Error codes and messages are public surface. Add new codes to `TokenError.codes` and document them.

## Commits and pull requests

- Use conventional commit subjects, for example `fix: ...`, `docs: ...` or `chore: ...`.
- Sign commits with GPG.
- Link the issue in the pull request body. CI checks for a linked issue.
- Run `npm run test:ci` before committing and make sure it passes.
- Do not merge pull requests. A maintainer merges after review.
