import { create } from 'zustand'
import { APIPreset, FunctionAPIConfig } from '../services/api/types'
import { db } from '../db'

interface APIState {
  presets: APIPreset[]
  currentPresetId: string | null
  currentConfig: FunctionAPIConfig | null
  temperature: number
  topP: number
  maxTokens: number
  
  loadPresets: () => Promise<void>
  savePreset: (preset: APIPreset) => Promise<void>
  deletePreset: (id: string) => Promise<void>
  setCurrentPreset: (id: string) => void
  updateConfig: (config: Partial<FunctionAPIConfig>) => void
  updateParams: (params: { temperature?: number; topP?: number; maxTokens?: number }) => void
}

const DEFAULT_FUNCTION_API: FunctionAPIConfig = {
  main: '',
  voice: '',
  imageRecognition: '',
  imageGen: '',
  coupleSpace: '',
  xiaohongshu: '',
  xApp: '',
  taobao: '',
  email: '',
  xianyu: '',
  auction: '',
  forum: '',
  game: ''
}

export const useAPIStore = create<APIState>((set, get) => ({
  presets: [],
  currentPresetId: null,
  currentConfig: DEFAULT_FUNCTION_API,
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 2000,

  loadPresets: async () => {
    try {
      const saved = await db.settings.where({ key: 'apiPresets' }).first()
      if (saved) {
        set({ presets: saved.value as APIPreset[] })
      }
      
      const currentPreset = await db.settings.where({ key: 'currentPresetId' }).first()
      if (currentPreset) {
        set({ currentPresetId: currentPreset.value as string })
      }

      const config = await db.settings.where({ key: 'functionAPIConfig' }).first()
      if (config) {
        set({ currentConfig: config.value as FunctionAPIConfig })
      }

      const params = await db.settings.where({ key: 'apiParams' }).first()
      if (params) {
        const { temperature, topP, maxTokens } = params.value as any
        set({ temperature, topP, maxTokens })
      }
    } catch (error) {
      console.error('加载 API 配置失败:', error)
    }
  },

  savePreset: async (preset) => {
    const { presets } = get()
    const existingIndex = presets.findIndex(p => p.id === preset.id)
    let newPresets: APIPreset[]

    if (existingIndex >= 0) {
      newPresets = [...presets]
      newPresets[existingIndex] = preset
    } else {
      newPresets = [...presets, preset]
    }

    set({ presets: newPresets })
    await db.settings.put({ key: 'apiPresets', value: newPresets })
  },

  deletePreset: async (id) => {
    const { presets, currentPresetId } = get()
    const newPresets = presets.filter(p => p.id !== id)
    
    set({ 
      presets: newPresets,
      currentPresetId: currentPresetId === id ? null : currentPresetId
    })
    
    await db.settings.put({ key: 'apiPresets', value: newPresets })
  },

  setCurrentPreset: (id) => {
    const { presets } = get()
    const preset = presets.find(p => p.id === id)
    
    if (preset) {
      set({
        currentPresetId: id,
        currentConfig: preset.functionAPIs,
        temperature: preset.temperature,
        topP: preset.topP,
        maxTokens: preset.maxTokens
      })
      
      db.settings.put({ key: 'currentPresetId', value: id })
      db.settings.put({ key: 'functionAPIConfig', value: preset.functionAPIs })
      db.settings.put({ key: 'apiParams', value: {
        temperature: preset.temperature,
        topP: preset.topP,
        maxTokens: preset.maxTokens
      }})
    }
  },

  updateConfig: (config) => {
    const { currentConfig } = get()
    const newConfig = { ...currentConfig, ...config } as FunctionAPIConfig
    set({ currentConfig: newConfig })
    db.settings.put({ key: 'functionAPIConfig', value: newConfig })
  },

  updateParams: (params) => {
    const { temperature, topP, maxTokens } = get()
    const newParams = {
      temperature: params.temperature ?? temperature,
      topP: params.topP ?? topP,
      maxTokens: params.maxTokens ?? maxTokens
    }
    set(newParams)
    db.settings.put({ key: 'apiParams', value: newParams })
  }
}))
