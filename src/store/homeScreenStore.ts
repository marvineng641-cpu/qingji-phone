import { create } from 'zustand'
import { db } from '../db'
import { getDefaultApps } from '../registry/appsRegistry'

interface HomeScreenItem {
  id: string
  appId: string
  screen: number
  position: number
}

interface HomeScreenState {
  screens: HomeScreenItem[][]
  isEditMode: boolean
  setEditMode: (mode: boolean) => void
  loadScreens: () => Promise<void>
  saveScreens: (screens: HomeScreenItem[][]) => Promise<void>
  moveItem: (fromScreen: number, fromIndex: number, toScreen: number, toIndex: number) => void
  addItem: (appId: string) => Promise<void>
  removeItem: (screen: number, index: number) => void
}

const SCREENS_COUNT = 3
const ITEMS_PER_SCREEN = 16 // 4x4 网格

export const useHomeScreenStore = create<HomeScreenState>((set, get) => ({
  screens: [[], [], []],
  isEditMode: false,

  setEditMode: (mode) => set({ isEditMode: mode }),

  loadScreens: async () => {
    try {
      const saved = await db.homeScreen.toArray()
      if (saved.length > 0) {
        // 从数据库加载
        const screens: HomeScreenItem[][] = [[], [], []]
        saved.forEach(item => {
          if (item.screen < SCREENS_COUNT) {
            screens[item.screen].push(item)
          }
        })
        // 按位置排序
        screens.forEach(screen => screen.sort((a, b) => a.position - b.position))
        set({ screens })
      } else {
        // 首次加载，从注册表初始化
        const defaultApps = getDefaultApps()
        const screens: HomeScreenItem[][] = [[], [], []]
        const items: HomeScreenItem[] = []
        
        defaultApps.forEach((app, index) => {
          const screenIndex = Math.floor(index / ITEMS_PER_SCREEN)
          const position = index % ITEMS_PER_SCREEN
          if (screenIndex < SCREENS_COUNT) {
            const item: HomeScreenItem = {
              id: `${app.id}_${Date.now()}`,
              appId: app.id,
              screen: screenIndex,
              position
            }
            screens[screenIndex].push(item)
            items.push(item)
          }
        })
        
        // 保存到数据库
        await db.homeScreen.bulkPut(items)
        set({ screens })
      }
    } catch (error) {
      console.error('加载主屏幕失败:', error)
    }
  },

  saveScreens: async (screens) => {
    try {
      const items: HomeScreenItem[] = []
      screens.forEach((screen, screenIndex) => {
        screen.forEach((item, index) => {
          items.push({
            ...item,
            screen: screenIndex,
            position: index
          })
        })
      })
      await db.homeScreen.clear()
      await db.homeScreen.bulkPut(items)
    } catch (error) {
      console.error('保存主屏幕失败:', error)
    }
  },

  moveItem: (fromScreen, fromIndex, toScreen, toIndex) => {
    const { screens } = get()
    const newScreens = screens.map(s => [...s])
    
    const [movedItem] = newScreens[fromScreen].splice(fromIndex, 1)
    newScreens[toScreen].splice(toIndex, 0, movedItem)
    
    set({ screens: newScreens })
    get().saveScreens(newScreens)
  },

  addItem: async (appId) => {
    const { screens } = get()
    const newScreens = screens.map(s => [...s])
    
    // 找到第一个有空位的屏幕
    let targetScreen = 0
    let targetPosition = 0
    for (let i = 0; i < SCREENS_COUNT; i++) {
      if (newScreens[i].length < ITEMS_PER_SCREEN) {
        targetScreen = i
        targetPosition = newScreens[i].length
        break
      }
    }
    
    const newItem: HomeScreenItem = {
      id: `${appId}_${Date.now()}`,
      appId,
      screen: targetScreen,
      position: targetPosition
    }
    
    newScreens[targetScreen].push(newItem)
 set({ screens: newScreens })
    await get().saveScreens(newScreens)
  },

  removeItem: (screen, index) => {
    const { screens } = get()
    const newScreens = screens.map(s => [...s])
    const [removedItem] = newScreens[screen].splice(index, 1)
    
    // 从数据库删除
    db.homeScreen.delete(removedItem.id)
    set({ screens: newScreens })
  }
}))
