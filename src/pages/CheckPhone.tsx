import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface Character {
  id?: number
  name: string
  avatar: string
}

const CheckPhone: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([])
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
  const [characterData, setCharacterData] = useState<any>(null)

  useEffect(() => {
    loadCharacters()
  }, [])

  const loadCharacters = async () => {
    try {
      const chars = await db.characters.toArray()
      setCharacters(chars)
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  const handleSelectCharacter = async (character: Character) => {
    setSelectedCharacter(character)
    await loadCharacterData(character.id)
  }

  const loadCharacterData = async (characterId: number | undefined) => {
    if (!characterId) return

    try {
      const [messages, posts, coupleNotes, coupleDiaries, xiaohongshuPosts, xPosts] = await Promise.all([
        db.messages.where('characterId').equals(characterId).toArray(),
        db.posts.where('characterId').equals(characterId).toArray(),
        db.coupleNotes.where('characterId').equals(characterId).toArray(),
        db.coupleDiaries.where('characterId').equals(characterId).toArray(),
        db.xiaohongshuPosts.where('characterId').equals(characterId).toArray(),
        db.xPosts.where('characterId').equals(characterId).toArray()
      ])

      setCharacterData({
        messages,
        posts,
        coupleNotes,
        coupleDiaries,
        xiaohongshuPosts,
        xPosts
      })
    } catch (error) {
      console.error('加载角色数据失败:', error)
    }
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#f5f5f5' }}>
      <BackButton />

      <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>查手机</h1>

      {!selectedCharacter ? (
        <>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>选择要查看的角色手机</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {characters.length === 0 ? (
              <div style={{
                padding: '40px 16px',
                textAlign: 'center',
                color: '#666',
                background: 'white',
                borderRadius: '12px'
              }}>
                <p>还没有角色</p>
              </div>
            ) : (
              characters.map(char => (
                <div
                  key={char.id}
                  onClick={() => handleSelectCharacter(char)}
                  style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                    {char.avatar || '👤'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: '600' }}>{char.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>点击查看手机内容</div>
                  </div>
                  <div style={{ fontSize: '20px', color: '#007aff' }}>→</div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedCharacter(null)
              setCharacterData(null)
            }}
            style={{
              padding: '8px 16px',
              background: '#e5e5e5',
              color: '#333',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← 返回角色列表
          </button>

          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px'
              }}>
                {selectedCharacter.avatar || '👤'}
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {selectedCharacter.name} 的手机
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  数据隔离模式
                </div>
              </div>
            </div>
          </div>

          {characterData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* 聊天消息 */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  💬 聊天消息 ({characterData.messages.length})
                </div>
                {characterData.messages.length === 0 ? (
                  <div style={{ fontSize: '14px', color: '#666' }}>暂无消息</div>
                ) : (
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {characterData.messages.slice(0, 5).map((msg: any) => (
                      <div key={msg.id} style={{
                        padding: '8px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        {msg.content?.substring(0, 50) || '空消息'}
                      </div>
                    ))}
                    {characterData.messages.length > 5 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        还有 {characterData.messages.length - 5} 条消息...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 动态 */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  📝 动态 ({characterData.posts.length})
                </div>
                {characterData.posts.length === 0 ? (
                  <div style={{ fontSize: '14px', color: '#666' }}>暂无动态</div>
                ) : (
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {characterData.posts.slice(0, 5).map((post: any) => (
                      <div key={post.id} style={{
                        padding: '8px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        {post.content?.substring(0, 50) || '空动态'}
                      </div>
                    ))}
                    {characterData.posts.length > 5 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        还有 {characterData.posts.length - 5} 条动态...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 小红书 */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  📕 小红书 ({characterData.xiaohongshuPosts.length})
                </div>
                {characterData.xiaohongshuPosts.length === 0 ? (
                  <div style={{ fontSize: '14px', color: '#666' }}>暂无帖子</div>
                ) : (
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {characterData.xiaohongshuPosts.slice(0, 5).map((post: any) => (
                      <div key={post.id} style={{
                        padding: '8px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        {post.content?.substring(0, 50) || '空帖子'}
                      </div>
                    ))}
                    {characterData.xiaohongshuPosts.length > 5 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        还有 {characterData.xiaohongshuPosts.length - 5} 条帖子...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* X 软件 */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  ✖️ X ({characterData.xPosts.length})
                </div>
                {characterData.xPosts.length === 0 ? (
                  <div style={{ fontSize: '14px', color: '#666' }}>暂无帖子</div>
                ) : (
                  <div style={{ maxHeight: '200px', overflow: 'auto' }}>
                    {characterData.xPosts.slice(0, 5).map((post: any) => (
                      <div key={post.id} style={{
                        padding: '8px',
                        background: '#f9f9f9',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        fontSize: '14px'
                      }}>
                        {post.content?.substring(0, 50) || '空帖子'}
                      </div>
                    ))}
                    {characterData.xPosts.length > 5 && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        还有 {characterData.xPosts.length - 5} 条帖子...
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 情侣空间 */}
              <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                  💕 情侣空间
                </div>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '14px' }}>
                    小纸条: {characterData.coupleNotes.length}
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    日记: {characterData.coupleDiaries.length}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: '40px 16px',
              textAlign: 'center',
              color: '#666',
              background: 'white',
              borderRadius: '12px'
            }}>
              <p>加载中...</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default CheckPhone
