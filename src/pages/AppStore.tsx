import React, { useState } from 'react'
import BackButton from '../components/BackButton'
import { useNavigate } from 'react-router-dom'
import { appsRegistry } from '../registry/appsRegistry'

const AppStore: React.FC = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [installedApps, setInstalledApps] = useState<string[]>([])

  const filteredApps = appsRegistry.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (app.description && app.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleInstall = (appId: string) => {
    if (installedApps.includes(appId)) {
      alert('该应用已安装')
      return
    }
    setInstalledApps([...installedApps, appId])
    alert(`${appsRegistry.find(a => a.id === appId)?.name} 安装成功！已添加到主屏幕`)
  }

  const handleOpen = (route: string) => {
    navigate(route)
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>应用市场</h1>

      {/* 搜索框 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索应用..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e5e5e5',
            borderRadius: '24px',
            fontSize: '14px',
            background: 'white'
          }}
        />
      </div>

      {/* 分类标签 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflow: 'auto',
        paddingBottom: '8px',
        marginBottom: '16px',
        scrollbarWidth: 'none'
      }}>
        {['全部', '社交', '工具', '娱乐', '生活'].map(category => (
          <button
            key={category}
            style={{
              padding: '8px 16px',
              background: '#007aff',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '14px',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 应用列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredApps.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666',
            background: 'white',
            borderRadius: '12px'
          }}>
            <p>没有找到应用</p>
          </div>
        ) : (
          filteredApps.map(app => {
            const isInstalled = installedApps.includes(app.id)
            return (
              <div
                key={app.id}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '12px',
                  background: '#007aff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  flexShrink: 0
                }}>
                  {app.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                    {app.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                    {app.description}
                  </div>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    {app.category}
                  </div>
                </div>
                {isInstalled ? (
                  <button
                    onClick={() => handleOpen(app.route)}
                    style={{
                      padding: '8px 16px',
                      background: '#e5e5e5',
                      color: '#666',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    打开
                  </button>
                ) : (
                  <button
                    onClick={() => handleInstall(app.id)}
                    style={{
                      padding: '8px 16px',
                      background: '#007aff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    安装
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* 已安装应用 */}
      {installedApps.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>已安装</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {installedApps.map(appId => {
              const app = appsRegistry.find(a => a.id === appId)
              if (!app) return null
              return (
                <div
                  key={appId}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '8px',
                    background: '#007aff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {app.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{app.name}</div>
                  </div>
                  <button
                    onClick={() => handleOpen(app.route)}
                    style={{
                      padding: '6px 12px',
                      background: '#007aff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    打开
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default AppStore
