import chalk from 'chalk';
import ora from 'ora';
import { createHeader } from '../utils/header.js';

/**
 * Handles streaming output with elegant formatting
 */
class StreamingOutput {
  constructor(renderer) {
    this.renderer = renderer;
    this.currentSpinner = null;
    this.buffer = '';
  }

  /**
   * Start streaming text output
   */
  startStream() {
    this.buffer = '';
  }

  /**
   * Add chunk to stream
   */
  addChunk(chunk) {
    this.buffer += chunk;
    // Stream word by word for natural feel
    process.stdout.write(chunk);
  }

  /**
   * End the current stream
   */
  endStream() {
    if (this.buffer) {
      process.stdout.write('\n\n');
      this.buffer = '';
    }
  }

  /**
   * Show a thinking indicator
   */
  startThinking(message = 'Thinking...') {
    if (this.currentSpinner) {
      this.currentSpinner.stop();
    }

    this.currentSpinner = ora({
      text: chalk.dim(message),
      color: 'cyan',
      spinner: 'dots'
    }).start();
  }

  /**
   * Stop thinking indicator
   */
  stopThinking() {
    if (this.currentSpinner) {
      this.currentSpinner.stop();
      this.currentSpinner = null;
    }
  }

  /**
   * Update thinking message
   */
  updateThinking(message) {
    if (this.currentSpinner) {
      this.currentSpinner.text = chalk.dim(message);
    }
  }

  /**
   * Show tool execution
   */
  showToolExecution(toolName, description) {
    this.stopThinking();
    process.stdout.write(this.renderer.renderToolUse(toolName, description));

    this.startThinking(`Running ${toolName}...`);
  }

  /**
   * Show tool result
   */
  showToolResult(toolName, success = true) {
    this.stopThinking();
    process.stdout.write(this.renderer.renderToolResult(toolName, success));
  }

  /**
   * Display error message
   */
  showError(error) {
    this.stopThinking();
    console.error('\n' + chalk.red.bold('Error: ') + chalk.red(error.message || error));
    console.error(chalk.gray('─'.repeat(process.stdout.columns || 80)));
  }

  /**
   * Display success message
   */
  showSuccess(message) {
    this.stopThinking();
    console.log('\n' + chalk.green('✓ ') + chalk.white(message));
  }

  /**
   * Display info message
   */
  showInfo(message) {
    this.stopThinking();
    console.log('\n' + chalk.cyan('ℹ ') + chalk.white(message));
  }

  showGitInfo(context) {
    this.stopThinking();
    context.map(change => {
      console.log(`${change.status} ${change.value} ${change.additions > 0 ? '+ ' + change.additions : ''} ${change.deletions > 0 ? '- ' + change.deletions : ''}`)
    })
  }

  /**
   * Display warning message
   */
  showWarning(message) {
    this.stopThinking();
    console.log('\n' + chalk.yellow('⚠ ') + chalk.white(message));
  }

  /**
   * Display a separator
   */
  showSeparator() {
    const width = process.stdout.columns || 80;
    console.log(chalk.gray('─'.repeat(width)));
  }

  /**
   * Clear the console
   */
  clear() {
    console.clear();
  }

  /**
   * Display welcome banner with gradient header
   */
  showWelcome(appName = 'CoParrot', version = '1.0.0', config = {}) {
    this.clear();
    console.log();

    // Display gradient header
    const header = createHeader(appName);
    console.log(header);

    // Display version and tagline
    console.log(chalk.dim(`  v${version}`) + chalk.cyan('  •  ') + chalk.dim('Your Git Assistant'));
    console.log();

    // Show helpful info for first-time users
    if (!config.provider) {
      console.log(chalk.yellow('  ⚡ First time? Run setup to get started!'));
      console.log();
    }

    console.log(chalk.dim('  Type your message or use /help for commands'));
    console.log();
    this.showSeparator();
  }
}

export default StreamingOutput;
