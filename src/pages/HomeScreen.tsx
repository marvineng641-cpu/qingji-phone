import React, { useEffect, useState } from 'react'
import HomeScreenGrid from '../components/HomeScreenGrid'
import { useHomeScreenStore } from '../store/homeScreenStore'

const HomeScreen: React.FC = () => {
  const { screens, isEditMode, setEditMode, loadScreens } = useHomeScreenStore()
  const [currentScreen, setCurrentScreen] = useState(0)

  useEffect(() => {
    loadScreens()
  }, [loadScreens])

  const handleLongPress = () => {
    setEditMode(true)
  }

  const handleScreenChange = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1)
    } else if (direction === 'right' && currentScreen > 0) {
      setCurrentScreen(currentScreen - 1)
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const startX = e.touches[0].clientX
    const handleTouchEnd = (e: React.TouchEvent) => {
      const endX = e.changedTouches[0].clientX
      const diff = startX - endX
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleScreenChange('left')
        } else {
          handleScreenChange('right')
        }
      }
      
      e.currentTarget.removeEventListener('touchend', handleTouchEnd as any)
    }
    
    e.currentTarget.addEventListener('touchend', handleTouchEnd as any)
  }

  return (
    <div 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
      onTouchStart={handleTouchStart}
    >
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        zIndex: 100
      }}>
        <button
          onClick={() => setEditMode(!isEditMode)}
          style={{
            padding: '8px 16px',
            background: isEditMode ? '#ff4444' : 'rgba(255, 255, 255, 0.3)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {isEditMode ? '完成编辑' : '编辑'}
        </button>
      </div>

      {isEditMode && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          color: 'white',
          fontSize: '12px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '8px 12px',
          borderRadius: '8px'
        }}>
          长按图标可拖拽排序，点击红色 × 删除
        </div>
      )}

      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        transition: 'transform 0.3s ease',
        transform: `translateX(-${currentScreen * 100}%)`
      }}>
        {screens.map((screenItems, index) => (
          <div
            key={index}
            style={{
              minWidth: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HomeScreenGrid
              screenIndex={index}
              items={screenItems}
              isEditMode={isEditMode}
              onLongPress={handleLongPress}
            />
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute',
        bottom: '30px',
        display: 'flex',
        gap: '8px',
        zIndex: 100
      }}>
        {screens.map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentScreen(index)}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: index === currentScreen ? 'white' : 'rgba(255, 255, 255, 0.5)',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default HomeScreen
