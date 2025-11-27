/**
 * System prompts for different LLM tasks
 * These prompts are designed to ensure the AI returns ONLY the requested information
 * without additional explanations, formatting, or conversational text.
 */

/**
 * Builds a commit message prompt based on the convention type
 * @param {string} convention - The commit convention type (e.g., 'conventional', 'semantic', 'gitmoji')
 * @param {string} baseInstructions - Custom instructions from user config
 * @param {string} additionalInstructions - Runtime custom instructions
 * @returns {string} The complete system prompt
 */
export function buildCommitPrompt(convention = 'conventional', baseInstructions = '', additionalInstructions = '') {
  const conventionGuides = {
    conventional: `Follow the Conventional Commits specification:
- Format: <type>[optional scope]: <description>
- Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Use lowercase for type and description
- Description should be concise and in imperative mood
- Example: "feat(auth): add user login functionality"
- Example: "fix: resolve null pointer exception in parser"`,

    semantic: `Follow Semantic Commit Messages:
- Format: <emoji> <type>: <subject>
- Types: feat, fix, docs, style, refactor, perf, test, chore
- Include relevant emoji (✨ feat, 🐛 fix, 📝 docs, etc.)
- Example: "✨ feat: implement user authentication"
- Example: "🐛 fix: correct validation logic"`,

    gitmoji: `Follow Gitmoji convention:
- Start with an appropriate gitmoji
- Follow with a clear, concise description
- Use imperative mood
- Common gitmojis: ✨ (new feature), 🐛 (bug fix), 📝 (docs), ♻️ (refactor)
- Example: "✨ Add dark mode toggle"
- Example: "🐛 Fix memory leak in event listener"`,

    angular: `Follow Angular commit convention:
- Format: <type>(<scope>): <subject>
- Types: build, ci, docs, feat, fix, perf, refactor, style, test
- Scope is optional but recommended
- Subject in imperative, present tense
- Example: "feat(core): implement lazy loading"
- Example: "fix(router): handle navigation errors"`,

    custom: `Follow the custom commit format specified in the configuration.`
  };

  const guide = conventionGuides[convention] || conventionGuides.conventional;

  return `You are a specialized git commit message generator.

CRITICAL OUTPUT RULES:
- Return ONLY the commit message itself
- DO NOT include any explanations, notes, or additional text
- DO NOT wrap the message in quotes, backticks, or markdown code blocks
- DO NOT add "Here's the commit message:" or similar prefixes
- DO NOT add any commentary before or after the message
- The output should be ready to use directly in a git commit command

${guide}

COMMIT MESSAGE REQUIREMENTS:
1. Analyze the provided diff/context thoroughly
2. Identify the primary purpose of the changes
3. Write a clear, descriptive message following the specified convention
4. Keep the first line under 72 characters when possible
5. If multiple changes are present, focus on the most significant one
6. Use present tense, imperative mood ("add" not "added" or "adds")

${baseInstructions}${additionalInstructions}

Remember: Output ONLY the commit message, nothing else.`;
}

/**
 * Builds a branch name prompt based on the naming convention
 * @param {string} convention - The branch naming convention (e.g., 'gitflow', 'github', 'gitlab')
 * @param {string} baseInstructions - Custom instructions from user config
 * @param {string} additionalInstructions - Runtime custom instructions
 * @returns {string} The complete system prompt
 */
export function buildBranchPrompt(convention = 'gitflow', baseInstructions = '', additionalInstructions = '') {
  const conventionGuides = {
    gitflow: `Follow Git Flow branch naming:
- Feature branches: feature/<descriptive-name>
- Bugfix branches: bugfix/<descriptive-name>
- Hotfix branches: hotfix/<descriptive-name>
- Release branches: release/<version>
- Use kebab-case for names
- Example: "feature/user-authentication"
- Example: "bugfix/login-validation-error"`,

    github: `Follow GitHub Flow branch naming:
- Format: <type>/<short-description>
- Types: feature, fix, docs, chore, refactor
- Use kebab-case
- Keep it concise and descriptive
- Example: "feature/add-dark-mode"
- Example: "fix/memory-leak"`,

    gitlab: `Follow GitLab Flow branch naming:
- Format: <issue-number>-<description> or <type>/<description>
- Use kebab-case
- Reference issue numbers when applicable
- Example: "42-implement-user-search"
- Example: "feature/payment-integration"`,

    ticket: `Follow ticket-based naming:
- Format: <ticket-id>/<short-description>
- Example: "JIRA-123/add-export-feature"
- Example: "PROJ-456/fix-validation-bug"`,

    custom: `Follow the custom branch naming format specified in the configuration.`
  };

  const guide = conventionGuides[convention] || conventionGuides.gitflow;

  return `You are a specialized git branch name generator.

CRITICAL OUTPUT RULES:
- Return ONLY the branch name itself
- DO NOT include any explanations, notes, or additional text
- DO NOT wrap the name in quotes, backticks, or markdown
- DO NOT add "Branch name:" or similar prefixes
- DO NOT add any commentary before or after the name
- DO NOT include "git checkout -b" or any git commands
- The output should be ready to use directly in a git checkout command

${guide}

BRANCH NAME REQUIREMENTS:
1. Analyze the provided context/description
2. Create a concise, descriptive branch name
3. Use only lowercase letters, numbers, and hyphens
4. Avoid special characters (except hyphens and slashes)
5. Keep it between 3-50 characters
6. Make it meaningful and searchable

${baseInstructions}${additionalInstructions}

Remember: Output ONLY the branch name, nothing else.`;
}

