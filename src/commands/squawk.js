import { checkbox } from '@inquirer/prompts';
import MarkdownRenderer from '../lib/renderer.js';
import i18n from '../services/i18n.js';
import chalk from 'chalk';

/**
 * Adds and commit all the files with changes individually
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @returns {Promise<void>}
 * @throws {Error} If git add operation fails
 */
export async function squawk(repo, provider) {
  try {
    const changes = repo.getDetailedStatus();

    if (changes.length === 0) {
      console.log(chalk.yellow(i18n.t('git.squawk.noChanges')));
      return;
    }

    // Show title
    const renderer = new MarkdownRenderer({
      width: process.stdout.columns || 80
    });
    const titleMarkdown = `## ${i18n.t('git.squawk.title')}`;
    console.log(renderer.render(titleMarkdown));

    let committedCount = 0;

    // Process each file sequentially for better UX
    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const current = i + 1;
      const total = changes.length;

      // Show progress
      console.log(chalk.cyan(`\n[${current}/${total}] ${i18n.t('git.squawk.processing', { current, total })}`));

      // Show file being staged
      console.log(chalk.gray(`${i18n.t('git.squawk.stagingFile')} ${chalk.white(change.path)}`));
      // await repo.add([change.path]);

      // Generate commit message
      const context = repo.diff([], { staged: true });
      const commitMessage = await provider.generateCommitMessage(context);

      // Commit the file
      console.log(change)
      console.log(chalk.gray(`${i18n.t('git.squawk.committingFile')} ${chalk.white(change.value)}`));
      // await repo.commit(commitMessage);

      // Show success
      console.log(chalk.green(`${i18n.t('output.prefixes.success')} ${i18n.t('git.squawk.fileComplete')}`));
      committedCount++;
    }

    // Show final summary
    showSquawkSummary(committedCount);
  } catch (error) {
    console.error(i18n.t('output.prefixes.error'), error.message);
    throw error;
  }
}

/**
 * Displays a formatted summary of committed files
 * @param {number} count - Number of files committed
 * @private
 */
function showSquawkSummary(count) {
  const renderer = new MarkdownRenderer({
    width: process.stdout.columns || 80
  });

  const filesWord = i18n.plural('git.add.files', count);
  const markdown = `
## ${i18n.t('git.squawk.allComplete')}

${i18n.t('git.squawk.summary', { count, files: filesWord })}
`;

  const output = renderer.render(markdown);
  console.log(output);
}

/**
 * Displays a formatted list of staged files
 * @param {string[]} files - Array of file paths that were staged
 * @private
 */
function showAddedFiles(files) {
  const renderer = new MarkdownRenderer({
    width: process.stdout.columns || 80
  });

  const fileCount = files.length;
  const filesWord = i18n.plural('git.add.files', fileCount);

  const markdown = `
## ${i18n.t('git.add.successStaged', { count: fileCount, files: filesWord })}

${files.map(file => `✓ ${file}`).join('\n')}

${i18n.t('git.add.nextStep')}
`;

  const output = renderer.render(markdown);
  console.log(output);
}
