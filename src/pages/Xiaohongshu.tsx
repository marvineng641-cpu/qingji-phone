import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface XiaohongshuPost {
  id?: number
  characterId?: number
  title: string
  content: string
  images?: string[]
  tags: string[]
  likes: number
  isLiked: boolean
  timestamp: number
}

const Xiaohongshu: React.FC = () => {
  const [posts, setPosts] = useState<XiaohongshuPost[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<number | undefined>()
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    loadPosts()
    loadCharacters()
  }, [])

  const loadPosts = async () => {
    try {
      const postData = await db.xiaohongshuPosts.toArray()
      setPosts(postData.sort((a: any, b: any) => b.timestamp - a.timestamp))
    } catch (error) {
      console.error('加载帖子失败:', error)
    }
  }

  const loadCharacters = async () => {
    try {
      const chars = await db.characters.toArray()
      setCharacters(chars)
    } catch (error) {
      console.error('加载角色失败:', error)
    }
  }

  const handleCreatePost = async () => {
    if (!newTitle.trim() || !newContent.trim()) return

    const post: XiaohongshuPost = {
      characterId: selectedCharacter,
      title: newTitle,
      content: newContent,
      tags: newTags.split(',').map(t => t.trim()).filter(t => t),
      likes: 0,
      isLiked: false,
      timestamp: Date.now()
    }

    await db.xiaohongshuPosts.add(post)
    await loadPosts()
    setNewTitle('')
    setNewContent('')
    setNewTags('')
    setSelectedCharacter(undefined)
    setShowCreateModal(false)
  }

  const handleLike = async (post: XiaohongshuPost) => {
    if (!post.id) return
    const updated = { ...post, likes: post.likes + 1, isLiked: !post.isLiked }
    await db.xiaohongshuPosts.update(post.id, updated)
    await loadPosts()
  }

  const handleFavorite = async (post: XiaohongshuPost) => {
    if (!post.id) return
    try {
      const existing = await db.favorites.where({ itemId: post.id, type: 'xiaohongshu' }).first()
      if (existing) {
        await db.favorites.delete(existing.id!)
      } else {
        await db.favorites.add({
          itemId: post.id,
          type: 'xiaohongshu',
          timestamp: Date.now()
        })
      }
    } catch (error) {
      console.error('收藏失败:', error)
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
        <h1 style={{ fontSize: '20px', fontWeight: '600', margin: 0 }}>小红书</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            background: '#ff2442',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          + 发布
        </button>
      </div>

      {/* 帖子列表 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {posts.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '40px 16px',
            textAlign: 'center',
            color: '#666'
          }}>
            <p>还没有帖子，发布第一条吧</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* 图片占位 */}
              <div style={{
                aspectRatio: '3/4',
                background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px'
              }}>
                📷
              </div>

              {/* 标题 */}
              <div style={{ padding: '12px' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {post.title}
                </div>

                {/* 标签 */}
                {post.tags.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '4px',
                    flexWrap: 'wrap',
                    marginBottom: '8px'
                  }}>
                    {post.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: '10px',
                          color: '#ff2442',
                          background: '#fff0f2',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* 作者 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: '#e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>
                    {post.characterId ? '👤' : '👤'}
                  </div>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    {post.characterId 
                      ? characters.find(c => c.id === post.characterId)?.name || '角色' 
                      : '我'}
                  </span>
                </div>

                {/* 点赞 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    onClick={() => handleLike(post)}
                    style={{
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: post.isLiked ? '#ff2442' : '#666',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    ❤ {post.likes}
                  </button>
                  <button
                    onClick={() => handleFavorite(post)}
                    style={{
                      padding: '4px',
                      background: 'none',
                      border: 'none',
                      fontSize: '14px',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    ⭐
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 发布弹窗 */}
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
            width: '80%',
            maxWidth: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>发布笔记</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>选择角色 (可选)</label>
              <select
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              >
                <option value="">自己发布</option>
                {characters.map(char => (
                  <option key={char.id} value={char.id}>{char.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>标题</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="输入标题..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>内容</label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="分享你的心得..."
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
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px' }}>标签 (用逗号分隔)</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="例如: 美食, 旅行"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleCreatePost}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#ff2442',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                发布
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewTitle('')
                  setNewContent('')
                  setNewTags('')
                  setSelectedCharacter(undefined)
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

export default Xiaohongshu
