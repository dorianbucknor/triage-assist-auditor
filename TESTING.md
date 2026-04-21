# TriageAssist - Testing Guide

## Overview

This project uses Jest and React Testing Library for comprehensive testing of components, hooks, utilities, and API routes.

## Setup

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Files Structure

```
__tests__/
├── api/                    # API route tests
│   ├── access-request.test.ts
│   └── scenarios.test.ts
├── components/            # Component tests
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   ├── Input.test.tsx
│   ├── ThemeToggle.test.tsx
│   ├── LoginForm.test.tsx
│   ├── SignupForm.test.tsx
│   ├── FormComponents.test.tsx
│   └── DialogComponents.test.tsx
├── hooks/                 # Hooks tests
│   ├── use-mobile.test.ts
│   └── use-pointer-location.test.ts
├── lib/                   # Utility/type tests
│   ├── utils.test.ts
│   └── types.test.ts
├── providers/            # Provider tests
│   └── supabase-client.test.ts
├── integration/          # Integration tests
│   ├── auth-flow.test.ts
│   └── scenario-management.test.ts
└── test-utils.ts        # Shared test utilities
```

## Test Coverage

### Unit Tests

#### Components
- **Button**: Click events, disabled state, variants, sizes
- **Input**: Text input, validation, events, placeholder
- **Card**: Structure, nested content, styling
- **ThemeToggle**: Theme switching, state management
- **LoginForm**: Email/password validation, submission
- **SignupForm**: Multi-step form, validation
- **Form Components**: Checkbox, Textarea, Toggle
- **Dialog Components**: Alert, Dialog, Dropdown Menu

#### Hooks
- **useIsMobile**: Responsive breakpoint detection
- **usePointerLocation**: Mouse tracking, event handling

#### Utilities
- **cn()**: Class name merging, Tailwind CSS conflict resolution

#### Types
- **TriageData**: Valid triage data structures
- **UserRole**: Role validation

#### API Routes
- **Access Request**: Request submission, validation
- **Scenarios**: Pagination, filtering, data retrieval

#### Providers
- **Supabase Client**: Authentication, database operations

### Integration Tests

#### Auth Flow
- Complete login/signup workflow
- Session management
- Error handling
- User profile management

#### Scenario Management
- Scenario CRUD operations
- Grading submission
- Performance metrics
- Search and filtering

## Writing Tests

### Component Testing Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('Component - MyComponent', () => {
  it('should render component', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', async () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Hook Testing Example

```typescript
import { renderHook } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('Hook - useMyHook', () => {
  it('should return expected value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current).toBeDefined();
  });
});
```

### API Testing Example

```typescript
describe('API - My Route', () => {
  it('should handle POST request', async () => {
    const mockResponse = { success: true };
    (createServerClient as jest.Mock).mockResolvedValue(mockClient);
    
    // Test implementation
  });
});
```

## Test Utilities

The `test-utils.ts` file provides reusable testing utilities:

### Mock Factories
- `createMockSupabaseClient()`: Creates mock Supabase instance
- `createMockSession()`: Creates mock auth session
- `createMockUser()`: Creates mock user object
- `createMockTriageData()`: Creates mock triage data
- `createMockRouter()`: Creates mock Next.js router

### Helper Functions
- `mockFetch()`: Mocks fetch API
- `resetAllMocks()`: Resets all Jest mocks
- `waitForAsync()`: Waits for async operations

### Custom Render
```typescript
import { render } from '__tests__/test-utils';

// Automatically wraps components with necessary providers
render(<MyComponent />);
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the component does, not how it does it
2. **Use Semantic Queries**: Prefer `getByRole`, `getByText`, and `getByLabelText`
3. **Avoid Implementation Details**: Don't test internal state unless necessary
4. **Write Isolated Tests**: Each test should be independent
5. **Use Descriptive Names**: Test names should clearly describe what they test
6. **Mock External Dependencies**: Mock API calls, database operations, and external libraries
7. **Test Edge Cases**: Include tests for null/undefined, empty states, and errors
8. **Async Testing**: Use `waitFor()` and `async/await` for async operations

## Mocking

### Mocking Next.js Features

```typescript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));
```

### Mocking Supabase

```typescript
jest.mock('@/providers/supabase/client', () => ({
  supabaseClient: {
    auth: {
      signInWithPassword: jest.fn(),
    },
  },
}));
```

### Mocking Modules

```typescript
jest.mock('module-name', () => ({
  export: jest.fn(),
}));
```

## Running Specific Tests

```bash
# Run tests for a specific file
npm test -- Button.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="Login"

# Run tests in a specific directory
npm test -- __tests__/components
```

## Debugging Tests

```bash
# Run tests with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run with debugging output
npm test -- --verbose
```

## Coverage Reports

Generate coverage report:
```bash
npm run test:coverage
```

View coverage in browser:
- HTML report generated in `coverage/` directory
- Open `coverage/lcov-report/index.html`

## CI/CD Integration

Add to your CI/CD pipeline:

```yaml
- name: Run tests
  run: npm test -- --coverage --watchAll=false

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Common Issues

### Tests Timeout
- Increase Jest timeout: `jest.setTimeout(10000)`
- Check for unresolved promises
- Ensure mocks resolve correctly

### Component Not Rendering
- Verify all required props are provided
- Check for missing mocks
- Ensure providers are properly mocked

### Async/Await Issues
- Use `waitFor()` for async operations
- Ensure promises are returned from tests
- Check async function signatures

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library Docs](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
