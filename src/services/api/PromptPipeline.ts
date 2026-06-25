import { ChatMessage, PromptContext } from './types'

// 提示词组装管线
export class PromptPipeline {
  /**
   * 组装完整的提示词
   * 顺序：人设 → 绑定世界书 → 功能上下文 → 默认行为提示词 → 隐私开关注入
   */
  static assemblePrompt(context: PromptContext, userMessage: string): ChatMessage[] {
    const messages: ChatMessage[] = []

    // 1. System Prompt - 包含人设和世界书
    const systemPrompt = this.buildSystemPrompt(context)
    messages.push({
      role: 'system',
      content: systemPrompt
    })

    // 2. 功能上下文（如果有）
    if (context.functionContext) {
      messages.push({
        role: 'system',
        content: `[功能上下文]\n${context.functionContext}`
      })
    }

    // 3. 默认行为提示词
    if (context.defaultBehavior) {
      messages.push({
        role: 'system',
        content: `[行为指导]\n${context.defaultBehavior}`
      })
    }

    // 4. 隐私设置注入
    const privacyPrompt = this.buildPrivacyPrompt(context.privacySettings)
    if (privacyPrompt) {
      messages.push({
        role: 'system',
        content: privacyPrompt
      })
    }

    // 5. 用户消息
    messages.push({
      role: 'user',
      content: userMessage
    })

    return messages
  }

  /**
   * 构建 System Prompt
   */
  private static buildSystemPrompt(context: PromptContext): string {
    let prompt = `[人设]\n${context.characterPersona}\n\n`

    if (context.worldbookContent) {
      prompt += `[世界书]\n${context.worldbookContent}\n\n`
    }

    prompt += `请根据以上人设和世界书信息，以角色的身份回复。`
    
    return prompt
  }

  /**
   * 构建隐私设置提示词
   */
  private static buildPrivacyPrompt(settings: {
    characterCanCheckPhone: boolean
    characterKnowsCheckPhone: boolean
  }): string {
    const parts: string[] = []

    if (!settings.characterCanCheckPhone) {
      parts.push('角色无法查看用户的手机内容（备注、收藏、备忘录等）。')
    }

    if (!settings.characterKnowsCheckPhone) {
      parts.push('角色不知道用户在查看他们的手机。')
    }

    if (parts.length > 0) {
      return `[隐私限制]\n${parts.join('\n')}`
    }

    return ''
  }

  /**
   * 添加世界书内容
   */
  static addWorldbookContent(context: PromptContext, worldbookEntries: string[]): PromptContext {
    const worldbookContent = worldbookEntries.join('\n\n')
    return {
      ...context,
      worldbookContent: context.worldbookContent + (worldbookContent ? `\n${worldbookContent}` : '')
    }
  }

  /**
   * 添加功能上下文
   */
  static addFunctionContext(context: PromptContext, functionContext: string): PromptContext {
    return {
      ...context,
      functionContext: context.functionContext + (functionContext ? `\n${functionContext}` : '')
    }
  }
}
