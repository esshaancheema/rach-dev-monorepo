# Contributing to Zoptal

Thank you for your interest in contributing to Zoptal! This document provides guidelines and
information for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18.19.0+ (use the version specified in `.nvmrc`)
- pnpm 8.0.0+
- Docker & Docker Compose
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/zoptal-monorepo.git
   cd zoptal-monorepo
   ```

3. Add the upstream remote:
   ```bash
   git remote add upstream https://github.com/zoptal/zoptal-monorepo.git
   ```

## ⚙️ Development Setup

### Quick Setup

1. **Install dependencies:**

   ```bash
   pnpm install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development services:**

   ```bash
   # Start databases
   docker-compose up -d postgres redis

   # Generate database schema
   pnpm db:generate
   pnpm db:push

   # Start all services
   pnpm dev
   ```

### Service-Specific Development

```bash
# Work on specific services
pnpm --filter auth-service dev
pnpm --filter web-main dev
pnpm --filter @zoptal/ui dev

# Run multiple specific services
pnpm --filter auth-service --filter web-main dev
```

## 📝 Contributing Guidelines

### Types of Contributions

We welcome the following types of contributions:

- 🐛 **Bug Fixes**: Fix identified issues
- ✨ **New Features**: Add new functionality
- 📚 **Documentation**: Improve or add documentation
- 🎨 **UI/UX**: Improve user interface and experience
- ⚡ **Performance**: Optimize performance
- 🔒 **Security**: Security improvements
- 🧪 **Tests**: Add or improve tests
- 🔧 **Tooling**: Improve development tools

### Contribution Areas

#### High Priority

- Service implementations (project-service, ai-service, billing-service)
- Authentication integration across apps
- API client improvements
- Performance optimizations

#### Medium Priority

- UI component library enhancements
- Infrastructure improvements
- Testing coverage
- Documentation improvements

#### Low Priority

- Code quality improvements
- Minor bug fixes
- Development tooling enhancements

## 🔄 Pull Request Process

### Before You Start

1. **Check existing issues** to avoid duplicate work
2. **Create an issue** for large changes to discuss the approach
3. **Keep changes focused** - one feature/fix per PR

### PR Workflow

1. **Create a feature branch:**

   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make your changes** following our coding standards

3. **Test thoroughly:**

   ```bash
   # Run tests
   pnpm test

   # Run type checking
   pnpm type-check

   # Run linting
   pnpm lint

   # Run formatting
   pnpm format
   ```

4. **Commit with conventional commits:**

   ```bash
   git commit -m "feat(auth): add OAuth provider support"
   git commit -m "fix(ui): resolve button styling issue"
   git commit -m "docs(readme): update setup instructions"
   ```

5. **Push and create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### PR Requirements

- ✅ All tests pass
- ✅ Code is properly formatted and linted
- ✅ Type checking passes
- ✅ Documentation is updated if needed
- ✅ Conventional commit messages
- ✅ PR description follows template

### PR Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Team members review the code
3. **Testing**: Manual testing if needed
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash and merge into main branch

## 💻 Coding Standards

### General Guidelines

- **Follow existing patterns** in the codebase
- **Write readable code** with meaningful names
- **Add comments** for complex logic
- **Keep functions small** and focused
- **Use TypeScript** for type safety

### Code Style

- **Prettier** for code formatting (automatic)
- **ESLint** for code quality (see .eslintrc.js)
- **TypeScript** strict mode enabled
- **Consistent naming conventions**

### Naming Conventions

```typescript
// Files and directories
kebab-case: auth-service, user-profile.tsx

// Variables and functions
camelCase: getUserProfile, isAuthenticated

// Types and interfaces
PascalCase: UserProfile, AuthProvider

// Constants
UPPER_SNAKE_CASE: API_BASE_URL, MAX_RETRY_ATTEMPTS

// Components
PascalCase: UserProfile, AuthButton
```

### Project Structure

