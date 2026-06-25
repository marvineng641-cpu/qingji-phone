import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import SettingItemComponent from '../components/SettingItem'
import { settingsSchema, SettingSection } from '../registry/settingsSchema'
import { useAPIStore } from '../store/apiStore'

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({})
  const { loadPresets, currentConfig, temperature, topP, maxTokens, updateConfig, updateParams } = useAPIStore()

  useEffect(() => {
    loadPresets()
    
    // 初始化设置值
    const initialValues: Record<string, any> = {}
    
    // API 配置
    if (currentConfig) {
      Object.entries(currentConfig).forEach(([key, value]) => {
        initialValues[key] = value
      })
    }
    
    // 参数
    initialValues.temperature = temperature
    initialValues.topP = topP
    initialValues.maxTokens = maxTokens
    
    // 开关默认值
    initialValues.backgroundActivity = true
    initialValues.characterKnowsCheckPhone = false
    initialValues.characterCanCheckPhone = false
    initialValues.crossChatMessages = false
    initialValues.enableInnerVoice = true
    initialValues.backgroundKeepAlive = true
    initialValues.systemNotification = true
    initialValues.consoleEnabled = true
    
    setSettings(initialValues)
  }, [loadPresets, currentConfig, temperature, topP, maxTokens])

  const handleSettingChange = (id: string, value: any) => {
    setSettings(prev => ({ ...prev, [id]: value }))
    
    // 根据 ID 分类更新
    if (['main', 'voice', 'imageRecognition', 'imageGen', 'coupleSpace', 'xiaohongshu', 'xApp', 'taobao', 'email', 'xianyu', 'auction', 'forum', 'game'].includes(id)) {
      updateConfig({ [id]: value })
    } else if (['temperature', 'topP', 'maxTokens'].includes(id)) {
      updateParams({ [id]: value })
    }
  }

  return (
    <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />
      
      <h1 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '20px' }}>设置</h1>
      
      {settingsSchema.map((section: SettingSection) => (
        <div key={section.id} style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px', color: '#333' }}>
            {section.title}
          </h2>
          
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '0 16px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            {section.items.map(item => (
              <SettingItemComponent
                key={item.id}
                item={item}
                value={settings[item.id] ?? item.defaultValue}
                onChange={(value) => handleSettingChange(item.id, value)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Settings
