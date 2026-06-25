// API 类型定义

export interface AIProviderConfig {
  type: 'openai' | 'google' | 'anthropic' | 'custom'
  apiKey: string
  baseUrl?: string
  model?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  messages: ChatMessage[]
  temperature?: number
  topP?: number
  maxTokens?: number
  stream?: boolean
}

export interface ChatCompletionResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface FunctionAPIConfig {
  main: string // 必填
  voice?: string
  imageRecognition?: string
  imageGen?: string
  coupleSpace?: string
  xiaohongshu?: string
  xApp?: string
  taobao?: string
  email?: string
  xianyu?: string
  auction?: string
  forum?: string
  game?: string
}

export interface APIPreset {
  id: string
  name: string
  config: AIProviderConfig
  functionAPIs: FunctionAPIConfig
  temperature: number
  topP: number
  maxTokens: number
}

export interface PromptContext {
  characterPersona: string
  worldbookContent: string
  functionContext: string
  defaultBehavior: string
  privacySettings: {
    characterCanCheckPhone: boolean
    characterKnowsCheckPhone: boolean
  }
}