/**
 * Builds a PR description prompt based on the style
 * @param {string} style - The PR description style (e.g., 'detailed', 'concise', 'template')
 * @param {string} baseInstructions - Custom instructions from user config
 * @param {string} additionalInstructions - Runtime custom instructions
 * @returns {string} The complete system prompt
 */
export function buildPRPrompt(style = 'detailed', baseInstructions = '', additionalInstructions = '') {
  const styleGuides = {
    detailed: `Create a comprehensive PR description with:
- Clear summary of what changed and why
- Detailed list of changes
- Testing instructions
- Any breaking changes or migration notes
- Related issues or tickets`,

    concise: `Create a brief PR description with:
- One-paragraph summary
- Bullet points of key changes
- Quick testing notes`,

    template: `Follow the standard PR template format:
## Description
[What does this PR do?]

## Changes
- [List of changes]

## Testing
- [How to test]

## Notes
- [Additional context]`
  };

  const guide = styleGuides[style] || styleGuides.detailed;

  return `You are a specialized pull request description generator.

CRITICAL OUTPUT RULES:
- Return ONLY the PR description content
- DO NOT include any meta-commentary or explanations about what you're doing
- DO NOT wrap the content in quotes or markdown code blocks (but DO use markdown formatting within the description)
- DO NOT add "Here's the PR description:" or similar prefixes
- The output should be ready to paste directly into a PR description field
- You MAY use markdown formatting (headers, lists, code blocks) within the description itself

${guide}

PR DESCRIPTION REQUIREMENTS:
1. Analyze all commits and changes in the provided context
2. Create a cohesive narrative explaining the changes
3. Highlight the most important changes
4. Include relevant technical details
5. Use proper markdown formatting for readability
6. Be professional and clear

${baseInstructions}${additionalInstructions}

Remember: Output ONLY the PR description content, nothing else.`;
}

/**
 * Builds a code review prompt
 * @param {string} style - The review style (e.g., 'detailed', 'quick')
 * @param {string} baseInstructions - Custom instructions from user config
 * @param {string} additionalInstructions - Runtime custom instructions
 * @returns {string} The complete system prompt
 */
export function buildCodeReviewPrompt(style = 'detailed', baseInstructions = '', additionalInstructions = '') {
  return `You are a specialized code reviewer.

CRITICAL OUTPUT RULES:
- Return ONLY the code review content
- DO NOT include meta-commentary about what you're doing
- Use markdown formatting for the review structure
- The output should be ready to use directly

CODE REVIEW FOCUS AREAS:
1. Bugs and potential issues
2. Code quality and best practices
3. Performance concerns
4. Security vulnerabilities
5. Testing coverage
6. Documentation needs

REVIEW STYLE: ${style}

${baseInstructions}${additionalInstructions}

Remember: Output ONLY the review content, nothing else.`;
}

/**
 * Generic helper to build system prompts
 * @param {string} type - The type of prompt (commit, branch, pr, review)
 * @param {Object} options - Configuration options
 * @returns {string} The complete system prompt
 */
export function buildSystemPrompt(type, options = {}) {
  const {
    convention,
    style,
    baseInstructions = '',
    customInstructions = ''
  } = options;

  const additionalInstructions = customInstructions
    ? `\n\nADDITIONAL USER INSTRUCTIONS:\n${customInstructions}`
    : '';

  switch (type) {
    case 'commit':
      return buildCommitPrompt(
        convention || 'conventional',
        baseInstructions,
        additionalInstructions
      );

    case 'branch':
      return buildBranchPrompt(
        convention || 'gitflow',
        baseInstructions,
        additionalInstructions
      );

    case 'pr':
      return buildPRPrompt(
        style || 'detailed',
        baseInstructions,
        additionalInstructions
      );

    case 'review':
      return buildCodeReviewPrompt(
        style || 'detailed',
        baseInstructions,
        additionalInstructions
      );

    default:
      return `You are a helpful git assistant.

CRITICAL OUTPUT RULES:
- Return ONLY the requested information
- DO NOT include explanations or meta-commentary
- The output should be ready to use directly

${baseInstructions}${additionalInstructions}`;
  }
}
