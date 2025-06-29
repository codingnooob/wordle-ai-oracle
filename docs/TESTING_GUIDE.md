
# Testing Guide

## 🧪 Testing Framework

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Generate coverage report
```

### Testing Stack
- **Jest** for unit testing
- **React Testing Library** for component testing
- **Supertest** for API testing
- **MSW** for mocking HTTP requests

## ✅ Writing Tests

### Unit Tests
Write unit tests for utility functions:

```typescript
describe('ComponentName', () => {
  it('should handle normal case', () => {
    // Test implementation
  });

  it('should handle edge case', () => {
    // Test implementation
  });

  it('should handle error case', () => {
    // Test implementation
  });
});
```

### Component Tests
Test React components with user interactions:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interaction', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Updated Text')).toBeInTheDocument();
  });
});
```

### Integration Tests
Test complex workflows and API interactions:

```typescript
describe('Wordle Analysis Integration', () => {
  it('should analyze wordle puzzle correctly', async () => {
    // Mock API calls
    // Test full workflow
    // Verify results
  });
});
```

## 📊 Testing Requirements

### Coverage Goals
- **Aim for >80% code coverage**
- **100% coverage** for critical ML algorithms
- **Test all error conditions** and edge cases
- **Mock external dependencies** (API calls, etc.)

### Testing Checklist
- [ ] Unit tests for utility functions
- [ ] Component tests for UI interactions
- [ ] Integration tests for workflows
- [ ] Error handling tests
- [ ] Performance tests for ML operations
- [ ] Accessibility tests

## 🔧 Testing Utilities

### Mock Setup
```typescript
// Mock external services
jest.mock('./apiService', () => ({
  analyzeWordle: jest.fn(),
}));

// Mock React hooks
jest.mock('./useCustomHook', () => ({
  useCustomHook: () => ({
    data: mockData,
    loading: false,
    error: null,
  }),
}));
```

### Test Data
- Create reusable test fixtures
- Use factory functions for test data
- Keep test data realistic but minimal
- Store complex test data in separate files

## 🚀 Continuous Integration

### Pre-commit Hooks
- Run tests before commit
- Lint and format code
- Type checking
- Security scanning

### CI Pipeline
- Run full test suite
- Generate coverage reports
- Performance benchmarks
- Security audits
