# Testing Guide

This document outlines the comprehensive testing strategy for the Fitness Tracker application.

## 🧪 Testing Stack

### Core Testing Tools

- **Vitest**: Fast unit test runner with native TypeScript support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: End-to-end testing across multiple browsers
- **Storybook**: Component documentation and visual testing
- **MSW (Mock Service Worker)**: API mocking for reliable tests
- **Chromatic**: Visual regression testing for UI components

## 📁 Test Structure

```
src/
├── __tests__/
│   ├── integration/          # Integration tests
│   └── utils/               # Test utilities
├── components/
│   ├── __tests__/           # Component unit tests
│   └── *.stories.tsx        # Storybook stories
├── utils/
│   ├── __tests__/           # Utility function tests
│   └── test-utils.tsx       # Custom testing utilities
├── mocks/                   # MSW mock handlers
└── setupTests.ts           # Test configuration

tests/
└── e2e/                    # Playwright E2E tests
```

## 🎯 Testing Types

### 1. Unit Tests

Test individual functions and components in isolation.

**Location**: `src/utils/__tests__/`, `src/components/__tests__/`

**Run**: `npm run test` or `npm run test:watch`

**Example**:

```typescript
// src/utils/__tests__/bmiCalculator.test.ts
import { calculateBMI } from "../bmiCalculator";

describe("BMI Calculator", () => {
  it("calculates BMI correctly", () => {
    expect(calculateBMI(70, 175)).toBe(22.86);
  });
});
```

### 2. Component Tests

Test React components with user interactions.

**Location**: `src/components/__tests__/`

**Run**: `npm run test:component`

**Example**:

```typescript
// src/components/__tests__/WorkoutTracker.test.tsx
import { render, screen } from "../../utils/test-utils";
import WorkoutTracker from "../WorkoutTracker";

test("renders workout form", () => {
  render(<WorkoutTracker />);
  expect(screen.getByLabelText(/exercise name/i)).toBeInTheDocument();
});
```

### 3. Integration Tests

Test complete user workflows across multiple components.

**Location**: `src/__tests__/integration/`

**Run**: `npm run test` (included in main test suite)

**Example**:

```typescript
// src/__tests__/integration/workout-flow.test.tsx
test("complete workout logging flow", async () => {
  render(<App />);
  // Test full user journey from login to workout completion
});
```

### 4. End-to-End Tests

Test the complete application in real browsers.

**Location**: `tests/e2e/`

**🎉 Performance Optimized**: Fixed 30-minute hanging issue - tests now complete in minutes!

**Run**:

- `npm run test:e2e` - Environment-aware (fast CI, full local)
- `npm run test:e2e:headed` - With browser UI
- `npm run test:e2e:ui` - Interactive mode

**Environment-Aware Testing**:

- **Local Development**: Full test suite on all browsers
- **CI/CD**: Fast environment check only (prevents hanging)
- **Smart Configuration**: Automatically adapts to environment

**Example**:

```typescript
// tests/e2e/auth.spec.ts
test("user can log in", async ({ page }) => {
  await page.goto("/login");
  await page.fill('[data-testid="email"]', "user@example.com");
  await page.fill('[data-testid="password"]', "password");
  await page.click('[data-testid="login-button"]');
  await expect(page).toHaveURL("/dashboard");
});
```

### 5. Visual Regression Tests

Detect unintended UI changes using Storybook and Chromatic.

**Location**: `src/components/*.stories.tsx`

**Run**:

- `npm run storybook` - Local development
- `npm run chromatic` - Visual regression testing

## 🛠️ Test Utilities

### Custom Render Function

Use the custom render function for components that need routing context:

```typescript
import { render, screen } from "../utils/test-utils";
// This includes BrowserRouter and other providers
```

### Mock Data Factories

Create consistent test data:

```typescript
import { createMockWorkout, createMockGoal } from "../utils/test-utils";

const workout = createMockWorkout({ exercise: "Running" });
const goal = createMockGoal({ target: 10 });
```

