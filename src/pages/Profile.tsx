import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../db'

const Profile: React.FC = () => {
  const navigate = useNavigate()
  const [characterCount, setCharacterCount] = useState(0)
  const [groupCount, setGroupCount] = useState(0)
  const [postCount, setPostCount] = useState(0)
  const [favoriteCount, setFavoriteCount] = useState(0)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [chars, groups, posts, favorites] = await Promise.all([
        db.characters.toArray(),
        db.groups.toArray(),
        db.posts.toArray(),
        db.favorites.toArray()
      ])
      setCharacterCount(chars.length)
      setGroupCount(groups.length)
      setPostCount(posts.length)
      setFavoriteCount(favorites.length)
    } catch (error) {
      console.error('加载统计失败:', error)
    }
  }

  const menuItems = [
    { icon: '👤', label: '我的角色', count: characterCount, path: '/qq' },
    { icon: '👥', label: '我的群聊', count: groupCount, path: '/qq' },
    { icon: '📰', label: '我的动态', count: postCount, path: '/qq/dynamic' },
    { icon: '⭐', label: '我的收藏', count: favoriteCount, path: '/qq/dynamic' },
    { icon: '📚', label: '世界书', count: 0, path: '/worldbook' },
    { icon: '⚙', label: '设置', count: 0, path: '/settings' },
    { icon: '🖥', label: '控制台', count: 0, path: '/console' }
  ]

  return (
    <div style={{ 
      padding: '60px 16px 80px', 
      height: '100vh', 
      overflow: 'auto', 
      background: '#f5f5f5' 
    }}>
      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '32px',
          color: 'white'
        }}>
          👤
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>我的主页</h1>
          <p style={{ fontSize: '14px', color: '#666', margin: '4px 0 0 0' }}>
            欢迎使用晴机
          </p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#007aff' }}>
            {characterCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>角色</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#5856d6' }}>
            {groupCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>群聊</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '16px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#ff9500' }}>
            {postCount}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>动态</div>
        </div>
      </div>

      {/* 功能菜单 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '8px 0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        {menuItems.map((item, index) => (
          <div
            key={item.label}
            onClick={() => navigate(item.path)}
            style={{
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid #f0f0f0' : 'none'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px'
            }}>
              {item.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: '500' }}>{item.label}</div>
            </div>
            {item.count > 0 && (
              <div style={{
                padding: '4px 8px',
                background: '#ff3b30',
                color: 'white',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {item.count}
              </div>
            )}
            <div style={{ fontSize: '14px', color: '#ccc' }}>›</div>
          </div>
        ))}
      </div>

      {/* 跨聊天消息 */}
      <div style={{
        marginTop: '24px',
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
          跨聊天消息
        </h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
          开启后，角色可以在不同聊天之间传递消息
        </p>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            defaultChecked={false}
            style={{ width: '20px', height: '20px' }}
          />
          <span style={{ fontSize: '14px' }}>启用跨聊天消息</span>
        </label>
      </div>
    </div>
  )
}

export default Profile
