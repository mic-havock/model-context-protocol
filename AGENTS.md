# Jules Agent Guidelines (AGENTS.md)

## 1. Project Context

MCP for a Recreation.gov front-end that monitors campsites that aren't available and alerts users when something opens up.

## 2. Tech Stack & Environment

- **Language/Framework:** [e.g., TypeScript / Node.js 20]
- **Cloud/Infrastructure:** AWS. When generating cloud resources or interacting with infrastructure, default to AWS SDK v3. Enforce IAM least-privilege principles for all generated roles or policies.
- **Package Manager:** [e.g., npm, pnpm]

## 3. Code Style & Conventions

- **Strict Typing:** [e.g., TypeScript strict mode is enabled. Do not use `any`. Define explicit interfaces for all payloads.]
- **Modularity:** Keep functions small and single-purpose. Extract reusable logic into the `src/utils` or `src/shared` directories.
- **Error Handling:** Fail fast. Catch specific exceptions rather than generic errors. All errors must be logged using the standard project logger (e.g., Winston/Pino) with contextual metadata. Do not swallow exceptions.
- **No Unsolicited Refactoring:** Only modify files directly related to the specific prompt. Do not format or refactor adjacent code just because you are in the file.

## 4. Testing Requirements

- All new features, bug fixes, or logic changes must include corresponding unit tests.
- **Test Framework:** [e.g., Jest, PyTest]
- Mock external dependencies and AWS services (e.g., using `aws-sdk-client-mock`) to ensure tests run offline and quickly.

## 5. PR & Git Workflow

- Commit messages must follow the Conventional Commits standard (e.g., `feat:`, `fix:`, `chore:`).
- Do not modify environment variable files (`.env`), CI/CD pipelines, or GitHub Actions workflows unless explicitly instructed in the prompt.
