import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Theme {
  id?: number
  name: string
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  buttonStyle: 'rounded' | 'square' | 'pill'
  isCustom: boolean
}

const Wallpaper: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([])
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    name: '',
    primaryColor: '#007aff',
    secondaryColor: '#5856d6',
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    buttonStyle: 'rounded',
    isCustom: true
  })

  useEffect(() => {
    loadThemes()
  }, [])

  const loadThemes = async () => {
    try {
      const themeData = await db.themes.toArray()
      if (themeData.length === 0) {
        // 初始化默认主题
        const defaultThemes: Theme[] = [
          { id: 1, name: '默认蓝色', primaryColor: '#007aff', secondaryColor: '#5856d6', backgroundColor: '#f5f5f5', textColor: '#333333', buttonStyle: 'rounded', isCustom: false },
          { id: 2, name: '暗黑模式', primaryColor: '#0a84ff', secondaryColor: '#5e5ce6', backgroundColor: '#000000', textColor: '#ffffff', buttonStyle: 'rounded', isCustom: false },
          { id: 3, name: '粉色主题', primaryColor: '#ff2d55', secondaryColor: '#ff9500', backgroundColor: '#fff0f5', textColor: '#333333', buttonStyle: 'pill', isCustom: false },
          { id: 4, name: '绿色自然', primaryColor: '#34c759', secondaryColor: '#30b0c7', backgroundColor: '#f0fff4', textColor: '#333333', buttonStyle: 'square', isCustom: false }
        ]
        for (const t of defaultThemes) {
          await db.themes.add(t)
        }
        setThemes(defaultThemes)
        setCurrentTheme(defaultThemes[0])
      } else {
        setThemes(themeData)
        const active = await db.themes.where({ isActive: true }).first()
        setCurrentTheme(active || themeData[0])
      }
    } catch (error) {
      console.error('加载主题失败:', error)
    }
  }

  const handleApplyTheme = async (theme: Theme) => {
    setCurrentTheme(theme)
    // 保存到 localStorage 以便全局应用
    localStorage.setItem('currentTheme', JSON.stringify(theme))
    alert(`已应用主题: ${theme.name}`)
  }

  const handleCreateTheme = async () => {
    if (!newTheme.name) return

    const theme: Theme = {
      ...newTheme as Theme,
      isCustom: true
    }

    await db.themes.add(theme)
    await loadThemes()
    setNewTheme({
      name: '',
      primaryColor: '#007aff',
      secondaryColor: '#5856d6',
      backgroundColor: '#f5f5f5',
      textColor: '#333333',
      buttonStyle: 'rounded',
      isCustom: true
    })
    setShowCreateModal(false)
  }

  const handleDeleteTheme = async (theme: Theme) => {
    if (!theme.isCustom) {
      alert('默认主题不能删除')
      return
    }
    if (!theme.id) return
    await db.themes.delete(theme.id)
    await loadThemes()
  }

  const handleExportTheme = (theme: Theme) => {
    const data = JSON.stringify(theme, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${theme.name}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTheme = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const theme = JSON.parse(text)
        await db.themes.add({ ...theme, isCustom: true })
        await loadThemes()
        alert('主题导入成功')
      } catch (error) {
        alert('主题导入失败')
      }
    }
    input.click()
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: currentTheme?.backgroundColor || '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: currentTheme?.textColor || '#333' }}>壁纸</h1>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            flex: 1,
            padding: '12px',
            background: currentTheme?.primaryColor || '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: currentTheme?.buttonStyle === 'pill' ? '24px' : currentTheme?.buttonStyle === 'square' ? '4px' : '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + 创建主题
        </button>
        <button
          onClick={handleImportTheme}
          style={{
            flex: 1,
            padding: '12px',
            background: currentTheme?.secondaryColor || '#5856d6',
            color: 'white',
            border: 'none',
            borderRadius: currentTheme?.buttonStyle === 'pill' ? '24px' : currentTheme?.buttonStyle === 'square' ? '4px' : '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          导入主题
        </button>
      </div>

      {/* 主题列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {themes.map(theme => (
          <div
            key={theme.id}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: currentTheme?.id === theme.id ? `3px solid ${theme.primaryColor}` : 'none'
            }}
          >
            <div style={{
              height: '80px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
              marginBottom: '12px'
            }} />
            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#333' }}>
              {theme.name}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={() => handleApplyTheme(theme)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: theme.primaryColor,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.buttonStyle === 'pill' ? '16px' : theme.buttonStyle === 'square' ? '4px' : '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                应用
              </button>
              <button
                onClick={() => handleExportTheme(theme)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: theme.buttonStyle === 'pill' ? '16px' : theme.buttonStyle === 'square' ? '4px' : '6px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                导出
              </button>
              {theme.isCustom && (
                <button
                  onClick={() => handleDeleteTheme(theme)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ff3b30',
                    color: 'white',
                    border: 'none',
                    borderRadius: theme.buttonStyle === 'pill' ? '16px' : theme.buttonStyle === 'square' ? '4px' : '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 创建主题弹窗 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            width: '80%',
            maxWidth: '400px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>创建主题</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>主题名称</label>
              <input
                type="text"
                value={newTheme.name}
                onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>主色调</label>
              <input
                type="color"
                value={newTheme.primaryColor}
                onChange={(e) => setNewTheme({ ...newTheme, primaryColor: e.target.value })}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>辅助色</label>
              <input
                type="color"
                value={newTheme.secondaryColor}
                onChange={(e) => setNewTheme({ ...newTheme, secondaryColor: e.target.value })}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>背景色</label>
              <input
                type="color"
                value={newTheme.backgroundColor}
                onChange={(e) => setNewTheme({ ...newTheme, backgroundColor: e.target.value })}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>文字颜色</label>
              <input
                type="color"
                value={newTheme.textColor}
                onChange={(e) => setNewTheme({ ...newTheme, textColor: e.target.value })}
                style={{ width: '100%', height: '40px', border: 'none', borderRadius: '8px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>按钮样式</label>
              <select
                value={newTheme.buttonStyle}
                onChange={(e) => setNewTheme({ ...newTheme, buttonStyle: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="rounded">圆角</option>
                <option value="square">方形</option>
                <option value="pill">胶囊</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreateTheme}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#007aff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                创建
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTheme({
                    name: '',
                    primaryColor: '#007aff',
                    secondaryColor: '#5856d6',
                    backgroundColor: '#f5f5f5',
                    textColor: '#333333',
                    buttonStyle: 'rounded',
                    isCustom: true
                  })
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#e5e5e5',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wallpaper
