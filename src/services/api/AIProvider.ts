import { AIProviderConfig, ChatCompletionRequest, ChatCompletionResponse } from './types'

// AI Provider 抽象接口
export abstract class AIProvider {
  protected config: AIProviderConfig

  constructor(config: AIProviderConfig) {
    this.config = config
  }

  abstract chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>
  
  protected getAPIKey(): string {
    return this.config.apiKey
  }

  protected getBaseUrl(): string {
    return this.config.baseUrl || this.getDefaultBaseUrl()
  }

  protected getModel(): string {
    return this.config.model || this.getDefaultModel()
  }

  protected abstract getDefaultBaseUrl(): string
  protected abstract getDefaultModel(): string
}

// OpenAI Provider
export class OpenAIProvider extends AIProvider {
  protected getDefaultBaseUrl(): string {
    return 'https://api.openai.com/v1'
  }

  protected getDefaultModel(): string {
    return 'gpt-4'
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        model: this.getModel(),
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
        max_tokens: request.maxTokens ?? 2000,
        stream: request.stream ?? false
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens
      }
    }
  }
}

// Google Provider
export class GoogleProvider extends AIProvider {
  protected getDefaultBaseUrl(): string {
    return 'https://generativelanguage.googleapis.com/v1beta'
  }

  protected getDefaultModel(): string {
    return 'gemini-pro'
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(
      `${this.getBaseUrl()}/models/${this.getModel()}:generateContent?key=${this.getAPIKey()}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: request.messages.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
          })),
          generationConfig: {
            temperature: request.temperature ?? 0.7,
            topP: request.topP ?? 0.9,
            maxOutputTokens: request.maxTokens ?? 2000
          }
        })
      }
    )

    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0
      }
    }
  }
}

// Anthropic Provider
export class AnthropicProvider extends AIProvider {
  protected getDefaultBaseUrl(): string {
    return 'https://api.anthropic.com/v1'
  }

  protected getDefaultModel(): string {
    return 'claude-3-opus-20240229'
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.getBaseUrl()}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.getAPIKey(),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.getModel(),
        messages: request.messages.filter(m => m.role !== 'system'),
        system: request.messages.find(m => m.role === 'system')?.content || '',
        max_tokens: request.maxTokens ?? 2000,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9
      })
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    }
  }
}

// Custom Provider (通用自定义)
export class CustomProvider extends AIProvider {
  protected getDefaultBaseUrl(): string {
    return this.config.baseUrl || ''
  }

  protected getDefaultModel(): string {
    return this.config.model || 'default'
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    const response = await fetch(`${this.getBaseUrl()}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAPIKey()}`
      },
      body: JSON.stringify({
        model: this.getModel(),
        messages: request.messages,
        temperature: request.temperature ?? 0.7,
        top_p: request.topP ?? 0.9,
        max_tokens: request.maxTokens ?? 2000
      })
    })

    if (!response.ok) {
      throw new Error(`Custom API error: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      content: data.choices?.[0]?.message?.content || data.content || '',
      usage: data.usage ? {
        promptTokens: data.usage.prompt_tokens || 0,
        completionTokens: data.usage.completion_tokens || 0,
        totalTokens: data.usage.total_tokens || 0
      } : undefined
    }
  }
}

// Provider 工厂
export function createAIProvider(config: AIProviderConfig): AIProvider {
  switch (config.type) {
    case 'openai':
      return new OpenAIProvider(config)
    case 'google':
      return new GoogleProvider(config)
    case 'anthropic':
      return new AnthropicProvider(config)
    case 'custom':
      return new CustomProvider(config)
    default:
      throw new Error(`Unknown provider type: ${config.type}`)
  }
}
