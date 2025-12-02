# Contributing to coParrot

First off, thank you for considering contributing to coParrot! 🎉

coParrot is a community project, and we welcome contributions of all kinds: bug reports, feature requests, documentation improvements, code contributions, and more.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Adding New Features](#adding-new-features)
- [Adding Translations](#adding-translations)
- [Code Style Guidelines](#code-style-guidelines)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Community](#community)

## 🤝 Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code:

- **Be respectful**: Treat everyone with respect and courtesy
- **Be constructive**: Provide constructive feedback and criticism
- **Be collaborative**: Work together toward common goals
- **Be patient**: Remember that everyone has different experience levels

## 🎯 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title**: Describe the issue concisely
- **Steps to reproduce**: Detailed steps to recreate the bug
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Environment**: OS, Node version, coParrot version
- **Screenshots**: If applicable

**Example:**
```markdown
**Title:** Squawk fails with grouped patterns on Windows

**Steps to reproduce:**
1. Run `squawk --group "*.json" "*.js"`
2. Observe error message

**Expected:** Files should be grouped and committed
**Actual:** Error: "Pattern matching failed"

**Environment:**
- OS: Windows 11
- Node: v18.16.0
- coParrot: v1.0.0
```

### Suggesting Features

Feature suggestions are welcome! Please include:

- **Use case**: Why is this feature needed?
- **Expected behavior**: How should it work?
- **Examples**: Show examples of usage
- **Alternatives**: Have you considered alternatives?

### Contributing Code

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Test thoroughly**
5. **Commit with meaningful messages**: `git commit -m 'feat: add amazing feature'`
6. **Push to your fork**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 🛠️ Development Setup

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher
- **Git**: Latest version
- **API Key**: OpenAI, Claude, or Gemini (for testing)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/coParrot.git
cd coParrot

# Install dependencies
npm install

# Link for local development
npm link

# Now you can use 'coparrot' command globally
coparrot
```

### Development Workflow

```bash
# Make changes to the code
# ...

# Test your changes
npm start

# Or test specific command
node bin/index.js
```

### Unlinking (when done)

```bash
npm unlink -g coparrot
```

## 🏗️ Project Structure

Understanding the codebase:

```
coparrot/
├── bin/
│   └── index.js              # CLI entry point, command routing
│
├── src/
│   ├── commands/             # Command implementations
│   │   ├── add.js           # Interactive file staging
│   │   ├── commit.js        # AI-powered commits
│   │   ├── squawk.js        # Individual file commits
│   │   └── checkout.js      # Branch operations
│   │
│   ├── services/            # Core services
│   │   ├── config.js        # Configuration management
│   │   ├── git.js           # Git operations wrapper
│   │   ├── llms.js          # LLM provider orchestration
│   │   ├── i18n.js          # Internationalization
│   │   ├── prompts.js       # AI prompt templates
│   │   └── setup.js         # Interactive setup wizard
│   │
│   ├── lib/                 # UI components
│   │   ├── cli.js           # Main CLI framework
│   │   ├── renderer.js      # Markdown rendering
│   │   └── streamer.js      # Streaming output/spinners
│   │
│   └── utils/               # Utility functions
│       ├── args-parser.js   # Command-line argument parsing
│       ├── glob.js          # Pattern matching utilities
│       ├── header.js        # ASCII art header
│       └── repo-stats.js    # Repository statistics
│
├── locales/                 # Translations
│   ├── en.json             # English
│   ├── pt-BR.json          # Portuguese (Brazil)
│   └── es.json             # Spanish
│
└── package.json            # Project metadata
```

### Key Files Explained

**`bin/index.js`**
- Entry point for the CLI
- Handles command routing
- Initializes configuration and services

**`src/services/llms.js`**
- Manages LLM provider interactions
- Handles approval workflow
- Supports OpenAI, Claude, and Gemini

**`src/services/git.js`**
- Wraps git commands
- Provides clean API for git operations
- Handles error cases

**`src/lib/cli.js`**
- Main CLI framework
- Handles user input
- Manages conversation flow

**`locales/*.json`**
- Translation files
- Structured JSON with dot notation keys
- Easy to add new languages

## ✨ Adding New Features

### Adding a New Command

**1. Create command file:**

```javascript
// src/commands/mycommand.js
import chalk from 'chalk';
import i18n from '../services/i18n.js';

export async function myCommand(repo, provider, options = {}) {
  try {
    console.log(chalk.cyan('Running my command...'));

    // Your command logic here

    console.log(chalk.green('✓ Command completed!'));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    throw error;
  }
}
```

**2. Register in `bin/index.js`:**

```javascript
// Import at top
import { myCommand } from '../src/commands/mycommand.js';

// Add case in handleCommand function
case 'mycommand':
  await myCommand(repo, provider, options);
  break;

// Add to customCommands object
customCommands: {
  // ... existing commands
  'mycommand': 'Description of my command'
}
```

**3. Add translations:**

```json
// locales/en.json
{
  "commands": {
    "mycommand": {
      "title": "My Command",
      "description": "Does something cool",
      "success": "Command completed successfully!"
    }
  }
}
```

### Adding a New LLM Provider

**1. Add provider in `src/services/llms.js`:**

```javascript
case 'newprovider':
  return this._callNewProvider(context, type, customInstructions);

async _callNewProvider(context, type, customInstructions = null) {
  const response = await this.client.api.create({
    model: this.options.model || 'default-model',
    prompt: this._buildSystemPrompt(type, customInstructions),
    context: JSON.stringify(context)
  });

  return response.text;
}
```

**2. Update setup in `src/services/setup.js`:**

```javascript
{
  name: 'New Provider',
  value: 'newprovider',
  description: 'Description of the provider'
}
```

**3. Add API key URL in translations:**

```json
"apiKeyHelpUrls": {
  "newprovider": "https://newprovider.com/api-keys"
}
```

## 🌍 Adding Translations

We welcome new language translations!

### Adding a New Language

**1. Create translation file:**

```bash
cp locales/en.json locales/fr.json
```

**2. Translate all strings:**

```json
{
  "app": {
    "name": "coParrot",
    "tagline": "Votre Assistant Git"
  },
  // ... translate all keys
}
```

**3. Register language in `package.json`:**

```json
"i18n": {
  "supportedLanguages": [
    "en",
    "pt-BR",
    "es",
    "fr"  // Add new language
  ]
}
```

**4. Add to setup options in `src/services/setup.js`:**

```javascript
{
  name: 'Français',
  value: 'fr'
}
```

### Translation Guidelines

- Keep the same structure as `en.json`
- Preserve placeholders like `{count}`, `{files}`, `{message}`
- Test all UI flows in the new language
- Keep tone consistent (friendly, professional)
- Use native speakers for review when possible

## 📝 Code Style Guidelines

### General Principles

- **Clear over clever**: Write code that's easy to understand
- **Consistent**: Follow existing patterns
- **Documented**: Add JSDoc comments for functions
- **Tested**: Ensure your code works

### JavaScript Style

```javascript
// Use ES6 modules
import { something } from './module.js';

// Use async/await over promises
async function doSomething() {
  const result = await fetchData();
  return result;
}

// Descriptive variable names
const userSelectedFiles = getUserSelection();

// JSDoc for public functions
/**
 * Commits files with AI-generated messages
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider
 * @param {Object} options - Command options
 * @returns {Promise<void>}
 */
export async function commit(repo, provider, options) {
  // Implementation
}

// Error handling
try {
  await riskyOperation();
} catch (error) {
  console.error(chalk.red('Error:'), error.message);
  throw error;
}
```

### File Naming

- **Commands**: Lowercase, verb-based: `add.js`, `commit.js`, `squawk.js`
- **Services**: Lowercase, noun-based: `git.js`, `config.js`, `llms.js`
- **Utils**: Lowercase, descriptive: `glob.js`, `args-parser.js`

### Git Commit Messages

Follow Conventional Commits:

```
feat: add new command for branch management
fix: resolve pattern matching issue on Windows
docs: update installation instructions
chore: update dependencies
refactor: simplify error handling
test: add tests for glob utility
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting)
- `refactor`: Code refactoring
- `test`: Tests
- `chore`: Maintenance

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Fresh installation works (`npm install`)
- [ ] Setup wizard completes successfully
- [ ] All commands work as expected
- [ ] Error cases are handled gracefully
- [ ] Works on different operating systems (if possible)
- [ ] Translations display correctly
- [ ] No console errors or warnings

### Testing Commands

```bash
# Test basic commands
coparrot
> add
> status
> commit
> squawk

# Test with options
> squawk --ignore "*.md"
> squawk --group "*.json" "*.png"

# Test setup
> setup

# Test different languages
> setup  # Change language in setup
```

### Testing Providers

Test with all supported providers:
- OpenAI (GPT-4, GPT-3.5)
- Claude (Sonnet, Opus)
- Gemini

## 🔄 Pull Request Process

### Before Submitting

1. **Update documentation** if you've added features
2. **Add translations** for new UI strings
3. **Test thoroughly** on your local machine
4. **Check code style** matches project guidelines
5. **Write clear commit messages**

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Translation
- [ ] Refactoring

## Testing
Describe how you tested this

## Screenshots
If applicable, add screenshots

## Checklist
- [ ] My code follows the project style
- [ ] I've added necessary translations
- [ ] I've updated documentation
- [ ] I've tested on my machine
- [ ] My commits follow conventional commits
```

### Review Process

1. **Automated checks**: Code will be checked automatically
2. **Maintainer review**: A maintainer will review your code
3. **Feedback**: Address any requested changes
4. **Merge**: Once approved, your PR will be merged!

### After Your PR is Merged

🎉 **Congratulations!** You're now a coParrot contributor!

- Your name will be added to the contributors list
- Your contribution will be included in the next release
- Thank you for making coParrot better!

## 💬 Community

### Getting Help

- **Questions**: Open a [Discussion](https://github.com/ddVital/coParrot/discussions)
- **Bugs**: Open an [Issue](https://github.com/ddVital/coParrot/issues)
- **Chat**: Join our community (coming soon)

### Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes
- Project README

## 📚 Resources

- [Node.js Documentation](https://nodejs.org/docs)
- [Inquirer.js (for prompts)](https://github.com/SBoudrias/Inquirer.js)
- [Chalk (for colors)](https://github.com/chalk/chalk)
- [Conventional Commits](https://www.conventionalcommits.org)

## 🙏 Thank You

Your contributions make coParrot better for everyone. Whether you're fixing typos, adding features, or improving documentation - every contribution matters!

---

**Questions?** Open an issue or discussion, and we'll help you get started!

Happy coding! 🦜✨
