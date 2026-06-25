import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

const navItems: NavItem[] = [
  { id: 'home', label: '主页', icon: '🏠', path: '/' },
  { id: 'qq', label: 'QQ', icon: '💬', path: '/qq' },
  { id: 'couplespace', label: '情侣', icon: '💕', path: '/couplespace' },
  { id: 'xiaohongshu', label: '小红书', icon: '📕', path: '/xiaohongshu' },
  { id: 'profile', label: '我的', icon: '👤', path: '/profile' }
]

const BottomNavigation: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      display: 'flex',
      borderTop: '1px solid #e5e5e5',
      background: 'white',
      zIndex: 1000
    }}>
      {navItems.map(item => {
        const isActive = location.pathname === item.path || 
                         (item.path !== '/' && location.pathname.startsWith(item.path))
        
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            style={{
              flex: 1,
              padding: '8px 0',
              background: 'none',
              border: 'none',
              fontSize: '10px',
              color: isActive ? '#007aff' : '#666',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default BottomNavigation
