// 设置 Schema 注册表 - 数据驱动渲染设置页
export interface SettingItem {
  id: string
  type: 'toggle' | 'select' | 'input' | 'number' | 'section'
  label: string
  category: 'api' | 'switch' | 'privacy' | 'system'
  defaultValue?: any
  options?: { label: string; value: any }[]
  min?: number
  max?: number
  step?: number
  description?: string
}

export interface SettingSection {
  id: string
  title: string
  items: SettingItem[]
}

export const settingsSchema: SettingSection[] = [
  {
    id: 'api',
    title: 'API 配置',
    items: [
      {
        id: 'apiPreset',
        type: 'select',
        label: 'API 预设',
        category: 'api',
        defaultValue: 'preset1',
        options: [
          { label: '预设 1', value: 'preset1' },
          { label: '预设 2', value: 'preset2' }
        ]
      },
      {
        id: 'mainApi',
        type: 'input',
        label: '主 API (必填)',
        category: 'api',
        defaultValue: '',
        description: '主要 AI 服务提供商 API'
      },
      {
        id: 'voiceApi',
        type: 'input',
        label: '语音 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'imageRecognitionApi',
        type: 'input',
        label: '图片识别 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'imageGenApi',
        type: 'input',
        label: '生图 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'coupleSpaceApi',
        type: 'input',
        label: '情侣空间 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'xiaohongshuApi',
        type: 'input',
        label: '小红书 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'xAppApi',
        type: 'input',
        label: 'X 软件 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'taobaoApi',
        type: 'input',
        label: '淘宝 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'emailApi',
        type: 'input',
        label: '邮件 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'xianyuApi',
        type: 'input',
        label: '闲鱼 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'auctionApi',
        type: 'input',
        label: '拍卖 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'forumApi',
        type: 'input',
        label: '论坛 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'gameApi',
        type: 'input',
        label: '游戏 API',
        category: 'api',
        defaultValue: '',
        description: '留空则使用主 API'
      },
      {
        id: 'temperature',
        type: 'number',
        label: 'Temperature',
        category: 'api',
        defaultValue: 0.7,
        min: 0,
        max: 2,
        step: 0.1
      },
      {
        id: 'topP',
        type: 'number',
        label: 'Top P',
        category: 'api',
        defaultValue: 0.9,
        min: 0,
        max: 1,
        step: 0.1
      },
      {
        id: 'maxTokens',
        type: 'number',
        label: 'Max Tokens',
        category: 'api',
        defaultValue: 2000,
        min: 1,
        max: 10000
      }
    ]
  },
  {
    id: 'switch',
    title: '功能开关',
    items: [
      {
        id: 'backgroundActivity',
        type: 'toggle',
        label: '后台活动',
        category: 'switch',
        defaultValue: true,
        description: '角色在后台主动发消息'
      },
      {
        id: 'characterKnowsCheckPhone',
        type: 'toggle',
        label: '角色知道你查手机',
        category: 'switch',
        defaultValue: false,
        description: '角色是否知道你在查看他们的手机'
      },
      {
        id: 'characterCanCheckPhone',
        type: 'toggle',
        label: '角色可查你手机',
        category: 'switch',
        defaultValue: false,
        description: '角色是否可以查看你的手机内容'
      },
      {
        id: 'crossChatMessages',
        type: 'toggle',
        label: '跨聊天消息',
        category: 'switch',
        defaultValue: false,
        description: '角色可从群聊跳私信发消息'
      },
      {
        id: 'enableInnerVoice',
        type: 'toggle',
        label: '启用心声',
        category: 'switch',
        defaultValue: true,
        description: '单击头像显示角色心声'
      },
      {
        id: 'backgroundKeepAlive',
        type: 'toggle',
        label: '后台保活',
        category: 'switch',
        defaultValue: true,
        description: '保持后台活动'
      },
      {
        id: 'systemNotification',
        type: 'toggle',
        label: '系统通知',
        category: 'switch',
        defaultValue: true,
        description: '接收系统推送通知'
      }
    ]
  },
  {
    id: 'privacy',
    title: '隐私设置',
    items: [
      {
        id: 'privacyLevel',
        type: 'select',
        label: '隐私级别',
        category: 'privacy',
        defaultValue: 'medium',
        options: [
          { label: '高', value: 'high' },
          { label: '中', value: 'medium' },
          { label: '低', value: 'low' }
        ]
      }
    ]
  },
  {
    id: 'system',
    title: '系统设置',
    items: [
      {
        id: 'consoleEnabled',
        type: 'toggle',
        label: '启用控制台',
        category: 'system',
        defaultValue: true,
        description: '显示移动端控制台'
      }
    ]
  }
]

// 根据 ID 获取设置项
export function getSettingById(id: string): SettingItem | undefined {
  for (const section of settingsSchema) {
    const item = section.items.find(item => item.id === id)
    if (item) return item
  }
  return undefined
}

// 根据分类获取设置项
export function getSettingsByCategory(category: SettingItem['category']): SettingItem[] {
  const items: SettingItem[] = []
  for (const section of settingsSchema) {
    items.push(...section.items.filter(item => item.category === category))
  }
  return items
}
