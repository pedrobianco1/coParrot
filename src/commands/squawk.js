import MarkdownRenderer from '../lib/renderer.js';
import i18n from '../services/i18n.js';
import chalk from 'chalk';
import { filterByGlob, matchesAnyPattern } from '../utils/glob.js';

/**
 * Main entry point for squawk command - commits each file individually with AI-generated messages
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @param {Object} options - Command options
 * @param {string[]} options.ignore - Glob patterns for files to ignore
 * @returns {Promise<void>}
 */
export async function squawk(repo, provider, options = {}) {
  const startTime = Date.now();

  try {
    const allChanges = repo.getDetailedStatus();

    if (allChanges.length === 0) {
      console.log(chalk.yellow(i18n.t('git.squawk.noChanges')));
      return;
    }

    // Apply ignore patterns first
    const filteredChanges = applyIgnorePatterns(allChanges, options.ignore);

    // Then apply group patterns
    const { groups, ungroupedChanges } = applyGroupPatterns(filteredChanges, options.group);

    if (filteredChanges.length === 0) {
      console.log(chalk.yellow(i18n.t('git.squawk.allFilesIgnored')));
      return;
    }

    showSquawkTitle();

    const stats = await processFilesSequentially(repo, provider, ungroupedChanges, groups);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    showSquawkSummary(stats, elapsed);
  } catch (error) {
    console.error(i18n.t('output.prefixes.error'), error.message);
    throw error;
  }
}

/**
 * Applies ignore patterns to filter out unwanted files
 * @param {Array<Object>} changes - Array of change objects from git status
 * @param {string[]} ignorePatterns - Glob patterns to filter
 * @returns {Array<Object>} Filtered changes
 */
function applyIgnorePatterns(changes, ignorePatterns) {
  if (!ignorePatterns || ignorePatterns.length === 0) {
    return changes;
  }

  // Extract file paths from change objects
  const filePaths = changes.map(c => c.value);

  // Filter file paths using glob patterns
  const filteredPaths = filterByGlob(filePaths, ignorePatterns);

  // Keep only changes that weren't filtered out
  const filteredChanges = changes.filter(c => filteredPaths.includes(c.value));

  // Show info about ignored files
  const ignoredCount = changes.length - filteredChanges.length;
  if (ignoredCount > 0) {
    const message = i18n.t('git.squawk.ignoringFiles', {
      count: ignoredCount,
      patterns: ignorePatterns.join(', ')
    });
    console.log(chalk.dim(message + '\n'));
  }

  return filteredChanges;
}

/**
 * Applies group patterns to organize files into groups
 * @param {Array<Object>} changes - Array of change objects from git status
 * @param {string[]} groupPatterns - Glob patterns for grouping
 * @returns {Object} Object with groups array and ungroupedChanges array
 */
function applyGroupPatterns(changes, groupPatterns) {
  if (!groupPatterns || groupPatterns.length === 0) {
    return { groups: [], ungroupedChanges: changes };
  }

  // Create groups for each pattern
  const groups = groupPatterns.map(pattern => ({
    pattern: pattern,
    files: changes.filter(c => matchesAnyPattern(c.value, [pattern]))
  })).filter(group => group.files.length > 0); // Remove empty groups

  // Get files that match any group pattern
  const groupedFiles = new Set();
  groups.forEach(group => {
    group.files.forEach(file => groupedFiles.add(file.value));
  });

  // Files that don't match any group pattern
  const ungroupedChanges = changes.filter(c => !groupedFiles.has(c.value));

  // Show info about grouped files
  const totalGroupedFiles = groupedFiles.size;
  if (totalGroupedFiles > 0) {
    const message = i18n.t('git.squawk.groupingFiles', {
      count: totalGroupedFiles,
      groups: groups.length,
      patterns: groupPatterns.join(', ')
    });
    console.log(chalk.dim(message + '\n'));
  }

  return { groups, ungroupedChanges };
}

/**
 * Shows the squawk command title with progress bar style
 */
function showSquawkTitle() {
  console.log();
  console.log(chalk.cyan.bold('🦜 Squawk Progress:'));
  const separator = '━'.repeat(Math.min(process.stdout.columns - 2 || 78, 80));
  console.log(chalk.dim(separator));
  console.log();
}

/**
 * Processes each file sequentially: stage, generate message, commit
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @param {Array<Object>} changes - Array of changes to process
 * @param {Array<Object>} groups - Array of grouped files
 * @returns {Promise<Object>} Statistics about commits
 */
async function processFilesSequentially(repo, provider, changes, groups) {
  const stats = {
    groupCommits: 0,
    groupFiles: 0,
    individualCommits: 0,
    totalCommits: 0,
    failed: 0
  };

  const groupStats = await processGroups(repo, provider, groups, changes.length);
  stats.groupCommits = groupStats.commits;
  stats.groupFiles = groupStats.files;

  const totalItems = groups.length + changes.length;
  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const current = groups.length + i + 1;

    try {
      await processSingleFile(repo, provider, change, current, totalItems);
      stats.individualCommits++;
    } catch (error) {
      showFileFailure(error.message);
      stats.failed++;
    }
  }

  stats.totalCommits = stats.groupCommits + stats.individualCommits;
  return stats;
}

