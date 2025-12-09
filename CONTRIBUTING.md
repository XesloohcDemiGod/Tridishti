# Contributing to Tridishti

Thank you for your interest in contributing to Tridishti! We welcome contributions from developers of all skill levels.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Submitting Changes](#submitting-changes)
- [Community](#community)

## 🤝 Code of Conduct

This project follows a code of conduct inspired by the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you agree to:

- Be respectful and inclusive
- Focus on constructive feedback
- Accept responsibility for mistakes
- Show empathy towards other contributors
- Help create a positive community

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18.0 or higher
- **VS Code**: Version 1.80 or higher
- **Git**: Latest stable version
- **TypeScript**: Version 5.0 or higher

### Setup

```bash
# Fork and clone the repository
git clone https://github.com/XesloohcDemiGod/Tridishti.git
cd tridishti

# Install dependencies
npm install

# Compile the project
npm run compile

# Run tests
npm test
```

### Development Commands

```bash
# Start compilation in watch mode
npm run watch

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Lint code
npm run lint
```

## 🔄 Development Workflow

### 1. Choose an Issue

- Check [GitHub Issues](https://github.com/XesloohcDemiGod/Tridishti/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch

```bash
# Create and switch to a feature branch
git checkout -b feature/your-feature-name

# Or for bug fixes
git checkout -b fix/issue-number-description
```

### 3. Make Changes

- Follow the [code standards](#code-standards)
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 4. Commit Changes

```bash
# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: add new feature description

- What was changed
- Why it was changed
- Any breaking changes
"

# Follow conventional commit format
# Types: feat, fix, docs, style, refactor, test, chore
```

## 📏 Code Standards

### TypeScript

- **Strict mode**: All TypeScript strict checks enabled
- **Interface naming**: All interfaces prefixed with `I` (e.g., `IYatra`, `IJnana`)
- **Type definitions**: Prefer interfaces over types for object shapes
- **Null checks**: Use strict null checks, avoid `any` type

### Code Style

- **ESLint**: Follow all ESLint rules
- **Prettier**: Code formatted with Prettier
- **Imports**: Group imports by external libraries, then internal modules
- **Naming**: Use descriptive, Sanskrit-inspired names where appropriate

### Architecture

- **Separation of concerns**: Each module has a single responsibility
- **Dependency injection**: Core modules accept dependencies
- **Event-driven**: Use VS Code's event system for loose coupling
- **Error handling**: Graceful error handling with user feedback

### Example Code Structure

```typescript
/**
 * JSDoc comment explaining the class/module purpose
 * Maps to Jnana/Karma/Bhakti pillar
 */
export class ExampleClass {
  private config: IExampleConfig;
  private eventEmitter: vscode.EventEmitter<ICoreEvent>;

  /**
   * Constructor with dependency injection
   */
  constructor(config: IExampleConfig, eventEmitter: vscode.EventEmitter<ICoreEvent>) {
    this.config = config;
    this.eventEmitter = eventEmitter;
  }

  /**
   * Public method with JSDoc
   * @param param Description of parameter
   * @returns Description of return value
   */
  public async exampleMethod(param: string): Promise<IResult> {
    // Implementation
  }
}
```

## 🧪 Testing

### Test Structure

- **Unit tests**: Test individual modules in isolation
- **Integration tests**: Test module interactions
- **Snapshot tests**: UI component testing
- **Coverage**: Maintain >80% code coverage

### Writing Tests

```typescript
describe('ExampleClass', () => {
  let instance: ExampleClass;
  let mockEmitter: any;

  beforeEach(() => {
    mockEmitter = (global as any).testUtils.createMockEventEmitter();
    instance = new ExampleClass(config, mockEmitter);
  });

  describe('exampleMethod', () => {
    it('should return expected result', async () => {
      const result = await instance.exampleMethod('test');
      expect(result).toBeDefined();
    });

    it('should handle edge cases', async () => {
      await expect(instance.exampleMethod('')).rejects.toThrow();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/core/example.test.ts

# Run with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📚 Documentation

### Code Documentation

- **JSDoc**: All public APIs must have JSDoc comments
- **Examples**: Include usage examples in JSDoc
- **Parameters**: Document all parameters and return values
- **Philosophy mapping**: Explain how features map to Jnana/Karma/Bhakti

### README Updates

- Update README.md for new features
- Add examples and usage instructions
- Update badges and version information

### API Documentation

- Maintain API documentation in `/docs`
- Update for breaking changes
- Include migration guides

## 📤 Submitting Changes

### Pull Request Process

1. **Ensure tests pass**: All tests must pass locally
2. **Update documentation**: README, API docs, etc.
3. **Squash commits**: Combine related commits into logical units
4. **Write clear description**: Explain what and why, not how

### PR Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Refactoring

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes
```

### Review Process

- At least one maintainer review required
- CI checks must pass
- Conflicts resolved before merge
- Squash and merge for clean history

## 🌐 Community

### Communication

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General discussion and Q&A
- **Pull Request comments**: Code review feedback

### Getting Help

- Check existing issues and documentation first
- Use descriptive titles for issues
- Provide minimal reproduction cases for bugs
- Include VS Code version and OS information

### Recognition

Contributors are recognized in:

- GitHub's contributor insights
- Release notes
- Special mentions in documentation

## 🎯 Development Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and milestones.

### Priority Areas

- **Performance**: Optimize for large codebases
- **Accessibility**: Improve screen reader support
- **Internationalization**: Multi-language support
- **Integrations**: GitHub, Obsidian, time tracking tools

---

Thank you for contributing to Tridishti! Your efforts help create a more mindful and productive development experience for everyone.

_"The best way to find yourself is to lose yourself in the service of others."_
— Mahatma Gandhi
