import { select, password, confirm, input } from '@inquirer/prompts';
import chalk from 'chalk';
import i18n from '../services/i18n.js';

/**
 * Interactive setup wizard for coParrot
 * Guides users through initial configuration with a friendly UX
 */
export async function setup() {
  // Show welcome banner (before language selection, use English)
  console.log();
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log(chalk.cyan.bold('  Welcome to coParrot!'));
  console.log(chalk.dim('  Let\'s get you set up. This will only take a minute.'));
  console.log(chalk.cyan.bold('═'.repeat(60)));
  console.log();

  try {
    // Step 1: Language Selection (always in English initially)
    const language = await selectLanguage();

    // Reinitialize i18n with selected language
    i18n.setLanguage(language);

    // Clear screen and show welcome in selected language
    console.clear();
    console.log();
    console.log(chalk.cyan.bold('═'.repeat(60)));
    console.log(chalk.cyan.bold(`  ${i18n.t('setup.welcome')}`));
    console.log(chalk.dim(`  ${i18n.t('setup.intro')}`));
    console.log(chalk.cyan.bold('═'.repeat(60)));
    console.log();

    // Step 2: LLM Provider Selection
    const provider = await selectProvider();

    // Step 3: API Key Input
    const apiKey = await promptApiKey(provider);

    // Step 4: Model Selection
    const model = getDefaultModel(provider);

    // Step 5: Commit Convention
    const commitConvention = await selectCommitConvention();

    // Step 6: Code Review Preferences
    const codeReviewStyle = await selectCodeReviewStyle();

    // Step 7: PR Message Style
    const prMessageStyle = await selectPRMessageStyle();

    // Step 8: Custom Instructions/Observations
    const customInstructions = await promptCustomInstructions();

    console.log();
    console.log(chalk.green('✓ ') + chalk.white(i18n.t('setup.setupComplete')));
    console.log();

    return {
      language,
      provider,
      apiKey,
      model,
      commitConvention,
      codeReviewStyle,
      prMessageStyle,
      customInstructions
    };

  } catch (error) {
    if (error.name === 'ExitPromptError') {
      // User cancelled setup
      console.log();
      console.log(chalk.yellow(i18n.t('setup.setupCancelled') || 'Setup cancelled.'));
      process.exit(0);
    }
    throw error;
  }
}

/**
 * Language selection step (always in English initially)
 */
async function selectLanguage() {
  const language = await select({
    message: 'Choose your preferred language:',
    choices: [
      {
        name: 'English',
        value: 'en',
        description: 'Use English throughout the app'
      },
      {
        name: 'Português (Brasil)',
        value: 'pt-BR',
        description: 'Usar Português em todo o aplicativo'
      },
      {
        name: 'Español',
        value: 'es',
        description: 'Usar Español en toda la aplicación'
      }
    ],
    default: 'en'
  });

  return language;
}

/**
 * Provider selection step with descriptions
 */
async function selectProvider() {
  console.log();

  const provider = await select({
    message: i18n.t('setup.selectProvider'),
    choices: [
      {
        name: i18n.t('setup.providers.openai'),
        value: 'openai',
        description: i18n.t('setup.providers.openaiDesc')
      },
      {
        name: i18n.t('setup.providers.claude'),
        value: 'claude',
        description: i18n.t('setup.providers.claudeDesc')
      },
      {
        name: i18n.t('setup.providers.gemini'),
        value: 'gemini',
        description: i18n.t('setup.providers.geminiDesc')
      }
    ]
  });

  return provider;
}

/**
 * API Key input with helper text
 */
async function promptApiKey(provider) {
  console.log();

  // Show helpful link to get API key
  const urls = {
    'openai': i18n.t('setup.apiKeyHelpUrls.openai'),
    'claude': i18n.t('setup.apiKeyHelpUrls.claude'),
    'gemini': i18n.t('setup.apiKeyHelpUrls.gemini')
  };

  console.log(chalk.dim('  ' + i18n.t('setup.apiKeyHelp', { url: chalk.cyan(urls[provider]) })));
  console.log();

  const apiKey = await password({
    message: i18n.t('setup.enterApiKey', { provider: chalk.bold(provider) }),
    mask: '•',
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return 'API key cannot be empty';
      }
      if (value.trim().length < 10) {
        return 'API key seems too short. Please check and try again.';
      }
      return true;
    }
  });

  return apiKey.trim();
}

