import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

const Storage: React.FC = () => {
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    characters: 0,
    messages: 0,
    worldbooks: 0,
    images: 0,
    cache: 0
  })
  // const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  useEffect(() => {
    calculateStorage()
  }, [])

  const calculateStorage = async () => {
    try {
      const [chars, msgs, wbs, posts, orders] = await Promise.all([
        db.characters.toArray(),
        db.messages.toArray(),
        db.worldbooks.toArray(),
        db.posts.toArray(),
        db.orders.toArray()
      ])

      // 估算存储大小（JSON 字符串长度）
      const charsSize = JSON.stringify(chars).length
      const msgsSize = JSON.stringify(msgs).length
      const wbsSize = JSON.stringify(wbs).length
      const postsSize = JSON.stringify(posts).length
      const ordersSize = JSON.stringify(orders).length

      setStorageInfo({
        totalSize: charsSize + msgsSize + wbsSize + postsSize + ordersSize,
        characters: charsSize,
        messages: msgsSize,
        worldbooks: wbsSize,
        images: postsSize + ordersSize,
        cache: 0
      })
    } catch (error) {
      console.error('计算存储失败:', error)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleClearEmojis = async () => {
    try {
      // 清空角色中的表情包数据
      const chars = await db.characters.toArray()
      for (const char of chars) {
        if (char.emojis) {
          await db.characters.update(char.id!, { emojis: [] })
        }
      }
      await calculateStorage()
      alert('表情包已清空')
    } catch (error) {
      console.error('清空表情包失败:', error)
    }
  }

  const handleClearCache = async () => {
    try {
      // 清空缓存数据（这里模拟清空一些临时数据）
      localStorage.clear()
      await calculateStorage()
      alert('缓存已清空')
    } catch (error) {
      console.error('清空缓存失败:', error)
    }
  }

  const handleExportData = async () => {
    try {
      const data = {
        characters: await db.characters.toArray(),
        messages: await db.messages.toArray(),
        worldbooks: await db.worldbooks.toArray(),
        posts: await db.posts.toArray(),
        settings: await db.settings.toArray(),
        coupleSpaces: await db.coupleSpaces.toArray(),
        coupleTasks: await db.coupleTasks.toArray(),
        coupleNotes: await db.coupleNotes.toArray(),
        coupleQuestions: await db.coupleQuestions.toArray(),
        coupleDiaries: await db.coupleDiaries.toArray(),
        couplePets: await db.couplePets.toArray(),
        coupleWishes: await db.coupleWishes.toArray(),
        coupleMoods: await db.coupleMoods.toArray(),
        coupleSleeps: await db.coupleSleeps.toArray(),
        xiaohongshuPosts: await db.xiaohongshuPosts.toArray(),
        orders: await db.orders.toArray(),
        products: await db.products.toArray(),
        wallet: await db.wallet.toArray(),
        xPosts: await db.xPosts.toArray(),
        homeScreen: await db.homeScreen.toArray(),
        memos: await db.memos.toArray(),
        widgets: await db.widgets.toArray(),
        themes: await db.themes.toArray()
      }

      const json = JSON.stringify(data, null, 2)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qingji_backup_${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      alert('数据导出成功')
    } catch (error) {
      console.error('导出数据失败:', error)
      alert('导出数据失败')
    }
  }

  const handleResetAll = async () => {
    try {
      await db.delete()
      location.reload()
    } catch (error) {
      console.error('重置失败:', error)
      alert('重置失败')
    }
  }

  const handleCompressImages = async () => {
    alert('图片压缩功能需要实际图片数据支持，当前为模拟功能')
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>存储管理</h1>

      {/* 存储概览 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>存储概览</div>
        <div style={{ fontSize: '32px', fontWeight: '700', color: '#007aff', marginBottom: '8px' }}>
          {formatSize(storageInfo.totalSize)}
        </div>
        <div style={{ fontSize: '14px', color: '#666' }}>总存储空间</div>
      </div>

      {/* 存储详情 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>存储详情</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>角色数据</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatSize(storageInfo.characters)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>消息记录</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatSize(storageInfo.messages)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>世界书</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatSize(storageInfo.worldbooks)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>图片/表情</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatSize(storageInfo.images)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>缓存</span>
            <span style={{ fontSize: '14px', fontWeight: '600' }}>{formatSize(storageInfo.cache)}</span>
          </div>
        </div>
      </div>

      {/* 清理操作 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>清理操作</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleCompressImages}
            style={{
              width: '100%',
              padding: '12px',
              background: '#007aff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            📷 压缩图片
          </button>
          <button
            onClick={handleClearEmojis}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ff9500',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            😊 清空表情包
          </button>
          <button
            onClick={handleClearCache}
            style={{
              width: '100%',
              padding: '12px',
              background: '#5856d6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🗑️ 清空缓存
          </button>
        </div>
      </div>

      {/* 数据管理 */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>数据管理</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={handleExportData}
            style={{
              width: '100%',
              padding: '12px',
              background: '#34c759',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            📤 导出数据
          </button>
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 重置所有数据
          </button>
        </div>
      </div>

      {/* 重置确认弹窗 */}
      {showResetConfirm && (
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
            maxWidth: '300px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>确认重置</h3>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              此操作将删除所有数据，无法恢复。确定要继续吗？
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleResetAll}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff3b30',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                确认重置
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
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

export default Storage
