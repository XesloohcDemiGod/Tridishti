# 📑 Tridishti Technical Feature Specification

## 1. 🎯 Project Identity

- **Name:** Tridishti
- **Tagline:** _Code with threefold vision — knowledge, action, reflection._
- **Philosophy:** Inspired by the Bhagavad Gita and Puranic principles, Tridishti integrates **Jnana (knowledge)**, **Karma (action)**, and **Bhakti (reflection)** into developer workflows.

---

## 2. 🧱 Core Modules

| Module               | Sanskrit Concept  | Purpose               | Key Features                                      |
| -------------------- | ----------------- | --------------------- | ------------------------------------------------- |
| **SutraCheckpoints** | Sutra (thread)    | Periodic checkpoints  | Configurable interval, auto‑commit option         |
| **KarmaPhala**       | Fruits of action  | Milestone tracking    | Git tags, milestone nudges                        |
| **DharmaSankata**    | Crisis of purpose | Scope drift detection | File change threshold, goal alignment             |
| **YatraManager**     | Journey           | Session lifecycle     | Start/stop sessions, Sankalpa reminders           |
| **JnanaCapture**     | Knowledge         | Insight logging       | Categories: insight, gotcha, solution, pattern    |
| **SmritiRecall**     | Memory            | Context recovery      | Auto‑save, restore last state                     |
| **AtmaVichara**      | Self‑inquiry      | Reflection            | Guided prompts, end‑session review                |
| **DrishtiDashboard** | Vision            | Analytics             | Heatmaps, productivity trends, Sankalpa alignment |

---

## 3. ⚙️ Configuration Options

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

---

## 4. 🧠 Agent Prompt Template

This template ensures **precise, error‑free one‑shot generation** when interacting with AI agents.

```text
SYSTEM ROLE:
You are Tridishti’s development agent. Your role is to generate exact, error-free specifications, code stubs, or documentation aligned with the threefold vision (Jnana, Karma, Bhakti). Always produce complete outputs in one shot.

CONTEXT:
- Project: Tridishti (VS Code extension)
- Modules: SutraCheckpoints, KarmaPhala, DharmaSankata, YatraManager, JnanaCapture, SmritiRecall, AtmaVichara, DrishtiDashboard
- Philosophy: Inspired by Gita/Puranas, mapping coding flow to knowledge, action, reflection

INSTRUCTIONS:
1. Always generate **full, self-contained outputs** (no placeholders).
2. Use **TypeScript** for code stubs.
3. Use **Markdown** for documentation.
4. Align naming with Sanskrit metaphors.
5. Ensure **error-free syntax** and **consistent imports**.
6. Include **comments** explaining philosophical mapping.
7. Never leave TODOs — resolve them in output.

OUTPUT FORMAT:
- For code: TypeScript files with JSDoc comments.
- For docs: Markdown with headings, lists, tables.
- For configs: JSON with valid schema.

MEMORY NOTES:
- Always recall Tridishti’s threefold vision.
- Map features to Jnana (knowledge), Karma (action), Bhakti (reflection).
- Preserve consistency across README, package.json, and source modules.
- Ensure extensibility for plugins and integrations.
```

---

## 5. 📝 Memory Notes for Development

- **Consistency:** All commands, configs, and docs must use `tridishti.*` namespace.
- **Philosophy:** Every feature maps to Jnana, Karma, or Bhakti.
- **Error Prevention:**
  - Validate JSON schemas.
  - Ensure TypeScript strict mode compliance.
  - Run ESLint + Prettier before commits.
- **Extensibility:**
  - Plugin hooks: `onCheckpoint`, `onMilestone`, `onReflection`.
  - Export system: Markdown, JSON, CSV, HTML.
- **Testing:**
  - Jest unit tests for each module.
  - Target >80% coverage.

---

## 6. 🚀 Roadmap Alignment

- **Phase 1:** Refactor modules (done).
- **Phase 2:** Persistence + plugin system.
- **Phase 3:** UX (timeline, onboarding, Sankalpa reminders).
- **Phase 4:** Advanced analytics (Drishti).
- **Phase 5:** Integrations (GitHub, Obsidian, time tracking).
- **Phase 6:** Branding (chakra logo, triadic palette).
- **Phase 7:** AI insights (scope drift prediction, session summarizer).
- **Phase 8:** Team collaboration (shared sutras, cloud sync).