/**
 * Processes grouped files
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @param {Array<Object>} groups - Array of grouped files
 * @param {number} totalIndividual - Number of individual files
 * @returns {Promise<Object>} Statistics about group commits
 */
async function processGroups(repo, provider, groups, totalIndividual) {
  const stats = { commits: 0, files: 0 };
  const totalItems = groups.length + totalIndividual;

  for (let j = 0; j < groups.length; j++) {
    const group = groups[j];
    const current = j + 1;

    // Skip empty groups
    if (group.files.length === 0) continue;

    showFileProgress(group.pattern, current, totalItems, true, group.files.length);

    try {
      await stageFiles(repo, group.files);
      const commitMessage = await generateCommitMessage(repo, provider);
      await commitFile(repo, group.files, commitMessage);

      showFileSuccess();
      stats.commits++;
      stats.files += group.files.length;
    } catch (error) {
      showFileFailure(error.message);
    }
  }

  return stats;
}

/**
 * Processes a single file: stages, generates commit message, and commits
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @param {Object} change - Change object containing file info
 * @param {number} current - Current item index (1-based)
 * @param {number} total - Total number of items (groups + files)
 */
async function processSingleFile(repo, provider, change, current, total) {
  showFileProgress(change.value, current, total, false, 1);

  await stageFiles(repo, [change.value]);
  const commitMessage = await generateCommitMessage(repo, provider);
  await commitFile(repo, [change.value], commitMessage);

  showFileSuccess();
}

/**
 * Shows progress for current file in compact format
 */
function showFileProgress(filename, current, total, isGroup = false, fileCount = 1) {
  const icon = isGroup ? '📦' : '📄';
  const label = isGroup ? `${filename} (${fileCount} files)` : filename;
  const maxLabelLength = 40;
  const truncatedLabel = label.length > maxLabelLength ? label.substring(0, maxLabelLength - 3) + '...' : label;
  const padding = Math.max(50 - truncatedLabel.length, 0);
  const dots = '.'.repeat(padding);

  process.stdout.write(chalk.dim(`${icon} [${current}/${total}] `) + chalk.white(truncatedLabel) + chalk.dim(` ${dots} `));
}

/**
 * Stages files silently
 * @param {Object} repo - Git repository instance
 * @param {Array[]} files - Files to stage
 */
async function stageFiles(repo, files) {
  await repo.add(files);
  // console.log('add')
}

/**
 * Generates a commit message for staged changes silently
 * @param {Object} repo - Git repository instance
 * @param {Object} provider - LLM provider instance
 * @returns {Promise<string>} Generated commit message
 */
async function generateCommitMessage(repo, provider) {
  const context = repo.diff([], { staged: true });
  const commitMessage = await provider.generateCommitMessage(context);
  return commitMessage;
}

/**
 * Commits files with the given message silently
 * @param {Object} repo - Git repository instance
 * @param {Array} files - Files being committed
 * @param {string} message - Commit message
 */
async function commitFile(repo, files, message) {
  await repo.commit(message);
}

/**
 * Shows success message for a committed file (inline checkmark)
 */
function showFileSuccess() {
  console.log(chalk.green('✓'));
}

/**
 * Shows failure message for a committed file (inline X)
 */
function showFileFailure(error) {
  console.log(chalk.red('✗'));
  console.log(chalk.red(`  ↳ ${error}`));
}

/**
 * Displays a formatted summary with stats and timing
 * @param {Object} stats - Statistics about commits
 * @param {string} elapsed - Elapsed time in seconds
 */
function showSquawkSummary(stats, elapsed) {
  console.log();

  const totalFiles = stats.groupFiles + stats.individualCommits;
  const summaryText = i18n.t('git.squawk.summaryComplete', {
    count: stats.totalCommits,
    files: totalFiles
  });
  console.log(chalk.green.bold(`✨ ${summaryText}`));

  if (stats.groupCommits > 0) {
    const groupText = i18n.t('git.squawk.groupCommits', {
      count: stats.groupCommits,
      files: stats.groupFiles
    });
    console.log(chalk.dim(`   • ${groupText}`));
  }
  if (stats.individualCommits > 0) {
    const individualText = i18n.t('git.squawk.individualCommits', {
      count: stats.individualCommits
    });
    console.log(chalk.dim(`   • ${individualText}`));
  }
  if (stats.failed > 0) {
    const failedText = i18n.t('git.squawk.failedCommits', {
      count: stats.failed
    });
    console.log(chalk.red(`   • ${failedText}`));
  }

  const timeText = i18n.t('git.squawk.completedIn', { time: elapsed });
  console.log(chalk.dim(`\n⏱️  ${timeText}`));
  console.log();
}
