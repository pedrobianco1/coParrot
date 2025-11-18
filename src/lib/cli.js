import inquirer from 'inquirer';
import chalk from 'chalk';
import MarkdownRenderer from './renderer.js';
import StreamingOutput from './streamer.js';
import i18n from '../services/i18n.js';

/**
 * Main CLI Interface
 */
class CLI {
  constructor(options = {}) {
    this.options = {
      appName: options.appName || 'CoParrot',
      version: options.version || '1.0.0',
      prompt: options.prompt || '> ',
      multiline: options.multiline !== false,
      ...options
    };

    this.config = options.config || {};

    this.renderer = new MarkdownRenderer({
      width: process.stdout.columns || 80
    });

    this.streamer = new StreamingOutput(this.renderer);
    this.conversationHistory = [];
    this.isRunning = false;
  }

  /**
   * Start the CLI interface
   */
  async start() {
    this.streamer.showWelcome(this.options.appName, this.options.version, this.config);
    this.isRunning = true;

    // Handle graceful shutdown
    process.on('SIGINT', () => this.shutdown());
    process.on('SIGTERM', () => this.shutdown());

    await this.mainLoop();
  }

  /**
   * Main interaction loop
   */
  async mainLoop() {
    while (this.isRunning) {
      try {
        const userInput = await this.getUserInput();

        if (!userInput || userInput.trim() === '') {
          continue;
        }

        // Handle special commands
        if (userInput.startsWith('/')) {
          await this.handleCommand(userInput);
          continue;
        }

        // Process regular message
        await this.processMessage(userInput);

      } catch (error) {
        if (error.isTtyError) {
          this.streamer.showError(i18n.t('cli.messages.renderError'));
          break;
        } else {
          this.streamer.showError(error);
        }
      }
    }
  }

  /**
   * Get user input with multiline support
   */
  async getUserInput() {
    const answer = await inquirer.prompt([
      {
        type: 'input',
        name: 'message',
        message: chalk.cyan(this.options.prompt),
        default: '',
        waitUserInput: true,
        // Use editor for multiline, input for single line
        ...(this.options.multiline ? {} : { type: 'input' })
      }
    ]);

    return answer.message.trim();
  }

  /**
   * Process a user message
   */
  async processMessage(message) {
    // Add to history
    this.conversationHistory.push({
      role: 'user',
      content: message
    });

    console.log();
    this.streamer.showSeparator();

    // Show that we're thinking
    this.streamer.startThinking('Processing your request...');

    this.streamer.stopThinking();
    console.log();
    this.streamer.showSeparator();
  }

  /**
   * Handle special commands
   */
  async handleCommand(command) {
    const [cmd, ...args] = command.slice(1).split(' ');

    switch (cmd.toLowerCase()) {
      case 'help':
        this.showHelp();
        break;

      case 'clear':
        this.streamer.clear();
        this.streamer.showWelcome(this.options.appName, this.options.version);
        break;

      case 'history':
        this.showHistory();
        break;

      case 'exit':
      case 'quit':
        await this.shutdown();
        break;

      default:
        // Call custom command handler if provided
        if (this.options.onCommand) {
          await this.options.onCommand(cmd, args, this);
        } else {
          this.streamer.showError(i18n.t('cli.messages.unknownCommand', { cmd }));
          this.streamer.showInfo(i18n.t('cli.messages.helpHint'));
        }
    }
  }

  /**
   * Show help message
   */
  showHelp() {
    console.log();
    console.log(chalk.white.bold(i18n.t('cli.messages.availableCommands') + ':'));
    console.log();
    console.log(chalk.cyan(`  /${i18n.t('cli.commands.help')}`) + chalk.dim(`     - ${i18n.t('cli.commandDescriptions.help')}`));
    console.log(chalk.cyan(`  /${i18n.t('cli.commands.clear')}`) + chalk.dim(`    - ${i18n.t('cli.commandDescriptions.clear')}`));
    console.log(chalk.cyan(`  /${i18n.t('cli.commands.history')}`) + chalk.dim(`  - ${i18n.t('cli.commandDescriptions.history')}`));
    console.log(chalk.cyan(`  /${i18n.t('cli.commands.exit')}`) + chalk.dim(`     - ${i18n.t('cli.commandDescriptions.exit')}`));

    if (this.options.customCommands) {
      console.log();
      console.log(chalk.white.bold(i18n.t('cli.messages.customCommands') + ':'));
      console.log();
      for (const [cmd, description] of Object.entries(this.options.customCommands)) {
        console.log(chalk.cyan(`  /${cmd}`) + chalk.dim(`     - ${description}`));
      }
    }

    console.log();
  }

  /**
   * Show conversation history
   */
  showHistory() {
    console.log();
    console.log(chalk.white.bold(i18n.t('cli.history.title') + ':'));
    console.log();

    if (this.conversationHistory.length === 0) {
      console.log(chalk.dim('  ' + i18n.t('cli.history.empty')));
      console.log();
      return;
    }

    this.conversationHistory.forEach((entry, index) => {
      const roleColor = entry.role === 'user' ? chalk.cyan : chalk.green;
      const roleLabel = entry.role === 'user' ? i18n.t('cli.history.you') : i18n.t('cli.history.assistant');

      console.log(roleColor.bold(`  ${roleLabel}:`));
      console.log(chalk.dim(`  ${entry.content.substring(0, 100)}${entry.content.length > 100 ? '...' : ''}`));
      console.log();
    });
  }

  /**
   * Shutdown the CLI gracefully
   */
  async shutdown() {
    this.streamer.stopThinking();
    console.log();
    this.streamer.showInfo(i18n.t('app.goodbye') + ' 👋');
    console.log();
    this.isRunning = false;
    process.exit(0);
  }

  /**
   * Simulate streaming response (for demonstration)
   */
  async simulateStreaming(text, delayMs = 20) {
    this.streamer.startStream();

    const words = text.split(' ');
    for (const word of words) {
      this.streamer.addChunk(word + ' ');
      await this.sleep(delayMs);
    }

    this.streamer.endStream();
  }

  /**
   * Display a response with markdown
   */
  displayResponse(markdown) {
    const rendered = this.renderer.render(markdown);
    console.log(rendered);

    // Add to history
    this.conversationHistory.push({
      role: 'assistant',
      content: markdown
    });
  }

  /**
   * Display tool usage
   */
  displayToolUse(toolName, description) {
    this.streamer.showToolExecution(toolName, description);
  }

  /**
   * Display tool result
   */
  displayToolResult(toolName, success = true) {
    this.streamer.showToolResult(toolName, success);
  }

  /**
   * Utility: Sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default CLI;