```
apps/               # Next.js applications
├── web-main/       # Public website
├── dashboard/      # User dashboard
├── admin/          # Admin panel
└── developer-portal/ # Developer docs

services/           # Microservices
├── auth-service/   # Authentication
├── project-service/ # Project management
└── ...

packages/           # Shared packages
├── ui/             # UI components
├── database/       # Database schemas
└── config/         # Shared configurations

libs/               # Shared libraries
├── utils/          # Utilities
├── types/          # TypeScript types
└── api-client/     # API client
```

## 🧪 Testing Guidelines

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test service interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Ensure performance standards

### Writing Tests

```typescript
// Unit test example
describe('auth service', () => {
  it('should authenticate valid user', async () => {
    const result = await authService.login(validCredentials);
    expect(result.success).toBe(true);
  });
});

// Component test example
describe('AuthButton', () => {
  it('should render login button when not authenticated', () => {
    render(<AuthButton isAuthenticated={false} />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });
});
```

### Test Requirements

- **Coverage**: Aim for >80% coverage
- **Test Names**: Descriptive test names
- **Arrange-Act-Assert**: Clear test structure
- **Mock External Dependencies**: Use mocks for external services

### Running Tests

```bash
# All tests
pnpm test

# Specific workspace
pnpm --filter auth-service test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage

# E2E tests
pnpm test:e2e
```

## 📖 Documentation

### Documentation Types

- **Code Comments**: Inline documentation
- **README Files**: Setup and usage instructions
- **API Documentation**: OpenAPI/Swagger specs
- **Architecture Docs**: System design documentation
- **User Guides**: End-user documentation

### Documentation Standards

- **Clear and Concise**: Easy to understand
- **Up to Date**: Keep docs current with code changes
- **Examples**: Include code examples
- **Links**: Link to related documentation

### Adding Documentation

```bash
# Service documentation
services/auth-service/README.md
services/auth-service/docs/

# Package documentation
packages/ui/README.md
packages/ui/docs/

# General documentation
docs/
├── architecture/
├── deployment/
└── api/
```

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, include:

- **Environment**: OS, Node.js version, pnpm version
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: If applicable
- **Logs**: Relevant error logs

### Feature Requests

When requesting features, include:

- **Problem Description**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other solutions considered
- **Additional Context**: Any other relevant information

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `help wanted`: Extra attention needed
- `good first issue`: Good for newcomers
- `priority: high`: High priority
- `type: security`: Security related

## 🏷️ Commit Message Format

We use [Conventional Commits](https://conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Test changes
- `build`: Build system changes
- `ci`: CI configuration changes
- `chore`: Maintenance tasks

### Examples

```bash
feat(auth): add OAuth provider support
fix(ui): resolve button styling in dark mode
docs(readme): update installation instructions
test(auth): add unit tests for login flow
perf(api): optimize database queries
```

## 🎯 Development Workflow

### Daily Development

1. **Sync with upstream:**

   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create feature branch:**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Develop and test:**

   ```bash
   pnpm dev
   pnpm test
   pnpm lint
   ```

4. **Commit and push:**

   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   git push origin feature/amazing-feature
   ```

5. **Create Pull Request** on GitHub

### Release Process

Releases are handled by maintainers using [Changesets](https://github.com/changesets/changesets):

1. **Create changeset:**

   ```bash
   pnpm changeset
   ```

2. **Version packages:**

   ```bash
   pnpm changeset version
   ```

3. **Publish:**
   ```bash
   pnpm changeset publish
   ```

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and discussions
- **Email**: eshancheema@zoptal.com for private matters

### Getting Support

1. **Search existing issues** and discussions
2. **Check documentation** in README and docs/
3. **Ask in discussions** for general questions
4. **Create an issue** for bugs or feature requests

## 🏆 Recognition

We appreciate all contributions! Contributors will be:

- **Listed in CONTRIBUTORS.md**
- **Mentioned in release notes**
- **Invited to our contributor Discord**
- **Eligible for contributor perks**

## 📜 License

By contributing to Zoptal, you agree that your contributions will be licensed under the same license
as the project.

---

Thank you for contributing to Zoptal! Your efforts help make this project better for everyone. 🚀
