import { AIProviderConfig } from './types.js';

export class AIProviderService {
  private config: AIProviderConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AIProviderConfig {
    const provider = (process.env.AI_PROVIDER as 'gemini' | 'ollama') || 'gemini';
    const apiKey = process.env.GEMINI_API_KEY?.trim() || '';
    const model = process.env.AI_MODEL?.trim() || (provider === 'gemini' ? 'gemini-1.5-flash' : 'llama3.2');
    const enabled = process.env.AI_ENABLED !== 'false' && (provider === 'ollama' || (provider === 'gemini' && apiKey.length > 0));
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL?.trim() || 'http://localhost:11434';
    const timeoutMs = parseInt(process.env.AI_TIMEOUT_MS || '15000', 10);

    return {
      provider,
      apiKey,
      model,
      enabled,
      ollamaBaseUrl,
      timeoutMs,
    };
  }

  public getStatus() {
    this.config = this.loadConfig();
    return {
      provider: this.config.provider,
      model: this.config.model,
      enabled: this.config.enabled,
      hasApiKey: !!this.config.apiKey && this.config.apiKey.length > 5,
    };
  }

  public isAvailable(): boolean {
    this.config = this.loadConfig();
    return this.config.enabled && (this.config.provider === 'ollama' || (this.config.provider === 'gemini' && !!this.config.apiKey));
  }

  public async generateText(
    systemPrompt: string,
    userPrompt: string,
    options?: { jsonMode?: boolean }
  ): Promise<{ text: string; model: string }> {
    this.config = this.loadConfig();

    if (!this.isAvailable()) {
      throw new Error(
        `AI service unavailable: ${
          this.config.provider === 'gemini' && !this.config.apiKey
            ? 'GEMINI_API_KEY is not configured in backend/.env. Please configure a free Gemini API key or enable Ollama.'
            : 'AI is disabled via AI_ENABLED=false.'
        }`
      );
    }

    if (this.config.provider === 'gemini') {
      return this.callGemini(systemPrompt, userPrompt, options);
    } else {
      return this.callOllama(systemPrompt, userPrompt, options);
    }
  }

  private async callGemini(
    systemPrompt: string,
    userPrompt: string,
    options?: { jsonMode?: boolean }
  ): Promise<{ text: string; model: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs || 15000);

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.config.model
    )}:generateContent?key=${encodeURIComponent(this.config.apiKey || '')}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\n[USER INPUT]:\n${userPrompt}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2048,
            ...(options?.jsonMode ? { responseMimeType: 'application/json' } : {}),
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = (errorData as any)?.error?.message || `Gemini API returned HTTP ${response.status}`;
        throw new Error(`Gemini LLM error: ${message}`);
      }

      const data = (await response.json()) as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Gemini API returned an empty response candidate.');
      }

      return { text, model: this.config.model };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Gemini request timed out after ${this.config.timeoutMs}ms.`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async callOllama(
    systemPrompt: string,
    userPrompt: string,
    options?: { jsonMode?: boolean }
  ): Promise<{ text: string; model: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeoutMs || 25000);

    const endpoint = `${this.config.ollamaBaseUrl}/api/generate`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt: `${systemPrompt}\n\n${userPrompt}`,
          stream: false,
          format: options?.jsonMode ? 'json' : undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama returned HTTP ${response.status}`);
      }

      const data = (await response.json()) as any;
      return { text: data.response || '', model: this.config.model };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error('Ollama request timed out.');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Safe helper to parse structured JSON from LLM text responses,
   * gracefully handling markdown backticks or prefixes.
   */
  public cleanAndParseJSON<T>(rawText: string): T {
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (e: any) {
      // Attempt substring extraction if model added conversational preamble
      const firstBrace = cleaned.indexOf('{');
      const lastBrace = cleaned.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const sliced = cleaned.slice(firstBrace, lastBrace + 1);
        return JSON.parse(sliced) as T;
      }
      throw new Error(`Failed to parse LLM structured JSON output: ${e.message}`);
    }
  }
}

export const aiProvider = new AIProviderService();