### MSW API Mocking

Mock API calls consistently across tests:

```typescript
// src/mocks/handlers.ts
export const handlers = [
  http.get("/api/workouts", () => {
    return HttpResponse.json([createMockWorkout()]);
  }),
];
```

## 🎨 Visual Testing with Storybook

### Creating Stories

Document and test component variations:

```typescript
// src/components/Button.stories.tsx
export default {
  title: "Components/Button",
  component: Button,
};

export const Primary = {
  args: { variant: "primary", children: "Click me" },
};

export const Disabled = {
  args: { disabled: true, children: "Disabled" },
};
```

### Visual Regression

Chromatic automatically detects visual changes in your components and requires approval for intentional changes.

## 🚀 Running Tests

### Development Workflow

```bash
# Run tests in watch mode during development
npm run test:watch

# Run specific test file
npm test -- WorkoutTracker.test.tsx

# Run tests with coverage
npm run test:coverage

# Run E2E tests with UI
npm run test:e2e:ui
```

### CI/CD Pipeline

All tests run automatically on:

- Pull requests
- Pushes to main/develop branches
- Before deployment

### Test Coverage

Aim for:

- **Unit Tests**: 90%+ coverage for utilities and services
- **Component Tests**: 80%+ coverage for UI components
- **Integration Tests**: Cover critical user workflows
- **E2E Tests**: Cover main application features

## 📊 Test Reports

### Coverage Reports

Generated in `coverage/` directory:

- HTML report: `coverage/index.html`
- LCOV format for CI integration

### Playwright Reports

Generated in `playwright-report/` directory:

- Test results with screenshots and videos
- Performance metrics
- Trace files for debugging

### Chromatic Reports

Visual regression reports available at:

- Chromatic dashboard
- GitHub PR comments with visual diffs

## 🔧 Configuration Files

### Vitest Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: ["**/node_modules/**", "**/dist/**"],
    },
  },
});
```

### Playwright Configuration

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
});
```

## 🐛 Debugging Tests

### Unit/Component Tests

```bash
# Debug with Vitest UI
npm run test:ui

# Debug specific test
npm test -- --reporter=verbose WorkoutTracker.test.tsx
```

### E2E Tests

```bash
# Run with browser visible
npm run test:e2e:headed

# Debug mode with step-by-step execution
npx playwright test --debug

# Generate and view trace
npx playwright show-trace trace.zip
```

### Storybook

```bash
# Run Storybook locally
npm run storybook

# Test interactions in browser
# Visit http://localhost:6006
```

## 📝 Best Practices

### Writing Tests

1. **Test behavior, not implementation**
2. **Use descriptive test names**
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Mock external dependencies**
5. **Test error states and edge cases**

### Component Testing

1. **Test from user's perspective**
2. **Use semantic queries** (`getByRole`, `getByLabelText`)
3. **Test accessibility** (screen readers, keyboard navigation)
4. **Mock complex child components**

### E2E Testing

1. **Test critical user journeys**
2. **Use data-testid for stable selectors**
3. **Test across different browsers and devices**
4. **Keep tests independent and isolated**

### Performance

1. **Use `beforeEach` for test setup**
2. **Clean up after tests** (automatic with Testing Library)
3. **Mock heavy operations**
4. **Parallelize test execution**

## 🔄 Continuous Integration

The testing pipeline runs:

1. **Lint and Type Check** - Code quality validation
2. **Unit Tests** - Fast feedback on individual components
3. **Component Tests** - UI component behavior validation
4. **Integration Tests** - Feature workflow validation
5. **E2E Tests** - Full application testing
6. **Visual Regression** - UI consistency validation

All tests must pass before code can be merged to main branch.

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Storybook Documentation](https://storybook.js.org/docs)
- [MSW Documentation](https://mswjs.io/docs/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

This comprehensive testing setup ensures your fitness tracker is reliable, maintainable, and provides an excellent user experience across all platforms and devices.
