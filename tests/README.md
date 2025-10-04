# Testing Structure

This directory contains the E2E (End-to-End) tests for the fitness tracker application.

## Test Types

### Unit & Integration Tests

Located in `src/` directory alongside the source code:

- `src/components/__tests__/` - Component tests
- `src/utils/__tests__/` - Utility function tests
- `src/__tests__/integration/` - Integration tests

### E2E Tests

Located in `tests/e2e/` directory:

- `auth.spec.ts` - Authentication flow tests
- `calculators.spec.ts` - Health calculator tests
- `navigation.spec.ts` - Navigation and routing tests

## Running Tests

### Unit & Integration Tests

```bash
npm test                 # Run all unit/integration tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage report
```

### E2E Tests

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
```

## Configuration

- **Vitest**: Configured in `vitest.config.ts` for unit/integration tests
- **Playwright**: Configured in `playwright.config.ts` for E2E tests

The configurations are separated to avoid conflicts between the two test runners.
