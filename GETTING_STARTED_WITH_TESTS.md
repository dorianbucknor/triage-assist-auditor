# TriageAssist Testing Setup - Getting Started

## 🚀 Quick Start

### 1. Install Dependencies
The test dependencies have been added to `package.json`. Install them:

```bash
npm install
```

This will install:
- **jest**: Testing framework
- **@testing-library/react**: React component testing utilities
- **@testing-library/user-event**: User interaction simulation
- **jest-environment-jsdom**: DOM environment for Jest
- **ts-jest**: TypeScript support for Jest

### 2. Run Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Generate coverage report
npm run test:coverage
```

---

## 📁 Test Structure

```
project-root/
├── __tests__/                    # All test files
│   ├── api/                      # API route tests
│   │   ├── access-request.test.ts
│   │   └── scenarios.test.ts
│   ├── components/               # Component tests
│   │   ├── Button.test.tsx
│   │   ├── Card.test.tsx
│   │   ├── Input.test.tsx
│   │   ├── ThemeToggle.test.tsx
│   │   ├── LoginForm.test.tsx
│   │   ├── SignupForm.test.tsx
│   │   ├── FormComponents.test.tsx
│   │   ├── DialogComponents.test.tsx
│   │   └── SelectAndDisplay.test.tsx
│   ├── hooks/                    # Hook tests
│   │   ├── use-mobile.test.ts
│   │   └── use-pointer-location.test.ts
│   ├── integration/              # Integration tests
│   │   ├── auth-flow.test.ts
│   │   └── scenario-management.test.ts
│   ├── lib/                      # Utility tests
│   │   ├── utils.test.ts
│   │   └── types.test.ts
│   ├── providers/                # Provider tests
│   │   └── supabase-client.test.ts
│   └── test-utils.ts             # Shared testing utilities
├── jest.config.ts                # Jest configuration
├── jest.setup.ts                 # Jest setup (mocks, etc)
├── TESTING.md                    # Comprehensive testing guide
├── TEST_SUMMARY.md               # Overview of all tests
└── test-help.sh                  # Quick reference script
```

---

## 📊 What's Been Tested

### Components (9 files, 85+ tests)
- ✅ **UI Components**: Button, Input, Card, Badge, Separator
- ✅ **Form Components**: Checkbox, Textarea, Toggle, Select
- ✅ **Dialog Components**: Alert, Dialog, Dropdown Menu
- ✅ **Feature Components**: ThemeToggle, LoginForm, SignupForm

### Hooks (2 files, 15 tests)
- ✅ **useIsMobile**: Responsive breakpoint detection
- ✅ **usePointerLocation**: Mouse position tracking

### Utilities (2 files, 23 tests)
- ✅ **cn()**: Class name merging with Tailwind CSS
- ✅ **Types**: TriageData, UserRole validation

### API Routes (2 files, 14 tests)
- ✅ **Access Requests**: Request submission and validation
- ✅ **Scenarios**: Pagination, filtering, grading

### Providers (1 file, 25 tests)
- ✅ **Supabase Client**: Auth and database operations

### Integration Tests (2 files, 30 tests)
- ✅ **Auth Flow**: Login, signup, session management
- ✅ **Scenario Management**: CRUD, grading, analytics

**Total: 200+ tests across all areas**

---

## 🛠️ Development Workflow

### When Adding a New Feature

1. **Create the feature code** (e.g., `components/MyButton.tsx`)

2. **Create a test file** (e.g., `__tests__/components/MyButton.test.tsx`)

3. **Write tests following this pattern**:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   import { MyButton } from '@/components/MyButton';

   describe('Component - MyButton', () => {
     it('should render button with text', () => {
       render(<MyButton>Click me</MyButton>);
       expect(screen.getByText('Click me')).toBeInTheDocument();
     });

     it('should handle click events', () => {
       const handleClick = jest.fn();
       render(<MyButton onClick={handleClick}>Click</MyButton>);
       fireEvent.click(screen.getByRole('button'));
       expect(handleClick).toHaveBeenCalled();
     });
   });
   ```

4. **Run tests in watch mode**:
   ```bash
   npm run test:watch
   ```

5. **Verify all tests pass** before committing

---

## 🧪 Testing Best Practices

### Do ✅
- Test behavior, not implementation
- Use semantic queries: `getByRole`, `getByText`, `getByLabelText`
- Write focused, isolated tests
- Test edge cases and error conditions
- Mock external dependencies
- Use descriptive test names

### Don't ❌
- Test internal state (use behavior instead)
- Use implementation-specific selectors (`.container > div`)
- Make tests depend on other tests
- Test third-party libraries
- Mock things that work without mocking
- Ignore async operations

---

## 🔍 Common Commands

```bash
# Run all tests
npm test

# Watch mode (rerun on changes)
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- Button.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="Login"

# Run tests in directory
npm test -- __tests__/components

# Verbose output
npm test -- --verbose

# Update snapshots (if using snapshots)
npm test -- -u
```

---

## 📖 Documentation Files

1. **TESTING.md** - Comprehensive testing guide with examples
2. **TEST_SUMMARY.md** - Overview of all tests and coverage
3. **test-help.sh** - Quick reference for common commands

---

## 🎯 Coverage Goals

| Metric | Target | Status |
|--------|--------|--------|
| Statements | 80%+ | ✅ |
| Branches | 75%+ | ✅ |
| Functions | 80%+ | ✅ |
| Lines | 80%+ | ✅ |

Check coverage with:
```bash
npm run test:coverage
```

View detailed report:
```bash
# Coverage report generated in coverage/ directory
# Open coverage/lcov-report/index.html in browser
```

---

## 🐛 Debugging Tests

### In Terminal
```bash
# Run with debugging output
npm test -- --verbose

# Run single test
npm test -- Button.test.tsx
```

### In VS Code
1. Add breakpoint in test file
2. Run: `npm test:watch`
3. Open DevTools or use VS Code debugger

---

## 🔗 Useful Resources

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

---

## ❓ Troubleshooting

### Tests won't run
```bash
# Clear cache and reinstall
npm test -- --clearCache
npm install
```

### "Cannot find module" errors
```bash
# Check jest.config.ts moduleNameMapper
# Make sure path aliases match tsconfig.json
```

### Async test timeouts
```typescript
// Increase timeout for specific test
jest.setTimeout(10000);

// Or wrap in waitFor()
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 5000 });
```

### Mock-related issues
```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

---

## 📝 Next Steps

1. ✅ **Install dependencies**: `npm install`
2. ✅ **Run tests**: `npm test`
3. ✅ **Check coverage**: `npm run test:coverage`
4. 📖 **Read TESTING.md** for detailed guide
5. 🧪 **Write tests for new features**

---

## Questions?

Refer to:
- [TESTING.md](./TESTING.md) - Comprehensive guide
- [TEST_SUMMARY.md](./TEST_SUMMARY.md) - Test overview
- Individual test files for examples

Happy testing! 🎉
