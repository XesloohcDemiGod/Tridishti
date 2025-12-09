# Tridishti 👁️👁️👁️

> Code with threefold vision — knowledge, action, reflection

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/VS_Code-1.80+-blue.svg)](https://code.visualstudio.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Jest](https://img.shields.io/badge/Jest-tested-green.svg)](https://jestjs.io/)
[![CI](https://github.com/XesloohcDemiGod/Tridishti/actions/workflows/ci.yml/badge.svg)](https://github.com/XesloohcDemiGod/Tridishti/actions)
[![codecov](https://codecov.io/gh/XesloohcDemiGod/Tridishti/branch/main/graph/badge.svg)](https://codecov.io/gh/XesloohcDemiGod/Tridishti)
[![GitHub issues](https://img.shields.io/github/issues/XesloohcDemiGod/Tridishti.svg)](https://github.com/XesloohcDemiGod/Tridishti/issues)
[![GitHub stars](https://img.shields.io/github/stars/XesloohcDemiGod/Tridishti.svg)](https://github.com/XesloohcDemiGod/Tridishti/stargazers)

Tridishti is a VS Code extension that integrates the ancient Indian philosophy of **Jnana (knowledge)**, **Karma (action)**, and **Bhakti (reflection)** into modern developer workflows. It helps developers maintain productive, mindful coding sessions through structured reflection, milestone tracking, and continuous learning.

## 🎯 Philosophy

Drawing inspiration from the Bhagavad Gita and Puranic traditions, Tridishti maps software development to spiritual practice:

- **Jnana (Knowledge)**: Learning and insight capture
- **Karma (Action)**: Milestone tracking and workflow management
- **Bhakti (Reflection)**: Self-inquiry and continuous improvement

## ✨ Features

### Core Modules

- **🧵 Sutra Checkpoints**: Periodic reflection threads that capture your coding state
- **🌸 Karma Phala Milestones**: Track the "fruits of action" with scoring and Git integration
- **⚠️ Dharma Sankata Detection**: Scope drift alerts to maintain focus on intentions
- **🚶 Yatra Session Management**: Structured coding journeys with Sankalpa (intentions)

### Learning & Memory

- **📚 Jnana Capture**: Capture insights, patterns, solutions, and gotchas
- **📝 Smriti Recall**: Indexed knowledge retrieval with pluggable storage backends
- **🔍 Smart Search**: Find knowledge by category, tags, or content

### Reflection & Analytics

- **🪞 Atma Vichara**: Guided self-inquiry and end-session reflection
- **📊 Drishti Dashboard**: Analytics and productivity insights
- **📈 Health Monitoring**: Extension status and performance metrics

## 🚀 Installation

### From Source

```bash
git clone https://github.com/XesloohcDemiGod/Tridishti.git
cd tridishti
npm install
npm run compile
```

### VS Code Extension

1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Install from VSIX"
4. Select the compiled `.vsix` file

## 🛠️ Usage

### Quick Start

1. **Set Your Sankalpa**: Define your coding intention for the session
2. **Start a Yatra**: Begin a structured coding session
3. **Capture Jnana**: Record insights and learnings as you code
4. **Create Milestones**: Mark significant achievements
5. **Reflect**: Use Atma Vichara for guided self-inquiry

### Commands

- `Tridishti: Create Sutra` - Manually create a checkpoint
- `Tridishti: Create Karma Phala Milestone` - Mark a milestone
- `Tridishti: Capture Jnana` - Record knowledge or insights
- `Tridishti: Check Dharma Alignment` - Verify scope alignment
- `Tridishti: Show Current Yatra` - View active session
- `Tridishti: Show Drishti Dashboard` - View analytics
- `Tridishti: End Session (Atma Vichara)` - Guided reflection

### Configuration

Configure Tridishti through VS Code settings:

```json
{
  "tridishti.enabled": true,
  "tridishti.checkpointInterval": 30,
  "tridishti.milestoneThreshold": 120,
  "tridishti.scopeCheckInterval": 60,
  "tridishti.fileChangeThreshold": 10,
  "tridishti.nudgeStrategy": "default",
  "tridishti.autoCommit": false,
  "tridishti.autoTag": false,
  "tridishti.learningCategories": ["insight", "gotcha", "pattern", "solution", "question"]
}
```

## 🧪 Development

### Prerequisites

- Node.js 18+
- VS Code 1.80+
- TypeScript 5.0+

### Setup

```bash
npm install
npm run compile
npm test
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Building

```bash
# Compile TypeScript
npm run compile

# Watch mode compilation
npm run watch

# Lint code
npm run lint
```

## 📚 API Documentation

### Core Types

```typescript
interface ISutraCheckpoint {
  id: string;
  timestamp: number;
  message?: string;
  filesChanged: string[];
  gitCommitHash?: string;
}

interface IKarmaPhala {
  id: string;
  milestoneId: string;
  timestamp: number;
  score: number;
  duration: number;
  filesModified: string[];
  gitTag?: string;
}

interface IJnana {
  id: string;
  category: JnanaCategory;
  content: string;
  context?: {
    file?: string;
    line?: number;
    timestamp: number;
    yatraId?: string;
  };
  tags?: string[];
}
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Ensure all tests pass
6. Submit a pull request

### Code Quality

- TypeScript strict mode enabled
- ESLint and Prettier configured
- Jest test coverage >80%
- JSDoc comments on all public APIs
- Semantic versioning

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Inspired by:

- Bhagavad Gita teachings on Jnana, Karma, and Bhakti
- Puranic concepts of Dharma and Yatra
- Modern productivity and mindfulness practices

## 📞 Support

- [GitHub Issues](https://github.com/XesloohcDemiGod/Tridishti/issues)
- [Discussions](https://github.com/XesloohcDemiGod/Tridishti/discussions)
- [Documentation](https://tridishti.dev)

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Clone your fork: `git clone https://github.com/XesloohcDemiGod/Tridishti.git`
3. Create a feature branch: `git checkout -b feature/your-feature`
4. Install dependencies: `npm install`
5. Make your changes and add tests
6. Run the test suite: `npm test`
7. Submit a pull request

### Development Commands

```bash
npm run compile    # Compile TypeScript
npm run watch      # Watch mode compilation
npm test           # Run test suite
npm run lint       # Lint code
npm run test:coverage # Generate coverage report
```

## 📊 Project Status

### 📈 Metrics

- **Lines of Code**: ~5000+ lines
- **Test Coverage**: 90%+ (Jest)
- **Supported Platforms**: Windows, macOS, Linux
- **VS Code Versions**: 1.80+

### 🏗️ Architecture

- **Modules**: 8 core modules (Jnana, Karma, Bhakti)
- **Languages**: TypeScript (primary), JavaScript (compiled)
- **Testing**: Jest with VS Code API mocking
- **Build**: npm scripts with TypeScript compilation

## 📖 Documentation

- **[📚 README](README.md)** - Installation and usage guide
- **[🤝 Contributing](CONTRIBUTING.md)** - Development guidelines
- **[🛡️ Security](SECURITY.md)** - Security policy and reporting
- **[📋 Changelog](CHANGELOG.md)** - Version history
- **[🗺️ Roadmap](ROADMAP.md)** - Future development plans
- **[📋 Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards

## 🎯 Roadmap

See our [Roadmap](ROADMAP.md) for upcoming features and planned improvements.

### Recently Completed ✅

- Complete extension implementation with Jnana, Karma, Bhakti integration
- Comprehensive test suite with 100+ test cases
- Full documentation and contribution guidelines
- CI/CD pipeline with GitHub Actions

### Upcoming 🚧

- Advanced AI insights for productivity optimization
- Team collaboration features
- Cloud synchronization
- Mobile companion app

## 🙏 Acknowledgments

### Philosophical Inspiration

- **Bhagavad Gita**: Jnana, Karma, and Bhakti teachings
- **Puranic Traditions**: Ancient Indian wisdom and philosophy
- **Buddhist Mindfulness**: Present-moment awareness in development

### Technical Acknowledgments

- **VS Code Extension API**: Rich platform for extension development
- **TypeScript Community**: Strong typing and developer experience
- **Open Source Community**: Jest, ESLint, Prettier, and countless other tools

### Contributors

We appreciate all contributors who help make Tridishti better!

<a href="https://github.com/XesloohcDemiGod/Tridishti/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=XesloohcDemiGod/Tridishti" />
</a>

## 📞 Contact & Support

- **📧 Email**: [contact@tridishti.dev](mailto:contact@tridishti.dev)
- **🐛 Issues**: [GitHub Issues](https://github.com/XesloohcDemiGod/Tridishti/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/XesloohcDemiGod/Tridishti/discussions)
- **📖 Documentation**: [GitHub Wiki](https://github.com/XesloohcDemiGod/Tridishti/wiki)

## 📜 License

Copyright © 2025 Tridishti Team.

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

_"You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions."_
— Bhagavad Gita 2.47
