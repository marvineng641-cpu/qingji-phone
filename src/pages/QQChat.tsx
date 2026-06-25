import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
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
}

interface Message {
  id?: number
  characterId: number
  content: string
  role: 'user' | 'assistant'
  timestamp: number
  type: 'text' | 'image' | 'voice' | 'redpacket' | 'transfer' | 'location' | 'voicecall' | 'videocall'
}

const QQChat: React.FC = () => {
  const { characterId } = useParams<{ characterId: string }>()
  // const navigate = useNavigate()
  const [character, setCharacter] = useState<Character | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [showFunctionBar, setShowFunctionBar] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [innerVoice, setInnerVoice] = useState('')

  useEffect(() => {
    if (characterId) {
      loadCharacter(Number(characterId))
      loadMessages(Number(characterId))
    }
  }, [characterId])

  const loadCharacter = async (id: number) => {
    try {
      const char = await db.characters.get(id)
      setCharacter(char || null)
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  const loadMessages = async (charId: number) => {
    try {
      const msgs = await db.messages.where({ characterId: charId }).toArray()
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp))
    } catch (error) {
      console.error('加载消息失败:', error)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || !character) return

    const userMessage: Message = {
      characterId: character.id!,
      content: inputText,
      role: 'user',
      timestamp: Date.now(),
      type: 'text'
    }

    await db.messages.add(userMessage)
    setMessages([...messages, userMessage])
    setInputText('')
  }

  const handleCatClick = async () => {
    // 触发 AI 回复（小猫按钮）
    if (!character) return
    
    // 这里应该调用 AI 服务获取回复
    // 暂时模拟回复
    const aiMessage: Message = {
      characterId: character.id!,
      content: '（AI 回复功能将在后续实现）',
      role: 'assistant',
      timestamp: Date.now(),
      type: 'text'
    }

    await db.messages.add(aiMessage)
    setMessages([...messages, aiMessage])
  }

  const handleAvatarClick = () => {
    // 单击头像显示心声
    if (character) {
      setInnerVoice(`${character.name} 的心声：...`)
    }
  }

  const handleAvatarDoubleClick = () => {
    // 双击拍一拍
    if (character) {
      const patMessage = `你拍了拍 ${character.name} ${character.patText}`
      const msg: Message = {
        characterId: character.id!,
        content: patMessage,
        role: 'user',
        timestamp: Date.now(),
        type: 'text'
      }
      db.messages.add(msg)
      setMessages([...messages, msg])
    }
  }

  const handleProfileMenu = () => {
    setShowProfileMenu(true)
  }

  if (!character) {
    return (
      <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
        <BackButton />
        <p>角色不存在</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#f5f5f5' }}>
      {/* 顶部栏 */}
      <div style={{
        position: 'relative',
        padding: '12px 16px',
        background: 'white',
        borderBottom: '1px solid #e5e5e5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <BackButton />
        
        <div
          onClick={handleAvatarClick}
          onDoubleClick={handleAvatarDoubleClick}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#e5e5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          {character.avatar}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>{character.name}</div>
          {character.remark && (
            <div style={{ fontSize: '12px', color: '#666' }}>备注: {character.remark}</div>
          )}
        </div>

        <button
          onClick={handleProfileMenu}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer'
          }}
        >
          ☰
        </button>
      </div>

      {/* 消息列表 */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '70%',
              padding: '10px 14px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? '#95ec69' : 'white',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
            }}>
              {msg.type === 'text' && (
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
              )}
              {msg.type === 'image' && (
                <div style={{ fontSize: '12px', color: '#666' }}>[图片]</div>
              )}
              {msg.type === 'voice' && (
                <div style={{ fontSize: '12px', color: '#666' }}>[语音]</div>
              )}
              {msg.type === 'redpacket' && (
                <div style={{ fontSize: '12px', color: '#ff3b30' }}>[红包]</div>
              )}
              {msg.type === 'transfer' && (
                <div style={{ fontSize: '12px', color: '#ff9500' }}>[转账]</div>
              )}
              {msg.type === 'location' && (
                <div style={{ fontSize: '12px', color: '#007aff' }}>[定位]</div>
              )}
              {msg.type === 'voicecall' && (
                <div style={{ fontSize: '12px', color: '#5856d6' }}>[语音通话]</div>
              )}
              {msg.type === 'videocall' && (
                <div style={{ fontSize: '12px', color: '#5856d6' }}>[视频通话]</div>
              )}
            </div>
          </div>
        ))}
        
        {innerVoice && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#666',
            fontStyle: 'italic'
          }}>
            {innerVoice}
          </div>
        )}
      </div>

      {/* 输入区域 */}
      <div style={{
        padding: '12px 16px',
        background: 'white',
        borderTop: '1px solid #e5e5e5'
      }}>
        {showFunctionBar && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '12px',
            padding: '12px 0',
            borderBottom: '1px solid #e5e5e5',
            marginBottom: '12px'
          }}>
            {character.micEnabled && (
              <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
                🎤
              </button>
            )}
            {character.visionEnabled && (
              <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
                📷
              </button>
            )}
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📷
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              🧧
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              💰
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📍
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📞
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📹
            </button>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setShowFunctionBar(!showFunctionBar)}
            style={{
              padding: '8px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            +
          </button>
          
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入消息..."
            style={{
              flex: 1,
              padding: '10px 14px',
              border: '1px solid #e5e5e5',
              borderRadius: '20px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          
          <button
            onClick={handleSend}
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
            发送
          </button>
          
          <button
            onClick={handleCatClick}
            style={{
              padding: '8px 12px',
              background: '#ff9500',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🐱
          </button>
        </div>
      </div>

      {/* 角色主页菜单 */}
      {showProfileMenu && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '80%',
          maxWidth: '300px',
          height: '100%',
          background: 'white',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          padding: '20px'
        }}>
          <button
            onClick={() => setShowProfileMenu(false)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              padding: '8px',
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>

          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            {character.name} 的主页
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>麦克风交流</label>
            <input
              type="checkbox"
              checked={character.micEnabled}
              onChange={(e) => {
                const updated = { ...character, micEnabled: e.target.checked }
                db.characters.update(character.id!, updated)
                setCharacter(updated)
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>画面感知</label>
            <input
              type="checkbox"
              checked={character.visionEnabled}
              onChange={(e) => {
                const updated = { ...character, visionEnabled: e.target.checked }
                db.characters.update(character.id!, updated)
                setCharacter(updated)
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>拍一拍文字</label>
            <input
              type="text"
              value={character.patText}
              onChange={(e) => {
                const updated = { ...character, patText: e.target.value }
                db.characters.update(character.id!, updated)
                setCharacter(updated)
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>人设</label>
            <textarea
              value={character.persona}
              onChange={(e) => {
                const updated = { ...character, persona: e.target.value }
                db.characters.update(character.id!, updated)
                setCharacter(updated)
              }}
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>绑定世界书</label>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {character.boundWorldbookIds.length > 0 
                ? `已绑定 ${character.boundWorldbookIds.length} 条世界书`
                : '未绑定世界书'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default QQChat
