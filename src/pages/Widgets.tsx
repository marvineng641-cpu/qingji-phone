import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Widget {
  id?: number
  type: 'clock' | 'weather' | 'calendar' | 'notes' | 'custom'
  title: string
  content: string
  position: number
  size: 'small' | 'medium' | 'large'
  isActive: boolean
}

const Widgets: React.FC = () => {
  const [widgets, setWidgets] = useState<Widget[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWidget, setNewWidget] = useState<Partial<Widget>>({
    type: 'clock',
    title: '',
    content: '',
    size: 'medium',
    isActive: true
  })

  useEffect(() => {
    loadWidgets()
  }, [])

  const loadWidgets = async () => {
    try {
      const widgetData = await db.widgets.toArray()
      setWidgets(widgetData.sort((a: any, b: any) => a.position - b.position))
    } catch (error) {
      console.error('加载小组件失败:', error)
    }
  }

  const handleCreateWidget = async () => {
    if (!newWidget.title) return

    const widget: Widget = {
      ...newWidget as Widget,
      position: widgets.length,
      content: newWidget.content || ''
    }

    await db.widgets.add(widget)
    await loadWidgets()
    setNewWidget({
      type: 'clock',
      title: '',
      content: '',
      size: 'medium',
      isActive: true
    })
    setShowCreateModal(false)
  }

  const handleDeleteWidget = async (widget: Widget) => {
    if (!widget.id) return
    if (confirm('确定要删除这个小组件吗？')) {
      await db.widgets.delete(widget.id)
      await loadWidgets()
    }
  }

  const handleToggleActive = async (widget: Widget) => {
    if (!widget.id) return
    await db.widgets.update(widget.id, { isActive: !widget.isActive })
    await loadWidgets()
  }

  const handleImportWidget = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const text = await file.text()
      try {
        const widget = JSON.parse(text)
        await db.widgets.add({ ...widget, position: widgets.length })
        await loadWidgets()
        alert('小组件导入成功')
      } catch (error) {
        alert('小组件导入失败')
      }
    }
    input.click()
  }

  const handleExportWidget = (widget: Widget) => {
    const data = JSON.stringify(widget, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${widget.title}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getWidgetIcon = (type: Widget['type']) => {
    switch (type) {
      case 'clock': return '⏰'
      case 'weather': return '🌤️'
      case 'calendar': return '📅'
      case 'notes': return '📝'
      case 'custom': return '🎨'
      default: return '📱'
    }
  }

  const getSizeLabel = (size: Widget['size']) => {
    switch (size) {
      case 'small': return '小'
      case 'medium': return '中'
      case 'large': return '大'
      default: return '中'
    }
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>小组件</h1>

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={() => setShowCreateModal(true)}
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
          + 添加小组件
        </button>
        <button
          onClick={handleImportWidget}
          style={{
            flex: 1,
            padding: '12px',
            background: '#5856d6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          导入小组件
        </button>
      </div>

      {/* 小组件列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {widgets.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '12px'
          }}>
            <p>还没有小组件，添加一个吧</p>
          </div>
        ) : (
          widgets.map(widget => (
            <div
              key={widget.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                opacity: widget.isActive ? 1 : 0.5
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  background: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px'
                }}>
                  {getWidgetIcon(widget.type)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {widget.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {getSizeLabel(widget.size)} · {widget.type === 'custom' ? '自定义' : widget.type}
                  </div>
                </div>
                <button
                  onClick={() => handleToggleActive(widget)}
                  style={{
                    padding: '8px',
                    background: widget.isActive ? '#34c759' : '#e5e5e5',
                    color: widget.isActive ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {widget.isActive ? '启用' : '禁用'}
                </button>
              </div>
              {widget.content && (
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '12px',
                  padding: '8px',
                  background: '#f9f9f9',
                  borderRadius: '6px'
                }}>
                  {widget.content}
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleExportWidget(widget)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#e5e5e5',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  导出
                </button>
                <button
                  onClick={() => handleDeleteWidget(widget)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ff3b30',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建小组件弹窗 */}
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
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>添加小组件</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>小组件名称</label>
              <input
                type="text"
                value={newWidget.title}
                onChange={(e) => setNewWidget({ ...newWidget, title: e.target.value })}
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
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>类型</label>
              <select
                value={newWidget.type}
                onChange={(e) => setNewWidget({ ...newWidget, type: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="clock">时钟</option>
                <option value="weather">天气</option>
                <option value="calendar">日历</option>
                <option value="notes">笔记</option>
                <option value="custom">自定义</option>
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>大小</label>
              <select
                value={newWidget.size}
                onChange={(e) => setNewWidget({ ...newWidget, size: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="small">小</option>
                <option value="medium">中</option>
                <option value="large">大</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>内容（可选）</label>
              <textarea
                value={newWidget.content}
                onChange={(e) => setNewWidget({ ...newWidget, content: e.target.value })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreateWidget}
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
                添加
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewWidget({
                    type: 'clock',
                    title: '',
                    content: '',
                    size: 'medium',
                    isActive: true
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

export default Widgets
