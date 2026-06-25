import React, { useEffect, useState } from 'react'
import BackButton from '../components/BackButton'
import { db } from '../db'

interface XPost {
  id?: number
  characterId?: number
  content: string
  likes: number
  reposts: number
  replies: number
  isLiked: boolean
  isReposted: boolean
  timestamp: number
}

const XApp: React.FC = () => {
  const [posts, setPosts] = useState<XPost[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [selectedCharacter, setSelectedCharacter] = useState<number | undefined>()
  const [characters, setCharacters] = useState<any[]>([])

  useEffect(() => {
    loadPosts()
    loadCharacters()
  }, [])

  const loadPosts = async () => {
    try {
      const postData = await db.xPosts.toArray()
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
    if (!newPostContent.trim()) return

    const post: XPost = {
      characterId: selectedCharacter,
      content: newPostContent,
      likes: 0,
      reposts: 0,
      replies: 0,
      isLiked: false,
      isReposted: false,
      timestamp: Date.now()
    }

    await db.xPosts.add(post)
    await loadPosts()
    setNewPostContent('')
    setSelectedCharacter(undefined)
    setShowCreateModal(false)
  }

  const handleLike = async (post: XPost) => {
    if (!post.id) return
    const updated = { ...post, likes: post.likes + 1, isLiked: !post.isLiked }
    await db.xPosts.update(post.id, updated)
    await loadPosts()
  }

  const handleRepost = async (post: XPost) => {
    if (!post.id) return
    const updated = { ...post, reposts: post.reposts + 1, isReposted: !post.isReposted }
    await db.xPosts.update(post.id, updated)
    await loadPosts()
  }

  const handleReply = async (post: XPost) => {
    const reply = prompt('输入回复:')
    if (!reply || !post.id) return
    const updated = { ...post, replies: post.replies + 1 }
    await db.xPosts.update(post.id, updated)
    await loadPosts()
  }

  return (
    <div style={{ padding: '60px 16px 80px', height: '100vh', overflow: 'auto', background: '#000' }}>
      <BackButton />

      {/* 头部 */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        borderBottom: '1px solid #2f3336',
        paddingBottom: '16px'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: '700', margin: 0, color: 'white' }}>X</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            padding: '8px 16px',
            background: '#1d9bf0',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          发帖
        </button>
      </div>

      {/* 帖子列表 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {posts.length === 0 ? (
          <div style={{
            padding: '40px 16px',
            textAlign: 'center',
            color: '#71767b'
          }}>
            <p>还没有帖子，发第一条吧</p>
          </div>
        ) : (
          posts.map(post => (
            <div
              key={post.id}
              style={{
                borderBottom: '1px solid #2f3336',
                paddingBottom: '16px'
              }}
            >
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#333',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  flexShrink: 0
                }}>
                  {post.characterId 
                    ? characters.find(c => c.id === post.characterId)?.avatar || '👤' 
                    : '👤'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>
                      {post.characterId 
                        ? characters.find(c => c.id === post.characterId)?.name || '角色' 
                        : '我'}
                    </span>
                    <span style={{ fontSize: '14px', color: '#71767b' }}>
                      @{post.characterId 
                        ? characters.find(c => c.id === post.characterId)?.name?.toLowerCase() || 'user' 
                        : 'me'}
                    </span>
                    <span style={{ fontSize: '14px', color: '#71767b' }}>·</span>
                    <span style={{ fontSize: '14px', color: '#71767b' }}>
                      {new Date(post.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '15px', color: 'white', lineHeight: '1.5', marginBottom: '12px' }}>
                    {post.content}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '400px' }}>
                    <button
                      onClick={() => handleReply(post)}
                      style={{
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        color: '#71767b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      💬 {post.replies}
                    </button>
                    <button
                      onClick={() => handleRepost(post)}
                      style={{
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        color: post.isReposted ? '#00ba7c' : '#71767b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      🔄 {post.reposts}
                    </button>
                    <button
                      onClick={() => handleLike(post)}
                      style={{
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        color: post.isLiked ? '#f91880' : '#71767b',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      ❤ {post.likes}
                    </button>
                    <button
                      style={{
                        padding: '8px',
                        background: 'none',
                        border: 'none',
                        fontSize: '14px',
                        color: '#71767b',
                        cursor: 'pointer'
                      }}
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 发帖弹窗 */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'flex-end',
          zIndex: 1000
        }}>
          <div style={{
            background: '#000',
            borderTop: '1px solid #2f3336',
            borderRadius: '16px 16px 0 0',
            padding: '20px',
            width: '100%'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewPostContent('')
                  setSelectedCharacter(undefined)
                }}
                style={{
                  padding: '8px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
              <button
                onClick={handleCreatePost}
                disabled={!newPostContent.trim()}
                style={{
                  padding: '8px 16px',
                  background: newPostContent.trim() ? '#1d9bf0' : '#0d4bd3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: newPostContent.trim() ? 'pointer' : 'not-allowed',
                  opacity: newPostContent.trim() ? 1 : 0.5
                }}
              >
                发帖
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '14px', color: '#71767b', marginBottom: '8px' }}>
                选择角色 (可选)
              </label>
              <select
                value={selectedCharacter || ''}
                onChange={(e) => setSelectedCharacter(e.target.value ? Number(e.target.value) : undefined)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#16181c',
                  color: 'white',
                  border: '1px solid #2f3336',
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

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="有什么新鲜事？"
              rows={4}
              maxLength={280}
              style={{
                width: '100%',
                padding: '12px',
                background: '#16181c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'none',
                outline: 'none'
              }}
            />
            <div style={{ textAlign: 'right', fontSize: '12px', color: '#71767b', marginTop: '8px' }}>
              {newPostContent.length}/280
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default XApp
