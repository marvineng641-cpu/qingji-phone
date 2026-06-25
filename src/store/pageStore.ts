import { create } from 'zustand'

interface PageState {
  pageStack: string[]
  pushPage: (page: string) => void
  popPage: () => string | null
  clearStack: () => void
}

export const usePageStore = create<PageState>((set) => ({
  pageStack: [],
  pushPage: (page) => set((state) => ({ pageStack: [...state.pageStack, page] })),
  popPage: () => {
    let previousPage: string | null = null
    set((state) => {
      const newStack = [...state.pageStack]
      previousPage = newStack.pop() || null
      return { pageStack: newStack }
    })
    return previousPage
  },
  clearStack: () => set({ pageStack: [] })
}))
