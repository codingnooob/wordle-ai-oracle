
# Coding Standards

## 📋 TypeScript/React Guidelines

### General Principles
- **Use TypeScript** for all new code
- **Define interfaces** for all props and data structures
- **Use functional components** with hooks
- **Follow React best practices** (proper key props, avoid inline functions)
- **Use descriptive variable names**
- **Add JSDoc comments** for complex functions

### Code Style
- **Use Prettier** for formatting (configured in the project)
- **Use ESLint** rules (configured in the project)
- **2 spaces** for indentation
- **Single quotes** for strings
- **Semicolons** at end of statements

### File Organization
- **Create focused components** (50 lines or less when possible)
- **Use proper file naming**: PascalCase for components, camelCase for utilities
- **Organize imports**: external libraries first, then internal modules
- **Create utility files** for reusable logic

## 🤖 ML/AI Code Guidelines

### Documentation
- **Document ML models** and their purposes
- **Include performance metrics** when applicable
- **Add logging** for debugging ML processes
- **Consider edge cases** (network failures, invalid data)

### Error Handling
- **Use proper error handling** for AI operations
- **Provide fallback mechanisms** for ML failures
- **Validate inputs** before processing
- **Handle async operations** properly

## 🔒 Security Guidelines

### Input Validation
- **Validate all inputs** using SecurityUtils
- **Sanitize user data** before processing
- **Use rate limiting** for public endpoints
- **Never log sensitive information**
- **Follow OWASP security practices**

### API Security
- **Validate API inputs** strictly
- **Use proper authentication** where required
- **Implement rate limiting**
- **Sanitize error messages** before returning to client

## 🎨 UI/UX Guidelines

### Design Principles
- **Mobile-first** responsive design
- **Accessibility** (proper ARIA labels, keyboard navigation)
- **Consistent spacing** using Tailwind CSS classes
- **Clear visual hierarchy**
- **Fast loading times**

### Component Guidelines
- **Use shadcn/ui components** when possible
- **Follow design system** colors and typography
- **Add loading states** for async operations
- **Provide user feedback** for actions
- **Handle error states** gracefully

## 📝 Documentation Standards

### Code Documentation
- **Document public APIs** with JSDoc
- **Add inline comments** for complex logic
- **Update README** for new features
- **Create examples** for new utilities

### Commit Messages
Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code restructuring
- `test:` test additions/modifications
- `chore:` maintenance tasks

Examples:
```
feat: add word frequency analysis to ML pipeline
fix: resolve constraint validation edge case
docs: update self-hosting guide with Docker instructions
```
