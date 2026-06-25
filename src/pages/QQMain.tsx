import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Character {
  id?: number
  name: string
  avatar: string
  persona: string
  boundWorldbookIds: number[]
  micEnabled: boolean
  visionEnabled: boolean
  patText: string
  remark?: string
  isPinned?: boolean
  isMuted?: boolean
  isSpecialCare?: boolean
  sparkDays?: number
  lastSparkDate?: number
}

interface ChatListItem {
  character: Character
  lastMessage?: string
  lastMessageTime?: number
  unreadCount?: number
}

const QQMain: React.FC = () => {
  const navigate = useNavigate()
  const [chatList, setChatList] = useState<ChatListItem[]>([])
  const [activeTab, setActiveTab] = useState<'chat' | 'contacts' | 'dynamic'>('chat')
  const [showMenuForId, setShowMenuForId] = useState<number | null>(null)
  const [showRemarkModal, setShowRemarkModal] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [remarkText, setRemarkText] = useState('')

  useEffect(() => {
    loadChatList()
  }, [])

  const loadChatList = async () => {
    try {
      const chars = await db.characters.toArray()
      const list: ChatListItem[] = chars.map(char => ({
        character: char,
        lastMessage: '',
        lastMessageTime: 0,
        unreadCount: 0
      }))
      
      // 置顶的排前面
      list.sort((a, b) => {
        if (a.character.isPinned && !b.character.isPinned) return -1
        if (!a.character.isPinned && b.character.isPinned) return 1
        return 0
      })
      
      setChatList(list)
    } catch (error) {
      console.error('加载聊天列表失败:', error)
    }
  }

  const handleAddCharacter = async () => {
    const name = prompt('输入角色名称:')
    if (!name) return

    const newCharacter: Character = {
      name,
      avatar: '👤',
      persona: '请设置角色人设',
      boundWorldbookIds: [],
      micEnabled: false,
      visionEnabled: false,
      patText: '的肩膀',
      isPinned: false,
      isMuted: false,
      isSpecialCare: false,
      sparkDays: 0
    }

    try {
      const id = await db.characters.add(newCharacter)
      await loadChatList()
      navigate(`/qq/chat/${id}`)
    } catch (error) {
      console.error('添加角色失败:', error)
    }
  }

  const handleImportCharacter = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        let character: Character

        if (file.name.endsWith('.json')) {
          character = JSON.parse(content)
        } else if (file.name.endsWith('.png')) {
          character = {
            name: file.name.replace('.png', ''),
            avatar: '👤',
            persona: '从 PNG 导入的角色',
            boundWorldbookIds: [],
            micEnabled: false,
            visionEnabled: false,
            patText: '的肩膀',
            isPinned: false,
            isMuted: false,
            isSpecialCare: false,
            sparkDays: 0
          }
        } else {
          alert('不支持的文件格式')
          return
        }

        const id = await db.characters.add(character)
        await loadChatList()
        navigate(`/qq/chat/${id}`)
      } catch (error) {
        console.error('导入角色失败:', error)
        alert('导入失败')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handlePin = async (character: Character) => {
    if (!character.id) return
    const updated = { ...character, isPinned: !character.isPinned }
    await db.characters.update(character.id, updated)
    await loadChatList()
    setShowMenuForId(null)
  }

  const handleMute = async (character: Character) => {
    if (!character.id) return
    const updated = { ...character, isMuted: !character.isMuted }
    await db.characters.update(character.id, updated)
    await loadChatList()
    setShowMenuForId(null)
  }

  const handleSpecialCare = async (character: Character) => {
    if (!character.id) return
    const updated = { ...character, isSpecialCare: !character.isSpecialCare }
    await db.characters.update(character.id, updated)
    await loadChatList()
    setShowMenuForId(null)
  }

  const handleDelete = async (characterId: number) => {
    if (!confirm('确定删除这个角色吗？')) return
    try {
      await db.characters.delete(characterId)
      await db.messages.where({ characterId }).delete()
      await loadChatList()
      setShowMenuForId(null)
    } catch (error) {
      console.error('删除角色失败:', error)
    }
  }

  const handleSetRemark = (character: Character) => {
    setEditingCharacter(character)
    setRemarkText(character.remark || '')
    setShowRemarkModal(true)
    setShowMenuForId(null)
  }

  const saveRemark = async () => {
    if (!editingCharacter?.id) return
    const updated = { ...editingCharacter, remark: remarkText }
    await db.characters.update(editingCharacter.id, updated)
    await loadChatList()
    setShowRemarkModal(false)
    setEditingCharacter(null)
    setRemarkText('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      {/* 顶部栏 */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <BackButton />
        <h1 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>QQ</h1>
      </div>

      {/* 搜索栏 */}
      <div style={{ padding: '12px 16px', background: '#f5f5f5' }}>
        <input
          type="text"
          placeholder="搜索聊天记录或角色..."
          style={{
            width: '100%',
            padding: '10px 14px',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            background: 'white'
          }}
        />
      </div>

      {/* 内容区域 */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'chat' && (
          <div>
            <div style={{ padding: '12px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                onClick={handleAddCharacter}
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
                添加角色
              </button>
              <label style={{
                padding: '8px 16px',
                background: '#5856d6',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}>
                导入角色
                <input type="file" accept=".json,.png" onChange={handleImportCharacter} style={{ display: 'none' }} />
              </label>
            </div>

            {chatList.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: '#666' }}>
                <p>还没有角色，点击上方按钮添加</p>
              </div>
            ) : (
              chatList.map(item => (
                <div
                  key={item.character.id}
                  style={{ position: 'relative' }}
                >
                  {/* 操作菜单 */}
                  {showMenuForId === item.character.id && (
                    <div style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      display: 'flex',
                      alignItems: 'center',
                      zIndex: 10
                    }}>
                      <button
                        onClick={() => handlePin(item.character)}
                        style={{
                          padding: '16px',
                          background: '#ff9500',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        {item.character.isPinned ? '取消置顶' : '置顶'}
                      </button>
                      <button
                        onClick={() => handleMute(item.character)}
                        style={{
                          padding: '16px',
                          background: '#007aff',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        {item.character.isMuted ? '取消免打扰' : '免打扰'}
                      </button>
                      <button
                        onClick={() => handleSetRemark(item.character)}
                        style={{
                          padding: '16px',
                          background: '#5856d6',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        备注
                      </button>
                      <button
                        onClick={() => handleSpecialCare(item.character)}
                        style={{
                          padding: '16px',
                          background: '#ff3b30',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        {item.character.isSpecialCare ? '取消特别关心' : '特别关心'}
                      </button>
                      <button
                        onClick={() => item.character.id && handleDelete(item.character.id)}
                        style={{
                          padding: '16px',
                          background: '#8e8e93',
                          color: 'white',
                          border: 'none',
                          fontSize: '14px'
                        }}
                      >
                        删除
                      </button>
                    </div>
                  )}

                  {/* 聊天项 */}
                  <div
                    onClick={() => {
                      if (showMenuForId === item.character.id) {
                        setShowMenuForId(null)
                      } else {
                        navigate(`/qq/chat/${item.character.id}`)
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      if (item.character.id) {
                        setShowMenuForId(item.character.id)
                      }
                    }}
                    style={{
                      padding: '16px',
                      background: showMenuForId === item.character.id ? '#f0f0f0' : 'white',
                      borderBottom: '1px solid #e5e5e5',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      transform: showMenuForId === item.character.id ? 'translateX(-200px)' : 'translateX(0)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        background: '#e5e5e5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px'
                      }}>
                        {item.character.avatar}
                      </div>
                      {item.character.isPinned && (
                        <div style={{
                          position: 'absolute',
                          top: '-4px',
                          right: '-4px',
                          width: '16px',
                          height: '16px',
                          background: '#ff9500',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white'
                        }}>
                          📌
                        </div>
                      )}
                      {item.character.isSpecialCare && (
                        <div style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          width: '16px',
                          height: '16px',
                          background: '#ff3b30',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'white'
                        }}>
                          ❤
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ fontSize: '16px', fontWeight: '600' }}>
                          {item.character.remark || item.character.name}
                        </div>
                        {item.character.isMuted && (
                          <span style={{ fontSize: '12px', color: '#666' }}>🔇</span>
                        )}
                      </div>
                      {item.character.remark && (
                        <div style={{ fontSize: '12px', color: '#666' }}>{item.character.name}</div>
                      )}
                      {item.character.sparkDays && item.character.sparkDays > 0 && (
                        <div style={{ fontSize: '11px', color: '#ff3b30', marginTop: '4px' }}>
                          🔥 续火花 {item.character.sparkDays} 天
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'contacts' && (
          <div style={{ padding: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>特别关心</h2>
            <div style={{ marginBottom: '20px' }}>
              {chatList.filter(item => item.character.isSpecialCare).map(item => (
                <div
                  key={item.character.id}
                  onClick={() => navigate(`/qq/chat/${item.character.id}`)}
                  style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {item.character.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {item.character.remark || item.character.name}
                    </div>
                  </div>
                </div>
              ))}
              {chatList.filter(item => item.character.isSpecialCare).length === 0 && (
                <div style={{ fontSize: '12px', color: '#666' }}>暂无特别关心</div>
              )}
            </div>

            <h2 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>好友</h2>
            <div>
              {chatList.map(item => (
                <div
                  key={item.character.id}
                  onClick={() => navigate(`/qq/chat/${item.character.id}`)}
                  style={{
                    padding: '12px',
                    background: 'white',
                    borderRadius: '8px',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: '#e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    {item.character.avatar}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>
                      {item.character.remark || item.character.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'dynamic' && (
          <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
            <p>动态功能已实现，请点击底部导航进入动态页面</p>
            <button
              onClick={() => navigate('/qq/dynamic')}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                background: '#007aff',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              进入动态
            </button>
          </div>
        )}
      </div>

      {/* 底部导航 */}
      <div style={{
        display: 'flex',
        borderTop: '1px solid #e5e5e5',
        background: 'white'
      }}>
        {[
          { id: 'chat' as const, label: '消息', icon: '💬' },
          { id: 'contacts' as const, label: '好友', icon: '👥' },
          { id: 'dynamic' as const, label: '动态', icon: '📰' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px',
              background: 'none',
              border: 'none',
              fontSize: '12px',
              color: activeTab === tab.id ? '#007aff' : '#666',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span style={{ fontSize: '20px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 备注弹窗 */}
      {showRemarkModal && (
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
            maxWidth: '300px'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>设置备注</h3>
            <input
              type="text"
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              placeholder="输入备注名称"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                marginBottom: '16px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={saveRemark}
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
                确定
              </button>
              <button
                onClick={() => {
                  setShowRemarkModal(false)
                  setEditingCharacter(null)
                  setRemarkText('')
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

export default QQMain
