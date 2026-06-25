import { BrowserRouter, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AppRouter from './router/AppRouter'
import BottomNavigation from './components/BottomNavigation'
import { backgroundScheduler, initDefaultTasks } from './services/BackgroundScheduler'
import { checkFeatureSupport, showFeatureWarning } from './utils/storageUtils'

function AppContent() {
  const location = useLocation()
  const [showWarning, setShowWarning] = useState(false)
  const [warnings, setWarnings] = useState<string[]>([])

  // 在主页和设置页不显示底部导航
  const showBottomNav = location.pathname !== '/' && location.pathname !== '/settings' && location.pathname !== '/console'

  useEffect(() => {
    // 检查功能支持
    const features = checkFeatureSupport()
    const featureWarnings = showFeatureWarning(features)
    
    if (featureWarnings.length > 0) {
      setWarnings(featureWarnings)
      setShowWarning(true)
    }

    // 初始化后台调度器
    initDefaultTasks()
    backgroundScheduler.startScheduler()
    backgroundScheduler.startKeepAlive()

    return () => {
      backgroundScheduler.stopScheduler()
      backgroundScheduler.stopKeepAlive()
    }
  }, [])

  return (
    <>
      {showWarning && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#fff3cd',
          color: '#856404',
          padding: '12px 16px',
          zIndex: 9999,
          borderBottom: '1px solid #ffeeba'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            ⚠️ 功能限制提示
          </div>
          <ul style={{ fontSize: '12px', margin: 0, paddingLeft: '20px' }}>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
          <button
            onClick={() => setShowWarning(false)}
            style={{
              marginTop: '8px',
              padding: '4px 12px',
              background: '#856404',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            知道了
          </button>
        </div>
      )}
      <AppRouter />
      {showBottomNav && <BottomNavigation />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
