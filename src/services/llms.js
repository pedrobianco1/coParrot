
import OpenAI from 'openai';

class LLMOrchestrator {
  constructor(options = {}) {
    this.options = {
      provider: options.provider || 'openAI',
      apiKey: options.apiKey,
      model: options.model,
      instructions: options.instructions || {},
      ...options
    };

    this.client = this._initializeClient();
  }

  _initializeClient() {
    switch (this.options.provider.toLowerCase()) {
      case 'openai':
        return new OpenAI({ apiKey: this.options.apiKey });
        break;
      case 'claude':
        return new Anthropic({ apiKey: this.options.apiKey });
        break;
      case 'gemini':
        return new GoogleGenerativeAI(this.options.apiKey);
        break;
      default:
        throw new Error(`Unsupported provider: ${this.options.provider}`);
    }
  }

  async call(context, type) {
    // Chamar o método específico do provider
    switch (this.options.provider.toLowerCase()) {
      case 'openai':
        return this._callOpenAI(context, type);
      case 'claude':
        return this._callClaude(context, type);
      case 'gemini':
        return this._callGemini(context, type);
      default:
        throw new Error(`Unsupported provider: ${this.options.provider}`);
    }
  }

  approveLLMResponse() {
    
  }

  generateCommitMessage(context, type) {
    this.call(context, type)
  }

  async _callOpenAI(context, type) {
    const response = await this.client.chat.completions.create({
      model: this.options.model || 'gpt-4',
      messages: [
        {
          role: 'system',
          content: this._buildSystemPrompt(type)
        },
        {
          role: 'user',
          content: JSON.stringify(context)
        }
      ]
    });

    return response.choices[0].message.content;
  }

  async _callClaude(context, type) {
    const response = await this.client.messages.create({
      model: this.options.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: this._buildSystemPrompt(type),
      messages: [
        {
          role: 'user',
          content: JSON.stringify(context)
        }
      ]
    });

    return response.content[0].text;
  }

  async _callGemini(context, type) {
    const model = this.client.getGenerativeModel({
      model: this.options.model || 'gemini-pro'
    });

    const prompt = `${this._buildSystemPrompt(type)}\n\n${JSON.stringify(context)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  }

  /**
     * Constrói o system prompt baseado no tipo de requisição
     */
  _buildSystemPrompt(type) {
    const baseInstructions = this.options.instructions.customInstructions || '';

    switch (type) {
      case 'commit':
        return `You are a helpful git assistant. Generate a commit message following the
${this.options.instructions.commitConvention?.type || 'conventional'} convention.\n${baseInstructions}`;

      case 'branch':
        return `You are a helpful git assistant. Generate a branch name following the
${this.options.instructions.branchNaming?.type || 'gitflow'} convention.\n${baseInstructions}`;

      case 'pr':
        return `You are a helpful git assistant. Generate a PR description in ${this.options.instructions.prMessageStyle
|| 'detailed'} style.\n${baseInstructions}`;

      default:
        return `You are a helpful git assistant.\n${baseInstructions}`;
    }
  }
}

export default LLMOrchestrator;
