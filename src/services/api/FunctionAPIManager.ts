import { FunctionAPIConfig, AIProviderConfig, ChatCompletionRequest, ChatCompletionResponse, ChatMessage } from './types'
import { createAIProvider } from './AIProvider'
import { assemblePrompt } from '../../config/defaultPrompts'

// 功能 API 管理器
export class FunctionAPIManager {
  private config: FunctionAPIConfig
  private mainProvider: any
  private scene: string = 'default'
  private characterInfo?: { name: string; personality: string }

  constructor(config: FunctionAPIConfig, mainProviderConfig: AIProviderConfig) {
    this.config = config
    this.mainProvider = createAIProvider(mainProviderConfig)
  }

  // 设置当前场景（用于选择对应的提示词）
  setScene(scene: string) {
    this.scene = scene
  }

  // 设置角色信息
  setCharacterInfo(info: { name: string; personality: string }) {
    this.characterInfo = info
  }

  // 获取指定功能的 API，如果未配置则回落到 main
  private getAPIForFunction(functionName: keyof FunctionAPIConfig): string {
    return this.config[functionName] || this.config.main
  }

  // 更新配置
  updateConfig(config: Partial<FunctionAPIConfig>) {
    this.config = { ...this.config, ...config }
  }

  // 注入默认提示词
  private injectPrompt(request: ChatCompletionRequest): ChatCompletionRequest {
    const userMessage = request.messages[request.messages.length - 1]?.content || ''
    
    const context = request.messages.slice(0, -1).map(m => m.content).join('\n')

    const assembledPrompt = assemblePrompt(
      this.scene,
      userMessage,
      context,
      this.characterInfo
    )

    // 将组装好的提示词转换为 ChatMessage 数组
    const newMessages: ChatMessage[] = [
      { role: 'system', content: assembledPrompt },
      ...request.messages
    ]

    return {
      ...request,
      messages: newMessages
    }
  }

  // 使用指定功能的 API 发送请求
  async chatWithFunction(
    functionName: keyof FunctionAPIConfig,
    request: ChatCompletionRequest,
    providerConfig?: AIProviderConfig,
    injectPrompt: boolean = true
  ): Promise<ChatCompletionResponse> {
    const finalRequest = injectPrompt ? this.injectPrompt(request) : request
    const apiKey = this.getAPIForFunction(functionName)
    
    // 如果与 main 相同，使用 main provider
    if (apiKey === this.config.main && !providerConfig) {
      return await this.mainProvider.chat(finalRequest)
    }

    // 否则使用自定义 provider
    const config = providerConfig || {
      type: 'custom' as const,
      apiKey,
      baseUrl: apiKey // 假设 apiKey 就是 baseUrl
    }
    
    const provider = createAIProvider(config)
    return await provider.chat(finalRequest)
  }

  // 使用 main API
  async chat(request: ChatCompletionRequest, injectPrompt: boolean = true): Promise<ChatCompletionResponse> {
    const finalRequest = injectPrompt ? this.injectPrompt(request) : request
    return await this.mainProvider.chat(finalRequest)
  }

  // 各功能 API 的便捷方法
  async voice(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('voice', request, providerConfig)
  }

  async imageRecognition(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('imageRecognition', request, providerConfig)
  }

  async imageGen(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('imageGen', request, providerConfig)
  }

  async coupleSpace(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('coupleSpace', request, providerConfig)
  }

  async xiaohongshu(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('xiaohongshu', request, providerConfig)
  }

  async xApp(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('xApp', request, providerConfig)
  }

  async taobao(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('taobao', request, providerConfig)
  }

  async email(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('email', request, providerConfig)
  }

  async xianyu(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('xianyu', request, providerConfig)
  }

  async auction(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('auction', request, providerConfig)
  }

  async forum(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('forum', request, providerConfig)
  }

  async game(request: ChatCompletionRequest, providerConfig?: AIProviderConfig) {
    return this.chatWithFunction('game', request, providerConfig)
  }
}
