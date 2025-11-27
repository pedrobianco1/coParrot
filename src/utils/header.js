import figlet from 'figlet';
import gradient from 'gradient-string';
import terminalImage from 'terminal-image';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate a cool gradient header for CoParrot
 * @param {string} text - Text to display (default: "CoParrot")
 * @param {string} font - Figlet font to use (default: "Standard")
 * @returns {string} Gradient colored ASCII art
 */
export function createHeader(text = 'CoParrot', font = 'Standard') {
  const asciiArt = figlet.textSync(text, {
    font: font,
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  // Create a cool gradient (blue to purple to pink)
  const gradientColors = gradient(['#00D4FF', '#7B2FFF', '#FF006E']);

  return gradientColors.multiline(asciiArt);
}

/**
 * Get a random cool gradient
 * @returns {function} Gradient function
 */
export function getRandomGradient() {
  const gradients = [
    // Ocean (blue to cyan)
    gradient(['#0A2463', '#3E92CC', '#00F5FF']),
    // Sunset (orange to pink)
    gradient(['#FF6B35', '#F7931E', '#FF006E']),
    // Forest (green to teal)
    gradient(['#2D6A4F', '#40916C', '#74C69D']),
    // Purple Dream
    gradient(['#7209B7', '#B5179E', '#F72585']),
    // Fire
    gradient(['#FF0000', '#FF6B00', '#FFD700']),
    // Rainbow
    gradient(['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'])
  ];

  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Create an animated gradient header (cycles through colors)
 * @param {string} text - Text to display
 * @param {string} font - Figlet font
 * @param {number} duration - Animation duration in ms
 * @param {number} fps - Frames per second
 */
export async function animateHeader(text = 'CoParrot', font = 'Standard', duration = 2000, fps = 10) {
  const asciiArt = figlet.textSync(text, {
    font: font,
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  const frameDelay = 1000 / fps;
  const frames = Math.floor(duration / frameDelay);

  const gradients = [
    gradient(['#00D4FF', '#7B2FFF', '#FF006E']),
    gradient(['#FF006E', '#7B2FFF', '#00D4FF']),
    gradient(['#7B2FFF', '#FF006E', '#00D4FF']),
  ];

  for (let i = 0; i < frames; i++) {
    console.clear();
    const currentGradient = gradients[i % gradients.length];
    console.log(currentGradient.multiline(asciiArt));
    await new Promise(resolve => setTimeout(resolve, frameDelay));
  }
}

/**
 * Display a static header with version info
 * @param {string} appName - Application name
 * @param {string} version - Version string
 * @param {string} tagline - Optional tagline
 */
export function displayHeader(appName = 'CoParrot', version = '1.0.0', tagline = null) {
  const header = createHeader(appName);
  console.log('\n' + header);

  if (version) {
    const versionGradient = gradient(['#7B2FFF', '#FF006E']);
    console.log(versionGradient(`  v${version}`));
  }

  if (tagline) {
    const taglineGradient = gradient(['#00D4FF', '#7B2FFF']);
    console.log(taglineGradient(`  ${tagline}`));
  }

  console.log('');
}

/**
 * Animate the parrot sprite frames
 * @param {number} loops - Number of times to loop the animation (default: 3)
 * @param {number} frameDelay - Delay between frames in ms (default: 200)
 * @returns {Promise<void>}
 */
export async function animateParrot(loops = 3, frameDelay = 200) {
  const frame1Path = path.join(__dirname, '../ascii-text-art1.png');
  const frame2Path = path.join(__dirname, '../ascii-text-art2.png');

  // Check if files exist
  if (!fs.existsSync(frame1Path) || !fs.existsSync(frame2Path)) {
    console.log('Parrot sprite frames not found, skipping animation...');
    return;
  }

  try {
    // Read both frames
    const frame1Buffer = fs.readFileSync(frame1Path);
    const frame2Buffer = fs.readFileSync(frame2Path);

    // Convert to terminal images
    const frame1 = await terminalImage.buffer(frame1Buffer, { width: 30, height: 15 });
    const frame2 = await terminalImage.buffer(frame2Buffer, { width: 30, height: 15 });

    // Animate
    for (let i = 0; i < loops; i++) {
      // Clear and show frame 1
      process.stdout.write('\x1b[2J\x1b[0f'); // Clear screen
      console.log(frame1);
      await new Promise(resolve => setTimeout(resolve, frameDelay));

      // Clear and show frame 2
      process.stdout.write('\x1b[2J\x1b[0f'); // Clear screen
      console.log(frame2);
      await new Promise(resolve => setTimeout(resolve, frameDelay));
    }
  } catch (error) {
    // Silently fail if terminal doesn't support images
    console.log('Animation not supported in this terminal');
  }
}

/**
 * Combines text lines side by side
 * @param {string} left - Left text (with ANSI colors)
 * @param {string} right - Right text (with ANSI colors)
 * @param {number} padding - Padding between columns
 * @returns {string}
 */
function combineTextSideBySide(left, right, padding = 4) {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  const maxLines = Math.max(leftLines.length, rightLines.length);

  // Calculate width of left column (without ANSI codes)
  const stripAnsi = (str) => str.replace(/\x1b\[[0-9;]*m/g, '');
  const leftWidth = Math.max(...leftLines.map(line => stripAnsi(line).length));

  const combined = [];
  for (let i = 0; i < maxLines; i++) {
    const leftLine = leftLines[i] || '';
    const rightLine = rightLines[i] || '';

    // Calculate padding needed (accounting for ANSI codes)
    const leftVisibleLength = stripAnsi(leftLine).length;
    const paddingNeeded = leftWidth - leftVisibleLength + padding;

    combined.push(leftLine + ' '.repeat(Math.max(0, paddingNeeded)) + rightLine);
  }

  return combined.join('\n');
}

/**
 * Display header text only (parrot will be animated separately)
 * @param {string} appName - Application name
 * @param {string} version - Version string
 * @param {string} tagline - Optional tagline
 * @returns {Promise<void>}
 */
export async function displayAnimatedHeader(appName = 'CoParrot', version = '1.0.0', tagline = null) {
  // Use a solid/filled font for better gradient visibility
  const asciiArt = figlet.textSync(appName, {
    font: 'ANSI Shadow', // Filled font with background
    horizontalLayout: 'default',
    verticalLayout: 'default'
  });

  // Apply gradient ONLY to the CoParrot text
  const gradientColors = gradient(['#00D4FF', '#7B2FFF', '#FF006E']);
  const gradientHeader = gradientColors.multiline(asciiArt);

  // Add padding to move text to the right (space for parrot on left)
  const paddedHeader = gradientHeader.split('\n').map(line => '                          ' + line).join('\n');

  console.log('\n' + paddedHeader);

  // Version and tagline in plain white (no gradient)
  if (version) {
    console.log('                          ' + chalk.white(`  v${version}`));
  }

  if (tagline) {
    console.log('                          ' + chalk.dim(`  ${tagline}`));
  }

  console.log();
}

/**
 * Starts a continuous background parrot animation
 * Updates only the parrot area without affecting input
 * @returns {Object} Animation controller with stop() method
 */
export function startContinuousParrotAnimation() {
  const frame1Path = path.join(__dirname, '../ascii-text-art1.png');
  const frame2Path = path.join(__dirname, '../ascii-text-art2.png');

  // Check if files exist
  if (!fs.existsSync(frame1Path) || !fs.existsSync(frame2Path)) {
    return { stop: () => {} }; // Return no-op controller
  }

  let animationInterval = null;
  let currentFrame = 0;
  let frames = null;

  // Load frames asynchronously
  (async () => {
    try {
      const frame1Buffer = fs.readFileSync(frame1Path);
      const frame2Buffer = fs.readFileSync(frame2Path);

      const frame1 = await terminalImage.buffer(frame1Buffer, { width: 20, height: 10 });
      const frame2 = await terminalImage.buffer(frame2Buffer, { width: 20, height: 10 });

      frames = [frame1, frame2];

      // Start animation loop
      animationInterval = setInterval(() => {
        if (!frames) return;

        const frameLines = frames[currentFrame].split('\n');

        // Save cursor position, move to top-left, draw parrot, restore cursor
        process.stdout.write('\x1b[s'); // Save cursor position
        process.stdout.write('\x1b[1;1H'); // Move to row 1, col 1

        // Draw each line of the parrot
        frameLines.forEach((line, index) => {
          process.stdout.write(`\x1b[${index + 1};1H`); // Move to row
          process.stdout.write(line);
        });

        process.stdout.write('\x1b[u'); // Restore cursor position

        currentFrame = (currentFrame + 1) % 2;
      }, 300); // 300ms per frame
    } catch (error) {
      // Silent fail
    }
  })();

  // Return controller
  return {
    stop: () => {
      if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
      }
    }
  };
}

export default {
  createHeader,
  getRandomGradient,
  animateHeader,
  displayHeader,
  animateParrot,
  displayAnimatedHeader,
  startContinuousParrotAnimation
};
