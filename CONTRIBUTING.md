
# Contributing to Wordly AI Oracle

Thank you for your interest in contributing to Wordly AI Oracle! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/yourusername/wordly-ai-oracle.git
   cd wordly-ai-oracle
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Add your Supabase credentials
   ```
5. **Start development server**:
   ```bash
   npm run dev
   ```

## 🎯 How to Contribute

### Reporting Issues
- **Search existing issues** before creating new ones
- **Use issue templates** when available
- **Provide detailed information**: steps to reproduce, expected vs actual behavior
- **Include system information**: browser, Node.js version, OS

### Suggesting Features
- **Open a discussion** first for major features
- **Describe the use case** and why it's needed
- **Consider backwards compatibility**
- **Provide implementation ideas** if possible

### Code Contributions

#### Before You Start
- **Check existing issues** and pull requests
- **Discuss major changes** in an issue first
- **Follow the coding standards** outlined below

#### Development Workflow
1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Commit with descriptive messages**:
   ```bash
   git commit -m "feat: add word frequency analysis"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** with a clear description

## 📋 Coding Standards

### TypeScript/React Guidelines
- **Use TypeScript** for all new code
- **Define interfaces** for all props and data structures
- **Use functional components** with hooks
- **Follow React best practices** (proper key props, avoid inline functions, etc.)
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

### ML/AI Code Guidelines
- **Document ML models** and their purposes
- **Include performance metrics** when applicable
- **Use proper error handling** for AI operations
- **Add logging** for debugging ML processes
- **Consider edge cases** (network failures, invalid data, etc.)

### Security Guidelines
- **Validate all inputs** using SecurityUtils
- **Sanitize user data** before processing
- **Use rate limiting** for public endpoints
- **Never log sensitive information**
- **Follow OWASP security practices**

## 🧪 Testing

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Run in watch mode
npm run test:coverage     # Generate coverage report
```

### Writing Tests
- **Write unit tests** for utility functions
- **Write integration tests** for complex workflows
- **Test error conditions** and edge cases
- **Mock external dependencies** (API calls, etc.)
- **Aim for >80% code coverage**

### Test Structure
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

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   └── *.tsx            # Feature components
├── utils/               # Utility functions
│   ├── ml/              # Machine learning utilities
│   ├── security/        # Security utilities
│   └── *.ts             # General utilities
├── hooks/               # Custom React hooks
├── pages/               # Page components
├── integrations/        # External service integrations
└── types/               # TypeScript type definitions
```

## 🔧 Environment Setup

### Required Tools
- **Node.js 18+** and npm
- **Git** for version control
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense

### Supabase Setup
1. **Create a Supabase project**
2. **Copy your project URL and keys**
3. **Add to `.env.local`**
4. **Deploy edge functions** (if contributing to backend):
   ```bash
   supabase functions deploy
   ```

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

## 📚 Documentation

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

## 🔍 Review Process

### Pull Request Guidelines
- **Clear title and description**
- **Link related issues**
- **Include screenshots** for UI changes
- **List breaking changes** if any
- **Ensure CI passes** before requesting review

### Review Criteria
- **Code quality** and maintainability
- **Test coverage** for new features
- **Performance** impact
- **Security** considerations
- **Documentation** completeness
- **Backwards compatibility**

## 🚀 Release Process

### Versioning
We follow [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] Security audit passed
- [ ] Performance benchmarks stable

## 🎯 Areas for Contribution

### High Priority
- **ML model improvements**: Better word prediction algorithms
- **Performance optimization**: Faster analysis and rendering
- **Mobile experience**: Enhanced mobile UI/UX
- **Accessibility**: WCAG 2.1 AA compliance
- **Testing**: Increased test coverage

### Medium Priority
- **Additional word sources**: More comprehensive word lists
- **Analytics**: User behavior and model performance tracking
- **Internationalization**: Multi-language support
- **Themes**: Additional UI themes and customization

### Documentation Needs
- **API documentation**: Comprehensive API docs
- **Tutorials**: Step-by-step guides
- **Architecture docs**: System design documentation
- **Deployment guides**: Platform-specific deployment instructions

## 🤝 Code of Conduct

### Our Standards
- **Be respectful** and inclusive
- **Provide constructive feedback**
- **Focus on the code**, not the person
- **Help newcomers** get started
- **Acknowledge contributions**

### Unacceptable Behavior
- Harassment, discrimination, or trolling
- Spam or off-topic discussions
- Sharing private information without consent
- Any form of malicious activity

## 📞 Getting Help

### Resources
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Documentation**: README and inline code docs

### Contact
- **Project Maintainers**: Open an issue for direct contact
- **Security Issues**: Report privately via GitHub Security tab

## 🎉 Recognition

Contributors are recognized in:
- **README.md**: Major contributors listed
- **Release notes**: Feature contributors mentioned
- **GitHub**: Contributor graph and statistics

Thank you for contributing to Wordly AI Oracle! Your efforts help make this project better for everyone. 🚀
