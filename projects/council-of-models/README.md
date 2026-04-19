# Council of Models

[![Python 3.7+](https://img.shields.io/badge/python-3.7+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> A Python framework for orchestrating structured debates between AI agents with different roles.

## 🎯 What It Does

Five AI agents with distinct perspectives debate topics and reach unified, well-reasoned decisions.

| Role | Purpose |
|------|---------|
| 🧐 **Critic** | Questions assumptions, finds flaws |
| 📊 **Planner** | Organizes steps, thinks strategically |
| 🔧 **Builder** | Focuses on implementation |
| 🧪 **Tester** | Identifies edge cases |
| 📚 **Historian** | Brings context from past experiences |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/Porfirio-Piero/council-of-models.git
cd council-of-models

# Install (pure Python, no deps required)
pip install -e .

# Run a debate
python -m council_of_models "What language for our new API?"
```

## 📦 Installation

```bash
# From source
git clone https://github.com/Porfirio-Piero/council-of-models.git
cd council-of-models
pip install -e .

# Or just copy the folder - it's pure Python!
```

## 💻 Usage

### Python API

```python
from council_of_models import DebateOrchestrator, DebateConfig, AgentConfig

orchestrator = DebateOrchestrator()
config = DebateConfig(topic="Should we use microservices?", max_rounds=3)

agents = [
    AgentConfig(role_name="critic"),
    AgentConfig(role_name="planner"),
    AgentConfig(role_name="builder"),
]

session = orchestrator.create_debate(config, agents)
orchestrator.start_debate(session.id)

# Run rounds
for i in range(config.max_rounds):
    messages = orchestrator.run_debate_round(session.id)

# Get decision
result = orchestrator.finalize_debate(session.id)
print(result['decision'])
```

### CLI

```bash
# Simple debate
python -m council_of_models "What database should we use?"

# With options
python -m council_of_models "Complex decision" --rounds 5 --verbose

# List roles
python -m council_of_models --list-roles
```

## 🏗️ Architecture

```
council-of-models/
├── agents/           # Agent definitions and roles
├── core/            # Orchestration and debate logic
├── examples/        # Example debates
└── tests/           # Unit tests
```

## 🔌 Connecting Real LLMs

By default uses simulated responses. To connect real LLMs, edit `agents/agent.py`:

```python
def generate_response(self, ...):
    # Add your LLM API call here
    # OpenAI, Anthropic, Ollama all work
    pass
```

## 🧪 Testing

```bash
python -m pytest tests/
```

## 📄 License

MIT - free for personal and commercial use.

## 🙏 Credits

Built with inspiration from multi-agent deliberation systems and ensemble AI approaches.

---

**Made by** [Porfirio-Piero](https://github.com/Porfirio-Piero)
