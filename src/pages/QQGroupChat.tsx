import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Group {
  id?: number
  name: string
  avatar: string
  description: string
  memberIds: number[]
  boundWorldbookIds: number[]
  enableSuisuinian: boolean
  permissions: {
    canKick: boolean
    canMute: boolean
    canChangeName: boolean
  }
}

interface GroupMessage {
  id?: number
  groupId: number
  characterId?: number
  senderName: string
  content: string
  timestamp: number
  type: 'text' | 'image' | 'voice' | 'redpacket' | 'location'
}

const QQGroupChat: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const [group, setGroup] = useState<Group | null>(null)
  const [messages, setMessages] = useState<GroupMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [showFunctionBar, setShowFunctionBar] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    if (groupId) {
      loadGroup(Number(groupId))
      loadMessages(Number(groupId))
    }
  }, [groupId])

  const loadGroup = async (id: number) => {
    try {
      const grp = await db.groups.get(id)
      setGroup(grp || null)
      
      if (grp?.memberIds) {
        const chars = await db.characters.where('id').anyOf(grp.memberIds).toArray()
        setMembers(chars)
      }
    } catch (error) {
      console.error('加载群聊失败:', error)
    }
  }

  const loadMessages = async (grpId: number) => {
    try {
      const msgs = await db.groupMessages.where({ groupId: grpId }).toArray()
      setMessages(msgs.sort((a, b) => a.timestamp - b.timestamp))
    } catch (error) {
      console.error('加载群消息失败:', error)
    }
  }

  const handleSend = async () => {
    if (!inputText.trim() || !group) return

    const message: GroupMessage = {
      groupId: group.id!,
      characterId: undefined, // 用户发送
      senderName: '我',
      content: inputText,
      timestamp: Date.now(),
      type: 'text'
    }

    await db.groupMessages.add(message)
    setMessages([...messages, message])
    setInputText('')
  }

  const handleSuisuinian = async () => {
    if (!group) return
    // 碎碎念功能 - 随机让一个角色发言
    if (members.length === 0) return
    
    const randomMember = members[Math.floor(Math.random() * members.length)]
    const message: GroupMessage = {
      groupId: group.id!,
      characterId: randomMember.id,
      senderName: randomMember.name,
      content: '（碎碎念功能将在后续实现）',
      timestamp: Date.now(),
      type: 'text'
    }

    await db.groupMessages.add(message)
    setMessages([...messages, message])
  }

  const handleSearch = () => {
    // 查找记录功能
    alert('查找记录功能将在后续实现')
  }

  if (!group) {
    return (
      <div style={{ padding: '60px 16px 16px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
        <BackButton />
        <p>群聊不存在</p>
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
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: '#e5e5e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}
        >
          {group.avatar}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '16px', fontWeight: '600' }}>{group.name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{members.length} 人</div>
        </div>

        <button
          onClick={handleSearch}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          🔍
        </button>
        <button
          onClick={() => setShowMembers(true)}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          👥
        </button>
        <button
          onClick={() => setShowSettings(true)}
          style={{
            padding: '8px',
            background: 'none',
            border: 'none',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          ⚙
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
              justifyContent: msg.senderName === '我' ? 'flex-end' : 'flex-start',
              alignItems: 'flex-start',
              gap: '8px'
            }}
          >
            {msg.senderName !== '我' && (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                flexShrink: 0
              }}>
                {members.find(m => m.id === msg.characterId)?.avatar || '👤'}
              </div>
            )}
            
            <div>
              {msg.senderName !== '我' && (
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>{msg.senderName}</div>
              )}
              <div style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: msg.senderName === '我' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: msg.senderName === '我' ? '#95ec69' : 'white',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
              }}>
                {msg.type === 'text' && (
                  <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
                )}
              </div>
            </div>
          </div>
        ))}
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
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📷
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              🧧
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              📍
            </button>
            <button style={{ padding: '12px', background: '#f5f5f5', borderRadius: '8px', border: 'none', fontSize: '24px' }}>
              @
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
          
          {group.enableSuisuinian && (
            <button
              onClick={handleSuisuinian}
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
              碎碎念
            </button>
          )}
        </div>
      </div>

      {/* 成员列表 */}
      {showMembers && (
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
          padding: '20px',
          overflow: 'auto'
        }}>
          <button
            onClick={() => setShowMembers(false)}
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
            群成员 ({members.length})
          </h2>

          {members.map(member => (
            <div
              key={member.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderBottom: '1px solid #e5e5e5'
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
                {member.avatar}
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{member.name}</div>
                {member.remark && (
                  <div style={{ fontSize: '12px', color: '#666' }}>{member.remark}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 群设置 */}
      {showSettings && (
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
          padding: '20px',
          overflow: 'auto'
        }}>
          <button
            onClick={() => setShowSettings(false)}
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
            群设置
          </h2>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>群名称</label>
            <input
              type="text"
              value={group.name}
              onChange={async (e) => {
                const updated = { ...group, name: e.target.value }
                await db.groups.update(group.id!, updated)
                setGroup(updated)
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
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>群描述</label>
            <textarea
              value={group.description}
              onChange={async (e) => {
                const updated = { ...group, description: e.target.value }
                await db.groups.update(group.id!, updated)
                setGroup(updated)
              }}
              rows={3}
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
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={group.enableSuisuinian}
                onChange={async (e) => {
                  const updated = { ...group, enableSuisuinian: e.target.checked }
                  await db.groups.update(group.id!, updated)
                  setGroup(updated)
                }}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>启用碎碎念</span>
            </label>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>绑定世界书</label>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {group.boundWorldbookIds.length > 0 
                ? `已绑定 ${group.boundWorldbookIds.length} 条世界书`
                : '未绑定世界书'}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>权限</h3>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={group.permissions.canKick}
                onChange={async (e) => {
                  const updated = { 
                    ...group, 
                    permissions: { ...group.permissions, canKick: e.target.checked }
                  }
                  await db.groups.update(group.id!, updated)
                  setGroup(updated)
                }}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>踢人</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={group.permissions.canMute}
                onChange={async (e) => {
                  const updated = { 
                    ...group, 
                    permissions: { ...group.permissions, canMute: e.target.checked }
                  }
                  await db.groups.update(group.id!, updated)
                  setGroup(updated)
                }}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>禁言</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <input
                type="checkbox"
                checked={group.permissions.canChangeName}
                onChange={async (e) => {
                  const updated = { 
                    ...group, 
                    permissions: { ...group.permissions, canChangeName: e.target.checked }
                  }
                  await db.groups.update(group.id!, updated)
                  setGroup(updated)
                }}
                style={{ marginRight: '8px' }}
              />
              <span style={{ fontSize: '14px' }}>修改群名</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

export default QQGroupChat
