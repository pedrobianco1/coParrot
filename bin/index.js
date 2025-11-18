#!/usr/bin/env node

import CLI from '../src/lib/cli.js';
import gitRepository from '../src/services/git.js'
import { program } from 'commander';
import chalk from 'chalk';
import { loadConfig, setupConfig } from '../src/services/config.js'
import { gitAdd } from '../src/commands/add.js'

// Configure commander
program
  .name('coparrot')
  .description('your git assistant')
  .version('1.0.0')
  .option('-s, --single-line', 'Use single-line input instead of editor')
  .parse(process.argv);

const options = program.opts();

/**
 * Example: Custom command handler
 */
async function handleCommand(cmd, args, cli) {
  const repo = new gitRepository();
  const status = repo.getDetailedStatus();

  switch (cmd) {
    case 'test':
      cli.streamer.showSuccess('Test command executed successfully!');
      break;

    case 'demo':
      cli.streamer.showInfo('Running demo...');
      await cli.simulateStreaming(
        'This is a demonstration of the streaming output feature. ' +
        'Text appears word by word, creating a natural conversation flow. ' +
        'You can customize the speed and behavior as needed.',
        30
      );
      break;
    case 'status':
      cli.streamer.showGitInfo(status)
      break;
    case 'add':
      gitAdd(repo, status) 
      break;
    default:
      cli.streamer.showError(`Unknown command: /${cmd}`);
      cli.streamer.showInfo('Available custom commands: /test, /demo');
  }
}

/**
 * Start the CLI
 */
async function main() {
  const config = loadConfig();

  const cli = new CLI({
    appName: 'CoParrot',
    version: '1.0.0',
    multiline: !options.singleLine,
    onCommand: handleCommand,
    customCommands: {
      'test': 'Run a test command',
      'demo': 'Show a streaming demo'
    },
    config: config
  });

  if (Object.keys(config).length === 0) {
    const isSetupFinished = await setupConfig();

    if (isSetupFinished) cli.start();
  } else {
    await cli.start();
  }
}

// Run the application
main().catch(error => {
  console.error(chalk.red.bold('\nFatal Error:'), error);
  process.exit(1);
});
