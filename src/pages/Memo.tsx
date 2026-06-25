import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Memo {
  id?: number
  title: string
  content: string
  timestamp: number
  isPinned: boolean
}

const Memo: React.FC = () => {
  const [memos, setMemos] = useState<Memo[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadMemos()
  }, [])

  const loadMemos = async () => {
    try {
      const memoData = await db.memos.toArray()
      setMemos(memoData.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1
        if (!a.isPinned && b.isPinned) return 1
        return b.timestamp - a.timestamp
      }))
    } catch (error) {
      console.error('加载备忘录失败:', error)
    }
  }

  const handleCreateMemo = async () => {
    if (!newTitle.trim() && !newContent.trim()) return

    const memo: Memo = {
      title: newTitle || '无标题',
      content: newContent,
      timestamp: Date.now(),
      isPinned: false
    }

    await db.memos.add(memo)
    await loadMemos()
    setNewTitle('')
    setNewContent('')
    setShowCreateModal(false)
  }

  const handleUpdateMemo = async () => {
    if (!editingMemo || !editingMemo.id) return

    const updated = {
      ...editingMemo,
      title: newTitle || '无标题',
      content: newContent,
      timestamp: Date.now()
    }

    await db.memos.update(editingMemo.id, updated)
    await loadMemos()
    setEditingMemo(null)
    setNewTitle('')
    setNewContent('')
    setShowCreateModal(false)
  }

  const handleDeleteMemo = async (memo: Memo) => {
    if (!memo.id) return
    if (confirm('确定要删除这条备忘录吗？')) {
      await db.memos.delete(memo.id)
      await loadMemos()
    }
  }

  const handleTogglePin = async (memo: Memo) => {
    if (!memo.id) return
    await db.memos.update(memo.id, { isPinned: !memo.isPinned })
    await loadMemos()
  }

  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo)
    setNewTitle(memo.title)
    setNewContent(memo.content)
    setShowCreateModal(true)
  }

  const filteredMemos = memos.filter(memo =>
    memo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    memo.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>备忘录</h1>
        <button
          onClick={() => {
            setEditingMemo(null)
            setNewTitle('')
            setNewContent('')
            setShowCreateModal(true)
          }}
          style={{
            padding: '8px 16px',
            background: '#007aff',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + 新建
        </button>
      </div>

      {/* 搜索框 */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索备忘录..."
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

      {/* 备忘录列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {filteredMemos.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>还没有备忘录，创建第一条吧</p>
          </div>
        ) : (
          filteredMemos.map(memo => (
            <div
              key={memo.id}
              onClick={() => handleEditMemo(memo)}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '120px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {memo.isPinned && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  fontSize: '12px',
                  color: '#007aff'
                }}>
                  📌
                </div>
              )}
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '8px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                paddingRight: memo.isPinned ? '24px' : '0'
              }}>
                {memo.title}
              </div>
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginBottom: '12px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                lineHeight: '1.4'
              }}>
                {memo.content}
              </div>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {formatDate(memo.timestamp)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 创建/编辑弹窗 */}
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
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                {editingMemo ? '编辑备忘录' : '新建备忘录'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setEditingMemo(null)
                  setNewTitle('')
                  setNewContent('')
                }}
                style={{
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="标题"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderBottom: '1px solid #e5e5e5',
                  fontSize: '18px',
                  fontWeight: '600',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="输入内容..."
                rows={8}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  fontSize: '16px',
                  resize: 'none',
                  outline: 'none',
                  lineHeight: '1.6'
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '12px', color: '#999' }}>
                {newContent.length} 字
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {editingMemo && (
                  <button
                    onClick={() => handleTogglePin(editingMemo)}
                    style={{
                      padding: '8px 16px',
                      background: editingMemo.isPinned ? '#007aff' : '#e5e5e5',
                      color: editingMemo.isPinned ? 'white' : '#333',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {editingMemo.isPinned ? '取消置顶' : '置顶'}
                  </button>
                )}
                {editingMemo && (
                  <button
                    onClick={() => handleDeleteMemo(editingMemo)}
                    style={{
                      padding: '8px 16px',
                      background: '#ff3b30',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    删除
                  </button>
                )}
                <button
                  onClick={editingMemo ? handleUpdateMemo : handleCreateMemo}
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
                  {editingMemo ? '保存' : '完成'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Memo
