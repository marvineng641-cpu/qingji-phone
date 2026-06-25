// App 注册表 - 数据驱动渲染的基础
export interface AppInfo {
  id: string
  name: string
  icon: string
  route: string
  category: 'system' | 'social' | 'shopping' | 'entertainment' | 'utility'
  defaultVisible: boolean
  description?: string
}

export const appsRegistry: AppInfo[] = [
  // 系统 App
  {
    id: 'settings',
    name: '设置',
    icon: '⚙️',
    route: '/settings',
    category: 'system',
    defaultVisible: true,
    description: '系统设置'
  },
  {
    id: 'appstore',
    name: '应用市场',
    icon: '🏪',
    route: '/appstore',
    category: 'system',
    defaultVisible: true,
    description: '下载应用'
  },
  {
    id: 'wallpaper',
    name: '壁纸',
    icon: '🖼️',
    route: '/wallpaper',
    category: 'system',
    defaultVisible: true,
    description: '更换壁纸'
  },
  {
    id: 'storage',
    name: '存储',
    icon: '💾',
    route: '/storage',
    category: 'system',
    defaultVisible: true,
    description: '数据管理'
  },
  {
    id: 'console',
    name: '控制台',
    icon: '🖥️',
    route: '/console',
    category: 'system',
    defaultVisible: true,
    description: '移动端控制台'
  },
  
  // 社交 App
  {
    id: 'qq',
    name: 'QQ',
    icon: '🐧',
    route: '/qq',
    category: 'social',
    defaultVisible: true,
    description: '即时通讯'
  },
  {
    id: 'xiaohongshu',
    name: '小红书',
    icon: '📕',
    route: '/xiaohongshu',
    category: 'social',
    defaultVisible: true,
    description: '生活方式社区'
  },
  {
    id: 'xapp',
    name: 'X',
    icon: '✖️',
    route: '/xapp',
    category: 'social',
    defaultVisible: true,
    description: '社交平台'
  },
  
  // 购物 App
  {
    id: 'waimai',
    name: '晴团外卖',
    icon: '🍔',
    route: '/waimai',
    category: 'shopping',
    defaultVisible: true,
    description: '外卖配送'
  },
  {
    id: 'taobao',
    name: '晴宝',
    icon: '🛍️',
    route: '/taobao',
    category: 'shopping',
    defaultVisible: true,
    description: '购物平台'
  },
  {
    id: 'alipay',
    name: '晴钱袋',
    icon: '💰',
    route: '/alipay',
    category: 'shopping',
    defaultVisible: true,
    description: '支付钱包'
  },
  
  // 娱乐 App
  {
    id: 'couplespace',
    name: '情侣空间',
    icon: '💕',
    route: '/couplespace',
    category: 'entertainment',
    defaultVisible: true,
    description: '情侣互动'
  },
  
  // 工具 App
  {
    id: 'worldbook',
    name: '世界书',
    icon: '📚',
    route: '/worldbook',
    category: 'utility',
    defaultVisible: true,
    description: '角色世界书管理'
  },
  {
    id: 'memo',
    name: '备忘录',
    icon: '📝',
    route: '/memo',
    category: 'utility',
    defaultVisible: true,
    description: '记事本'
  },
  {
    id: 'widgets',
    name: '小组件',
    icon: '📱',
    route: '/widgets',
    category: 'utility',
    defaultVisible: true,
    description: '桌面小组件'
  },
  {
    id: 'checkphone',
    name: '查手机',
    icon: '🔍',
    route: '/checkphone',
    category: 'utility',
    defaultVisible: true,
    description: '查看角色手机'
  }
]

// 获取默认可见的 App
export function getDefaultApps(): AppInfo[] {
  return appsRegistry.filter(app => app.defaultVisible)
}

// 根据 ID 获取 App
export function getAppById(id: string): AppInfo | undefined {
  return appsRegistry.find(app => app.id === id)
}

// 根据分类获取 App
export function getAppsByCategory(category: AppInfo['category']): AppInfo[] {
  return appsRegistry.filter(app => app.category === category)
}
