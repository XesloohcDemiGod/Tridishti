# Tridishti 👁️👁️👁️

> **Code with threefold vision — knowledge, action, reflection**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/) [![VS Code](https://img.shields.io/badge/VS%20Code-1.80%2B-blue.svg)](https://code.visualstudio.com/) [![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/) [![Jest](https://img.shields.io/badge/Jest-tested-brightgreen.svg)](https://jestjs.io/) [![codecov](https://codecov.io/gh/XesloohcDemiGod/Tridishti/branch/main/graph/badge.svg)](https://codecov.io/gh/XesloohcDemiGod/Tridishti) [![GitHub issues](https://img.shields.io/github/issues/XesloohcDemiGod/Tridishti)](https://github.com/XesloohcDemiGod/Tridishti/issues)

## What is Tridishti?

**Tridishti** is a VS Code extension that transforms your coding sessions into mindful, productive journeys. Inspired by ancient Indian philosophy, it integrates **Jnana (Knowledge)**, **Karma (Action)**, and **Bhakti (Reflection)** into modern development workflows.

Beyond a productivity tool, Tridishti is about intentional development—setting clear goals, tracking meaningful milestones, capturing learning moments, and reflecting on your progress.

### Key Differentiator

While most productivity tools focus on *what* you accomplish, **Tridishti focuses on *how* and *why*** you work. It bridges the gap between raw productivity metrics and meaningful, sustainable development practices through structured reflection and intentional practice.

---

## ✨ Core Features

### 🧵 Jnana (Knowledge Module)
- **Capture Knowledge**: Record insights, gotchas, patterns, solutions, and questions as you code
- **Smart Search**: Index and retrieve knowledge by category, tags, or full-text search
- **Smriti Recall**: Revisit past learnings in future sessions
- **Context Awareness**: Link knowledge to specific files, lines, and sessions

### ⚡ Karma (Action Module)
- **Sutra Checkpoints**: Periodic snapshots of your coding state with manual or automatic triggers
- **Karma Phala Milestones**: Mark significant achievements with scoring and git integration
- **Dharma Alignment Check**: Detect scope drift and ensure focus on your initial intention
- **Yatra Sessions**: Structure entire coding journeys with clear intentions (Sankalpa) and outcomes

### 🪞 Bhakti (Reflection Module)
- **Atma Vichara**: Guided end-session reflection prompts
- **Drishti Dashboard**: Analytics on productivity, focus, and learning patterns
- **Health Monitoring**: Extension performance and resource usage metrics
- **Session Analytics**: Understand your coding rhythms and optimize work patterns

### 🎯 Intelligent Features
- **Real-time File Watching**: Automatic change detection during sessions
- **Smart Nudges**: Context-aware reminders based on your workflow strategy
- **Git Integration**: Automatic tagging and branch management
- **Data Persistence**: Local-first architecture with optional cloud sync (future)

---

## 🚀 Quick Start

### Installation

1. **From VS Code Marketplace** (Coming soon)
   - Search for "Tridishti" in VS Code Extensions
   - Click Install

2. **From Source**
   ```bash
   git clone https://github.com/XesloohcDemiGod/Tridishti.git
   cd Tridishti
   npm install
   npm run compile
   # In VS Code: Ctrl+Shift+P > Extensions: Install from VSIX
   ```

### First Steps

1. **Set Your Sankalpa** (`Cmd/Ctrl+Shift+P` → "Tridishti: Create Yatra")
   - Define your coding intention for the session

2. **Start Capturing** (`Cmd/Ctrl+Shift+P` → "Tridishti: Capture Jnana")
   - Record insights as they emerge

3. **Mark Milestones** (`Cmd/Ctrl+Shift+P` → "Tridishti: Create Karma Phala")
   - Celebrate achievements and progress

4. **Reflect** (`Cmd/Ctrl+Shift+P` → "Tridishti: End Session")
   - Guided reflection to consolidate learning

---

## 🛠️ Commands Reference

| Command | Shortcut (Windows/Linux) | Shortcut (Mac) | Description |
|---------|--------------------------|----------------|-------------|
| Start New Yatra | - | - | Start a new coding session |
| Create Sutra | `Ctrl+Alt+S` | `Cmd+Alt+S` | Create a checkpoint snapshot |
| Create Karma Phala | `Ctrl+Alt+M` | `Cmd+Alt+M` | Mark a milestone achievement |
| Capture Jnana | `Ctrl+Alt+J` | `Cmd+Alt+J` | Record knowledge or insights |
| Check Dharma | - | - | Verify scope alignment |
| Show Yatra | `Ctrl+Alt+Y` | `Cmd+Alt+Y` | View current session details |
| Show Drishti | `Ctrl+Alt+D` | `Cmd+Alt+D` | Open analytics dashboard |
| End Session | - | - | Guided reflection (Atma Vichara) |

---

## ⚙️ Configuration

Customize Tridishti via VS Code Settings (`Cmd+,`):

```json
{
  "tridishti.enabled": true,
  "tridishti.checkpointInterval": 30,          // minutes
  "tridishti.milestoneThreshold": 120,         // minutes
  "tridishti.scopeCheckInterval": 60,          // minutes
  "tridishti.fileChangeThreshold": 10,         // max files
  "tridishti.nudgeStrategy": "default",        // deep-work|exploration|maintenance
  "tridishti.autoCommit": false,
  "tridishti.autoTag": false,
  "tridishti.learningCategories": [
    "insight", "gotcha", "pattern", "solution", "question"
  ]
}
```

---

## 📊 Project Status

### Metrics
- **~5,000** lines of TypeScript code
- **90%+** test coverage (Jest)
- **100+** test cases
- Multi-platform support (Windows, macOS, Linux)
- VS Code 1.80+ compatibility

### Architecture
- 8 core modules (Jnana, Karma, Bhakti)
- Strict TypeScript with JSDoc
- Comprehensive Jest test suite
- ESLint + Prettier + GitHub Actions CI/CD

---

## 🧪 Development

### Setup

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-compile)
npm run watch

# Run tests
npm test

# Generate coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

### Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Run specific test file
npm test -- src/core/sutra-checkpoints.test.ts
```

### Building

```bash
# Create VSIX package
npm run package

# Output: Tridishti-*.vsix
```

---

## 🎯 Roadmap

### Phase 3: UX Polish & Core Features (Q1 2025)
- Onboarding flow with Sankalpa creation
- Timeline visualization for session history
- Notification system with smart nudges
- Keyboard shortcuts for quick access
- Git integration with auto-tagging
- Performance optimization
- Accessibility improvements

### Phase 4: Advanced Analytics (Q2 2025)
- Drishti Dashboard enhancements
- ML-driven scope drift prediction
- Productivity pattern recognition
- Advanced visualizations (heat maps, network graphs)

### Phase 5: Ecosystem Integration (Q3 2025)
- GitHub, GitLab, Jira integration
- Obsidian, Notion, Logseq sync
- Slack/Teams notifications
- Toggl and RescueTime integration

### Phase 6: Platform Expansion (Q4 2025)
- Multi-IDE support (Cursor, JetBrains, Vim)
- Web version of Drishti
- Mobile companion app
- REST API and SDK

### Phase 7+: Collaboration & Innovation (2026+)
- Team collaboration features
- Enterprise SSO and audit logging
- Advanced AI insights
- Academic research partnerships

See the full [ROADMAP](./ROADMAP.md) for detailed plans.

---

## 📚 Documentation

- **[Quick Start Guide](./docs/QUICKSTART.md)** - Get started in 5 minutes
- **[User Guide](./docs/USER_GUIDE.md)** - Complete feature documentation
- **[API Reference](./docs/API_REFERENCE.md)** - TypeScript types and interfaces
- **[Contributing Guide](./CONTRIBUTING.md)** - How to contribute
- **[Security Policy](./SECURITY.md)** - Security reporting
- **[FAQ](./docs/FAQ.md)** - Common questions and answers

---

## 🤝 Contributing

We welcome contributions from developers of all skill levels! Here's how you can help:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/Tridishti.git`
3. **Create** a feature branch: `git checkout -b feature/your-feature`
4. **Make** your changes and add tests
5. **Run** `npm run lint && npm test` to verify
6. **Commit** with clear messages: `git commit -m "feat: description"`
7. **Push** and create a Pull Request

### Code Quality

We maintain high standards:
- ✅ TypeScript strict mode
- ✅ 90%+ test coverage (Jest)
- ✅ ESLint + Prettier formatted
- ✅ JSDoc comments on public APIs
- ✅ Semantic versioning

### Areas We Need Help

- 🎨 UI/UX improvements and design
- 🧪 Expanding test coverage
- 📖 Documentation and tutorials
- 🌍 Translations and localization
- 🐛 Bug fixes and issue triage
- ⚡ Performance optimizations

---

## 💡 Philosophy

Tridishti draws inspiration from profound philosophical traditions:

**Bhagavad Gita 2:47** — "You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions."

This principle guides our approach: focus on the *process* of intentional, mindful coding rather than just output metrics. By cultivating Jnana (understanding), Karma (disciplined action), and Bhakti (reflective practice), we enable sustainable, meaningful development.

---

## 📦 Requirements

- **VS Code**: 1.80.0 or later
- **Node.js**: 18.0.0 or later (for development)
- **Git**: For version control features
- **Platform**: Windows, macOS, or Linux

---

## 📄 License

Tridishti is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

```
Copyright © 2025 Tridishti Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

## 💬 Support & Community

- 📝 **[GitHub Issues](https://github.com/XesloohcDemiGod/Tridishti/issues)** - Report bugs or request features
- 💬 **[GitHub Discussions](https://github.com/XesloohcDemiGod/Tridishti/discussions)** - Ask questions and share ideas
- 📧 **Email**: contact@tridishti.dev
- 🌐 **[Website](https://tridishti.dev)** - Learn more and read blog posts
- 🐦 **Twitter**: [@Tridishti](https://twitter.com/tridishti) (coming soon)

---

## 🙏 Acknowledgments

### Philosophical Foundations
- **Bhagavad Gita** - Teachings on Jnana, Karma, and Bhakti
- **Puranic Traditions** - Ancient Indian wisdom
- **Buddhist Mindfulness** - Present-moment awareness

### Technical Inspiration
- **VS Code Extension API** - Rich development platform
- **TypeScript Community** - Modern, type-safe development
- **Jest, ESLint, Prettier** - Developer tooling excellence
- **Open Source Community** - Collaborative spirit

### Contributors
Special thanks to all contributors! See the [Contributors](https://github.com/XesloohcDemiGod/Tridishti/graphs/contributors) page.

---

## 🚀 Made with ❤️

Built for developers who believe in intentional, mindful, and sustainable coding practices.

**"The journey of a thousand lines of code begins with a single Sankalpa."** — Lao Tzu (adapted)
