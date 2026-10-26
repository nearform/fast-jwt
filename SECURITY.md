# Security Policy

## Check before you submit

Read [issue #687](https://github.com/nearform/fast-jwt/issues/687) first. It is the log of reports we have already assessed and decided are not vulnerabilities, and it opens with the scope and threat model we work to. A report that matches an entry will be closed as a duplicate of that decision, unless it shows something the original assessment did not cover. If yours does, say which entry you are building on and what is new.

## Reporting a vulnerability

Use GitHub private vulnerability reporting: [report a vulnerability](https://github.com/nearform/fast-jwt/security/advisories/new).

Do not open a public issue for a vulnerability that has not been fixed.

Please include:

- The affected version.
- A self-contained proof of concept that works against a released version and against current `master`.
- The attacker's position: what they control, and what they must already hold (for example a valid token or the signing key).

## Duplicates

The earliest report of a root cause is kept. Later reports of the same root cause are closed as duplicates, and independent reporters are credited on the original.

## Reports that are not vulnerabilities

A report that is not a vulnerability may still be worth a regular issue or pull request (for example hardening, validation or documentation). The maintainers decide whether to accept it.

## Supported versions

Only the latest release receives security fixes, published as a new version of the latest release line. Older releases are not patched.
