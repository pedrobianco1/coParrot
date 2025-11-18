import { checkbox } from '@inquirer/prompts';
import MarkdownRenderer from '../lib/renderer.js';

const MESSAGES = {
  SELECT_FILES: 'Choose files to stage for commit (Space to select, Enter to confirm)',
  NO_FILES_SELECTED: 'No files were staged. Your working directory remains unchanged.',
  NO_FILES_AVAILABLE: 'No files available to stage',
};

/**
 * Prompts the user to select files to add to git staging area
 * @param {string[]} files - Array of file paths to choose from
 * @returns {Promise<string[]>} Array of selected file paths
 * @throws {Error} If files array is invalid or empty
 */
export async function selectFilesToAdd(files) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error(MESSAGES.NO_FILES_AVAILABLE);
  }
  
  try {
    const response = await checkbox({
      message: MESSAGES.SELECT_FILES,
      choices: files,
      loop: false,
    });

    if (response.length > 0) {
      showAddedFiles(response);
    }

    return response;
  } catch (error) {
    if (error.name === 'ExitPromptError') {
      // User cancelled the prompt
      return [];
    }
    throw error;
  }
}

/**
 * Adds selected files to git staging area
 * @param {Object} repo - Git repository instance
 * @param {string[]} changes - Array of changed file paths
 * @returns {Promise<void>}
 * @throws {Error} If git add operation fails
 */
export async function gitAdd(repo, changes) {
  try {
    const selectedFiles = await selectFilesToAdd(changes);

    if (selectedFiles.length === 0) {
      console.log(MESSAGES.NO_FILES_SELECTED);
      return;
    }

    await repo.restoreAll();
    await repo.add(selectedFiles);
  } catch (error) {
    console.error('Error adding files:', error.message);
    throw error;
  }
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
  const plural = fileCount === 1 ? 'file' : 'files';

  const markdown = `
## Successfully staged ${fileCount} ${plural}

${files.map(file => `✓ ${file}`).join('\n')}

**Next step:** Run \`/commit\` to create your commit, or continue staging more files.
`;

  const output = renderer.render(markdown);
  console.log(output);
}
