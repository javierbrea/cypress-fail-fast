# Agent Guidelines

## Language Policy

**CRITICAL:** All repository artifacts must be written in English.

- Code, comments, test names and descriptions, documentation, and configuration messages must be in English.
- The agent can converse in other languages with users, but any output persisted to the repository (files, code, docs, test titles) must be in English.

## Repository Overview

This repository is a monorepo structured using Pnpm. I contains next packages:

- `./` - the main package with the core code, tests, and documentation.
- `./test-e2e/app` - A package for the web application used in end-to-end tests.
- `./test-e2e/cypress-latest` - A package for the Cypress tests used in end-to-end tests.
- `./test-e2e/runner` - A package dedicated to end-to-end testing, containing test runner code and e2e tests. It starts the web application and runs Cypress tests against it, checking the results based on the expected outcomes defined in the tests.

### Unit Tests

Unit tests are located in the `src` directory of the main package, alongside the implementation files. Each test file is named with a `.spec.ts` suffix and contains tests for the corresponding implementation file. For example, tests for `src/Browser/FailFast.ts` are located in `src/Browser/FailFast.spec.ts`.

## Essential Commands

The repository uses `pnpm` as the package manager.

Use next commands to run tasks in the main package:

- `pnpm test:unit` - runs unit tests
- `pnpm test:mutation` - runs mutation tests
- `pnpm test:e2e` - runs end-to-end tests
- `pnpm lint` - runs the linter
- `pnpm check:types` - checks TypeScript types
- `pnpm cspell` - checks spelling

Use next commands to run tasks in the `test-e2e/runner` package. Remember to navigate to the `test-e2e/runner` directory first:

```bash
cd test-e2e/runner
```

Then you can run the following commands:

- `pnpm test:e2e` - runs end-to-end tests
- `pnpm check:types` - checks TypeScript types

### Running Tests

**Run unit tests with coverage:**
```bash
pnpm test:unit --output-style=stream
```

**Run tests without coverage (faster for development):**
```bash
pnpm test:unit --coverage=false
```

**Run tests for specific file:**
```bash
pnpm test:unit <file-path-relative-to-package> --output-style=stream --coverage=false
```

## Workflow Best Practices

### After Making Changes

1. **Always format the modified file using `pnpm lint <path-to-modified-file> --fix`**
2. **Always run tests for the modified files immediately after changes**
3. **Use `--coverage=false` flag to speed up unit test execution during development**
4. **Run focused tests first, then full package suite if needed**

### Standard Post-Modification Flow

```bash
# 1. Format the modified file
pnpm lint <path-to-modified-file> --fix

# 2. Run tests for the modified file
pnpm test:unit <path-to-modified-test-file> --coverage=false

# Example: After modifying packages/elements/src/Matcher/ElementsMatcher.ts
pnpm lint src/Browser/FailFast.ts --fix
pnpm test:unit src/Browser/FailFast.spec.ts --coverage=false
```

### Type Safety in Tests

**NEVER use `any` type in tests.** Always use proper types to ensure type safety and catch potential issues early.

**For partial mocks**, use `@ts-expect-error` with a descriptive comment when you don't need to implement the complete interface, or `as unknown as` when necessary.

```typescript
// Good: Partial mock with explicit comment
const partialConfig = {
  timeout: 5000,
  retries: 3
} as unknown as ICompleteConfig;

// Bad: Using 'any' type
const config: any = { timeout: 5000 };
```

**Key principles:**
- Always import and use the correct interface/type
- Mock only what's necessary for the test
- Use `@ts-expect-error Mocked partially` comment when creating partial mocks
- Prefer existing mock factories over manual object creation

## Other Useful Commands

**Install dependencies:**

```bash
pnpm install
```