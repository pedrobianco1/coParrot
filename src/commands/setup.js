import { select, rawlist, password } from '@inquirer/prompts';
import { setupConfig } from '../services/config.js';

export async function setup(config) {
  const action = await select({
    message: "Let's set it up:",
    choices: [
      { name: 'Test setup', value: 'test' },
      // Add more options as needed
    ]
  });

  const llmProvider = await chooseProvider();
  const apiKey = await promptApiKey(llmProvider);

  console.log(`Selected action: ${action}`);
  console.log(`Using LLM: ${llmProvider}`);

  return ({
    provider: llmProvider,
    model: 'test',
    apiKey,
  });
}

async function chooseProvider() {
  return await rawlist({
    message: 'Select an LLM provider:',
    choices: [
      { name: 'OpenAI', value: 'openai' },
      { name: 'Claude', value: 'claude' },
      { name: 'Gemini', value: 'gemini' }
    ]
  });
}

async function promptApiKey(provider) {
  return await password({
    message: `Enter your ${provider} API key:`,
    mask: true
  });
}