/**
 * Get default model for provider
 */
function getDefaultModel(provider) {
  const defaultModels = {
    'openai': 'gpt-4',
    'claude': 'claude-3-5-sonnet-20241022',
    'gemini': 'gemini-pro'
  };

  return defaultModels[provider] || 'default';
}

/**
 * Select commit message convention
 */
async function selectCommitConvention() {
  console.log();

  const convention = await select({
    message: i18n.t('setup.selectCommitConvention'),
    choices: [
      {
        name: i18n.t('setup.commitConventions.conventional'),
        value: 'conventional',
        description: i18n.t('setup.commitConventions.conventionalDesc')
      },
      {
        name: i18n.t('setup.commitConventions.gitmoji'),
        value: 'gitmoji',
        description: i18n.t('setup.commitConventions.gitmojiDesc')
      },
      {
        name: i18n.t('setup.commitConventions.simple'),
        value: 'simple',
        description: i18n.t('setup.commitConventions.simpleDesc')
      },
      {
        name: i18n.t('setup.commitConventions.custom'),
        value: 'custom',
        description: i18n.t('setup.commitConventions.customDesc')
      }
    ],
    default: 'conventional'
  });

  return convention;
}

/**
 * Select code review style
 */
async function selectCodeReviewStyle() {
  console.log();

  const style = await select({
    message: i18n.t('setup.selectCodeReviewStyle'),
    choices: [
      {
        name: i18n.t('setup.codeReviewStyles.detailed'),
        value: 'detailed',
        description: i18n.t('setup.codeReviewStyles.detailedDesc')
      },
      {
        name: i18n.t('setup.codeReviewStyles.concise'),
        value: 'concise',
        description: i18n.t('setup.codeReviewStyles.conciseDesc')
      },
      {
        name: i18n.t('setup.codeReviewStyles.security'),
        value: 'security-focused',
        description: i18n.t('setup.codeReviewStyles.securityDesc')
      }
    ],
    default: 'detailed'
  });

  return style;
}

/**
 * Select PR message style
 */
async function selectPRMessageStyle() {
  console.log();

  const style = await select({
    message: i18n.t('setup.selectPRStyle'),
    choices: [
      {
        name: i18n.t('setup.prStyles.detailed'),
        value: 'detailed',
        description: i18n.t('setup.prStyles.detailedDesc')
      },
      {
        name: i18n.t('setup.prStyles.concise'),
        value: 'concise',
        description: i18n.t('setup.prStyles.conciseDesc')
      },
      {
        name: i18n.t('setup.prStyles.technical'),
        value: 'technical',
        description: i18n.t('setup.prStyles.technicalDesc')
      }
    ],
    default: 'detailed'
  });

  return style;
}

/**
 * Prompt for custom instructions/observations
 */
async function promptCustomInstructions() {
  console.log();

  const wantsCustom = await confirm({
    message: i18n.t('setup.wantsCustomInstructions'),
    default: false
  });

  if (!wantsCustom) {
    return '';
  }

  console.log();
  console.log(chalk.dim('  ' + i18n.t('setup.customInstructionsHelp')));
  console.log();

  const instructions = await input({
    message: i18n.t('setup.enterCustomInstructions'),
    default: '',
    validate: (value) => {
      if (value && value.length > 500) {
        return i18n.t('setup.customInstructionsTooLong') || 'Instructions too long (max 500 characters)';
      }
      return true;
    }
  });

  return instructions.trim();
}

/**
 * Test API connection (optional, can be implemented later)
 */
async function testConnection(provider, apiKey, model) {
  console.log();
  console.log(chalk.dim('  ' + i18n.t('setup.testing', { provider })));

  // TODO: Implement actual API test
  // For now, just simulate
  await new Promise(resolve => setTimeout(resolve, 1000));

  return true;
}

